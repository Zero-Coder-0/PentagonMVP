import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

    // Public routes — MUST be checked BEFORE any session access to prevent
    // PKCE code verifier cookie corruption during the /auth/callback flow.
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

    // CRITICAL: Use getSession() ONLY — NOT getUser().
    // getUser() makes a live server call that returns user data WITHOUT custom JWT claims.
    // getSession() reads the signed JWT cookie which CONTAINS our injected role and is_active.
    const { data: { session } } = await supabase.auth.getSession()

    // If no session, redirect to login
    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const appMetadata = session.user.app_metadata || {}
    const role = (appMetadata as any).role || 'vendor'
    const is_active = Boolean((appMetadata as any).is_active)
    const hook_debug = (appMetadata as any).hook_debug_status || 'unknown'

    console.log(`[Proxy] ${session.user.email} | role=${role} | is_active=${is_active} | hook=${hook_debug}`)

    // Waiting Room: inactive users go to approval-pending
    if (!is_active) {
        console.log(`[Proxy] BLOCKED: ${session.user.email} is not active.`)
        return NextResponse.redirect(new URL('/approval-pending', request.url))
    }

    // Role-based Route Enforcement
    if (role === 'super_admin') {
        return supabaseResponse // Full access
    }

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
}
