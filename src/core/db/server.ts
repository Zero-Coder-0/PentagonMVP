import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// TOGGLE THIS TO TRUE TO SKIP LOGIN
const DEV_BYPASS_AUTH = true 

export async function createClient() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored
          }
        },
      },
    }
  )

  // MONKEY PATCH: If Dev Mode is ON, we intercept getUser()
  if (DEV_BYPASS_AUTH) {
    const originalGetUser = supabase.auth.getUser
    supabase.auth.getUser = async () => {
      // Return a fake admin user
      return {
        data: {
          user: {
            id: 'dev-admin-user',
            email: 'dev@geoestate.local',
            role: 'authenticated',
            app_metadata: { role: 'admin' }, // We give ourselves ADMIN rights
            user_metadata: { full_name: 'Dev Admin' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          }
        },
        error: null
      } as any
    }
  }

  return supabase
}
