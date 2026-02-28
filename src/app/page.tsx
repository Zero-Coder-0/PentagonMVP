// src/app/page.tsx
// This page is a fallback. proxy.ts (Next.js 16) handles the real routing.
import { redirect } from 'next/navigation'

export default function HomePage() {
  // If the proxy allowed the request to hit here, the user is likely a guest
  redirect('/login')
}
