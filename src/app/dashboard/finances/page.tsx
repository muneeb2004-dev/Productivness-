/* =============================================================================
   Financial Tracker Page — /dashboard/finances
   ============================================================================= */

"use client";

import { useState, useEffect, FormEvent } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";

/* ── Types ────────────────────────────────────────────────── */
type TxnType = "income" | "expense";
type TxnCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "education"
  | "shopping"
  | "bills"
  | "salary"
  | "freelance"
  | "gift"
  | "other";

interface Transaction {
  id: string;
  user_id: string;
  type: TxnType;
  category: TxnCategory;
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

const CATEGORIES: Record<TxnCategory, { label: string; icon: string; color: string }> = {
  food: { label: "Food & Dining", icon: "bi-cup-straw", color: "#fd7e14" },
  transport: { label: "Transport", icon: "bi-bus-front", color: "#6f42c1" },
  entertainment: { label: "Entertainment", icon: "bi-controller", color: "#e91e8c" },
  education: { label: "Education", icon: "bi-book", color: "#0d6efd" },
  shopping: { label: "Shopping", icon: "bi-bag", color: "#20c997" },
  bills: { label: "Bills & Utilities", icon: "bi-lightning", color: "#ffc107" },
  salary: { label: "Salary", icon: "bi-wallet2", color: "#198754" },
  freelance: { label: "Freelance", icon: "bi-laptop", color: "#0dcaf0" },
  gift: { label: "Gift", icon: "bi-gift", color: "#d63384" },
  other: { label: "Other", icon: "bi-three-dots", color: "#6c757d" },
};

const EXPENSE_CATS: TxnCategory[] = ["food", "transport", "entertainment", "education", "shopping", "bills", "other"];
const INCOME_CATS: TxnCategory[] = ["salary", "freelance", "gift", "other"];

export default function FinancesPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  /* ── Form state ─────────────────────────────────────────── */
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [type, setType] = useState<TxnType>("expense");
  const [category, setCategory] = useState<TxnCategory>("food");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState(false);

