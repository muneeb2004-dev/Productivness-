/* =============================================================================
   Dashboard Home Page — /dashboard (Bootstrap Redesign)
   ============================================================================= */

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

interface DashboardStats {
  goalsCount: number;
  todosTotal: number;
  todosCompleted: number;
  habitsCount: number;
  currentCGPA: number | null;
  monthIncome: number;
  monthExpenses: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    goalsCount: 0, todosTotal: 0, todosCompleted: 0, habitsCount: 0, currentCGPA: null,
    monthIncome: 0, monthExpenses: 0,
  });


  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      try {
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        const [goalsRes, todosRes, habitsRes, cgpaRes, txnRes] = await Promise.all([
          supabase.from("goals").select("id, status").eq("user_id", user.id),
          supabase.from("todos").select("id, is_completed").eq("user_id", user.id),
          supabase.from("habits").select("id").eq("user_id", user.id),
          supabase.from("cgpa").select("current_cgpa").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1),
          supabase.from("transactions").select("type, amount, date").eq("user_id", user.id).gte("date", currentMonth + "-01").lte("date", currentMonth + "-31"),
        ]);
        const activeGoals = goalsRes.data?.filter((g) => g.status !== "completed").length ?? 0;
        // Gracefully handle missing transactions table
        const monthIncome = txnRes.error ? 0 : txnRes.data?.filter((t) => t.type === "income").reduce((s, t) => s + (t.amount || 0), 0) ?? 0;
        const monthExpenses = txnRes.error ? 0 : txnRes.data?.filter((t) => t.type === "expense").reduce((s, t) => s + (t.amount || 0), 0) ?? 0;
        setStats({
          goalsCount: activeGoals,
          todosTotal: todosRes.data?.length ?? 0,
          todosCompleted: todosRes.data?.filter((t) => t.is_completed).length ?? 0,
          habitsCount: habitsRes.data?.length ?? 0,
          currentCGPA: cgpaRes.data?.[0]?.current_cgpa ?? null,
          monthIncome,
          monthExpenses,
        });
      } catch {
        console.error("Failed to fetch dashboard stats");
      }
    };
    fetchStats();
  }, [user]);



  const statCards = [
    {
      label: "Life Goals",
      value: stats.goalsCount.toString(),
      subtitle: "active goals",
      icon: "bi-star-fill",
      bgClass: "bg-warning bg-opacity-10",
      iconColor: "#ffc107",
    },
    {
      label: "To-Dos",
      value: `${stats.todosCompleted}/${stats.todosTotal}`,
      subtitle: "completed",
      icon: "bi-check2-square",
      bgClass: "bg-primary bg-opacity-10",
      iconColor: "#0d6efd",
    },
    {
      label: "Habits",
      value: stats.habitsCount.toString(),
      subtitle: "active habits",
      icon: "bi-arrow-repeat",
      bgClass: "bg-success bg-opacity-10",
      iconColor: "#198754",
    },
    {
      label: "CGPA",
      value: stats.currentCGPA !== null ? stats.currentCGPA.toFixed(2) : "N/A",
      subtitle: "current",
      icon: "bi-mortarboard-fill",
      bgClass: "bg-info bg-opacity-10",
      iconColor: "#0dcaf0",
    },
    {
      label: "Balance",
      value: `Rs ${(stats.monthIncome - stats.monthExpenses).toLocaleString()}`,
      subtitle: "this month",
      icon: "bi-wallet2",
      bgClass: "bg-danger bg-opacity-10",
      iconColor: "#dc3545",
    },
  ];

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-4">
        <h1 className="fw-bold fs-3 mb-1">Welcome back! 👋</h1>
        <p className="text-body-secondary">
          {user?.email} — Here&apos;s your productivity overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        {statCards.map((card) => (
          <div key={card.label} className="col-6 col-lg-3">
            <div className="card card-custom h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className={`icon-box ${card.bgClass} rounded-3`}>
                    <i className={`bi ${card.icon}`} style={{ color: card.iconColor }}></i>
                  </div>
                  <span className="small fw-semibold text-body-secondary">{card.label}</span>
                </div>
                <p className="fs-4 fw-bold mb-0">{card.value}</p>
                {card.subtitle && (
                  <small className="text-body-secondary">{card.subtitle}</small>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
