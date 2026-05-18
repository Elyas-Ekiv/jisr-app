import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { childService, Child } from '../services/childService'

interface ChildContextType {
  /** All children belonging to the logged-in parent */
  children: Child[]
  /** Currently active child (the one using the AAC board) */
  activeChild: Child | null
  /** Switch the active child by ID */
  setActiveChildId: (id: string) => void
  /** True while the initial fetch is in progress */
  loading: boolean
  /** Refresh the children list from the backend */
  refresh: () => Promise<void>
}

const ChildContext = createContext<ChildContextType | undefined>(undefined)

const ACTIVE_CHILD_KEY = 'jisr_active_child_id'

export function ChildProvider({ children: reactChildren }: { children: ReactNode }) {
  const [childList, setChildList] = useState<Child[]>([])
  const [activeChild, setActiveChild] = useState<Child | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const data = await childService.getChildren()
      const list = Array.isArray(data) ? data : []
      setChildList(list)

      // Restore previously-selected child from localStorage
      const savedId = localStorage.getItem(ACTIVE_CHILD_KEY)
      const saved = savedId ? list.find((c) => c.id === savedId) : null

      if (saved) {
        setActiveChild(saved)
      } else if (list.length > 0) {
        // Default to first child
        setActiveChild(list[0])
        localStorage.setItem(ACTIVE_CHILD_KEY, list[0].id)
      } else {
        setActiveChild(null)
      }
    } catch (err) {
      console.error('ChildContext: failed to load children', err)
      setChildList([])
      setActiveChild(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setActiveChildId = useCallback(
    (id: string) => {
      const found = childList.find((c) => c.id === id)
      if (found) {
        setActiveChild(found)
        localStorage.setItem(ACTIVE_CHILD_KEY, id)
      }
    },
    [childList]
  )

  return (
    <ChildContext.Provider
      value={{
        children: childList,
        activeChild,
        setActiveChildId,
        loading,
        refresh,
      }}
    >
      {reactChildren}
    </ChildContext.Provider>
  )
}

export function useChild(): ChildContextType {
  const ctx = useContext(ChildContext)
  if (!ctx) {
    throw new Error('useChild() must be used inside <ChildProvider>')
  }
  return ctx
}
