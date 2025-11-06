'use client'

import { useState } from 'react'
import { Header } from '@/components/Layout/Header'
import { Sidebar } from '@/components/Layout/Sidebar'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)

  return (
    <>
      <Sidebar
        isExpanded={isSidebarExpanded}
        onToggle={() => setIsSidebarExpanded(!isSidebarExpanded)}
      />
      <div className="ml-0 sm:ml-16 transition-all duration-300">
        <Header onMenuClick={() => setIsSidebarExpanded(true)} />
        <main>{children}</main>
      </div>
    </>
  )
}
