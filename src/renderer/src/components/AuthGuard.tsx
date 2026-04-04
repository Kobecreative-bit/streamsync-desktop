import { useEffect, useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import Login from '../pages/Login'
import Register from '../pages/Register'

interface AuthGuardProps {
  children: React.ReactNode
}

function AuthGuard({ children }: AuthGuardProps): JSX.Element {
  const { user, loading, initialize } = useAuthStore()
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login')

  useEffect(() => {
    initialize()
  }, [initialize])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-primary">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent to-orange-600 flex items-center justify-center">
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

  if (!user) {
    if (authPage === 'register') {
      return <Register onNavigateToLogin={() => setAuthPage('login')} />
    }
    return <Login onNavigateToRegister={() => setAuthPage('register')} />
  }

  return <>{children}</>
}

export default AuthGuard
