import { ReactNode } from 'react'

interface ChildLayoutProps {
  children: ReactNode
}

export default function ChildLayout({ children }: ChildLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Full Screen Content - No Sidebar */}
      <main className="w-full h-screen overflow-hidden">
        {children}
      </main>
    </div>
  )
}
