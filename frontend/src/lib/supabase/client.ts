import { createBrowserClient } from "@supabase/ssr";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Browser-side Supabase client singleton.
 *
 * Returns `null` when NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY
 * are not configured, allowing the app to fall back to demo mode.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;

  if (typeof window === "undefined") {
    return createBrowserClient(url, key);
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, key);
  }
  return browserClient;
}

/** Whether Supabase credentials are configured */
export const isSupabaseConfigured =
  typeof process !== "undefined" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  (!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

/**
 * Controls demo fallback data.
 * When Supabase IS configured, demo fallback is strictly disabled unless
 * explicitly enabled via NEXT_PUBLIC_ENABLE_DEMO_FALLBACK="true".
 */
export function isDemoFallbackAllowed(): boolean {
  if (!isSupabaseConfigured) {
    return true;
  }
  return process.env.NEXT_PUBLIC_ENABLE_DEMO_FALLBACK === "true";
}
