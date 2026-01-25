import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// We export this as 'createClient' to match what your other files want
export async function createClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle middleware usage
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle middleware usage
          }
        },
      },
    }
  )
}





  /*
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
}*/
