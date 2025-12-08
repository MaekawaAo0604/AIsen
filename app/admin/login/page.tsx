'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // 管理者認証情報（環境変数から取得）
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@aisen.app'
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'aisen2025admin'

    if (email === adminEmail && password === adminPassword) {
      // 認証成功 - sessionStorageに保存
      sessionStorage.setItem('isAdmin', 'true')
      router.push('/admin/contacts')
    } else {
      setError('メールアドレスまたはパスワードが間違っています')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">管理者ログイン</h1>
          <p className="text-sm text-slate-600 mb-6 text-center">
            管理者専用ページです
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="admin@aisen.app"
              />
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="パスワードを入力"
              />
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg font-semibold hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-blue-600 hover:underline">
              トップページに戻る
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
