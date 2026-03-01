/* =============================================================================
   CGPA Improvement Planner — /dashboard/cgpa (Bootstrap Redesign)
   ============================================================================= */

"use client";

import { useState, useEffect, FormEvent } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Subject, Grade } from "@/types";

const gradePoints: Record<string, number> = {
  "A+": 4.0, A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7, "C+": 2.3, C: 2.0, "C-": 1.7, D: 1.0, F: 0.0,
};
const gradeOptions: Grade[] = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

export default function CGPAPage() {
  const { user } = useAuth();
  const [currentCGPA, setCurrentCGPA] = useState("");
  const [targetCGPA, setTargetCGPA] = useState("");
  const [completedCredits, setCompletedCredits] = useState("");
  const [cgpaId, setCgpaId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newCreditHours, setNewCreditHours] = useState("3");
  const [newTargetGrade, setNewTargetGrade] = useState<Grade>("A");

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data: cgpaData } = await supabase.from("cgpa").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
      if (cgpaData && cgpaData.length > 0) {
        setCurrentCGPA(cgpaData[0].current_cgpa?.toString() || "");
        setTargetCGPA(cgpaData[0].target_cgpa?.toString() || "");
        setCompletedCredits(cgpaData[0].completed_credits?.toString() || "");
        setCgpaId(cgpaData[0].id);
      }
      const { data: subjectsData } = await supabase.from("subjects").select("*").eq("user_id", user.id);
      if (subjectsData) setSubjects(subjectsData);
    };
    fetchData();
  }, [user]);

  const handleSaveCGPA = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const cgpaData = { user_id: user.id, current_cgpa: parseFloat(currentCGPA), target_cgpa: parseFloat(targetCGPA), completed_credits: parseInt(completedCredits) };
    let error;
    if (cgpaId) { ({ error } = await supabase.from("cgpa").update(cgpaData).eq("id", cgpaId)); }
    else { const result = await supabase.from("cgpa").insert(cgpaData).select().single(); error = result.error; if (result.data) setCgpaId(result.data.id); }
    if (error) { toast.error("Failed to save: " + error.message); } else { toast.success("CGPA data saved!"); }
    setSaving(false);
  };

  const addSubject = async () => {
    if (!user || !newSubjectName.trim()) { toast.error("Please enter a subject name"); return; }
    const { data, error } = await supabase.from("subjects").insert({ user_id: user.id, subject_name: newSubjectName, credit_hours: parseInt(newCreditHours), target_grade: newTargetGrade, current_grade: "" }).select().single();
    if (error) { toast.error("Failed to add subject: " + error.message); }
    else if (data) { setSubjects((prev) => [...prev, data]); setNewSubjectName(""); setNewCreditHours("3"); setNewTargetGrade("A"); toast.success("Subject added!"); }
  };

  const removeSubject = async (id: string) => {
    const { error } = await supabase.from("subjects").delete().eq("id", id);
    if (!error) { setSubjects((prev) => prev.filter((s) => s.id !== id)); toast.success("Subject removed!"); }
  };

  const calculateProjectedCGPA = (): number | null => {
    const current = parseFloat(currentCGPA);
    const credits = parseInt(completedCredits);
    if (isNaN(current) || isNaN(credits) || subjects.length === 0) return null;
    const existingQP = current * credits;
    let newQP = 0, newCredits = 0;
    for (const subject of subjects) { const gp = gradePoints[subject.target_grade] ?? 0; newQP += gp * subject.credit_hours; newCredits += subject.credit_hours; }
    const totalCredits = credits + newCredits;
    if (totalCredits === 0) return null;
    return (existingQP + newQP) / totalCredits;
  };

  const projectedCGPA = calculateProjectedCGPA();



  const progressPercent = () => {
    const current = parseFloat(currentCGPA);
    const target = parseFloat(targetCGPA);
    if (isNaN(current) || isNaN(target) || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="icon-box bg-warning bg-opacity-10 rounded-3">
          <i className="bi bi-calculator text-warning"></i>
        </div>
        <div>
          <h1 className="fs-4 fw-bold mb-0">CGPA Improvement Planner</h1>
          <small className="text-body-secondary">Plan your grades, reach your target.</small>
        </div>
      </div>

      {/* CGPA Info Form */}
      <div className="card card-custom mb-4">
        <div className="card-body p-4">
          <form onSubmit={handleSaveCGPA}>
            <h5 className="fw-bold mb-3">Your CGPA Info</h5>
            <div className="row g-3 mb-3">
              <div className="col-sm-4">
                <label className="form-label fw-medium small">Current CGPA</label>
                <input type="number" step="0.01" min="0" max="4" value={currentCGPA} onChange={(e) => setCurrentCGPA(e.target.value)} placeholder="e.g., 3.2" className="form-control" />
              </div>
              <div className="col-sm-4">
                <label className="form-label fw-medium small">Target CGPA</label>
                <input type="number" step="0.01" min="0" max="4" value={targetCGPA} onChange={(e) => setTargetCGPA(e.target.value)} placeholder="e.g., 3.5" className="form-control" />
              </div>
              <div className="col-sm-4">
                <label className="form-label fw-medium small">Completed Credits</label>
                <input type="number" min="0" value={completedCredits} onChange={(e) => setCompletedCredits(e.target.value)} placeholder="e.g., 90" className="form-control" />
              </div>
            </div>

            {/* Progress Bar */}
            {currentCGPA && targetCGPA && (
              <div className="mb-3">
                <div className="d-flex justify-content-between small text-body-secondary mb-1">
                  <span>Current: {currentCGPA}</span>
                  <span>Target: {targetCGPA}</span>
                </div>
                <div className="progress" style={{ height: 10 }}>
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${progressPercent()}%`, background: "linear-gradient(135deg, var(--accent), #a78bfa)" }}
                  />
                </div>
              </div>
            )}

            <div className="d-flex gap-2">
              <button type="submit" disabled={saving} className="btn btn-accent rounded-3 d-flex align-items-center gap-2">
                <i className="bi bi-floppy"></i>
                {saving ? <><span className="spinner-border spinner-border-sm"></span> Saving...</> : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Subjects Section */}
      <div className="card card-custom">
        <div className="card-body p-4">
          <h5 className="fw-bold mb-3">Upcoming Subjects</h5>

          {/* Add Subject Form */}
          <div className="row g-2 mb-4">
            <div className="col-sm-4">
              <input value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Subject name" className="form-control" />
            </div>
            <div className="col-sm-2">
              <input type="number" value={newCreditHours} onChange={(e) => setNewCreditHours(e.target.value)} min="1" max="6" placeholder="Credits" className="form-control" />
            </div>
            <div className="col-sm-3">
              <select value={newTargetGrade} onChange={(e) => setNewTargetGrade(e.target.value as Grade)} className="form-select">
                {gradeOptions.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="col-sm-3">
              <button onClick={addSubject} className="btn btn-accent rounded-3 w-100 d-flex align-items-center justify-content-center gap-2">
                <i className="bi bi-plus-lg"></i> Add
              </button>
            </div>
          </div>

          {/* Subjects List */}
          <div className="d-flex flex-column gap-2">
            {subjects.map((subject) => (
              <div key={subject.id} className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-body-tertiary">
                <div className="d-flex align-items-center gap-3">
                  <span className="fw-medium small">{subject.subject_name}</span>
                  <small className="text-body-secondary">{subject.credit_hours} credits</small>
                  <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill">Target: {subject.target_grade}</span>
                </div>
                <button onClick={() => removeSubject(subject.id)} className="btn btn-sm btn-outline-danger rounded-circle" style={{ width: 30, height: 30 }}>
                  <i className="bi bi-trash small"></i>
                </button>
              </div>
            ))}
          </div>

          {/* Projected CGPA */}
          {projectedCGPA !== null && (
            <div className="mt-4 p-3 rounded-3" style={{ background: "rgba(var(--accent-rgb), 0.1)", border: "1px solid rgba(var(--accent-rgb), 0.2)" }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <i className="bi bi-calculator" style={{ color: "var(--accent)" }}></i>
                <h6 className="fw-semibold mb-0 small">Projected CGPA</h6>
              </div>
              <p className="fs-3 fw-bold mb-0" style={{ color: "var(--accent)" }}>{projectedCGPA.toFixed(2)}</p>
              <small className="text-body-secondary">Based on your target grades for upcoming subjects</small>
              {parseFloat(targetCGPA) > 0 && (
                <p className={`small mt-2 fw-medium mb-0 ${projectedCGPA >= parseFloat(targetCGPA) ? "text-success" : "text-warning"}`}>
                  {projectedCGPA >= parseFloat(targetCGPA)
                    ? "You're on track to reach your target!"
                    : "You need higher grades to reach your target."}
                </p>
              )}
            </div>
          )}

          {subjects.length === 0 && (
            <p className="text-center small text-body-secondary py-4 mb-0">No subjects added yet. Add your upcoming courses above.</p>
          )}
        </div>
      </div>
    </div>
  );
}
