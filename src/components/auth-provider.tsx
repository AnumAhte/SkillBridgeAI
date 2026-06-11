"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { DEMO_USER, seedDemoData } from "@/lib/demo/seed";
import type { AppUser } from "@/types";

const DEMO_KEY = "sb:demo-session";

interface AuthContextValue {
  user: AppUser | null;
  /** "loading" until the initial session check completes. */
  status: "loading" | "ready";
  supabaseEnabled: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  enterDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapSupabaseUser(u: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): AppUser {
  return {
    id: u.id,
    email: u.email ?? null,
    name: (u.user_metadata?.full_name as string) || u.email?.split("@")[0] || "Learner",
    isDemo: false,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [status, setStatus] = useState<"loading" | "ready">("loading");

  useEffect(() => {
    // Demo session takes precedence — it exists only when explicitly chosen.
    if (localStorage.getItem(DEMO_KEY)) {
      setUser(DEMO_USER);
      setStatus("ready");
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus("ready");
      return;
    }

    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? mapSupabaseUser(data.session.user) : null);
      setStatus("ready");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? mapSupabaseUser(session.user) : null);
      setStatus("ready");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: "Cloud auth is not configured." };
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) setUser(mapSupabaseUser(data.user));
    return { error: null };
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (!isSupabaseConfigured) return { error: "Cloud auth is not configured." };
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) return { error: error.message };
    if (data.user) setUser(mapSupabaseUser(data.user));
    return { error: null };
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(DEMO_KEY);
    if (isSupabaseConfigured) {
      try {
        await createClient().auth.signOut();
      } catch {
        // Session may already be invalid — clearing local state is enough.
      }
    }
    setUser(null);
  }, []);

  const enterDemo = useCallback(async () => {
    localStorage.setItem(DEMO_KEY, "1");
    await seedDemoData();
    setUser(DEMO_USER);
    setStatus("ready");
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, status, supabaseEnabled: isSupabaseConfigured, signIn, signUp, signOut, enterDemo }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
