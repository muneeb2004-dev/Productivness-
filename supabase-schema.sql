-- =============================================================================
-- Supabase SQL Schema — productivness App
-- 
-- Run this SQL in your Supabase SQL Editor to create all required tables.
-- Make sure to enable Row Level Security (RLS) on each table!
-- 
-- Steps:
-- 1. Go to your Supabase Dashboard → SQL Editor
-- 2. Paste this entire file and click "Run"
-- 3. Then run the RLS policies below
-- =============================================================================

-- ─── Enable UUID Extension (if not already enabled) ──────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. Goals Table ─────────────────────────────────────────────────────────
-- Stores the user's life goal, 5-year vision, and current focus
CREATE TABLE IF NOT EXISTS goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  life_goal TEXT DEFAULT '',
  five_year_goal TEXT DEFAULT '',
  current_focus TEXT DEFAULT '',
  deadline DATE DEFAULT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Todos Table ─────────────────────────────────────────────────────────
-- Stores individual to-do items with priority and due dates
CREATE TABLE IF NOT EXISTS todos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  due_date DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. Habits Table ────────────────────────────────────────────────────────
-- Stores habits the user wants to track (daily or weekly)
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly')) DEFAULT 'daily',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. Habit Logs Table ────────────────────────────────────────────────────
-- Records whether a habit was completed on a specific date
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT TRUE,
  UNIQUE(habit_id, date)  -- Prevent duplicate logs for the same habit on the same day
);

-- ─── 5. CGPA Table ──────────────────────────────────────────────────────────
-- Stores the user's current and target CGPA information
CREATE TABLE IF NOT EXISTS cgpa (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_cgpa NUMERIC(3,2) DEFAULT 0,
  target_cgpa NUMERIC(3,2) DEFAULT 0,
  completed_credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. Subjects Table (for CGPA planning) ─────────────────────────────────
-- Stores upcoming subjects for CGPA improvement planning
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_name TEXT NOT NULL,
  credit_hours INTEGER DEFAULT 3,
  target_grade TEXT DEFAULT '',
  current_grade TEXT DEFAULT ''
);

-- ─── 7. Semesters Table ─────────────────────────────────────────────────────
-- Stores semester information (number and year)
CREATE TABLE IF NOT EXISTS semesters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  semester_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 8. Semester Subjects Table ─────────────────────────────────────────────
-- Stores subjects within a specific semester
CREATE TABLE IF NOT EXISTS semester_subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  semester_id UUID REFERENCES semesters(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  credit_hours INTEGER DEFAULT 3
);

-- ─── 9. Academic Events Table ───────────────────────────────────────────────
-- Stores quizzes, assignments, midterms, finals, labs for each subject
CREATE TABLE IF NOT EXISTS academic_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES semester_subjects(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('quiz', 'assignment', 'mid', 'final', 'lab')) NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  marks NUMERIC,
  is_completed BOOLEAN DEFAULT FALSE
);

-- ─── 10. Notes Table ────────────────────────────────────────────────────────
-- Stores notes attached to subjects
CREATE TABLE IF NOT EXISTS notes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES semester_subjects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ─── 11. Transactions Table (Financial Tracker) ─────────────────────────────
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
  category TEXT DEFAULT 'other',
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 12. Budgets Table (Monthly Budget) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- Format: YYYY-MM
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  UNIQUE(user_id, month)
);


-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- These ensure each user can only access their own data.
-- =============================================================================

-- ─── Enable RLS on all tables ────────────────────────────────────────────────
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cgpa ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE semester_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- ─── Goals policies ──────────────────────────────────────────────────────────
CREATE POLICY "Users can view own goals" ON goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goals" ON goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON goals FOR DELETE USING (auth.uid() = user_id);

-- ─── Todos policies ─────────────────────────────────────────────────────────
CREATE POLICY "Users can view own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own todos" ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own todos" ON todos FOR DELETE USING (auth.uid() = user_id);

-- ─── Habits policies ────────────────────────────────────────────────────────
CREATE POLICY "Users can view own habits" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits FOR DELETE USING (auth.uid() = user_id);

