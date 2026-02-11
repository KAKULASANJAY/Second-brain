import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// =============================================================================
// SUPABASE CLIENT CONFIGURATION
// =============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env.local file.'
  );
}

// FIX START - Validate Supabase URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error(
    `Invalid NEXT_PUBLIC_SUPABASE_URL format. Expected "https://YOUR_PROJECT.supabase.co", got "${supabaseUrl}"`
  );
}
// FIX END

// =============================================================================
// CLIENT-SIDE SUPABASE CLIENT
// =============================================================================
// Used for client-side operations (respects RLS policies)

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // For this demo, we don't need auth persistence
  },
});

// =============================================================================
// SERVER-SIDE SUPABASE CLIENT
// =============================================================================
// Used for server-side operations with elevated privileges
// This bypasses RLS - use carefully!

export function createServerClient() {
  if (!supabaseServiceKey) {
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY not set. Using anon key for server operations.'
    );
    return supabase;
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type { Database };
