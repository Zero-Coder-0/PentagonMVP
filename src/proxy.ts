import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * MIDDLEWARE.TS — Next.js 16 routing guard.
 * This file replaces src/proxy.ts to align with framework standards.
 */
export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname
  console.log(`[TRACE_00] Proxy checking path: ${path}`)

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 1. PUBLIC ROUTES: Skip authentication for internal assets and auth flow
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/static') ||
    path === '/login' ||
    path === '/fake-login' ||
    path === '/approval-pending' ||
    path.startsWith('/auth/callback')
  ) {
    console.log(`[TRACE_01] Path ${path} is public. Skipping auth.`)
    return supabaseResponse
  }

  // 2. SECURE SESSION CHECK: Use getUser() for server-side verification [V16 Standard]
  // This is critical for Mobile/Safari which handles cookie synchronization strictly.
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.log(`[TRACE_02] Redirecting to /login | authError: ${authError?.message} | user: ${user ? 'present' : 'null'}`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. GET SESSION DATA: Required for JWT access token to decode custom claims
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    console.log(`[TRACE_03] Redirecting to /login | session token missing`)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 4. DECODE JWT CLAIMS: Read the cryptographically signed role from the hook
  let role = 'vendor'
  let is_active = false

  try {
    const [, payloadB64] = session.access_token.split('.')
    const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
    const pad = base64.length % 4
    const padded = pad ? base64 + '='.repeat(4 - pad) : base64
    const decoded = JSON.parse(atob(padded))

    const meta = decoded.app_metadata || {}
    role = meta.role || 'vendor'
    is_active = Boolean(meta.is_active)

    console.log(`[TRACE_04] Decoded JWT | role: ${role} | is_active: ${is_active}`)
  } catch (e) {
    console.error(`[TRACE_05] JWT decode error:`, e)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 5. WAITING ROOM: Block users who haven't been approved yet
  if (!is_active) {
    console.log(`[TRACE_06] Redirecting to /approval-pending | user inactive`)
    return NextResponse.redirect(new URL('/approval-pending', request.url))
  }

  // 6. ROLE-BASED REDIRECTION: Ensure users stay in their designated areas
  // Handle Root Redirect
  if (path === '/') {
    console.log(`[TRACE_07] Root path redirect. Role: ${role}`)
    if (role === 'super_admin' || role === 'tenant_admin')
      return NextResponse.redirect(new URL('/admin', request.url))
    if (role === 'salesman')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    if (role === 'vendor')
      return NextResponse.redirect(new URL('/vendor', request.url))
  }

  // Handle Unauthorized Path Access
  const isAdminPath = path.startsWith('/admin')
  const isDashboardPath = path.startsWith('/dashboard')

  if (role === 'salesman' && isAdminPath) {
    console.log(`[TRACE_08] Blocking salesman from admin path`)
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (role === 'vendor' && (isAdminPath || isDashboardPath)) {
    console.log(`[TRACE_09] Blocking vendor from protected path`)
    return NextResponse.redirect(new URL('/vendor', request.url))
  }

  console.log(`[TRACE_10] Auth passed. Proceeding to ${path}`)
  return supabaseResponse
}

// Ensure middleware doesn't run on static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
















/*import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ============================================================
// PROXY.TS — Next.js 16 convention (renamed from middleware.ts)
// This is the sole routing guard for the entire application.
// Docs: https://nextjs.org/docs/app/building-your-application/routing/middleware
// ============================================================

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const path = request.nextUrl.pathname

    // ── Public / passthrough routes ───────────────────────────
    // MUST be checked BEFORE cookie access to prevent PKCE
    // code-verifier corruption in the /auth/callback flow.
    if (
        path.startsWith('/_next') ||
        path.startsWith('/api') ||
        path.startsWith('/static') ||
        path === '/login' ||
        path === '/fake-login' ||
        path === '/approval-pending' ||
        path.startsWith('/auth/callback')
    ) {
        return supabaseResponse
    }

    // ── Session Check ─────────────────────────────────────────
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.access_token) {
        console.log(`[Proxy] No session for ${path} — redirecting to /login`)
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // ── Decode JWT claims ─────────────────────────────────────
    // Must decode the raw access_token because session.user.app_metadata
    // is sourced from the auth.users DB table and does NOT contain
    // custom claims injected by our Supabase hook.
    // atob() is used instead of Buffer — Edge Runtime compatible.
    let role = 'vendor'
    let is_active = false
    let hook_debug = 'decode_error'

    try {
        const [, payloadB64] = session.access_token.split('.')

        // Robust base64url to base64 conversion with mandatory padding for atob()
        // (Edge runtime / atob requirement)
        const base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/')
        const pad = base64.length % 4
        const padded = pad ? base64 + '='.repeat(4 - pad) : base64

        const decoded = JSON.parse(atob(padded))
        const meta = decoded.app_metadata || {}

        role = meta.role || 'vendor'
        is_active = Boolean(meta.is_active)
        hook_debug = meta.hook_debug_status || 'unknown'

        console.log(`[Proxy] ${session.user.email} | role=${role} | active=${is_active} | hook=${hook_debug}`)
    } catch (e) {
        console.error('[Proxy] JWT decode error:', e)
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // ── Waiting Room ──────────────────────────────────────────
    if (!is_active) {
        console.log(`[Proxy] BLOCKED (inactive): ${session.user.email}`)
        return NextResponse.redirect(new URL('/approval-pending', request.url))
    }

    // ── Role-based Route Enforcement ──────────────────────────
    // If user hits the root (/), push them to their dashboard
    if (path === '/') {
        if (role === 'super_admin') return NextResponse.redirect(new URL('/admin', request.url))
        if (role === 'tenant_admin') return NextResponse.redirect(new URL('/admin', request.url))
        if (role === 'salesman') return NextResponse.redirect(new URL('/dashboard', request.url))
        if (role === 'vendor') return NextResponse.redirect(new URL('/vendor', request.url))
    }

    // Path-specific enforcement
    if (role === 'super_admin') return supabaseResponse

    if (role === 'tenant_admin' && path.startsWith('/admin/superdashboard')) {
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    if (role === 'salesman' && path.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (role === 'vendor' && (path.startsWith('/admin') || path.startsWith('/dashboard'))) {
        return NextResponse.redirect(new URL('/vendor', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}*/
