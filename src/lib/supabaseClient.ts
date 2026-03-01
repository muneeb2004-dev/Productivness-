/* =============================================================================
   Supabase Client Configuration
   
   This module creates and exports a singleton Supabase client instance.
   The client is used throughout the app for:
   - Authentication (login, signup, logout, session management)
   - Database queries (CRUD operations on all tables)
   - Real-time subscriptions (if needed in the future)
   
   Environment variables must be set in .env.local:
   - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous/public API key
   ============================================================================= */

import { createClient } from "@supabase/supabase-js";

// Read Supabase credentials from environment variables
// Fallback to placeholder strings during build time to avoid crashing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

/**
 * Supabase client singleton instance.
 * This is created once and reused across the entire application.
 * Uses the anonymous key which respects Row Level Security (RLS) policies.
 * 
 * Note: At build time, placeholder values are used so the build doesn't crash.
 * At runtime, the actual environment variables must be set in .env.local.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
