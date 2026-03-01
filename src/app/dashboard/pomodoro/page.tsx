/* =============================================================================
   Pomodoro Timer Page — /dashboard/pomodoro
   ============================================================================= */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

type Mode = "work" | "shortBreak" | "longBreak";

interface SessionLog {
  mode: Mode;
  duration: number; // minutes
  completedAt: Date;
}

const MODE_CONFIG: Record<Mode, { label: string; color: string; icon: string }> = {
  work: { label: "Focus", color: "#dc3545", icon: "bi-bullseye" },
  shortBreak: { label: "Short Break", color: "#198754", icon: "bi-cup-hot" },
  longBreak: { label: "Long Break", color: "#0d6efd", icon: "bi-cloud-sun" },
};

export default function PomodoroPage() {
  /* ── Settings ───────────────────────────────────────────── */
  const [workMin, setWorkMin] = useState(25);
  const [shortBreakMin, setShortBreakMin] = useState(5);
  const [longBreakMin, setLongBreakMin] = useState(15);
  const [longBreakInterval, setLongBreakInterval] = useState(4);
  const [showSettings, setShowSettings] = useState(false);

  /* ── Timer state ────────────────────────────────────────── */
  const [mode, setMode] = useState<Mode>("work");
  const [secondsLeft, setSecondsLeft] = useState(workMin * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [todayLogs, setTodayLogs] = useState<SessionLog[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ── Duration for current mode ──────────────────────────── */
  const getDuration = useCallback((m: Mode) => {
    if (m === "work") return workMin * 60;
    if (m === "shortBreak") return shortBreakMin * 60;
    return longBreakMin * 60;
  }, [workMin, shortBreakMin, longBreakMin]);

  /* ── Switch mode ────────────────────────────────────────── */
  const switchMode = useCallback((newMode: Mode) => {
    setMode(newMode);
    setSecondsLeft(getDuration(newMode));
    setIsRunning(false);
  }, [getDuration]);

  /* ── Timer tick ─────────────────────────────────────────── */
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          // Play sound
          try { audioRef.current?.play(); } catch { /* silent */ }

          // Log session
          const log: SessionLog = { mode, duration: mode === "work" ? workMin : mode === "shortBreak" ? shortBreakMin : longBreakMin, completedAt: new Date() };
          setTodayLogs((prev) => [...prev, log]);

          if (mode === "work") {
            const newCount = sessionsCompleted + 1;
            setSessionsCompleted(newCount);
            toast.success(`Focus session #${newCount} complete! 🎉`);

            // Auto-switch to break
            if (newCount % longBreakInterval === 0) {
              switchMode("longBreak");
            } else {
              switchMode("shortBreak");
            }
          } else {
            toast.success("Break is over — back to work! 💪");
            switchMode("work");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning, mode, sessionsCompleted, longBreakInterval, workMin, shortBreakMin, longBreakMin, switchMode]);

  /* ── Format time ────────────────────────────────────────── */
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  /* ── Progress percentage ────────────────────────────────── */
  const totalDuration = getDuration(mode);
  const progress = ((totalDuration - secondsLeft) / totalDuration) * 100;

  /* ── Today stats ────────────────────────────────────────── */
  const todayWorkSessions = todayLogs.filter((l) => l.mode === "work").length;
  const todayFocusMinutes = todayLogs.filter((l) => l.mode === "work").reduce((acc, l) => acc + l.duration, 0);

  /* ── Reset ──────────────────────────────────────────────── */
  const resetTimer = () => {
    setIsRunning(false);
    setSecondsLeft(getDuration(mode));
  };

  const resetAll = () => {
    setIsRunning(false);
    setMode("work");
    setSecondsLeft(workMin * 60);
    setSessionsCompleted(0);
    setTodayLogs([]);
    toast.success("Timer reset!");
  };

  /* ── Apply settings ─────────────────────────────────────── */
  const applySettings = () => {
    setShowSettings(false);
    if (!isRunning) {
      setSecondsLeft(getDuration(mode));
    }
    toast.success("Settings saved!");
  };

  const { color, icon, label } = MODE_CONFIG[mode];

  return (
    <div>
      {/* Hidden audio for notification */}
      <audio ref={audioRef} preload="auto">
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczJjqR09y/eDEkN5HL3cBqMSY8lNPcumMxKEKb1ty2WjEsR6PX3K9QMTFNq9jcpUYxN1Oy2dybPDE9W7na3JEyMUVju9rckigxT2+/29yGHzFZe8Tb3HoVMWOHydvcbwsx" type="audio/wav" />
      </audio>

      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-box bg-danger bg-opacity-10 rounded-3">
            <i className="bi bi-stopwatch text-danger"></i>
          </div>
          <div>
            <h1 className="fs-4 fw-bold mb-0">Pomodoro Timer</h1>
            <small className="text-body-secondary">Stay focused, take breaks, be productive</small>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className="btn btn-outline-secondary rounded-3 d-flex align-items-center gap-2">
            <i className="bi bi-gear"></i> Settings
          </button>
          <button onClick={resetAll} className="btn btn-outline-danger rounded-3 d-flex align-items-center gap-2">
            <i className="bi bi-arrow-counterclockwise"></i> Reset All
          </button>
        </div>
      </div>

      {/* ═══ Settings Panel ════════════════════════════════════ */}
      {showSettings && (
        <div className="card card-custom mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">
              <i className="bi bi-gear me-2"></i>Timer Settings
            </h5>
            <div className="row g-3">
              <div className="col-sm-6 col-md-3">
                <label className="form-label small fw-medium">Focus (min)</label>
                <input type="number" className="form-control" value={workMin} min={1} max={120}
                  onChange={(e) => setWorkMin(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
              <div className="col-sm-6 col-md-3">
                <label className="form-label small fw-medium">Short Break (min)</label>
                <input type="number" className="form-control" value={shortBreakMin} min={1} max={30}
                  onChange={(e) => setShortBreakMin(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
              <div className="col-sm-6 col-md-3">
                <label className="form-label small fw-medium">Long Break (min)</label>
                <input type="number" className="form-control" value={longBreakMin} min={1} max={60}
                  onChange={(e) => setLongBreakMin(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
              <div className="col-sm-6 col-md-3">
                <label className="form-label small fw-medium">Long Break After</label>
                <input type="number" className="form-control" value={longBreakInterval} min={2} max={10}
                  onChange={(e) => setLongBreakInterval(Math.max(2, parseInt(e.target.value) || 4))} />
              </div>
            </div>
            <button onClick={applySettings} className="btn btn-accent rounded-3 mt-3">
              <i className="bi bi-check-lg me-1"></i> Apply
            </button>
          </div>
        </div>
      )}

      {/* ═══ Today's Stats ════════════════════════════════════ */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card card-custom h-100">
            <div className="card-body p-3 text-center">
              <i className="bi bi-bullseye fs-4 text-danger d-block mb-1"></i>
              <p className="fs-4 fw-bold mb-0">{sessionsCompleted}</p>
              <small className="text-body-secondary">Sessions Done</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card card-custom h-100">
            <div className="card-body p-3 text-center">
              <i className="bi bi-clock-history fs-4 text-primary d-block mb-1"></i>
              <p className="fs-4 fw-bold mb-0">{todayFocusMinutes}</p>
              <small className="text-body-secondary">Focus Minutes</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card card-custom h-100">
            <div className="card-body p-3 text-center">
              <i className="bi bi-fire fs-4 text-warning d-block mb-1"></i>
              <p className="fs-4 fw-bold mb-0">{todayWorkSessions}</p>
              <small className="text-body-secondary">Work Blocks</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card card-custom h-100">
            <div className="card-body p-3 text-center">
              <i className="bi bi-trophy fs-4 text-success d-block mb-1"></i>
              <p className="fs-4 fw-bold mb-0">{Math.floor(todayFocusMinutes / 60)}h {todayFocusMinutes % 60}m</p>
              <small className="text-body-secondary">Total Focus</small>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Mode Tabs ═════════════════════════════════════════ */}
      <div className="card card-custom mb-4">
        <div className="card-body p-4">
          <div className="d-flex justify-content-center gap-2 mb-4">
            {(["work", "shortBreak", "longBreak"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`btn rounded-pill px-3 py-2 ${mode === m ? "text-white" : "btn-outline-secondary"}`}
                style={mode === m ? { backgroundColor: MODE_CONFIG[m].color, borderColor: MODE_CONFIG[m].color } : {}}
              >
                <i className={`bi ${MODE_CONFIG[m].icon} me-1`}></i>
                {MODE_CONFIG[m].label}
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="text-center mb-4">
            <div className="position-relative d-inline-block pomodoro-ring" style={{ width: 260, height: 260 }}>
              {/* SVG circular progress */}
              <svg width="260" height="260" viewBox="0 0 260 260" className="position-absolute top-0 start-0">
                <circle cx="130" cy="130" r="115" fill="none" stroke="currentColor" strokeWidth="6" opacity={0.1} />
                <circle
                  cx="130" cy="130" r="115" fill="none"
                  stroke={color} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 115}
                  strokeDashoffset={2 * Math.PI * 115 * (1 - progress / 100)}
                  style={{ transition: "stroke-dashoffset 0.5s ease", transform: "rotate(-90deg)", transformOrigin: "center" }}
                />
              </svg>
              <div className="position-absolute top-50 start-50 translate-middle text-center">
                <div className="mb-1">
                  <span className="badge rounded-pill" style={{ backgroundColor: color + "22", color }}>
                    <i className={`bi ${icon} me-1`}></i>{label}
                  </span>
                </div>
                <p className="display-3 fw-bold mb-0 font-monospace" style={{ color }}>
                  {formatTime(secondsLeft)}
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="d-flex justify-content-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="btn btn-lg rounded-pill px-5 text-white"
              style={{ backgroundColor: color, borderColor: color }}
            >
              <i className={`bi ${isRunning ? "bi-pause-fill" : "bi-play-fill"} me-2`}></i>
              {isRunning ? "Pause" : "Start"}
            </button>
            <button onClick={resetTimer} className="btn btn-lg btn-outline-secondary rounded-pill px-4">
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>

          {/* Session dots */}
          {sessionsCompleted > 0 && (
            <div className="d-flex justify-content-center gap-2 mt-4">
              {Array.from({ length: Math.min(sessionsCompleted, 12) }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-circle"
                  style={{
                    width: 12, height: 12,
                    backgroundColor: (i + 1) % longBreakInterval === 0 ? "#0d6efd" : "#dc3545",
                    opacity: 0.8,
                  }}
                  title={`Session ${i + 1}`}
                />
              ))}
              {sessionsCompleted > 12 && (
                <span className="text-body-secondary small align-self-center">+{sessionsCompleted - 12}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Session History ═══════════════════════════════════ */}
      {todayLogs.length > 0 && (
        <div className="card card-custom">
          <div className="card-body p-4">
            <h6 className="fw-bold mb-3">
              <i className="bi bi-journal-text me-2"></i>Session History
            </h6>
            <div className="list-group list-group-flush">
              {[...todayLogs].reverse().map((log, i) => (
                <div key={i} className="list-group-item d-flex align-items-center gap-3 bg-transparent border-start-0 border-end-0 px-0">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 36, height: 36, backgroundColor: MODE_CONFIG[log.mode].color + "22" }}
                  >
                    <i className={`bi ${MODE_CONFIG[log.mode].icon}`} style={{ color: MODE_CONFIG[log.mode].color }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <span className="fw-medium small">{MODE_CONFIG[log.mode].label}</span>
                    <span className="text-body-secondary small ms-2">{log.duration} min</span>
                  </div>
                  <small className="text-body-secondary">
                    {log.completedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
