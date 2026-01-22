import { redirect } from 'next/navigation'

export default function HomePage() {
  // Use relative path so it works on localhost + Vercel
  redirect('/admin/inventory/new')
}
