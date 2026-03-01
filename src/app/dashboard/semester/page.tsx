/* =============================================================================
   Semester Tracker Page — /dashboard/semester (Bootstrap Redesign)
   ============================================================================= */

"use client";

import { useState, useEffect, FormEvent } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import {
  Semester,
  SemesterSubject,
  AcademicEvent,
  Note,
  EventType,
} from "@/types";
import { format } from "date-fns";

const eventTypeLabels: Record<EventType, string> = {
  quiz: "Quiz", assignment: "Assignment", mid: "Midterm", final: "Final", lab: "Lab",
};
const eventTypeBadge: Record<EventType, string> = {
  quiz: "bg-info bg-opacity-10 text-info",
  assignment: "bg-success bg-opacity-10 text-success",
  mid: "bg-warning bg-opacity-10 text-warning",
  final: "bg-danger bg-opacity-10 text-danger",
  lab: "bg-primary bg-opacity-10 text-primary",
};

export default function SemesterPage() {
  const { user } = useAuth();

  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemesterId, setActiveSemesterId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<SemesterSubject[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const [showSemesterForm, setShowSemesterForm] = useState(false);
  const [semesterNumber, setSemesterNumber] = useState("");
  const [semesterYear, setSemesterYear] = useState(new Date().getFullYear().toString());

  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [subjectName, setSubjectName] = useState("");
  const [subjectCredits, setSubjectCredits] = useState("3");

  const [showEventForm, setShowEventForm] = useState<string | null>(null);
  const [eventType, setEventType] = useState<EventType>("quiz");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDueDate, setEventDueDate] = useState("");

  const [showNoteForm, setShowNoteForm] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    const fetchSemesters = async () => {
      const { data } = await supabase.from("semesters").select("*").eq("user_id", user.id).order("year", { ascending: false });
      if (data && data.length > 0) { setSemesters(data); setActiveSemesterId(data[0].id); }
    };
    fetchSemesters();
  }, [user]);

  useEffect(() => {
    if (!activeSemesterId) return;
    const fetchSemesterData = async () => {
      const { data: subjectsData } = await supabase.from("semester_subjects").select("*").eq("semester_id", activeSemesterId);
      if (subjectsData) {
        setSubjects(subjectsData);
        const subjectIds = subjectsData.map((s) => s.id);
        if (subjectIds.length > 0) {
          const { data: eventsData } = await supabase.from("academic_events").select("*").in("subject_id", subjectIds).order("due_date", { ascending: true });
          setEvents(eventsData ?? []);
          const { data: notesData } = await supabase.from("notes").select("*").in("subject_id", subjectIds).order("created_at", { ascending: false });
          setNotes(notesData ?? []);
        } else { setEvents([]); setNotes([]); }
      }
    };
    fetchSemesterData();
  }, [activeSemesterId]);

  const handleAddSemester = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    const { data, error } = await supabase.from("semesters").insert({ user_id: user.id, semester_number: parseInt(semesterNumber), year: parseInt(semesterYear) }).select().single();
    if (error) { toast.error("Failed to create semester: " + error.message); }
    else if (data) { setSemesters((prev) => [data, ...prev]); setActiveSemesterId(data.id); setSemesterNumber(""); setShowSemesterForm(false); toast.success("Semester created!"); }
  };

  const handleAddSubject = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeSemesterId) return;
    const { data, error } = await supabase.from("semester_subjects").insert({ semester_id: activeSemesterId, name: subjectName, credit_hours: parseInt(subjectCredits) }).select().single();
    if (error) { toast.error("Failed to add subject: " + error.message); }
    else if (data) { setSubjects((prev) => [...prev, data]); setSubjectName(""); setSubjectCredits("3"); setShowSubjectForm(false); toast.success("Subject added!"); }
  };

  const handleAddEvent = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showEventForm) return;
    const { data, error } = await supabase.from("academic_events").insert({ subject_id: showEventForm, type: eventType, title: eventTitle, due_date: eventDueDate, marks: null, is_completed: false }).select().single();
    if (error) { toast.error("Failed to add event: " + error.message); }
    else if (data) { setEvents((prev) => [...prev, data]); setEventTitle(""); setEventDueDate(""); setShowEventForm(null); toast.success("Event added!"); }
  };

  const handleAddNote = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!showNoteForm) return;
    const { data, error } = await supabase.from("notes").insert({ subject_id: showNoteForm, title: noteTitle, content: noteContent }).select().single();
    if (error) { toast.error("Failed to add note: " + error.message); }
    else if (data) { setNotes((prev) => [data, ...prev]); setNoteTitle(""); setNoteContent(""); setShowNoteForm(null); toast.success("Note added!"); }
  };

  const toggleEventComplete = async (eventId: string, current: boolean) => {
    const { error } = await supabase.from("academic_events").update({ is_completed: !current }).eq("id", eventId);
    if (!error) { setEvents((prev) => prev.map((e) => e.id === eventId ? { ...e, is_completed: !current } : e)); }
  };

  const updateEventMarks = async (eventId: string, marks: string) => {
    const marksNum = marks ? parseFloat(marks) : null;
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, marks: marksNum } : e)));
    await supabase.from("academic_events").update({ marks: marksNum }).eq("id", eventId);
  };

  const deleteEvent = async (eventId: string) => {
    const { error } = await supabase.from("academic_events").delete().eq("id", eventId);
    if (!error) { setEvents((prev) => prev.filter((e) => e.id !== eventId)); toast.success("Event deleted!"); }
  };

  const deleteNote = async (noteId: string) => {
    const { error } = await supabase.from("notes").delete().eq("id", noteId);
    if (!error) { setNotes((prev) => prev.filter((n) => n.id !== noteId)); toast.success("Note deleted!"); }
  };

  const deleteSubject = async (subjectId: string) => {
    await supabase.from("academic_events").delete().eq("subject_id", subjectId);
    await supabase.from("notes").delete().eq("subject_id", subjectId);
    const { error } = await supabase.from("semester_subjects").delete().eq("id", subjectId);
    if (!error) {
      setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
      setEvents((prev) => prev.filter((e) => e.subject_id !== subjectId));
      setNotes((prev) => prev.filter((n) => n.subject_id !== subjectId));
      toast.success("Subject deleted!");
    }
  };

  const toggleExpand = (subjectId: string) => {
    setExpandedSubjects((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) newSet.delete(subjectId); else newSet.add(subjectId);
      return newSet;
    });
  };



  const upcomingEvents = events
    .filter((e) => !e.is_completed && e.due_date)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 10);

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-box bg-primary bg-opacity-10 rounded-3">
            <i className="bi bi-mortarboard text-primary"></i>
          </div>
          <div>
            <h1 className="fs-4 fw-bold mb-0">Semester Tracker</h1>
            <small className="text-body-secondary">Track subjects, events, and academic progress.</small>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => setShowSemesterForm(!showSemesterForm)} className="btn btn-accent rounded-3 d-flex align-items-center gap-2">
            <i className="bi bi-plus-lg"></i> New Semester
          </button>
        </div>
      </div>

      {/* New Semester Form */}
      {showSemesterForm && (
        <div className="card card-custom mb-4">
          <div className="card-body p-4">
            <form onSubmit={handleAddSemester}>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label fw-medium small">Semester Number *</label>
                  <input type="number" value={semesterNumber} onChange={(e) => setSemesterNumber(e.target.value)} min="1" required placeholder="e.g., 5" className="form-control" />
                </div>
                <div className="col-sm-6">
                  <label className="form-label fw-medium small">Year</label>
                  <input type="number" value={semesterYear} onChange={(e) => setSemesterYear(e.target.value)} required className="form-control" />
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-accent rounded-3">Create Semester</button>
                <button type="button" onClick={() => setShowSemesterForm(false)} className="btn btn-outline-secondary rounded-3">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Semester Tabs */}
      {semesters.length > 0 && (
        <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
          {semesters.map((sem) => (
            <button
              key={sem.id}
              onClick={() => setActiveSemesterId(sem.id)}
              className={`btn rounded-pill px-4 text-nowrap ${
                activeSemesterId === sem.id ? "btn-accent" : "btn-outline-secondary"
              }`}
            >
              Semester {sem.semester_number} ({sem.year})
            </button>
          ))}
        </div>
      )}

      {/* Active Semester Content */}
      {activeSemesterId && (
        <div className="row g-4">
          {/* Left: Subjects (2/3 width) */}
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold mb-0">Subjects</h5>
              <button onClick={() => setShowSubjectForm(!showSubjectForm)} className="btn btn-sm btn-outline-secondary rounded-3 d-flex align-items-center gap-1">
                <i className="bi bi-plus"></i> Add Subject
              </button>
            </div>

            {/* New Subject Form */}
            {showSubjectForm && (
              <div className="card card-custom mb-3">
                <div className="card-body p-3">
                  <form onSubmit={handleAddSubject}>
                    <div className="row g-2 mb-2">
                      <div className="col-sm-8">
                        <input value={subjectName} onChange={(e) => setSubjectName(e.target.value)} placeholder="Subject name" required className="form-control form-control-sm" />
                      </div>
                      <div className="col-sm-4">
                        <input type="number" value={subjectCredits} onChange={(e) => setSubjectCredits(e.target.value)} min="1" placeholder="Credits" className="form-control form-control-sm" />
                      </div>
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-sm btn-accent rounded-3">Add</button>
                      <button type="button" onClick={() => setShowSubjectForm(false)} className="btn btn-sm btn-outline-secondary rounded-3">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Subject Cards */}
            <div className="d-flex flex-column gap-3">
              {subjects.map((subject) => {
                const subjectEvents = events.filter((e) => e.subject_id === subject.id);
                const subjectNotes = notes.filter((n) => n.subject_id === subject.id);
                const isExpanded = expandedSubjects.has(subject.id);

                return (
                  <div key={subject.id} className="card card-custom overflow-hidden">
                    {/* Subject Header */}
                    <div
                      onClick={() => toggleExpand(subject.id)}
                      className="card-body p-3 d-flex align-items-center justify-content-between"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-book text-primary"></i>
                        <div>
                          <h6 className="fw-semibold mb-0 small">{subject.name}</h6>
                          <small className="text-body-secondary">{subject.credit_hours} credits &middot; {subjectEvents.length} events &middot; {subjectNotes.length} notes</small>
                        </div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSubject(subject.id); }}
                          className="btn btn-sm btn-outline-danger rounded-circle p-0 d-flex align-items-center justify-content-center"
                          style={{ width: 28, height: 28 }}
                        >
                          <i className="bi bi-trash small"></i>
                        </button>
                        <i className={`bi ${isExpanded ? "bi-chevron-up" : "bi-chevron-down"} text-body-secondary`}></i>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-top p-3">
                        {/* Events Section */}
                        <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="small fw-medium mb-0"><i className="bi bi-calendar3 me-1"></i> Events</h6>
                            <button
                              onClick={() => setShowEventForm(showEventForm === subject.id ? null : subject.id)}
                              className="btn btn-sm btn-link text-decoration-none p-0 small"
                              style={{ color: "var(--accent)" }}
                            >+ Add Event</button>
                          </div>

                          {/* Event Form */}
                          {showEventForm === subject.id && (
                            <form onSubmit={handleAddEvent} className="p-3 rounded-3 bg-body-tertiary mb-2">
                              <div className="row g-2 mb-2">
                                <div className="col-4">
                                  <select value={eventType} onChange={(e) => setEventType(e.target.value as EventType)} className="form-select form-select-sm">
                                    {Object.entries(eventTypeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                                  </select>
                                </div>
                                <div className="col-4">
                                  <input value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} placeholder="Title" required className="form-control form-control-sm" />
                                </div>
                                <div className="col-4">
                                  <input type="date" value={eventDueDate} onChange={(e) => setEventDueDate(e.target.value)} className="form-control form-control-sm" />
                                </div>
                              </div>
                              <button type="submit" className="btn btn-sm btn-accent rounded-3">Add Event</button>
                            </form>
                          )}

                          {/* Events List */}
                          <div className="d-flex flex-column gap-2">
                            {subjectEvents.map((event) => (
                              <div key={event.id} className="d-flex align-items-center gap-2 p-2 rounded-3 bg-body-tertiary">
                                <button
                                  onClick={() => toggleEventComplete(event.id, event.is_completed)}
                                  className={`btn btn-sm rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center ${event.is_completed ? "btn-success" : "btn-outline-secondary"}`}
                                  style={{ width: 24, height: 24, padding: 0 }}
                                >
                                  {event.is_completed && <i className="bi bi-check text-white" style={{ fontSize: 12 }}></i>}
                                </button>
                                <div className="flex-grow-1 min-w-0">
                                  <div className="d-flex align-items-center gap-2">
                                    <span className={`badge rounded-pill ${eventTypeBadge[event.type]}`} style={{ fontSize: 10 }}>{eventTypeLabels[event.type]}</span>
                                    <small className={event.is_completed ? "text-decoration-line-through text-body-secondary" : ""}>{event.title}</small>
                                  </div>
                                  {event.due_date && <small className="text-body-secondary" style={{ fontSize: 10 }}>Due: {format(new Date(event.due_date), "MMM d, yyyy")}</small>}
                                </div>
                                <input
                                  type="number"
                                  value={event.marks ?? ""}
                                  onChange={(e) => updateEventMarks(event.id, e.target.value)}
                                  placeholder="Marks"
                                  className="form-control form-control-sm text-center"
                                  style={{ width: 70 }}
                                />
                                <button onClick={() => deleteEvent(event.id)} className="btn btn-sm text-body-secondary p-0">
                                  <i className="bi bi-trash small"></i>
                                </button>
                              </div>
                            ))}
                            {subjectEvents.length === 0 && <small className="text-body-secondary text-center py-2">No events yet</small>}
                          </div>
                        </div>

                        {/* Notes Section */}
                        <div>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="small fw-medium mb-0"><i className="bi bi-file-text me-1"></i> Notes</h6>
                            <button
                              onClick={() => setShowNoteForm(showNoteForm === subject.id ? null : subject.id)}
                              className="btn btn-sm btn-link text-decoration-none p-0 small"
                              style={{ color: "var(--accent)" }}
                            >+ Add Note</button>
                          </div>

                          {/* Note Form */}
                          {showNoteForm === subject.id && (
                            <form onSubmit={handleAddNote} className="p-3 rounded-3 bg-body-tertiary mb-2">
                              <div className="mb-2">
                                <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Note title" required className="form-control form-control-sm" />
                              </div>
                              <div className="mb-2">
                                <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Note content..." rows={3} className="form-control form-control-sm" />
                              </div>
                              <button type="submit" className="btn btn-sm btn-accent rounded-3">Add Note</button>
                            </form>
                          )}

                          {/* Notes List */}
                          <div className="d-flex flex-column gap-2">
                            {subjectNotes.map((note) => (
                              <div key={note.id} className="p-2 rounded-3 bg-body-tertiary">
                                <div className="d-flex justify-content-between align-items-start">
                                  <small className="fw-medium">{note.title}</small>
                                  <button onClick={() => deleteNote(note.id)} className="btn btn-sm text-body-secondary p-0">
                                    <i className="bi bi-trash small"></i>
                                  </button>
                                </div>
                                <p className="small text-body-secondary mb-1" style={{ whiteSpace: "pre-wrap" }}>{note.content}</p>
                                <small className="text-body-secondary" style={{ fontSize: 10 }}>{format(new Date(note.created_at), "MMM d, yyyy")}</small>
                              </div>
                            ))}
                            {subjectNotes.length === 0 && <small className="text-body-secondary text-center py-2">No notes yet</small>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {subjects.length === 0 && (
                <div className="text-center py-5 text-body-secondary">
                  <i className="bi bi-book display-4 d-block mb-2 opacity-50"></i>
                  <p className="small">No subjects added to this semester.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Upcoming Events (1/3 width) */}
          <div className="col-lg-4">
            <div className="card card-custom sticky-top" style={{ top: "1rem" }}>
              <div className="card-body p-4">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-calendar-event text-primary"></i>
                  <h6 className="fw-bold mb-0">Upcoming Events</h6>
                </div>

                {upcomingEvents.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {upcomingEvents.map((event) => {
                      const sub = subjects.find((s) => s.id === event.subject_id);
                      return (
                        <div key={event.id} className="p-2 rounded-3 bg-body-tertiary">
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge rounded-pill ${eventTypeBadge[event.type]}`} style={{ fontSize: 10 }}>{eventTypeLabels[event.type]}</span>
                            <small className="fw-medium text-truncate">{event.title}</small>
                          </div>
                          <div className="d-flex justify-content-between mt-1">
                            <small className="text-body-secondary" style={{ fontSize: 11 }}>{sub?.name}</small>
                            <small className="text-body-secondary" style={{ fontSize: 11 }}>
                              {event.due_date ? format(new Date(event.due_date), "MMM d") : "No date"}
                            </small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="small text-body-secondary text-center py-3 mb-0">No upcoming events</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {semesters.length === 0 && (
        <div className="text-center py-5 text-body-secondary">
          <i className="bi bi-mortarboard display-4 d-block mb-3 opacity-50"></i>
          <p>No semesters created yet. Start tracking your academic progress!</p>
        </div>
      )}
    </div>
  );
}
