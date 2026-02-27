'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/core/db/client'
import { ShieldCheck, Mail, ArrowRight, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Basic hydration check
    console.log('LoginPage: Ready')
  }, [])

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: isAdmin } = await supabase.rpc('check_is_admin_email', {
      check_email: email
    })

    if (isAdmin) {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      })

      if (error) {
        alert('Error: ' + error.message)
      } else {
        alert('Magic Link sent! Please check your inbox.')
      }
    } else {
      setTimeout(() => {
        router.push('/fake-login')
      }, 1500)
    }

    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0B] selection:bg-indigo-500/30">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative w-full max-w-[440px] px-6 py-12">
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 mb-6 shadow-lg shadow-indigo-500/20 animate-in fade-in zoom-in duration-700">
              <ShieldCheck className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              GeoEstate <span className="text-indigo-400">2026</span>
            </h1>
            <p className="text-gray-400 font-medium tracking-wide text-sm opacity-80">
              Intelligent Sales & Asset Management
            </p>
          </div>

          {/* Admin Login Form */}
          <form onSubmit={handleMagicLink} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="admin-email"
                className="block text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] ml-1"
              >
                Agent Identification
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@geoestate.com"
                  className="w-full bg-white/[0.05] border border-white/[0.1] rounded-xl pl-12 pr-4 py-3.5 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden group bg-white text-black py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
            >
              <div className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Verifying Identity...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Command Center</span>
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-10">
            <div className="flex-grow border-t border-white/[0.05]"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">Partner Portals</span>
            <div className="flex-grow border-t border-white/[0.05]"></div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.1] bg-white/[0.02] px-4 py-4 text-sm font-semibold text-gray-200 hover:bg-white/[0.05] hover:border-white/[0.2] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-300"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 shadow-sm" alt="Google" />
            Continue as Staff/Vendor
          </button>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-xs text-gray-500 font-medium tracking-wide">
          Protected by Pentagon-Grade Encryption &copy; 2026
        </p>
      </div>
    </div>
  )
}
