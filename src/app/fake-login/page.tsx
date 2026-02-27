export default function FakeLoginPage() {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0A0B] selection:bg-indigo-500/30">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />

            <div className="relative w-full max-w-[440px] px-6 py-12">
                <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 shadow-2xl overflow-hidden text-center space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-600/20 mb-2 border border-red-500/10">
                        <svg
                            className="w-8 h-8 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-white tracking-tight">
                        Authentication Failed
                    </h1>

                    <div className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl text-left">
                        <p className="text-sm text-gray-400 leading-relaxed text-center">
                            The credentials provided are incorrect or your account does not have sufficient clearance to access this portal.
                        </p>
                    </div>

                    <div className="flex justify-center pt-4">
                        <a
                            href="/login"
                            className="px-6 py-2.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-gray-300 rounded-lg text-sm font-semibold transition-all"
                        >
                            Return to Login
                        </a>
                    </div>
                </div>

                <p className="mt-8 text-center text-xs text-gray-600 font-medium tracking-wide">
                    Multiple failed attempts will result in an IP lockout.
                </p>
            </div>
        </div>
    )
}
