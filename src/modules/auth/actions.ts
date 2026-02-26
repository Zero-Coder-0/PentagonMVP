'use server'

import { createClient } from '@/core/db/server' // Fixed import name
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export async function loginWithGoogle() {
  const supabase = await createClient()
  
  // FIXED: await the headers() call for Next.js 16
  const headersList = await headers()
  const origin = headersList.get('origin')

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error(error)
    redirect('/login?error=oauth_start_error')
  }

  if (data.url) {
    redirect(data.url)
  }
}
