# productivness 🚀

A modern, AI-powered personal productivity web app built with Next.js 14, Supabase, and Google Gemini AI.

## Features

- 🔐 **Authentication** — Email/password signup, login, logout with session persistence
- 🎯 **Life Goals** — Track your main life goal, 5-year vision, and current focus
- ✅ **To-Do List** — Add, complete, delete tasks with due dates and priority levels
- 🔁 **Habit Tracker** — Create daily/weekly habits, track streaks, view heatmap calendar
- 🎓 **CGPA Planner** — Calculate projected CGPA, plan grades for upcoming subjects
- 📚 **Semester Tracker** — Track subjects, quizzes, assignments, midterms, finals, labs, and notes
- 🤖 **AI Integration** — Gemini AI powers study strategies, CGPA plans, habit routines, and goal roadmaps

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| UI | TailwindCSS + Glassmorphism |
| Animations | Framer Motion |
| Backend | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| AI | Google Gemini API |
| Deployment | Vercel |

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anonymous key
- `NEXT_PUBLIC_GEMINI_API_KEY` — Your Google AI Studio API key

### 3. Setup Supabase Database

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor**
3. Copy and run the contents of `supabase-schema.sql`
4. This creates all tables and Row Level Security policies

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── login/page.tsx          # Login page
│   ├── signup/page.tsx         # Signup page
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout (sidebar + auth guard)
│   │   ├── page.tsx            # Dashboard home (stats overview)
│   │   ├── goals/page.tsx      # Life Goals feature
│   │   ├── todos/page.tsx      # To-Do List feature
│   │   ├── habits/page.tsx     # Habits & Streaks feature
│   │   ├── cgpa/page.tsx       # CGPA Planner feature
│   │   └── semester/page.tsx   # Semester Tracker feature
│   ├── globals.css             # Global styles & glassmorphism
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home (redirect)
├── components/
│   └── Sidebar.tsx             # Navigation sidebar
├── hooks/
│   └── useAuth.ts              # Authentication hook
├── lib/
│   ├── supabaseClient.ts       # Supabase client singleton
│   └── geminiClient.ts         # Gemini AI client
└── types/
    └── index.ts                # TypeScript type definitions
```

## Deploy on Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel project settings
5. Deploy!
