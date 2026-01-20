import { redirect } from 'next/navigation'

export default function HomePage() {
  // DIRECT REDIRECT TO DASHBOARD
  redirect('/dashboard')
}
