// src/core/db/client.ts
import { createBrowserClient } from '@supabase/ssr'

// Export as createClient (Standard Supabase pattern)
export const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Also export as supabaseClient for backward compatibility if needed
export const supabaseClient = createClient 
