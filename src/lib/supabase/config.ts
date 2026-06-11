/**
 * True when real Supabase credentials are present. When false, the app runs
 * in offline demo mode: auth falls back to a one-click demo profile and
 * persistence falls back to localStorage — the demo never breaks.
 */
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("https://") &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("YOUR-PROJECT") &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your-anon-key",
);
