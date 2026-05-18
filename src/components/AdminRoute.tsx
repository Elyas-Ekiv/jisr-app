import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/authService'
import LoadingSpinner from './LoadingSpinner'

interface AdminRouteProps {
  children: ReactNode
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth()

  // Not authenticated at all — redirect immediately
  if (!authService.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }

  // Auth context is still loading the user for the first time
  if (loading && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-brand-surface dark:bg-ink-900">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-ink-500 dark:text-ink-400">Verifying admin access…</p>
      </div>
    )
  }

  // User loaded but not an admin — redirect
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
