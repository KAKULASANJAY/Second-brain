import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// =============================================================================
// SUPABASE CLIENT CONFIGURATION
// =============================================================================
// FIX START - Lazy initialization to prevent build-time execution
// Environment variables are now read ONLY when clients are first used

// Cached client instances (singleton pattern)
let _supabaseClient: SupabaseClient<Database> | null = null;
let _serverClient: SupabaseClient<Database> | null = null;

/**
 * Validates and returns Supabase configuration
 * Only called at runtime, never during build
 */
function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL format. Expected "https://YOUR_PROJECT.supabase.co", got "${supabaseUrl}"`
    );
  }

  return { supabaseUrl, supabaseAnonKey };
}
// FIX END

// =============================================================================
// CLIENT-SIDE SUPABASE CLIENT
// =============================================================================
// Used for client-side operations (respects RLS policies)
// FIX START - Lazy getter instead of top-level initialization

/**
 * Get the Supabase client (creates on first use)
 * Safe to import during build - only executes at runtime
 */
export function getSupabaseClient(): SupabaseClient<Database> {
  if (!_supabaseClient) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();
    _supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });
  }
  return _supabaseClient;
}

// Legacy alias - use getSupabaseClient() for new code
export { getSupabaseClient as supabase };
// FIX END

// =============================================================================
// SERVER-SIDE SUPABASE CLIENT
// =============================================================================
// Used for server-side operations with elevated privileges
// This bypasses RLS - use carefully!

export function createServerClient(): SupabaseClient<Database> {
  // FIX START - Lazy initialization for server client
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseServiceKey) {
    console.warn(
      'SUPABASE_SERVICE_ROLE_KEY not set. Using anon key for server operations.'
    );
    return getSupabaseClient();
  }

  if (!_serverClient) {
    const { supabaseUrl } = getSupabaseConfig();
    _serverClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _serverClient;
  // FIX END
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type { Database };
