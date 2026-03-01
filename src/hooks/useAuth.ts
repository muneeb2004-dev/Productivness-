/* =============================================================================
   useAuth Hook - Authentication State Management
   
   Custom React hook that manages the authentication state throughout the app.
   It listens for Supabase auth state changes (onAuthStateChange) and provides:
   - Current user object
   - Loading state while checking session
   - Sign in, sign up, and sign out functions
   
   This hook leverages Supabase's built-in session persistence so the user
   stays logged in across page refreshes and browser sessions.
   ============================================================================= */

"use client"; // This hook uses browser APIs and React state

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { User as SupabaseUser } from "@supabase/supabase-js";

/** Return type of the useAuth hook */
interface AuthState {
  user: SupabaseUser | null;  // Current authenticated user (null if logged out)
  loading: boolean;            // True while checking initial session
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  // State to hold the current user object
  const [user, setUser] = useState<SupabaseUser | null>(null);
  // Loading state - true until we check if there's an existing session
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /**
     * Check for an existing session on mount.
     * This handles the case where the user refreshes the page -
     * Supabase persists the session in localStorage and we retrieve it here.
     */
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      // Set the user from the existing session (or null if no session)
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    /**
     * Subscribe to auth state changes.
     * This event listener fires whenever:
     * - User signs in → event = "SIGNED_IN"
     * - User signs out → event = "SIGNED_OUT"
     * - Token is refreshed → event = "TOKEN_REFRESHED"
     * 
     * We update the user state accordingly to keep the UI in sync.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    /**
     * Cleanup: unsubscribe from the auth state listener.
     * This prevents memory leaks when the component using this hook unmounts.
     */
    return () => subscription.unsubscribe();
  }, []); // Empty dependency array: runs once on mount

  /**
   * Sign in with email and password.
   * Uses Supabase's signInWithPassword method which validates credentials
   * and returns a session if successful.
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Object with error message (null if successful)
   */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message ?? null };
  };

  /**
   * Create a new account with email and password.
   * Uses Supabase's signUp method which creates a new user in the auth system.
   * Note: Depending on Supabase settings, email confirmation may be required.
   * 
   * @param email - New user's email address
   * @param password - New user's password (min 6 characters by default)
   * @returns Object with error message (null if successful)
   */
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error: error?.message ?? null };
  };

  /**
   * Sign out the current user.
   * Clears the session from both the Supabase server and local storage.
   * The onAuthStateChange listener will automatically set user to null.
   */
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, signIn, signUp, signOut };
}
