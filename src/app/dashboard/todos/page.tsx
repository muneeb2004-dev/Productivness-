/* =============================================================================
   To-Do List Page — /dashboard/todos (Bootstrap Redesign)
   ============================================================================= */

"use client";

import { useState, useEffect, FormEvent } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Todo, Priority, TodoFilter } from "@/types";

export default function TodosPage() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchTodos = async () => {
      const { data, error } = await supabase
        .from("todos").select("*").eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setTodos(data);
    };
    fetchTodos();
  }, [user]);

  const filteredTodos = todos.filter((todo) => {
    if (filter === "completed") return todo.is_completed;
    if (filter === "pending") return !todo.is_completed;
    return true;
  });

  const handleAddTodo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setAdding(true);
    const { data, error } = await supabase
      .from("todos")
      .insert({ user_id: user.id, title, description, due_date: dueDate || null, priority, is_completed: false })
      .select().single();
    if (error) { toast.error("Failed to add task: " + error.message); }
    else if (data) {
      setTodos((prev) => [data, ...prev]);
      setTitle(""); setDescription(""); setDueDate(""); setPriority("medium"); setShowForm(false);
      toast.success("Task added!");
    }
    setAdding(false);
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("todos").update({ is_completed: !currentStatus }).eq("id", id);
    if (error) { toast.error("Failed to update task"); }
    else { setTodos((prev) => prev.map((t) => t.id === id ? { ...t, is_completed: !currentStatus } : t)); }
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) { toast.error("Failed to delete task"); }
    else { setTodos((prev) => prev.filter((t) => t.id !== id)); toast.success("Task deleted!"); }
  };

  const getPriorityBadge = (p: Priority) => {
    switch (p) {
      case "high": return "bg-danger bg-opacity-10 text-danger";
      case "medium": return "bg-warning bg-opacity-10 text-warning";
      case "low": return "bg-success bg-opacity-10 text-success";
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="icon-box bg-primary bg-opacity-10 rounded-3">
            <i className="bi bi-check2-square text-primary"></i>
          </div>
          <div>
            <h1 className="fs-4 fw-bold mb-0">To-Do List</h1>
            <small className="text-body-secondary">
              {todos.length} tasks &middot; {todos.filter((t) => t.is_completed).length} completed
            </small>
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-accent rounded-3 d-flex align-items-center gap-2">
          <i className="bi bi-plus-lg"></i> Add Task
        </button>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="card card-custom mb-4">
          <div className="card-body p-4">
            <form onSubmit={handleAddTodo}>
              <div className="mb-3">
                <label className="form-label fw-medium small">Task Title *</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" required className="form-control" />
              </div>
              <div className="mb-3">
                <label className="form-label fw-medium small">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add details..." rows={2} className="form-control" />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-sm-6">
                  <label className="form-label fw-medium small">Due Date</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="form-control" />
                </div>
                <div className="col-sm-6">
                  <label className="form-label fw-medium small">Priority</label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="form-select">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" disabled={adding} className="btn btn-accent rounded-3">
                  {adding ? <><span className="spinner-border spinner-border-sm me-1"></span>Adding...</> : "Add Task"}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline-secondary rounded-3">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="btn-group mb-4" role="group">
        {(["all", "pending", "completed"] as TodoFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`btn ${filter === f ? "btn-accent" : "btn-outline-secondary"} rounded-pill px-4`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Todo Items */}
      <div className="d-flex flex-column gap-3">
        {filteredTodos.map((todo) => (
          <div key={todo.id} className="card card-custom">
            <div className="card-body p-3 d-flex align-items-start gap-3">
              {/* Checkbox */}
              <button
                onClick={() => toggleComplete(todo.id, todo.is_completed)}
                className={`btn btn-sm rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center mt-1 ${
                  todo.is_completed ? "btn-success" : "btn-outline-secondary"
                }`}
                style={{ width: 28, height: 28 }}
              >
                {todo.is_completed && <i className="bi bi-check-lg text-white small"></i>}
              </button>

              {/* Content */}
              <div className="flex-grow-1 min-w-0">
                <h6 className={`mb-1 fw-medium ${todo.is_completed ? "text-decoration-line-through text-body-secondary" : ""}`}>
                  {todo.title}
                </h6>
                {todo.description && (
                  <p className="small text-body-secondary mb-1 text-truncate">{todo.description}</p>
                )}
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge rounded-pill ${getPriorityBadge(todo.priority)}`}>
                    {todo.priority}
                  </span>
                  {todo.due_date && (
                    <small className="text-body-secondary">
                      <i className="bi bi-calendar3 me-1"></i>
                      {new Date(todo.due_date).toLocaleDateString()}
                    </small>
                  )}
                </div>
              </div>

              {/* Delete */}
              <button onClick={() => deleteTodo(todo.id)} className="btn btn-sm btn-outline-danger rounded-circle flex-shrink-0" style={{ width: 32, height: 32 }} title="Delete task">
                <i className="bi bi-trash small"></i>
              </button>
            </div>
          </div>
        ))}

        {filteredTodos.length === 0 && (
          <div className="text-center py-5 text-body-secondary">
            <i className="bi bi-clipboard2 display-4 d-block mb-3 opacity-50"></i>
            <p>No tasks found. Add your first task!</p>
          </div>
        )}
      </div>
    </div>
  );
}
