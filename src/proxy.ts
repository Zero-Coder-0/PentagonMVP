import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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

    // Public routes — checked BEFORE any session access to prevent
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

    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.access_token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // CRITICAL: Decode the raw JWT access_token to get hook-injected claims.
    // session.user.app_metadata comes from auth.users table, NOT the JWT.
    // The custom access token hook injects claims INTO the JWT token string directly.
    let role = 'vendor'
    let is_active = false
    let hook_debug = 'decode_error'

    try {
        const [, payloadBase64] = session.access_token.split('.')
        // atob() is used here instead of Buffer (not available in Edge Runtime)
        const decoded = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')))
        const appMetadata = decoded.app_metadata || {}

        role = appMetadata.role || 'vendor'
        is_active = Boolean(appMetadata.is_active)
        hook_debug = appMetadata.hook_debug_status || 'unknown'

        console.log(`[Proxy] ${session.user.email} | role=${role} | is_active=${is_active} | hook=${hook_debug}`)
    } catch (e) {
        console.error('[Proxy] JWT decode failed:', e)
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Waiting Room: inactive users
    if (!is_active) {
        console.log(`[Proxy] BLOCKED: ${session.user.email} is not active.`)
        return NextResponse.redirect(new URL('/approval-pending', request.url))
    }

    // Role-based Route Enforcement
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
}
