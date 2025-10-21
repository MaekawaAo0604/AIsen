'use client'

import { useAuthStore } from '@/stores/useAuthStore'

export function Header() {
  const user = useAuthStore((state) => state.user)
  const isPro = user?.entitlements?.pro ?? false

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">AIsen</h1>
          </div>

          <div className="flex items-center gap-4">
            {isPro && (
              <span className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 px-3 py-1 text-sm font-semibold text-white">
                Pro
              </span>
            )}
            {user && (
              <span className="text-sm text-gray-600">
                {user.email}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
