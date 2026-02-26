'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/core/db/client' // Ensure this points to your Client Supabase helper

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // 1. UPDATED: Handle Magic Link with RPC Check
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Check if this email is an Admin using new RPC function
    const { data: isAdmin } = await supabase.rpc('check_is_admin_email', { 
      check_email: email 
    })
    
    if (isAdmin) {
      // Send magic link only to admins
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })
      
      if (error) {
        alert('Error sending magic link: ' + error.message)
      } else {
        alert('Magik Link sent! Check your VIP email.')
      }
    } else {
      // Redirect to fake login for non-admins (The Trap)
      setTimeout(() => {
        router.push('/fake-login')
      }, 1500)
    }
    
    setLoading(false)
  }

  // 2. NEW: Client-side Google Login Handler
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
     provider: 'google',
     options: {
       redirectTo: `${window.location.origin}/auth/callback`,
     },
   })
 }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">GeoEstate 2026</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access the sales inventory
          </p>
        </div>

        {/* --- VIP ADMIN SECTION --- */}
        <form onSubmit={handleMagicLink} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className="block text-xs font-bold text-gray-500 uppercase mb-1">
              Admin Access
            </label>
            <input 
              id="admin-email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pentagon-properties.com"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900"
              required
            />
          </div>
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Secure Admin Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase tracking-wider">Staff & Vendors</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* --- GOOGLE LOGIN (UPDATED TO CLIENT-SIDE) --- */}
        {/* Replaced <form> with direct button to use new client-side logic */}
        <button
          onClick={handleGoogleLogin}
          type="button"
          className="group relative flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