  /* ── Filter state ───────────────────────────────────────── */
  const [filterType, setFilterType] = useState<"all" | TxnType>("all");
  const [filterMonth, setFilterMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  /* ── Budget state ───────────────────────────────────────── */
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [showBudget, setShowBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [dbAvailable, setDbAvailable] = useState(true);

  /* ── Fetch transactions ─────────────────────────────────── */
  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error && (error.message.includes("not find the table") || error.message.includes("does not exist") || error.code === "42P01")) {
        setDbAvailable(false);
        setLoading(false);
        return;
      }
      if (!error && data) setTransactions(data);

      // Fetch budget
      const { data: budgetData } = await supabase
        .from("budgets")
        .select("amount")
        .eq("user_id", user.id)
        .eq("month", filterMonth)
        .single();
      if (budgetData) setMonthlyBudget(budgetData.amount);

      setLoading(false);
    };
    fetchData();
  }, [user, filterMonth]);

  /* ── Save transaction ───────────────────────────────────── */
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !amount) { toast.error("Amount is required"); return; }
    setSaving(true);

    const txnData = {
      user_id: user.id,
      type,
      category,
      amount: parseFloat(amount),
      description,
      date,
    };

    if (editingId) {
      const { data, error } = await supabase.from("transactions").update(txnData).eq("id", editingId).select().single();
      if (error) toast.error("Failed to update: " + error.message);
      else if (data) {
        setTransactions((prev) => prev.map((t) => t.id === editingId ? data as Transaction : t));
        toast.success("Transaction updated!");
      }
    } else {
      const { data, error } = await supabase.from("transactions").insert(txnData).select().single();
      if (error) { if (error.message.includes("not find the table") || error.message.includes("does not exist")) { setDbAvailable(false); setSaving(false); return; } toast.error("Failed to add: " + error.message); }
      else if (data) {
        setTransactions((prev) => [data as Transaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        toast.success("Transaction added!");
      }
    }

    resetForm();
    setSaving(false);
  };

  /* ── Delete ─────────────────────────────────────────────── */
  const deleteTxn = async (id: string) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) toast.error("Failed to delete");
    else { setTransactions((prev) => prev.filter((t) => t.id !== id)); toast.success("Deleted!"); }
  };

  /* ── Edit ───────────────────────────────────────────────── */
  const startEdit = (txn: Transaction) => {
    setEditingId(txn.id);
    setType(txn.type);
    setCategory(txn.category);
    setAmount(txn.amount.toString());
    setDescription(txn.description);
    setDate(txn.date);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ── Reset form ─────────────────────────────────────────── */
  const resetForm = () => {
    setEditingId(null);
    setType("expense");
    setCategory("food");
    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setShowForm(false);
  };

  /* ── Save budget ────────────────────────────────────────── */
  const saveBudget = async () => {
    if (!user || !budgetInput) return;
    const amt = parseFloat(budgetInput);
    const { error } = await supabase.from("budgets").upsert({
      user_id: user.id,
      month: filterMonth,
      amount: amt,
    }, { onConflict: "user_id,month" });
    if (error) toast.error("Failed to save budget: " + error.message);
    else { setMonthlyBudget(amt); setShowBudget(false); toast.success("Budget set!"); }
  };

  /* ── Filtered & computed ────────────────────────────────── */
  const monthTxns = transactions.filter((t) => t.date.startsWith(filterMonth));
  const filteredTxns = filterType === "all" ? monthTxns : monthTxns.filter((t) => t.type === filterType);

  const totalIncome = monthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpenses = monthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const budgetUsed = monthlyBudget > 0 ? (totalExpenses / monthlyBudget) * 100 : 0;

  /* ── Expense by category ────────────────────────────────── */
  const expenseByCategory = monthTxns
    .filter((t) => t.type === "expense")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});
  const topCategories = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);

  /* ── Format currency ────────────────────────────────────── */
  const fmt = (n: number) => n.toLocaleString("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border" style={{ color: "var(--accent)" }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  /* ── Missing table notice ───────────────────────────────── */
  if (!dbAvailable) {
    return (
      <div>
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="icon-box bg-success bg-opacity-10 rounded-3">
            <i className="bi bi-wallet2 text-success"></i>
          </div>
          <div>
            <h1 className="fs-4 fw-bold mb-0">Financial Tracker</h1>
            <small className="text-body-secondary">Track your income &amp; expenses</small>
          </div>
        </div>
        <div className="card card-custom">
          <div className="card-body p-4 text-center">
            <i className="bi bi-database-exclamation display-4 d-block mb-3 text-warning"></i>
            <h5 className="fw-bold mb-2">Database Tables Not Found</h5>
            <p className="text-body-secondary mb-3" style={{ maxWidth: 500, margin: "0 auto" }}>
              The <code>transactions</code> and <code>budgets</code> tables haven&apos;t been created in your Supabase database yet.
              Run the SQL below in the <strong>Supabase SQL Editor</strong> to set them up:
            </p>
            <div className="text-start mx-auto p-3 rounded-3" style={{ maxWidth: 640, background: "var(--bs-tertiary-bg)", fontSize: "0.78rem", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
{`-- 1) Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        text NOT NULL CHECK (type IN ('income','expense')),
  category    text NOT NULL DEFAULT 'other',
  amount      numeric NOT NULL DEFAULT 0,
  description text DEFAULT '',
  date        date NOT NULL DEFAULT CURRENT_DATE,
  created_at  timestamptz DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own transactions"
  ON public.transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 2) Budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
  id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month    text NOT NULL,
  amount   numeric NOT NULL DEFAULT 0,
  UNIQUE(user_id, month)
);
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own budgets"
  ON public.budgets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);`}
            </div>
            <button className="btn btn-accent rounded-3 mt-3" onClick={() => { navigator.clipboard.writeText(`CREATE TABLE IF NOT EXISTS public.transactions (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n  type text NOT NULL CHECK (type IN ('income','expense')),\n  category text NOT NULL DEFAULT 'other',\n  amount numeric NOT NULL DEFAULT 0,\n  description text DEFAULT '',\n  date date NOT NULL DEFAULT CURRENT_DATE,\n  created_at timestamptz DEFAULT now()\n);\nALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "Users manage own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);\n\nCREATE TABLE IF NOT EXISTS public.budgets (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,\n  month text NOT NULL,\n  amount numeric NOT NULL DEFAULT 0,\n  UNIQUE(user_id, month)\n);\nALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;\nCREATE POLICY "Users manage own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);`); toast.success("SQL copied to clipboard!"); }}>
              <i className="bi bi-clipboard me-2"></i>Copy SQL
            </button>
            <p className="text-body-secondary small mt-3 mb-0">After running the SQL, refresh this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-box bg-success bg-opacity-10 rounded-3">
            <i className="bi bi-wallet2 text-success"></i>
          </div>
          <div>
            <h1 className="fs-4 fw-bold mb-0">Financial Tracker</h1>
            <small className="text-body-secondary">Track your income &amp; expenses</small>
          </div>
        </div>
        <div className="d-flex gap-2">
          <input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="form-control form-control-sm"
            style={{ width: 160 }}
          />
          <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="btn btn-accent rounded-3 d-flex align-items-center gap-2">
            <i className={`bi ${showForm ? "bi-x-lg" : "bi-plus-lg"}`}></i>
            {showForm ? "Cancel" : "Add Transaction"}
          </button>
        </div>
      </div>

      {/* ═══ Summary Cards ════════════════════════════════════ */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card card-custom h-100">
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-arrow-down-circle text-success fs-5"></i>
                <small className="fw-medium text-body-secondary">Income</small>
              </div>
              <p className="fs-5 fw-bold text-success mb-0">{fmt(totalIncome)}</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card card-custom h-100">
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-arrow-up-circle text-danger fs-5"></i>
                <small className="fw-medium text-body-secondary">Expenses</small>
              </div>
              <p className="fs-5 fw-bold text-danger mb-0">{fmt(totalExpenses)}</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card card-custom h-100">
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className={`bi bi-cash-stack fs-5 ${balance >= 0 ? "text-primary" : "text-danger"}`}></i>
                <small className="fw-medium text-body-secondary">Balance</small>
              </div>
              <p className={`fs-5 fw-bold mb-0 ${balance >= 0 ? "text-primary" : "text-danger"}`}>{fmt(balance)}</p>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card card-custom h-100 cursor-pointer" onClick={() => { setBudgetInput(monthlyBudget.toString()); setShowBudget(true); }} style={{ cursor: "pointer" }}>
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-piggy-bank text-warning fs-5"></i>
                <small className="fw-medium text-body-secondary">Budget</small>
              </div>
              {monthlyBudget > 0 ? (
                <>
                  <p className="fs-5 fw-bold mb-1">{fmt(monthlyBudget)}</p>
                  <div className="progress" style={{ height: 6 }}>
                    <div
                      className={`progress-bar ${budgetUsed > 100 ? "bg-danger" : budgetUsed > 80 ? "bg-warning" : "bg-success"}`}
                      style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                    />
                  </div>
                  <small className="text-body-secondary">{budgetUsed.toFixed(0)}% used</small>
                </>
              ) : (
                <p className="small text-body-secondary mb-0">Click to set budget</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ Budget Modal ═════════════════════════════════════ */}
      {showBudget && (
        <div className="card card-custom mb-4">
          <div className="card-body p-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-piggy-bank me-2"></i>Set Monthly Budget</h6>
            <div className="d-flex gap-2">
              <input type="number" className="form-control" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} placeholder="e.g., 500" min={0} step={10} />
              <button onClick={saveBudget} className="btn btn-accent rounded-3">Save</button>
              <button onClick={() => setShowBudget(false)} className="btn btn-outline-secondary rounded-3">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Add / Edit Form ══════════════════════════════════ */}
      {showForm && (
        <div className="card card-custom mb-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-3">
              <i className={`bi ${editingId ? "bi-pencil" : "bi-plus-circle"} me-2`}></i>
              {editingId ? "Edit Transaction" : "New Transaction"}
            </h5>
            <form onSubmit={handleSave}>
              {/* Type toggle */}
              <div className="d-flex gap-2 mb-3">
                <button type="button" onClick={() => { setType("expense"); setCategory("food"); }}
                  className={`btn flex-fill rounded-pill ${type === "expense" ? "btn-danger" : "btn-outline-secondary"}`}>
                  <i className="bi bi-arrow-up-circle me-1"></i> Expense
                </button>
                <button type="button" onClick={() => { setType("income"); setCategory("salary"); }}
                  className={`btn flex-fill rounded-pill ${type === "income" ? "btn-success" : "btn-outline-secondary"}`}>
                  <i className="bi bi-arrow-down-circle me-1"></i> Income
                </button>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-sm-4">
                  <label className="form-label small fw-medium">Amount *</label>
                  <div className="input-group">
                    <span className="input-group-text">Rs</span>
                    <input type="number" className="form-control" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" min="0" required />
                  </div>
                </div>
                <div className="col-sm-4">
                  <label className="form-label small fw-medium">Category</label>
                  <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value as TxnCategory)}>
                    {(type === "expense" ? EXPENSE_CATS : INCOME_CATS).map((c) => (
                      <option key={c} value={c}>{CATEGORIES[c].label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-sm-4">
                  <label className="form-label small fw-medium">Date</label>
                  <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-medium">Description</label>
                <input className="form-control" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Grocery shopping, Monthly salary..." />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" disabled={saving} className="btn btn-accent rounded-3 d-flex align-items-center gap-2">
                  <i className="bi bi-floppy"></i>
                  {saving ? <><span className="spinner-border spinner-border-sm"></span> Saving...</> : editingId ? "Update" : "Add Transaction"}
                </button>
                <button type="button" onClick={resetForm} className="btn btn-outline-secondary rounded-3">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ Top Spending Categories ══════════════════════════ */}
      {topCategories.length > 0 && (
        <div className="card card-custom mb-4">
          <div className="card-body p-4">
            <h6 className="fw-bold mb-3"><i className="bi bi-bar-chart me-2"></i>Top Spending Categories</h6>
            {topCategories.map(([cat, amt]) => {
              const catInfo = CATEGORIES[cat as TxnCategory];
              const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
              return (
                <div key={cat} className="d-flex align-items-center gap-3 mb-2">
                  <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 32, height: 32, backgroundColor: catInfo.color + "22" }}>
                    <i className={`bi ${catInfo.icon} small`} style={{ color: catInfo.color }}></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-medium">{catInfo.label}</span>
                      <span className="text-body-secondary">{fmt(amt)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="progress" style={{ height: 5 }}>
                      <div className="progress-bar" style={{ width: `${pct}%`, backgroundColor: catInfo.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ Transactions List ════════════════════════════════ */}
      <div className="card card-custom">
        <div className="card-body p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h6 className="fw-bold mb-0"><i className="bi bi-list-ul me-2"></i>Transactions</h6>
            <div className="btn-group btn-group-sm">
              {(["all", "income", "expense"] as const).map((f) => (
                <button key={f} onClick={() => setFilterType(f)}
                  className={`btn ${filterType === f ? "btn-accent" : "btn-outline-secondary"} rounded-0 ${f === "all" ? "rounded-start" : ""} ${f === "expense" ? "rounded-end" : ""}`}>
                  {f === "all" ? "All" : f === "income" ? "Income" : "Expenses"}
                </button>
              ))}
            </div>
          </div>

          {filteredTxns.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-inbox display-4 d-block mb-2 opacity-25"></i>
              <p className="text-body-secondary mb-0">No transactions this month</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {filteredTxns.map((txn) => {
                const catInfo = CATEGORIES[txn.category] || CATEGORIES.other;
                return (
                  <div key={txn.id} className="list-group-item bg-transparent border-start-0 border-end-0 px-0 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: 40, height: 40, backgroundColor: catInfo.color + "22" }}>
                        <i className={`bi ${catInfo.icon}`} style={{ color: catInfo.color }}></i>
                      </div>
                      <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-center gap-2">
                          <span className="fw-medium small">{txn.description || catInfo.label}</span>
                          <span className="badge bg-body-secondary text-body-secondary rounded-pill" style={{ fontSize: "0.65rem" }}>{catInfo.label}</span>
                        </div>
                        <small className="text-body-secondary">
                          {new Date(txn.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </small>
                      </div>
                      <span className={`fw-bold ${txn.type === "income" ? "text-success" : "text-danger"}`}>
                        {txn.type === "income" ? "+" : "-"}{fmt(txn.amount)}
                      </span>
                      <div className="d-flex gap-1">
                        <button onClick={() => startEdit(txn)} className="btn btn-sm btn-outline-secondary rounded-circle" style={{ width: 28, height: 28 }} title="Edit">
                          <i className="bi bi-pencil" style={{ fontSize: "0.65rem" }}></i>
                        </button>
                        <button onClick={() => deleteTxn(txn.id)} className="btn btn-sm btn-outline-danger rounded-circle" style={{ width: 28, height: 28 }} title="Delete">
                          <i className="bi bi-trash" style={{ fontSize: "0.65rem" }}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
