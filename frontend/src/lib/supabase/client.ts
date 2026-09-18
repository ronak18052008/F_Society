/**
 * @file Browser-side Supabase client for Next.js App Router
 * @description Provides a Supabase client configured for client-side usage (e.g. in React components).
 */
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

/**
 * Creates a browser-side Supabase client instance.
 * Automatically picks up environment variables for the URL and Anon Key.
 *
 * @returns {ReturnType<typeof createBrowserClient<Database>>} The Supabase client instance.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
