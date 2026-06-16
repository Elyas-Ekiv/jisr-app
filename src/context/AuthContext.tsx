import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { authService, User } from '../services/authService'
import { AUTH_LOGIN_EVENT, AUTH_LOGOUT_EVENT } from '../utils/api'

interface AuthContextValue {
  user: User | null
  loading: boolean
  refetch: () => void
  isRestricted: (feature: string) => boolean
  isBlocked: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refetch: () => {},
  isRestricted: () => false,
  isBlocked: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!authService.isAuthenticated()) {
      setUser(null)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const u = await authService.getCurrentUser()
      setUser(u)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  // React to login/logout events and cross-tab token changes
  useEffect(() => {
    const onLogin = () => {
      setUser(null)
      void load()
    }
    const onLogout = () => {
      setUser(null)
      setLoading(false)
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'accessToken' || e.key === 'refreshToken' || e.key === 'jisr_session_epoch') {
        void load()
      }
    }

    window.addEventListener(AUTH_LOGIN_EVENT, onLogin)
    window.addEventListener(AUTH_LOGOUT_EVENT, onLogout)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(AUTH_LOGIN_EVENT, onLogin)
      window.removeEventListener(AUTH_LOGOUT_EVENT, onLogout)
      window.removeEventListener('storage', onStorage)
    }
  }, [load])

  const isRestricted = useCallback(
    (feature: string) => (user?.restrictions ?? []).includes(feature),
    [user]
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refetch: load,
        isRestricted,
        isBlocked: user?.blocked ?? false,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
