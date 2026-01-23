'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/core/db/server'


export async function loginWithGoogle() {
  const supabase = await createClient()
  
  // 1. Detect the URL dynamically
  // If we are in production (Vercel), use the production URL.
  // Otherwise, fallback to localhost.
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // 2. Point to the correct callback route
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login?error=auth_failed')
  }

  if (data.url) {
    redirect(data.url)
  }
}
