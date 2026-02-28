import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ============================================================
// PROXY.TS — Centralised Auth & RBAC Guard for all routes
// This file contains ALL routing/auth logic for the project.
// src/middleware.ts is just a thin entry point that calls this.
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
    // MUST be checked BEFORE any cookie access to prevent PKCE
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
    // getSession() reads the signed JWT cookie (fast, no network).
    // We then decode the access_token directly to read custom
    // claims injected by our Supabase hook — because
    // session.user.app_metadata is sourced from the DB table
    // (NOT the JWT) and will NOT contain our custom hook claims.
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.access_token) {
        console.log(`[Proxy] No session for ${path} — redirecting to /login`)
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // ── Decode JWT claims for RBAC ────────────────────────────
    let role = 'vendor'
    let is_active = false
    let hook_debug = 'decode_error'

    try {
        // atob() used instead of Buffer — Edge Runtime compatible
        const [, payloadB64] = session.access_token.split('.')
        const decoded = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
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
    // Super Admin — unrestricted
    if (role === 'super_admin') return supabaseResponse

    // Tenant Admin — blocked from /admin/superdashboard
    if (role === 'tenant_admin' && path.startsWith('/admin/superdashboard')) {
        return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Salesman — blocked from /admin
    if (role === 'salesman' && path.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Vendor — blocked from /admin and /dashboard
    if (role === 'vendor' && (path.startsWith('/admin') || path.startsWith('/dashboard'))) {
        return NextResponse.redirect(new URL('/vendor', request.url))
    }

    return supabaseResponse
}
