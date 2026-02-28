// ============================================================
// MIDDLEWARE.TS — Next.js entry point only.
// All routing logic lives in src/proxy.ts — edit that instead.
// ============================================================
import { proxy } from './proxy'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    return proxy(request)
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
