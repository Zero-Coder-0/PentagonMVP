import { createClient } from '@/core/db/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // If we have a session but hit / (the root), let's push to the admin dashboard
  // as the safest default for developers/admins.
  redirect('/admin')
}
