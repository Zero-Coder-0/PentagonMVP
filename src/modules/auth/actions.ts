'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/core/db/server'
import { headers } from 'next/headers'

export async function loginWithGoogle() {
  const supabase = await createClient()
  
  // 1. Get the actual Origin (works for Vercel Preview & Production automatically)
  const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // 2. Dynamic Redirect: Sends them back exactly where they came from
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('Google Auth Error:', error)
    redirect('/login?error=auth_failed')
  }

  if (data.url) {
    redirect(data.url)
  }
}
