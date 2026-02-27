import { createClient } from '@/core/db/server' // Fixed import name
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_code_error`)
    }

    // Fetch user profile with role
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Use email to link Google accounts to pre-existing rows in public.users
      const { data: profile, error: dbError } = await supabase
        .from('users')
        .select('role, is_active')
        .eq('email', user.email)
        .maybeSingle()

      if (dbError) {
        console.error('Error fetching user role:', dbError)
        return NextResponse.redirect(`${origin}/login?error=role_fetch_failed`)
      }

      const role = profile?.role || 'vendor'
      const is_active = profile?.is_active === true

      // Quarantine check
      if (!is_active) {
        return NextResponse.redirect(`${origin}/approval`)
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
        return NextResponse.redirect(`${origin}/approval`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
