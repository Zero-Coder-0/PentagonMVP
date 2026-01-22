import { createBrowserClient } from '@supabase/ssr'

// TOGGLE THIS TO FALSE FOR PRODUCTION
const DEV_BYPASS_AUTH = true

export function createClient() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  if (DEV_BYPASS_AUTH) {
    const originalGetUser = supabase.auth.getUser
    supabase.auth.getUser = async () => ({
      data: {
        user: {
          id: 'dev-admin-user',
          email: 'dev@geoestate.local',
          role: 'authenticated',
          app_metadata: { role: 'admin' },
          user_metadata: { full_name: 'Dev Admin' },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
        }
      },
      error: null
    } as any)
  }

  return supabase
}
