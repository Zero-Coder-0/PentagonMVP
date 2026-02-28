import { createClient } from '@/core/db/server' // Fixed import name
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
    }

    // Extract user directly from the exchanged session token
    // (getUser() fetches from DB and strips JWT custom claims!)
    const user = session?.user

    if (user) {
      // NUCLEAR DEBUG: Print the ENTIRE user object to catch the claims anywhere
      console.log('NUCLEAR USER OBJECT:', JSON.stringify(user, null, 2))

      const appMetadata = user.app_metadata || {}

      // Fallback: Check if hook_debug_status is at the top level or in app_metadata
      const hook_debug = (appMetadata as any).hook_debug_status || (user as any).hook_debug_status || 'unknown'
      const role = (appMetadata as any).role || (user as any).role || 'vendor'

      // Use Boolean() + multiple paths to be ABSOLUTELY sure we catch the TRUE value
      const is_active = Boolean((appMetadata as any).is_active) || Boolean((user as any).is_active)

      // Quarantine check
      if (!is_active) {
        console.log(`Access denied: User ${user.email} is NOT active (Hook: ${hook_debug}). Redirecting.`)
        return NextResponse.redirect(`${origin}/approval-pending`)
      }

      // Role-based routing for active users (Let middleware handle strict enforcement, just do initial push)
      if (role === 'super_admin') {
        return NextResponse.redirect(`${origin}/`)
      } else if (role === 'tenant_admin') {
        return NextResponse.redirect(`${origin}/admin`)
      } else if (role === 'salesman') {
        return NextResponse.redirect(`${origin}/dashboard`)
      } else if (role === 'vendor') {
        return NextResponse.redirect(`${origin}/vendor`)
      } else {
        return NextResponse.redirect(`${origin}/approval-pending`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
