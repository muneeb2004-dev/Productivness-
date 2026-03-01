/* =============================================================================
   Landing Page — Aurora-powered immersive landing
   ============================================================================= */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import Aurora from "@/components/Aurora";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard");
      } else {
        setReady(true);
      }
    }
  }, [user, loading, router]);

  /* ── Loading state ──────────────────────────────────────────── */
  if (loading || (!ready && !user)) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: "#050510" }}>
        <div className="text-center">
          <h1 className="display-4 fw-bold text-white mb-3" style={{ letterSpacing: "-0.02em" }}>
            <i className="bi bi-lightning-charge-fill me-2" style={{ color: "#7cff67" }}></i>productivness
          </h1>
          <div className="loading-bar mx-auto">
            <div className="loading-bar-inner" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Feature data ───────────────────────────────────────────── */
  const features = [
    { icon: "bi-stars",           color: "#ffc107", title: "Life Goals",        desc: "Define your vision, set milestones with deadlines, and track multiple goals toward your dreams." },
    { icon: "bi-check2-square",   color: "#0d6efd", title: "Smart To-Dos",      desc: "Manage tasks with priorities, due dates, and smart filters. Never miss a deadline again." },
    { icon: "bi-arrow-repeat",    color: "#34d399", title: "Habit Tracker",      desc: "Build streaks, track daily habits, and develop better routines with visual feedback." },
    { icon: "bi-stopwatch",       color: "#f472b6", title: "Pomodoro Timer",     desc: "Stay laser-focused with customizable work/break intervals and session tracking." },
    { icon: "bi-wallet2",         color: "#10b981", title: "Finance Tracker",    desc: "Track income & expenses, set budgets, and visualize spending by category." },
    { icon: "bi-mortarboard-fill",color: "#0dcaf0", title: "CGPA Planner",       desc: "Calculate projected CGPA, plan target grades, and track academic improvement." },
  ];

  const steps = [
    { num: "01", title: "Create Account", desc: "Sign up in seconds — free forever, no credit card." },
    { num: "02", title: "Set Up Dashboard", desc: "Add goals, habits, courses, and to-dos. Make it yours." },
    { num: "03", title: "Track & Grow", desc: "Monitor progress, build streaks, and level up daily." },
  ];

  const stats = [
    { value: "8+", label: "Productivity Tools" },
    { value: "24/7", label: "Cloud Synced" },
    { value: "Free", label: "Forever & Always" },
    { value: "Secure", label: "Your Data, Protected" },
  ];

  return (
    <div style={{ background: "#050510", color: "#fff", overflowX: "hidden" }}>

      {/* ═══════════════════════════════════════════════════════════
          NAVBAR — minimal glass over dark
      ═══════════════════════════════════════════════════════════ */}
      <nav className="navbar navbar-expand-lg fixed-top py-3" style={{
        background: "rgba(5, 5, 16, 0.6)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        zIndex: 100,
      }}>
        <div className="container">
          <Link href="/" className="navbar-brand fw-bold fs-5 text-white text-decoration-none d-flex align-items-center gap-2">
            <i className="bi bi-lightning-charge-fill" style={{ color: "#7cff67" }}></i>
            productivness
          </Link>

          <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
            <i className="bi bi-list text-white fs-4"></i>
          </button>

          <div className="collapse navbar-collapse" id="mainNav">
            <ul className="navbar-nav mx-auto gap-1">
              {["Features", "How It Works", "Stats"].map((item) => (
                <li key={item} className="nav-item">
                  <a className="nav-link text-white fw-medium" href={`#${item.toLowerCase().replace(/ /g, "-")}`}
                    style={{ opacity: 0.7, transition: "opacity 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
                  >{item}</a>
                </li>
              ))}
            </ul>
            <div className="d-flex align-items-center gap-2 mt-3 mt-lg-0">
              <Link href="/login" className="btn btn-outline-light rounded-pill px-4 fw-medium" style={{ borderColor: "rgba(255,255,255,0.2)" }}>
                Log In
              </Link>
              <Link href="/signup" className="btn rounded-pill px-4 fw-medium text-dark" style={{ background: "#fff" }}>
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION — Aurora background + bold copy
      ═══════════════════════════════════════════════════════════ */}
      <section className="position-relative d-flex align-items-center" style={{ minHeight: "100vh" }}>
        {/* Aurora background — full bleed */}
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 0 }}>
          <Aurora
            colorStops={["#7cff67", "#B19EEF", "#5227FF"]}
            blend={0.5}
            amplitude={1.0}
            speed={1}
          />
        </div>

        {/* Dark overlay for readability */}
        <div className="position-absolute top-0 start-0 w-100 h-100" style={{
          zIndex: 1,
          background: "linear-gradient(180deg, rgba(5,5,16,0.4) 0%, rgba(5,5,16,0.7) 60%, #050510 100%)",
        }} />

        <div className="container position-relative text-center" style={{ zIndex: 2, paddingTop: "8rem", paddingBottom: "6rem" }}>
          {/* Badge */}
          <div className="reveal-up mb-4">
            <span className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill" style={{
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
              fontSize: "0.85rem",
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7cff67", boxShadow: "0 0 8px #7cff67" }}></span>
              <span style={{ color: "rgba(255,255,255,0.85)" }}>All-in-One Productivity Platform</span>
            </span>
          </div>

          {/* Headline */}
          <h1 className="display-1 fw-bold lh-1 mb-4 reveal-up delay-1" style={{
            fontSize: "clamp(2.5rem, 6vw, 5.5rem)",
            letterSpacing: "-0.03em",
            maxWidth: 900,
            margin: "0 auto",
          }}>
            Level Up Your
            <br />
            <span style={{
              background: "linear-gradient(135deg, #7cff67, #B19EEF, #5227FF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Student Life</span>
          </h1>

          {/* Subtext */}
          <p className="fs-5 mb-5 mx-auto reveal-up delay-2" style={{
            color: "rgba(255,255,255,0.6)",
            maxWidth: 580,
            lineHeight: 1.7,
          }}>
            Goals, habits, tasks, finances, Pomodoro timer &amp; CGPA planning — everything you need to excel, in one beautiful dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="d-flex justify-content-center gap-3 flex-wrap mb-5 reveal-up delay-3">
            <Link href="/signup" className="btn btn-lg rounded-pill px-5 py-3 fw-semibold text-dark" style={{
              background: "#fff",
              boxShadow: "0 0 40px rgba(124, 255, 103, 0.2), 0 4px 20px rgba(0,0,0,0.3)",
              transition: "all 0.3s ease",
            }}>
              Get Started
            </Link>
            <a href="#features" className="btn btn-lg rounded-pill px-5 py-3 fw-semibold" style={{
              background: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
            }}>
              Learn More
            </a>
          </div>

          {/* Mini stats row */}
          <div className="d-flex justify-content-center gap-5 reveal-up delay-4">
            {[
              { val: "8+", label: "Tools" },
              { val: "24/7", label: "Cloud Sync" },
              { val: "100%", label: "Free" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="fw-bold fs-5" style={{ color: "#7cff67" }}>{s.val}</div>
                <small style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.78rem" }}>{s.label}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TRUSTED-BY RIBBON
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-center gap-4 gap-lg-5" style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.3)" }}>
            <span className="fw-semibold text-uppercase" style={{ letterSpacing: 1 }}>Built with</span>
            <span><i className="bi bi-filetype-tsx me-1"></i>Next.js</span>
            <span><i className="bi bi-bootstrap-fill me-1"></i>Bootstrap 5</span>
            <span><i className="bi bi-database me-1"></i>Supabase</span>
            <span><i className="bi bi-gpu-card me-1"></i>WebGL</span>
            <span><i className="bi bi-cloud-check me-1"></i>Cloud Synced</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES — Dark glass cards
      ═══════════════════════════════════════════════════════════ */}
      <section id="features" className="py-5 my-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-3" style={{
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.04)",
              fontSize: "0.8rem",
              color: "#B19EEF",
            }}>
              <i className="bi bi-grid-fill"></i> Features
            </span>
            <h2 className="display-5 fw-bold mb-3">
              Everything You Need to{" "}
              <span style={{
                background: "linear-gradient(135deg, #7cff67, #B19EEF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>Excel</span>
            </h2>
            <p className="mx-auto" style={{ maxWidth: 560, color: "rgba(255,255,255,0.5)", fontSize: "1.1rem" }}>
              Six powerful modules designed for students who refuse to be average.
            </p>
          </div>

          <div className="row g-4">
            {features.map((f, i) => (
              <div key={i} className="col-md-6 col-lg-4">
                <div className="h-100 p-4" style={{
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(10px)",
                  transition: "all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  cursor: "default",
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.borderColor = `${f.color}33`;
                    e.currentTarget.style.boxShadow = `0 20px 40px rgba(0,0,0,0.3), 0 0 30px ${f.color}11`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="d-flex align-items-center justify-content-center mb-3" style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `${f.color}18`,
                  }}>
                    <i className={`bi ${f.icon} fs-4`} style={{ color: f.color }}></i>
                  </div>
                  <h5 className="fw-bold mb-2">{f.title}</h5>
                  <p className="mb-0" style={{ color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          DASHBOARD PREVIEW — Glowing card
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-5">
        <div className="container">
          <div className="position-relative mx-auto" style={{ maxWidth: 900 }}>
            {/* Glow behind */}
            <div className="position-absolute top-50 start-50 translate-middle" style={{
              width: "80%", height: "80%", borderRadius: "50%",
              background: "radial-gradient(circle, rgba(82, 39, 255, 0.15) 0%, transparent 70%)",
              filter: "blur(60px)",
              zIndex: 0,
            }} />

            <div className="position-relative p-1" style={{
              borderRadius: 24,
              background: "linear-gradient(135deg, rgba(124,255,103,0.15), rgba(82,39,255,0.15))",
              zIndex: 1,
            }}>
              <div className="p-4" style={{ borderRadius: 22, background: "rgba(10, 10, 25, 0.95)" }}>
                {/* Window chrome */}
                <div className="d-flex align-items-center gap-2 mb-4">
                  <span className="rounded-circle" style={{ width: 12, height: 12, background: "#ff5f57" }}></span>
                  <span className="rounded-circle" style={{ width: 12, height: 12, background: "#febc2e" }}></span>
                  <span className="rounded-circle" style={{ width: 12, height: 12, background: "#28c840" }}></span>
                  <span className="ms-auto" style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.3)" }}>productivness / dashboard</span>
                </div>

                {/* Stat widgets */}
                <div className="row g-3 mb-3">
                  {[
                    { icon: "bi-bullseye",        c: "#ffc107", label: "Goals",   val: "5 Active" },
                    { icon: "bi-check2-square",   c: "#0d6efd", label: "To-Dos",  val: "12 / 15" },
                    { icon: "bi-fire",            c: "#34d399", label: "Habits",  val: "\u{1F525} 14 day" },
                    { icon: "bi-mortarboard-fill",c: "#0dcaf0", label: "CGPA",    val: "3.85" },
                    { icon: "bi-stopwatch",       c: "#f472b6", label: "Focus",   val: "2h 15m" },
                    { icon: "bi-wallet2",         c: "#10b981", label: "Balance", val: "$1,250" },
                  ].map((w, i) => (
                    <div className="col-4 col-md-2" key={i}>
                      <div className="rounded-3 p-2 p-md-3 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <i className={`bi ${w.icon} d-block mb-1`} style={{ color: w.c }}></i>
                        <small className="d-block fw-semibold text-truncate" style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.65rem" }}>{w.label}</small>
                        <div className="fw-bold small">{w.val}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Habit heatmap mini */}
                <div className="rounded-3 p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <small className="fw-semibold" style={{ color: "rgba(255,255,255,0.5)" }}>
                      <i className="bi bi-grid3x3-gap me-1"></i>Habit Heatmap
                    </small>
                    <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.3)" }}>This month</span>
                  </div>
                  <div className="d-flex gap-1 flex-wrap">
                    {Array.from({ length: 28 }).map((_, i) => {
                      const opacities = [0.05, 0.12, 0.25, 0.4, 0.6];
                      const opacity = opacities[i % opacities.length];
                      return <div key={i} className="rounded-1" style={{ width: 16, height: 16, background: `rgba(124, 255, 103, ${opacity})` }}></div>;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          HOW IT WORKS — Numbered steps
      ═══════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-5 my-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-3" style={{
              border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)",
              fontSize: "0.8rem", color: "#7cff67",
            }}>
              <i className="bi bi-signpost-split"></i> How It Works
            </span>
            <h2 className="display-5 fw-bold mb-3">
              Start in{" "}
              <span style={{
                background: "linear-gradient(135deg, #7cff67, #5227FF)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>3 Simple Steps</span>
            </h2>
          </div>

          <div className="row g-4 justify-content-center">
            {steps.map((s, i) => (
              <div key={i} className="col-md-4">
                <div className="text-center p-4" style={{
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                }}>
                  <div className="d-inline-flex align-items-center justify-content-center mb-3" style={{
                    width: 60, height: 60, borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(124,255,103,0.15), rgba(82,39,255,0.15))",
                    fontSize: "1.2rem", fontWeight: 800, color: "#7cff67",
                  }}>
                    {s.num}
                  </div>
                  <h5 className="fw-bold mb-2">{s.title}</h5>
                  <p className="mb-0" style={{ color: "rgba(255,255,255,0.5)" }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS RIBBON — Aurora-colored gradient
      ═══════════════════════════════════════════════════════════ */}
      <section id="stats" className="py-5 my-3">
        <div className="container">
          <div className="px-4 py-5 px-lg-5" style={{
            borderRadius: 28,
            background: "linear-gradient(135deg, #5227FF, #7cff67)",
            position: "relative",
            overflow: "hidden",
          }}>
            {/* Pattern overlay */}
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{
              background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat`,
            }} />
            <div className="row text-center text-white g-4 position-relative" style={{ zIndex: 1 }}>
              {stats.map((s, i) => (
                <div key={i} className="col-6 col-md-3">
                  <div className="display-5 fw-bold">{s.value}</div>
                  <div style={{ opacity: 0.8, fontSize: "0.9rem" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CTA — Final call to action with glow
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-5 my-5 position-relative">
        {/* Subtle aurora glow behind CTA */}
        <div className="position-absolute top-0 start-0 w-100" style={{ height: 400, zIndex: 0, opacity: 0.4 }}>
          <Aurora
            colorStops={["#5227FF", "#B19EEF", "#7cff67"]}
            blend={0.8}
            amplitude={0.6}
            speed={0.5}
          />
        </div>

        <div className="container position-relative" style={{ zIndex: 1 }}>
          <div className="text-center py-5">
            <h2 className="display-4 fw-bold mb-3">
              Ready to Be More{" "}
              <span style={{
                background: "linear-gradient(135deg, #7cff67, #B19EEF, #5227FF)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>Productive?</span>
            </h2>
            <p className="mx-auto mb-4" style={{ maxWidth: 480, color: "rgba(255,255,255,0.5)", fontSize: "1.1rem" }}>
              Join students who are already achieving more every single day.
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Link href="/signup" className="btn btn-lg rounded-pill px-5 py-3 fw-semibold text-dark" style={{
                background: "#fff",
                boxShadow: "0 0 40px rgba(124, 255, 103, 0.15), 0 4px 20px rgba(0,0,0,0.3)",
              }}>
                <i className="bi bi-rocket-takeoff me-2"></i>Get Started Free
              </Link>
              <Link href="/login" className="btn btn-lg rounded-pill px-5 py-3 fw-semibold" style={{
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.8)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}>
                <i className="bi bi-box-arrow-in-right me-2"></i>Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER — Dark minimal
      ═══════════════════════════════════════════════════════════ */}
      <footer className="py-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="container">
          <div className="row g-4 mb-4">
            {/* Brand */}
            <div className="col-lg-4">
              <Link href="/" className="text-decoration-none d-inline-flex align-items-center gap-2 mb-3">
                <i className="bi bi-lightning-charge-fill fs-4" style={{ color: "#7cff67" }}></i>
                <span className="fw-bold fs-5 text-white">productivness</span>
              </Link>
              <p className="mb-0" style={{ maxWidth: 300, fontSize: "0.92rem", color: "rgba(255,255,255,0.4)" }}>
                The all-in-one productivity platform built for ambitious students. Free and always evolving.
              </p>
            </div>
            {/* Product */}
            <div className="col-6 col-lg-2">
              <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: 1, color: "rgba(255,255,255,0.5)" }}>Product</h6>
              <div className="d-flex flex-column gap-2">
                {["Features", "How It Works", "Stats"].map((t) => (
                  <a key={t} href={`#${t.toLowerCase().replace(/ /g, "-")}`} className="text-decoration-none"
                    style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.92rem", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#7cff67")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                  >{t}</a>
                ))}
              </div>
            </div>
            {/* Tools */}
            <div className="col-6 col-lg-3">
              <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: 1, color: "rgba(255,255,255,0.5)" }}>Tools</h6>
              <div className="d-flex flex-column gap-2">
                {["Life Goals", "Smart To-Dos", "Habit Tracker", "Pomodoro Timer", "Finance Tracker", "CGPA Planner"].map((t) => (
                  <a key={t} href="#features" className="text-decoration-none"
                    style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.92rem", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#7cff67")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                  >{t}</a>
                ))}
              </div>
            </div>
            {/* Account */}
            <div className="col-6 col-lg-3">
              <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: 1, color: "rgba(255,255,255,0.5)" }}>Account</h6>
              <div className="d-flex flex-column gap-2">
                {[{ href: "/login", label: "Log In" }, { href: "/signup", label: "Create Account" }].map((l) => (
                  <Link key={l.href} href={l.href} className="text-decoration-none"
                    style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.92rem", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#7cff67")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                  >{l.label}</Link>
                ))}
              </div>
            </div>
          </div>
          <hr style={{ borderColor: "rgba(255,255,255,0.06)" }} />
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 pt-2">
            <small style={{ color: "rgba(255,255,255,0.3)" }}>&copy; {new Date().getFullYear()} productivness. All rights reserved.</small>
            <small style={{ color: "rgba(255,255,255,0.3)" }}>
              Made with <i className="bi bi-heart-fill" style={{ color: "#7cff67", fontSize: "0.7rem" }}></i> for students everywhere
            </small>
          </div>
        </div>
      </footer>
    </div>
  );
}
