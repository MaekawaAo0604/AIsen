import Link from 'next/link'

export function Footer() {
  return (
    <footer className="px-6 py-12 mx-auto max-w-7xl border-t border-[#e9e9e7] bg-white">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            AIsen
          </div>
          <div className="text-sm text-[#9b9a97]">© 2025 All rights reserved.</div>
        </div>
        <div className="flex gap-8 text-sm">
          <Link href="/pricing" className="text-[#787774] hover:text-[#37352f] transition-colors">
            料金プラン
          </Link>
          <Link href="/privacy" className="text-[#787774] hover:text-[#37352f] transition-colors">
            プライバシーポリシー
          </Link>
          <Link href="/terms" className="text-[#787774] hover:text-[#37352f] transition-colors">
            利用規約
          </Link>
          <a
            href="https://github.com/MaekawaAo0604/AIsen"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#787774] hover:text-[#37352f] transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  )
}
