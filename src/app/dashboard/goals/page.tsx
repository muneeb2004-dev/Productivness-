/* =============================================================================
   Life Goals Page — /dashboard/goals (Multiple Goals with Timelines)
   ============================================================================= */

"use client";

import { useState, useEffect, FormEvent } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Goal } from "@/types";

export default function GoalsPage() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── New goal form state ────────────────────────────────── */
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [focus, setFocus] = useState("");
  const [deadline, setDeadline] = useState("");
  const [saving, setSaving] = useState(false);

  /* ── Edit state ─────────────────────────────────────────── */
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ── Track if DB has deadline/status columns ────────────── */
  const [dbHasExtras, setDbHasExtras] = useState(true);

  /* ── Fetch all goals ────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    const fetchGoals = async () => {
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) {
        /* Detect if the DB has the deadline/status columns */
        if (data.length > 0) {
          setDbHasExtras("deadline" in data[0]);
        } else {
          /* No rows yet — probe with a dummy select to check column existence */
          const { error: probeErr } = await supabase.from("goals").select("deadline").limit(0);
          setDbHasExtras(!probeErr);
        }
        setGoals(data.map((g) => ({ ...g, status: g.status || "active" })));
      }
      setLoading(false);
    };
    fetchGoals();
  }, [user]);

  /* ── Save (create or update) ────────────────────────────── */
  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !title.trim()) { toast.error("Goal title is required"); return; }
    setSaving(true);

    /* Base payload — columns that always exist */
    const baseData: Record<string, unknown> = {
      user_id: user.id,
      life_goal: title,
      five_year_goal: description,
      current_focus: focus,
    };

    /* Only include deadline/status if the DB supports them */
    if (dbHasExtras) {
      baseData.deadline = deadline || null;
      baseData.status = "active";
    }

    const tryOp = async (withExtras: boolean) => {
      const payload = withExtras ? baseData : { user_id: baseData.user_id, life_goal: baseData.life_goal, five_year_goal: baseData.five_year_goal, current_focus: baseData.current_focus };
      if (editingId) {
        return supabase.from("goals").update(payload).eq("id", editingId).select().single();
      } else {
        return supabase.from("goals").insert(payload).select().single();
      }
    };

    let result = await tryOp(dbHasExtras);

    /* If it failed because of missing columns, retry without extras */
    if (result.error && result.error.message.includes("column")) {
      setDbHasExtras(false);
      result = await tryOp(false);
    }

    if (result.error) {
      toast.error(`Failed to ${editingId ? "update" : "create"} goal: ${result.error.message}`);
    } else if (result.data) {
      const saved = { ...result.data, status: result.data.status || "active" } as Goal;
      if (editingId) {
        setGoals((prev) => prev.map((g) => g.id === editingId ? saved : g));
        toast.success("Goal updated!");
      } else {
        setGoals((prev) => [saved, ...prev]);
        toast.success("Goal created!");
      }
    }

    resetForm();
    setSaving(false);
  };

  /* ── Delete ─────────────────────────────────────────────── */
  const deleteGoal = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) toast.error("Failed to delete goal");
    else { setGoals((prev) => prev.filter((g) => g.id !== id)); toast.success("Goal deleted!"); }
  };

  /* ── Toggle status ──────────────────────────────────────── */
  const toggleStatus = async (goal: Goal) => {
    const newStatus = goal.status === "completed" ? "active" : "completed";
    if (dbHasExtras) {
      const { error } = await supabase.from("goals").update({ status: newStatus }).eq("id", goal.id);
      if (error) {
        /* Column missing — just toggle locally */
        setDbHasExtras(false);
      }
      if (!error) setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, status: newStatus } : g));
    } else {
      /* No status column — toggle locally in UI only */
      setGoals((prev) => prev.map((g) => g.id === goal.id ? { ...g, status: newStatus } : g));
    }
  };

  /* ── Edit prefill ───────────────────────────────────────── */
  const startEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setTitle(goal.life_goal);
    setDescription(goal.five_year_goal);
    setFocus(goal.current_focus);
    setDeadline(goal.deadline || "");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Reset form ─────────────────────────────────────────── */
  const resetForm = () => {
    setTitle(""); setDescription(""); setFocus(""); setDeadline("");
    setEditingId(null); setShowForm(false);
  };

  /* ── Helpers ────────────────────────────────────────────── */
  const activeGoals = goals.filter((g) => g.status !== "completed");
  const completedGoals = goals.filter((g) => g.status === "completed");

  const getDaysLeft = (dl: string | undefined) => {
    if (!dl) return null;
    const diff = Math.ceil((new Date(dl).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const deadlineBadge = (dl: string | undefined) => {
    const days = getDaysLeft(dl);
    if (days === null) return null;
    if (days < 0) return <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill"><i className="bi bi-exclamation-triangle me-1"></i>Overdue by {Math.abs(days)}d</span>;
    if (days <= 7) return <span className="badge bg-warning bg-opacity-10 text-warning rounded-pill"><i className="bi bi-clock me-1"></i>{days}d left</span>;
    if (days <= 30) return <span className="badge bg-info bg-opacity-10 text-info rounded-pill"><i className="bi bi-clock me-1"></i>{days}d left</span>;
    return <span className="badge bg-success bg-opacity-10 text-success rounded-pill"><i className="bi bi-clock me-1"></i>{days}d left</span>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" style={{ color: "var(--accent)" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-box bg-primary bg-opacity-10 rounded-3">
            <i className="bi bi-star text-primary"></i>
          </div>
          <div>
            <h1 className="fs-4 fw-bold mb-0">Life Goals</h1>
            <small className="text-body-secondary">
              {goals.length} goal{goals.length !== 1 ? "s" : ""} &middot; {activeGoals.length} active &middot; {completedGoals.length} completed
            </small>
          </div>
        </div>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn btn-accent rounded-3 d-flex align-items-center gap-2">
          <i className={`bi ${showForm ? "bi-x-lg" : "bi-plus-lg"}`}></i>
          {showForm ? "Cancel" : "New Goal"}
        </button>
      </div>

      {/* ═══ Add / Edit Goal Form ═══════════════════════════════ */}
      {showForm && (
        <div className="card card-custom mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">
              <i className={`bi ${editingId ? "bi-pencil" : "bi-plus-circle"} me-2`}></i>
              {editingId ? "Edit Goal" : "Create New Goal"}
            </h5>
            <form onSubmit={handleSave}>
              <div className="row g-3 mb-3">
                <div className="col-md-8">
                  <label className="form-label fw-medium small">
                    <i className="bi bi-bullseye me-1"></i> Goal Title *
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Become a software architect, Graduate with honors..."
                    required
                    className="form-control"
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-medium small">
                    <i className="bi bi-calendar-event me-1"></i> Target Deadline
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium small">
                  <i className="bi bi-binoculars me-1"></i> Vision / Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your goal in detail — what does success look like?"
                  rows={2}
                  className="form-control"
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium small">
                  <i className="bi bi-fire me-1"></i> Current Focus / Next Steps
                </label>
                <textarea
                  value={focus}
                  onChange={(e) => setFocus(e.target.value)}
                  placeholder="What are you doing right now to move toward this goal?"
                  rows={2}
                  className="form-control"
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" disabled={saving} className="btn btn-accent rounded-3 d-flex align-items-center gap-2">
                  <i className="bi bi-floppy"></i>
                  {saving ? <><span className="spinner-border spinner-border-sm"></span> Saving...</> : editingId ? "Update Goal" : "Create Goal"}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-outline-secondary rounded-3">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ Active Goals ═══════════════════════════════════════ */}
      {activeGoals.length > 0 && (
        <div className="mb-4">
          <h6 className="text-body-secondary fw-bold text-uppercase mb-3" style={{ fontSize: "0.75rem", letterSpacing: 1 }}>
            <i className="bi bi-lightning-charge me-1"></i> Active Goals ({activeGoals.length})
          </h6>
          <div className="row g-3">
            {activeGoals.map((goal) => (
              <div key={goal.id} className="col-12">
                <div className="card card-custom">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start justify-content-between gap-3">
                      {/* Left: checkmark + content */}
                      <div className="d-flex gap-3 flex-grow-1 min-w-0">
                        <button
                          onClick={() => toggleStatus(goal)}
                          className="btn btn-outline-secondary rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center"
                          style={{ width: 38, height: 38 }}
                          title="Mark as completed"
                        >
                          <i className="bi bi-check-lg"></i>
                        </button>
                        <div className="min-w-0">
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <h6 className="fw-bold mb-0">{goal.life_goal}</h6>
                            {deadlineBadge(goal.deadline)}
                          </div>
                          {goal.five_year_goal && (
                            <p className="text-body-secondary small mb-1">{goal.five_year_goal}</p>
                          )}
                          {goal.current_focus && (
                            <p className="mb-0 small">
                              <span className="fw-semibold" style={{ color: "var(--accent)" }}>Focus:</span>{" "}
                              <span className="text-body-secondary">{goal.current_focus}</span>
                            </p>
                          )}
                          {goal.deadline && (
                            <p className="mb-0 mt-1 small text-body-secondary">
                              <i className="bi bi-calendar3 me-1"></i>
                              Deadline: {new Date(goal.deadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: actions */}
                      <div className="d-flex gap-1 flex-shrink-0">
                        <button onClick={() => startEdit(goal)} className="btn btn-sm btn-outline-secondary rounded-circle" style={{ width: 32, height: 32 }} title="Edit">
                          <i className="bi bi-pencil small"></i>
                        </button>
                        <button onClick={() => deleteGoal(goal.id)} className="btn btn-sm btn-outline-danger rounded-circle" style={{ width: 32, height: 32 }} title="Delete">
                          <i className="bi bi-trash small"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Completed Goals ════════════════════════════════════ */}
      {completedGoals.length > 0 && (
        <div className="mb-4">
          <h6 className="text-body-secondary fw-bold text-uppercase mb-3" style={{ fontSize: "0.75rem", letterSpacing: 1 }}>
            <i className="bi bi-trophy me-1"></i> Completed ({completedGoals.length})
          </h6>
          <div className="row g-3">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="col-12">
                <div className="card card-custom" style={{ opacity: 0.7 }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-start justify-content-between gap-3">
                      <div className="d-flex gap-3 flex-grow-1 min-w-0">
                        <button
                          onClick={() => toggleStatus(goal)}
                          className="btn btn-success rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center"
                          style={{ width: 38, height: 38 }}
                          title="Mark as active"
                        >
                          <i className="bi bi-check-lg text-white"></i>
                        </button>
                        <div className="min-w-0">
                          <h6 className="fw-bold mb-0 text-decoration-line-through">{goal.life_goal}</h6>
                          {goal.five_year_goal && (
                            <p className="text-body-secondary small mb-0 mt-1">{goal.five_year_goal}</p>
                          )}
                        </div>
                      </div>
                      <div className="d-flex gap-1 flex-shrink-0">
                        <button onClick={() => deleteGoal(goal.id)} className="btn btn-sm btn-outline-danger rounded-circle" style={{ width: 32, height: 32 }} title="Delete">
                          <i className="bi bi-trash small"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Empty State ════════════════════════════════════════ */}
      {goals.length === 0 && (
        <div className="text-center py-5">
          <i className="bi bi-stars display-3 d-block mb-3 opacity-25"></i>
          <h5 className="fw-bold mb-2">No goals yet</h5>
          <p className="text-body-secondary mb-3">Set your first life goal and start working toward it!</p>
          <button onClick={() => setShowForm(true)} className="btn btn-accent rounded-3">
            <i className="bi bi-plus-lg me-2"></i>Create Your First Goal
          </button>
        </div>
      )}
    </div>
  );
}
