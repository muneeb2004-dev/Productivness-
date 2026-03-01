/* =============================================================================
   ThemeToggle Component — Bootstrap Dark/Light Mode Switch
   ============================================================================= */

"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.setAttribute("data-bs-theme", "dark");
    } else if (saved === "light") {
      setIsDark(false);
      document.documentElement.setAttribute("data-bs-theme", "light");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
      document.documentElement.setAttribute("data-bs-theme", prefersDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.setAttribute("data-bs-theme", "light");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-sm btn-outline-secondary rounded-pill d-flex align-items-center gap-2 px-3"
      aria-label="Toggle theme"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <>
          <i className="bi bi-moon-stars-fill"></i>
          <span className="d-none d-sm-inline small">Dark</span>
        </>
      ) : (
        <>
          <i className="bi bi-sun-fill"></i>
          <span className="d-none d-sm-inline small">Light</span>
        </>
      )}
    </button>
  );
}
