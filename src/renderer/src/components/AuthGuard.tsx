import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import { isSupabaseConfigured } from '../lib/supabase'
import Login from '../pages/Login'
import Register from '../pages/Register'
import OnboardingFlow from './OnboardingFlow'

interface AuthGuardProps {
  children: React.ReactNode
}

function AuthGuard({ children }: AuthGuardProps): JSX.Element {
  const { user, profile, loading, initialize, markOnboarded } = useAuthStore()
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login')

  useEffect(() => {
    initialize()
  }, [initialize])

  if (!isSupabaseConfigured) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="max-w-md text-center p-8 bg-bg-card rounded-2xl border border-danger/30">
          <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">Configuration Required</h2>
          <p className="text-sm text-text-secondary">
            Supabase environment variables are missing. Set <code className="text-accent">VITE_SUPABASE_URL</code> and{' '}
            <code className="text-accent">VITE_SUPABASE_ANON_KEY</code> in your <code className="text-accent">.env</code> file and rebuild.
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center shadow-lg shadow-accent/20">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-text-secondary text-sm">Loading StreamSync...</span>
          </div>
        </div>
      </div>
    )
  }

  // Not authenticated — show login/register
  if (!user) {
    if (authPage === 'login') {
      return <Login onNavigateToRegister={() => setAuthPage('register')} />
    }
    return <Register onNavigateToLogin={() => setAuthPage('login')} />
  }

  // Authenticated but not onboarded — show onboarding flow
  if (profile && !profile.onboarded) {
    return (
      <OnboardingFlow
        onComplete={() => {
          markOnboarded()
        }}
      />
    )
  }

  return <>{children}</>
}

export default AuthGuard
