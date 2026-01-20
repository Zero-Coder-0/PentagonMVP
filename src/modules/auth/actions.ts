'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/core/db/server'

export async function loginWithGoogle() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    redirect('/login?error=auth_failed')
  }

  if (data.url) {
    redirect(data.url)
  }
}
