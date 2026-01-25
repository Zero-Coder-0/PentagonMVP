import { NextResponse } from 'next/server'
import { createClient } from '@/core/db/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'
  
  // LOGGING: This will show up in Vercel Logs
  console.log('Auth Callback hit:')
  console.log(' - Code present:', !!code)
  console.log(' - Next path:', next)
  console.log(' - Origin:', requestUrl.origin)

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log(' - Exchange successful! Redirecting...')
      
      // Determine the redirect URL
      // Use the request origin directly to avoid mismatch
      const redirectUrl = new URL(next, requestUrl.origin)
      return NextResponse.redirect(redirectUrl)
    } 
    
    // Log the actual error from Supabase
    console.error(' - Exchange Failed:', error.message)
    console.error(' - Error Details:', error)
  }

  // If code is missing or error occurred
  console.log(' - Redirecting to error page')
  return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_code_error`)
}
