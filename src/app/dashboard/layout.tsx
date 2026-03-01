/* =============================================================================
   Dashboard Layout — /dashboard/* (Bootstrap Redesign)
   ============================================================================= */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border mb-3" role="status" style={{ color: "var(--accent)", width: "2.5rem", height: "2.5rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-body-secondary small">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="d-flex min-vh-100">
      <Sidebar />
      <main className="flex-grow-1 min-vh-100 overflow-auto">
        {/* pt: 56px mobile topbar + 16px gap on small screens */}
        <div className="container-fluid p-3 p-md-4 pt-md-4" style={{ maxWidth: 1200, paddingTop: "calc(56px + 1rem)" }}>
          {children}
        </div>
      </main>
    </div>
  );
}
