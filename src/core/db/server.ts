import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  // 1. Check for bypass flag
  const DEV_BYPASS_AUTH = process.env.DEV_BYPASS_AUTH === 'true';

  const supabase = createSupabaseServerClient(
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

  // 2. MONKEY PATCH: If Dev Mode is ON, we intercept getUser()
  if (DEV_BYPASS_AUTH && process.env.NODE_ENV === 'development') {
    const devRole = process.env.DEV_ROLE || 'super_admin';
    supabase.auth.getUser = async () => {
      // Return a fake user based on the configured DEV_ROLE
      return {
        data: {
          user: {
            id: 'dev-mock-user-id',
            email: 'dev@geoestate.local',
            role: 'authenticated',
            app_metadata: { role: devRole },
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
