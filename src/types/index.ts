/* =============================================================================
   TypeScript Type Definitions
   
   Centralized type definitions for all database tables and application models.
   These types mirror the Supabase database schema and ensure type safety
   throughout the application.
   ============================================================================= */

// ─── Authentication Types ────────────────────────────────────────────────────

/** Represents the authenticated user object from Supabase Auth */
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// ─── Life Goals Types ────────────────────────────────────────────────────────

/** Represents a user's life goals entry in the 'goals' table */
export interface Goal {
  id: string;           // UUID primary key
  user_id: string;      // FK to auth.users
  life_goal: string;    // Main life goal text / title
  five_year_goal: string; // 5-year vision text / description
  current_focus: string;  // Current focus area text / next steps
  deadline?: string;      // Target deadline (ISO date string)
  status?: "active" | "completed"; // Goal status
  created_at: string;   // Timestamp of creation
}

// ─── To-Do Types ─────────────────────────────────────────────────────────────

/** Priority levels for todo items */
export type Priority = "low" | "medium" | "high";

/** Filter options for the todo list view */
export type TodoFilter = "all" | "completed" | "pending";

/** Represents a single to-do item in the 'todos' table */
export interface Todo {
  id: string;           // UUID primary key
  user_id: string;      // FK to auth.users
  title: string;        // Task title
  description: string;  // Task description
  due_date: string;     // Due date string (ISO format)
  priority: Priority;   // Task priority level
  is_completed: boolean; // Completion status
  created_at: string;   // Timestamp of creation
}

// ─── Habit & Streak Types ────────────────────────────────────────────────────

/** Frequency options for habits */
export type HabitFrequency = "daily" | "weekly";

/** Represents a habit in the 'habits' table */
export interface Habit {
  id: string;           // UUID primary key
  user_id: string;      // FK to auth.users
  title: string;        // Habit name/title
  frequency: HabitFrequency; // How often the habit should be done
  created_at: string;   // Timestamp of creation
}

/** Represents a single habit log entry in the 'habit_logs' table */
export interface HabitLog {
  id: string;           // UUID primary key
  habit_id: string;     // FK to habits table
  date: string;         // Date of the log (YYYY-MM-DD)
  completed: boolean;   // Whether the habit was completed on this date
}

/** Extended habit type that includes computed streak information */
export interface HabitWithStreak extends Habit {
  streak: number;       // Current consecutive streak count
  logs: HabitLog[];     // Array of habit log entries
}

// ─── CGPA Types ──────────────────────────────────────────────────────────────

/** Represents CGPA tracking data in the 'cgpa' table */
export interface CGPA {
  id: string;           // UUID primary key
  user_id: string;      // FK to auth.users
  current_cgpa: number; // Current CGPA value
  target_cgpa: number;  // Target/desired CGPA value
  completed_credits: number; // Total credits completed so far
  created_at: string;   // Timestamp of creation
}

/** Grade values for GPA calculation */
export type Grade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F";

/** Represents a subject for CGPA planning in the 'subjects' table */
export interface Subject {
  id: string;           // UUID primary key
  user_id: string;      // FK to auth.users
  subject_name: string; // Name of the subject/course
  credit_hours: number; // Credit hours for this subject
  target_grade: Grade | string;  // Target grade to achieve
  current_grade: Grade | string; // Current grade (if available)
}

// ─── Semester Tracker Types ──────────────────────────────────────────────────

/** Represents a semester in the 'semesters' table */
export interface Semester {
  id: string;           // UUID primary key
  user_id: string;      // FK to auth.users
  semester_number: number; // Semester number (e.g., 1, 2, 3...)
  year: number;         // Academic year
}

/** Represents a subject within a semester in 'semester_subjects' table */
export interface SemesterSubject {
  id: string;           // UUID primary key
  semester_id: string;  // FK to semesters table
  name: string;         // Subject name
  credit_hours: number; // Credit hours
}

/** Types of academic events */
export type EventType = "quiz" | "assignment" | "mid" | "final" | "lab";

/** Represents an academic event in the 'academic_events' table */
export interface AcademicEvent {
  id: string;           // UUID primary key
  subject_id: string;   // FK to semester_subjects table
  type: EventType;      // Type of academic event
  title: string;        // Event title
  due_date: string;     // Due date (ISO format)
  marks: number | null; // Marks received (null if not graded yet)
  is_completed: boolean; // Whether the event is done
}

/** Represents a note attached to a subject in the 'notes' table */
export interface Note {
  id: string;           // UUID primary key
  subject_id: string;   // FK to semester_subjects table
  title: string;        // Note title
  content: string;      // Note content text
  created_at: string;   // Timestamp of creation
}

/** Extended semester subject with its events and notes */
export interface SemesterSubjectWithDetails extends SemesterSubject {
  events: AcademicEvent[];
  notes: Note[];
}

// ─── Financial Tracker Types ─────────────────────────────────────────────────

/** Transaction type */
export type TxnType = "income" | "expense";

/** Transaction categories */
export type TxnCategory =
  | "food" | "transport" | "entertainment" | "education"
  | "shopping" | "bills" | "salary" | "freelance" | "gift" | "other";

/** Represents a financial transaction in the 'transactions' table */
export interface Transaction {
  id: string;
  user_id: string;
  type: TxnType;
  category: TxnCategory;
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

/** Represents a monthly budget in the 'budgets' table */
export interface Budget {
  id: string;
  user_id: string;
  month: string;  // YYYY-MM format
  amount: number;
}
