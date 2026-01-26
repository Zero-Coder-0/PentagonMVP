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
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, is_active')
        .eq('id', user.id)
        .single()
      
      // Route based on role and approval status
      if (!profile || !profile.is_active) {
        return NextResponse.redirect(`${origin}/approval-pending`)
      }
      
      // Role-based routing
      if (profile.role === 'super_admin') {
        return NextResponse.redirect(`${origin}/super`)
      } else if (profile.role === 'tenant_admin') {
        return NextResponse.redirect(`${origin}/admin`)
      } else if (profile.role === 'salesman') {
        return NextResponse.redirect(`${origin}/dashboard`)
      } else if (profile.role === 'vendor') {
        return NextResponse.redirect(`${origin}/vendor`)
      }
    }
  }
  
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
