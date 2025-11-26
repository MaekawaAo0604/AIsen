'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function PublicHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-slate-900">AIsen</span>
          </Link>

          {/* ナビゲーション */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/pricing"
              className={`text-sm font-medium transition-colors ${
                pathname === '/pricing'
                  ? 'text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              料金プラン
            </Link>
            <Link
              href="/s/DEMO"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              デモを見る
            </Link>
            <Link
              href="/b/new"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-150"
            >
              無料で始める
            </Link>
          </nav>

          {/* モバイルメニュー */}
          <div className="md:hidden">
            <Link
              href="/b/new"
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700"
            >
              始める
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
