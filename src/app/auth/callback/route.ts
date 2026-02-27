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
      const { data: profile, error: dbError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (dbError) {
        console.error('Error fetching user role:', dbError)
        return NextResponse.redirect(`${origin}/login?error=role_fetch_failed`)
      }

      const role = profile?.role || 'pending'

      // Role-based routing (Let middleware handle strict enforcement, just do initial push)
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
