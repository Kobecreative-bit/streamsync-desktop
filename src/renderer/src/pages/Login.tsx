import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

interface LoginProps {
  onNavigateToRegister: () => void
}

function Login({ onNavigateToRegister }: LoginProps): JSX.Element {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, loading, error, clearError } = useAuthStore()

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    clearError()
    await signIn(email, password)
  }

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Left side — branding */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/[0.04] rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center shadow-lg shadow-accent/20">
              <svg className="w-5.5 h-5.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <span className="font-bold text-2xl text-text-primary tracking-tight">StreamSync</span>
          </div>

          <h1 className="text-3xl font-bold text-text-primary leading-tight mb-4">
            Go live everywhere.<br />
            <span className="text-accent">Sell smarter.</span>
          </h1>
          <p className="text-text-secondary text-base leading-relaxed max-w-md">
            Stream to TikTok, YouTube, Instagram, and Facebook simultaneously with AI-powered selling tools. Keep 100% of your sales.
          </p>

          {/* Platform icons */}
          <div className="flex items-center gap-3 mt-10">
            {[
              { color: '#ff0050', label: 'TikTok' },
              { color: '#ff0000', label: 'YouTube' },
              { color: '#e1306c', label: 'Instagram' },
              { color: '#1877f2', label: 'Facebook' }
            ].map((p) => (
              <div
                key={p.label}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                style={{ backgroundColor: p.color + '20', color: p.color }}
              >
                {p.label.slice(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — login form */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-16">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="flex items-center justify-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <span className="font-bold text-2xl text-text-primary tracking-tight">StreamSync</span>
          </div>

          <div className="bg-bg-card rounded-2xl border border-white/[0.06] p-8 shadow-2xl shadow-black/20">
            <h2 className="text-xl font-bold text-text-primary mb-1">
              Welcome back
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              Sign in to your StreamSync account
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-danger shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-sm text-danger">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-text-secondary/70 mb-1.5 uppercase tracking-wider">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-bg-primary/80 border border-white/[0.08] rounded-xl text-text-primary text-sm placeholder:text-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/30 transition-all"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-text-secondary/70 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 bg-bg-primary/80 border border-white/[0.08] rounded-xl text-text-primary text-sm placeholder:text-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/30 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 mt-2"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/[0.04]">
              <p className="text-center text-sm text-text-secondary">
                Don&apos;t have an account?{' '}
                <button
                  onClick={onNavigateToRegister}
                  className="text-accent hover:text-accent/80 font-semibold transition-colors"
                >
                  Start free trial
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
