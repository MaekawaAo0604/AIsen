'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function PublicHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-[#e9e9e7] bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center justify-between">
          {/* ロゴ */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-[#37352f]">AIsen</span>
          </Link>

          {/* ナビゲーション */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/pricing"
              className={`text-sm font-medium transition-colors ${
                pathname === '/pricing'
                  ? 'text-[#37352f]'
                  : 'text-[#787774] hover:text-[#37352f]'
              }`}
            >
              料金プラン
            </Link>
            <Link
              href="/s/DEMO"
              className="text-sm font-medium text-[#787774] hover:text-[#37352f] transition-colors"
            >
              デモを見る
            </Link>
            <Link
              href="/b/new"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-[8px] hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              無料で始める
            </Link>
          </nav>

          {/* モバイルメニュー */}
          <div className="md:hidden">
            <Link
              href="/b/new"
              className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-[8px]"
            >
              始める
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
