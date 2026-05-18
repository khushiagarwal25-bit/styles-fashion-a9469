import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for use inside unstable_cache().
 * Only suitable for public read queries — no auth context.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