-- ─── Habit Logs policies (via habit ownership) ──────────────────────────────
CREATE POLICY "Users can view own habit logs" ON habit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "Users can insert own habit logs" ON habit_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "Users can update own habit logs" ON habit_logs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()));
CREATE POLICY "Users can delete own habit logs" ON habit_logs FOR DELETE
  USING (EXISTS (SELECT 1 FROM habits WHERE habits.id = habit_logs.habit_id AND habits.user_id = auth.uid()));

-- ─── CGPA policies ──────────────────────────────────────────────────────────
CREATE POLICY "Users can view own cgpa" ON cgpa FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cgpa" ON cgpa FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cgpa" ON cgpa FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own cgpa" ON cgpa FOR DELETE USING (auth.uid() = user_id);

-- ─── Subjects policies ──────────────────────────────────────────────────────
CREATE POLICY "Users can view own subjects" ON subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subjects" ON subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subjects" ON subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subjects" ON subjects FOR DELETE USING (auth.uid() = user_id);

-- ─── Semesters policies ─────────────────────────────────────────────────────
CREATE POLICY "Users can view own semesters" ON semesters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own semesters" ON semesters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own semesters" ON semesters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own semesters" ON semesters FOR DELETE USING (auth.uid() = user_id);

-- ─── Semester Subjects policies (via semester ownership) ─────────────────────
CREATE POLICY "Users can view own semester subjects" ON semester_subjects FOR SELECT
  USING (EXISTS (SELECT 1 FROM semesters WHERE semesters.id = semester_subjects.semester_id AND semesters.user_id = auth.uid()));
CREATE POLICY "Users can insert own semester subjects" ON semester_subjects FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM semesters WHERE semesters.id = semester_subjects.semester_id AND semesters.user_id = auth.uid()));
CREATE POLICY "Users can update own semester subjects" ON semester_subjects FOR UPDATE
  USING (EXISTS (SELECT 1 FROM semesters WHERE semesters.id = semester_subjects.semester_id AND semesters.user_id = auth.uid()));
CREATE POLICY "Users can delete own semester subjects" ON semester_subjects FOR DELETE
  USING (EXISTS (SELECT 1 FROM semesters WHERE semesters.id = semester_subjects.semester_id AND semesters.user_id = auth.uid()));

-- ─── Academic Events policies (via subject → semester → user ownership) ──────
CREATE POLICY "Users can view own events" ON academic_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM semester_subjects ss
    JOIN semesters s ON s.id = ss.semester_id
    WHERE ss.id = academic_events.subject_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own events" ON academic_events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM semester_subjects ss
    JOIN semesters s ON s.id = ss.semester_id
    WHERE ss.id = academic_events.subject_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own events" ON academic_events FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM semester_subjects ss
    JOIN semesters s ON s.id = ss.semester_id
    WHERE ss.id = academic_events.subject_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own events" ON academic_events FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM semester_subjects ss
    JOIN semesters s ON s.id = ss.semester_id
    WHERE ss.id = academic_events.subject_id AND s.user_id = auth.uid()
  ));

-- ─── Notes policies (via subject → semester → user ownership) ────────────────
CREATE POLICY "Users can view own notes" ON notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM semester_subjects ss
    JOIN semesters s ON s.id = ss.semester_id
    WHERE ss.id = notes.subject_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "Users can insert own notes" ON notes FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM semester_subjects ss
    JOIN semesters s ON s.id = ss.semester_id
    WHERE ss.id = notes.subject_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own notes" ON notes FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM semester_subjects ss
    JOIN semesters s ON s.id = ss.semester_id
    WHERE ss.id = notes.subject_id AND s.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own notes" ON notes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM semester_subjects ss
    JOIN semesters s ON s.id = ss.semester_id
    WHERE ss.id = notes.subject_id AND s.user_id = auth.uid()
  ));

-- ─── Transactions policies ───────────────────────────────────────────────────
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON transactions FOR DELETE USING (auth.uid() = user_id);

-- ─── Budgets policies ────────────────────────────────────────────────────────
CREATE POLICY "Users can view own budgets" ON budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own budgets" ON budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own budgets" ON budgets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own budgets" ON budgets FOR DELETE USING (auth.uid() = user_id);
