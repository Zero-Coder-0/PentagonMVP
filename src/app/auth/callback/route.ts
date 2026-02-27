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
      // DEBUG: Verify exactly what the Custom Access Token Hook injected
      console.log('User metadata in JWT:', JSON.stringify(user.app_metadata, null, 2))

      const appMetadata = user.app_metadata || {}
      const role = appMetadata.role || 'vendor'

      // Use Boolean() to be absolutely sure we catch the TRUE value from JSON
      const is_active = Boolean(appMetadata.is_active)

      // Quarantine check
      if (!is_active) {
        console.log(`Access denied: User ${user.email} is NOT active. Redirecting.`)
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
