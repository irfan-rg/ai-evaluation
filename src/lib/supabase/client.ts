import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'

/**
 * Creates a Supabase client for use in Client Components
 * This client automatically handles cookies and session management
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
