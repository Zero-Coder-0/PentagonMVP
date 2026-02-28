import { createClient } from '@/core/db/server'
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

    if (session?.access_token) {
      // CRITICAL: Decode the raw JWT access_token to get hook-injected claims.
      // session.user.app_metadata comes from auth.users table (no custom claims).
      // The hook injects into the JWT token itself — we must decode it directly.
      try {
        const [, payloadBase64] = session.access_token.split('.')
        const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString())
        const appMetadata = decoded.app_metadata || {}

        const role = appMetadata.role || 'vendor'
        const is_active = Boolean(appMetadata.is_active)
        const hook_debug = appMetadata.hook_debug_status || 'unknown'

        console.log(`[Callback] ${session.user.email} | role=${role} | is_active=${is_active} | hook=${hook_debug}`)
        console.log('[Callback] Full decoded JWT app_metadata:', JSON.stringify(appMetadata, null, 2))

        if (!is_active) {
          console.log(`Access denied: User ${session.user.email} is NOT active (Hook: ${hook_debug}). Redirecting.`)
          return NextResponse.redirect(`${origin}/approval-pending`)
        }

        if (role === 'super_admin') return NextResponse.redirect(`${origin}/`)
        if (role === 'tenant_admin') return NextResponse.redirect(`${origin}/admin`)
        if (role === 'salesman') return NextResponse.redirect(`${origin}/dashboard`)
        if (role === 'vendor') return NextResponse.redirect(`${origin}/vendor`)

        return NextResponse.redirect(`${origin}/approval-pending`)
      } catch (decodeError) {
        console.error('[Callback] Failed to decode JWT:', decodeError)
        return NextResponse.redirect(`${origin}/login?error=jwt_decode_error`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`)
}
