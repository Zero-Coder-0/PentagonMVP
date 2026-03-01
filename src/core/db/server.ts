// Redirect all calls to the centralized singleton to prevent connection leaks
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma as db } from '@/lib/prisma'

// 1. Prisma Export (Maintains your "Pass-through")
export { db }

// 2. Supabase SSR Export (Fixes the 7 Build Errors)
export async function createClient() {
  const cookieStore = await cookies() // MUST await in Next.js 16

  return createServerClient(
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
            // Safe to ignore in Server Components
          }
        },
      },
    }
  )
}











/*export { prisma as db } from '@/lib/prisma';*/



/*import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()


  const supabase = createSupabaseServerClient(
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
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )


  return supabase
}
*/