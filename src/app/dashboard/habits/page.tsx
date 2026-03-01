/* =============================================================================
   Habits & Streak System Page — /dashboard/habits (Bootstrap Redesign)
   ============================================================================= */

"use client";

import { useState, useEffect, FormEvent } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Habit, HabitLog, HabitFrequency, HabitWithStreak } from "@/types";
import { format, subDays, differenceInCalendarDays, parseISO } from "date-fns";

export default function HabitsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<HabitWithStreak[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [adding, setAdding] = useState(false);

  const calculateStreak = (logs: HabitLog[]): number => {
    const completedDates = logs
      .filter((log) => log.completed)
      .map((log) => log.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    if (completedDates.length === 0) return 0;
    const today = format(new Date(), "yyyy-MM-dd");
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    if (completedDates[0] !== today && completedDates[0] !== yesterday) return 0;
    let streak = 1;
    for (let i = 0; i < completedDates.length - 1; i++) {
      const current = parseISO(completedDates[i]);
      const next = parseISO(completedDates[i + 1]);
      if (differenceInCalendarDays(current, next) === 1) streak++;
      else break;
    }
    return streak;
  };

  useEffect(() => {
    if (!user) return;
    const fetchHabits = async () => {
      const { data: habitsData, error } = await supabase.from("habits").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error || !habitsData) return;
      const habitsWithStreaks: HabitWithStreak[] = await Promise.all(
        habitsData.map(async (habit: Habit) => {
          const { data: logs } = await supabase.from("habit_logs").select("*").eq("habit_id", habit.id);
          const habitLogs = logs ?? [];
          return { ...habit, logs: habitLogs, streak: calculateStreak(habitLogs) };
        })
      );
      setHabits(habitsWithStreaks);
    };
    fetchHabits();
  }, [user]);

  const handleAddHabit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setAdding(true);
    const { data, error } = await supabase.from("habits").insert({ user_id: user.id, title, frequency }).select().single();
    if (error) { toast.error("Failed to create habit: " + error.message); }
    else if (data) {
      setHabits((prev) => [{ ...data, logs: [], streak: 0 }, ...prev]);
      setTitle(""); setFrequency("daily"); setShowForm(false);
      toast.success("Habit created!");
    }
    setAdding(false);
  };

  const markDone = async (habitId: string) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const { data: existing } = await supabase.from("habit_logs").select("id").eq("habit_id", habitId).eq("date", today).limit(1);
    if (existing && existing.length > 0) { toast("Already marked as done today!"); return; }
    const { data, error } = await supabase.from("habit_logs").insert({ habit_id: habitId, date: today, completed: true }).select().single();
    if (error) { toast.error("Failed to log habit"); }
    else if (data) {
      setHabits((prev) => prev.map((h) => {
        if (h.id === habitId) { const newLogs = [...h.logs, data]; return { ...h, logs: newLogs, streak: calculateStreak(newLogs) }; }
        return h;
      }));
      toast.success("Habit completed!");
    }
  };

  const deleteHabit = async (habitId: string) => {
    await supabase.from("habit_logs").delete().eq("habit_id", habitId);
    const { error } = await supabase.from("habits").delete().eq("id", habitId);
    if (error) { toast.error("Failed to delete habit"); }
    else { setHabits((prev) => prev.filter((h) => h.id !== habitId)); toast.success("Habit deleted!"); }
  };

  const renderHeatmap = (logs: HabitLog[]) => {
    const today = new Date();
    const days = 90;
    const completedDates = new Set(logs.filter((l) => l.completed).map((l) => l.date));
    return (
      <div className="d-flex flex-wrap gap-1 mt-2">
        {Array.from({ length: days }).map((_, i) => {
          const date = format(subDays(today, days - 1 - i), "yyyy-MM-dd");
          const isCompleted = completedDates.has(date);
          const isToday = date === format(today, "yyyy-MM-dd");
          return (
            <div
              key={date}
              title={`${date}${isCompleted ? " ✓" : ""}`}
              className={isCompleted ? "heatmap-cell-3" : "heatmap-cell-0"}
              style={{
                width: 12, height: 12, borderRadius: 2,
                outline: isToday ? "1.5px solid var(--accent)" : "none",
              }}
            />
          );
        })}
      </div>
    );
  };



  const isDoneToday = (logs: HabitLog[]) => {
    const today = format(new Date(), "yyyy-MM-dd");
    return logs.some((l) => l.date === today && l.completed);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-box bg-success bg-opacity-10 rounded-3">
            <i className="bi bi-arrow-repeat text-success"></i>
          </div>
          <div>
            <h1 className="fs-4 fw-bold mb-0">Habits & Streaks</h1>
            <small className="text-body-secondary">Build consistency, track your progress.</small>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => setShowForm(!showForm)} className="btn btn-accent rounded-3 d-flex align-items-center gap-2">
            <i className="bi bi-plus-lg"></i> New Habit
          </button>
        </div>
      </div>

      {/* Add Habit Form */}
      {showForm && (
        <div className="card card-custom mb-4">
          <div className="card-body p-4">
            <form onSubmit={handleAddHabit}>
              <div className="mb-3">
                <label className="form-label fw-medium small">Habit Name *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Morning meditation, Read 20 pages..." required className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-medium small">Frequency</label>
                <select value={frequency} onChange={(e) => setFrequency(e.target.value as HabitFrequency)} className="form-select">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" disabled={adding} className="btn btn-accent rounded-3">
                  {adding ? <><span className="spinner-border spinner-border-sm me-1"></span>Creating...</> : "Create Habit"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline-secondary rounded-3">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Habits Grid */}
      <div className="row g-4">
        {habits.map((habit) => (
          <div key={habit.id} className="col-12 col-lg-6">
            <div className="card card-custom h-100">
              <div className="card-body p-4">
                {/* Header */}
                <div className="d-flex align-items-start justify-content-between mb-2">
                  <div>
                    <h6 className="fw-semibold mb-0">{habit.title}</h6>
                    <small className="text-body-secondary text-capitalize">{habit.frequency}</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className={`badge rounded-pill d-flex align-items-center gap-1 ${habit.streak > 0 ? "bg-warning bg-opacity-10 text-warning" : "bg-body-secondary text-body-secondary"}`}>
                      <i className="bi bi-fire"></i> {habit.streak}
                    </span>
                    <button onClick={() => deleteHabit(habit.id)} className="btn btn-sm btn-outline-danger rounded-circle" style={{ width: 30, height: 30 }} title="Delete habit">
                      <i className="bi bi-trash small"></i>
                    </button>
                  </div>
                </div>

                {/* Mark Done Button */}
                <button
                  onClick={() => markDone(habit.id)}
                  disabled={isDoneToday(habit.logs)}
                  className={`btn w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 mt-3 ${
                    isDoneToday(habit.logs) ? "btn-outline-success disabled" : "btn-accent"
                  }`}
                >
                  <i className="bi bi-check-lg"></i>
                  {isDoneToday(habit.logs) ? "Done Today" : "Mark as Done"}
                </button>

                {/* Heatmap */}
                <div className="mt-3">
                  <small className="text-body-secondary d-block mb-1">Last 90 days</small>
                  {renderHeatmap(habit.logs)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {habits.length === 0 && (
        <div className="text-center py-5 text-body-secondary">
          <i className="bi bi-arrow-repeat display-4 d-block mb-3 opacity-50"></i>
          <p>No habits yet. Start building your routine!</p>
        </div>
      )}
    </div>
  );
}
