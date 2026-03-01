/* =============================================================================
   Sidebar Component — Bootstrap Offcanvas + Desktop Sidebar
   ============================================================================= */

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import toast from "react-hot-toast";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "bi-house-door" },
  { href: "/dashboard/goals", label: "Life Goals", icon: "bi-star" },
  { href: "/dashboard/todos", label: "To-Do List", icon: "bi-check2-square" },
  { href: "/dashboard/habits", label: "Habits", icon: "bi-arrow-repeat" },
  { href: "/dashboard/pomodoro", label: "Pomodoro", icon: "bi-stopwatch" },
  { href: "/dashboard/finances", label: "Finances", icon: "bi-wallet2" },
  { href: "/dashboard/cgpa", label: "CGPA Planner", icon: "bi-mortarboard" },
  { href: "/dashboard/semester", label: "Semester", icon: "bi-book" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out successfully!");
    router.push("/login");
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    // Close offcanvas on mobile after navigation
    const offcanvasEl = document.getElementById("sidebarOffcanvas");
    if (offcanvasEl) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bsOffcanvas = (window as any).bootstrap?.Offcanvas?.getInstance(offcanvasEl);
      bsOffcanvas?.hide();
    }
  };

  const sidebarContent = (
    <div className="d-flex flex-column h-100">
      {/* Brand */}
      <div className="px-3 pt-4 pb-3">
        <button onClick={() => handleNavClick("/dashboard")} className="brand-link border-0 bg-transparent p-0 text-start w-100">
          <h1 className="gradient-text fw-bold fs-5 mb-0">
            <i className="bi bi-lightning-charge-fill me-2"></i>productivness
          </h1>
          <small className="text-body-secondary text-uppercase" style={{ fontSize: "0.65rem", letterSpacing: "0.1em" }}>
            Your Productivity Hub
          </small>
        </button>
      </div>

      <hr className="mx-3 my-1" />

      {/* Navigation */}
      <nav className="flex-grow-1 px-3 py-2 overflow-auto">
        <ul className="nav flex-column gap-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <li key={item.href} className="nav-item">
                <button
                  onClick={() => handleNavClick(item.href)}
                  className={`nav-link w-100 text-start d-flex align-items-center gap-3 ${isActive ? "active" : ""}`}
                >
                  <i className={`bi ${item.icon} fs-5`}></i>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="px-3 pb-3 mt-auto">
        {/* Theme toggle */}
        <div className="d-flex align-items-center justify-content-between mb-3 px-2">
          <small className="text-body-secondary fw-medium">Theme</small>
          <ThemeToggle />
        </div>

        <hr className="my-2" />

        {/* User email */}
        <p className="small text-body-secondary text-truncate px-2 mb-2">
          <i className="bi bi-person-circle me-1"></i>
          {user?.email ?? "Loading..."}
        </p>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="btn btn-outline-danger w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 btn-sm"
        >
          <i className="bi bi-box-arrow-left"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Mobile Top Bar ───────────────────────────────────── */}
      <div
        className="d-md-none position-fixed top-0 start-0 w-100 d-flex align-items-center px-3 mobile-topbar"
        style={{ zIndex: 1060, height: 56 }}
      >
        <button
          className="btn btn-outline-secondary rounded-3 d-flex align-items-center justify-content-center"
          style={{ width: 40, height: 40 }}
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#sidebarOffcanvas"
          aria-label="Toggle sidebar"
        >
          <i className="bi bi-list fs-5"></i>
        </button>
        <button onClick={() => handleNavClick("/dashboard")} className="brand-link border-0 bg-transparent p-0 ms-3">
          <span className="gradient-text fw-bold fs-6">
            <i className="bi bi-lightning-charge-fill me-1"></i>productivness
          </span>
        </button>
      </div>

      {/* ─── Desktop Sidebar ────────────────────────────────────── */}
      <aside className="sidebar d-none d-md-flex flex-column border-end sticky-top" style={{ height: "100vh" }}>
        {sidebarContent}
      </aside>

      {/* ─── Mobile Offcanvas Sidebar ───────────────────────────── */}
      <div
        className="offcanvas offcanvas-start d-md-none bg-body-tertiary"
        tabIndex={-1}
        id="sidebarOffcanvas"
        aria-labelledby="sidebarLabel"
      >
        <div className="offcanvas-header pb-0">
          <h5 className="offcanvas-title gradient-text fw-bold" id="sidebarLabel">
            <i className="bi bi-lightning-charge-fill me-2"></i>productivness
          </h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body p-0">
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
