/* =============================================================================
   AuroraBg — Lightweight CSS-only aurora backdrop for dashboard / auth pages
   Uses animated gradient orbs + blur for a dreamy ambient glow.
   ============================================================================= */

"use client";

export default function AuroraBg() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div className="aurora-orb aurora-orb--1" />
      <div className="aurora-orb aurora-orb--2" />
      <div className="aurora-orb aurora-orb--3" />
      <div className="aurora-orb aurora-orb--4" />
    </div>
  );
}
