import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import { authService, User } from '../services/authService'

interface AuthContextValue {
  user: User | null
  loading: boolean
  refetch: () => void
  isRestricted: (feature: string) => boolean
  isBlocked: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  refetch: () => {},
  isRestricted: () => false,
  isBlocked: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    if (!authService.isAuthenticated()) return
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
