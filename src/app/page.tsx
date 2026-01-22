import { redirect } from 'next/navigation'

export default function HomePage() {
  // DIRECT REDIRECT TO DASHBOARD
  redirect('http://localhost:3000/admin/inventory/new')
}
