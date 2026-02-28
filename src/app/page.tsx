// Root page — proxy.ts (middleware) handles all routing.
// If a user lands here with a valid session, they've already been
// redirected by the callback to the correct role-based route.
// This redirect acts as a last-resort safety net only.
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/login')
}
