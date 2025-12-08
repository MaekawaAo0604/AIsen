'use client'

import { useState, useEffect } from 'react'
import {
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  getRedirectResult,
} from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'
import { getAuthErrorMessage } from '@/lib/authErrors'

// LINE内ブラウザかどうかを判定
function isLineApp(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent.toLowerCase()
  return ua.includes('line/')
}

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const [hasAgreedToEmail, setHasAgreedToEmail] = useState(false)

  // リダイレクト後の認証結果を処理
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result) {
          // リダイレクト認証が成功した場合
          setMode('login')
          setEmail('')
          setPassword('')
          setError('')
          setResetEmailSent(false)
          setShowConsent(false)
          setHasAgreedToEmail(false)
          onClose()
        }
      } catch (err: unknown) {
        setError(getAuthErrorMessage(err))
      }
    }

    handleRedirectResult()
  }, [onClose])

  // モーダルを閉じる際に状態をリセット
  const handleClose = () => {
    setMode('login')
    setEmail('')
    setPassword('')
    setError('')
    setResetEmailSent(false)
    setShowConsent(false)
    setHasAgreedToEmail(false)
    onClose()
  }

  if (!isOpen) return null

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')
    try {
      // LINE内ブラウザの場合はリダイレクトを使用
      if (isLineApp()) {
        await signInWithRedirect(auth, googleProvider)
        // リダイレクトの場合、ここには到達しない（ページ遷移する）
      } else {
        // 通常のブラウザの場合はポップアップを使用
        await signInWithPopup(auth, googleProvider)
        handleClose()
      }
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err))
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      handleClose()
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err))
      // エラー時はフォーム入力を保持（ユーザーが修正しやすいように）
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      handleClose()
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err))
      // エラー時はフォーム入力を保持（ユーザーが修正しやすいように）
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await sendPasswordResetEmail(auth, email)
      setResetEmailSent(true)
    } catch (err: unknown) {
      setError(getAuthErrorMessage(err))
      // エラー時はメールアドレスを保持
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[3px] shadow-2xl w-full max-w-md mx-4 border border-[#e9e9e7]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e9e9e7]">
          <h2 className="text-[16px] font-semibold text-[#37352f]">
            {showConsent && 'メールアドレスの利用について'}
            {!showConsent && mode === 'login' && 'ログイン'}
            {!showConsent && mode === 'signup' && 'アカウント作成'}
            {!showConsent && mode === 'reset' && 'パスワードリセット'}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-[#fee2e2] border border-[#dc2626] rounded-[3px]">
              <p className="text-[13px] text-[#991b1b]">{error}</p>
            </div>
          )}

          {resetEmailSent && (
            <div className="mb-4 p-3 bg-[#f0fdf4] border border-[#10b981] rounded-[3px]">
              <p className="text-[13px] text-[#065f46]">
                パスワードリセットメールを送信しました。メールをご確認ください。
              </p>
            </div>
          )}

          {mode === 'reset' ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#37352f] mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full h-9 px-3 text-[14px] text-[#37352f] placeholder:text-[#9b9a97] bg-white border border-[#e9e9e7] rounded-[3px] focus:outline-none focus:border-[#2383e2] transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-9 px-4 text-[14px] font-medium text-white bg-[#2383e2] rounded-[3px] hover:bg-[#1a73d1] active:bg-[#155cb3] disabled:bg-[#e9e9e7] disabled:text-[#9b9a97] disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '送信中...' : 'リセットメールを送信'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setResetEmailSent(false)
                  setError('')
                }}
                className="w-full text-[13px] text-[#787774] hover:text-[#37352f] transition-colors"
              >
                ログインに戻る
              </button>
            </form>
          ) : showConsent ? (
            // 同意確認画面
            <div className="space-y-4">
              <p className="text-[14px] text-[#37352f]">
                アカウント作成にあたり、以下の内容をご確認ください。
              </p>

              <label className="flex items-start gap-3 p-3 border border-[#e9e9e7] rounded-[6px] cursor-pointer hover:bg-[#f7f6f3] transition-colors">
                <input
                  type="checkbox"
                  checked={hasAgreedToEmail}
                  onChange={(e) => setHasAgreedToEmail(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-[#2383e2] border-[#e9e9e7] rounded focus:ring-[#2383e2]"
                />
                <div className="flex-1">
                  <p className="text-[13px] text-[#37352f] leading-relaxed">
                    メールアドレスは、以下の目的でのみ使用します：
                  </p>
                  <ul className="mt-2 text-[12px] text-[#787774] space-y-1">
                    <li>・アカウント認証</li>
                    <li>・サービスに関する重要なお知らせ</li>
                  </ul>
                </div>
              </label>

              <button
                onClick={() => {
                  setShowConsent(false)
                  setMode('signup')
                }}
                disabled={!hasAgreedToEmail}
                className="w-full h-9 px-4 text-[14px] font-medium text-white bg-[#2383e2] rounded-[3px] hover:bg-[#1a73d1] active:bg-[#155cb3] disabled:bg-[#e9e9e7] disabled:text-[#9b9a97] disabled:cursor-not-allowed transition-colors"
              >
                同意して続ける
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowConsent(false)
                  setHasAgreedToEmail(false)
                  setMode('login')
                }}
                className="w-full text-[13px] text-[#787774] hover:text-[#37352f] transition-colors"
              >
                戻る
              </button>
            </div>
          ) : (
            <>
              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 h-10 px-4 text-[14px] font-medium text-[#37352f] bg-white border border-[#e9e9e7] rounded-[3px] hover:bg-[#f7f6f3] disabled:bg-[#fafafa] disabled:cursor-not-allowed transition-colors mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Googleでログイン
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#e9e9e7]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white text-[12px] text-[#9b9a97]">または</span>
                </div>
              </div>

              {/* Email Login/Signup */}
              <form onSubmit={mode === 'login' ? handleEmailLogin : handleEmailSignup} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-[#37352f] mb-2">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.com"
                    className="w-full h-9 px-3 text-[14px] text-[#37352f] placeholder:text-[#9b9a97] bg-white border border-[#e9e9e7] rounded-[3px] focus:outline-none focus:border-[#2383e2] transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-[#37352f] mb-2">
                    パスワード
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-9 px-3 text-[14px] text-[#37352f] placeholder:text-[#9b9a97] bg-white border border-[#e9e9e7] rounded-[3px] focus:outline-none focus:border-[#2383e2] transition-colors"
                    required
                  />
                </div>

                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[12px] text-[#787774] hover:text-[#37352f] transition-colors"
                  >
                    パスワードを忘れた場合
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-9 px-4 text-[14px] font-medium text-white bg-[#2383e2] rounded-[3px] hover:bg-[#1a73d1] active:bg-[#155cb3] disabled:bg-[#e9e9e7] disabled:text-[#9b9a97] disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? '処理中...' : mode === 'login' ? 'ログイン' : 'アカウント作成'}
                </button>
              </form>

              {/* Toggle Mode */}
              <div className="mt-4 text-center">
                {mode === 'login' ? (
                  <div className="space-y-2">
                    <p className="text-[13px] text-[#9b9a97]">
                      まだアカウントをお持ちでない方
                    </p>
                    <button
                      onClick={() => {
                        setShowConsent(true)
                        setError('')
                      }}
                      className="text-[14px] font-medium text-[#2383e2] hover:text-[#1a73d1] transition-colors underline"
                    >
                      新規登録はこちら
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[13px] text-[#9b9a97]">
                      すでにアカウントをお持ちの方
                    </p>
                    <button
                      onClick={() => {
                        setMode('login')
                        setError('')
                      }}
                      className="text-[14px] font-medium text-[#2383e2] hover:text-[#1a73d1] transition-colors underline"
                    >
                      ログインはこちら
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#e9e9e7] flex justify-end">
          <button
            onClick={handleClose}
            className="h-9 px-4 text-[14px] font-medium text-[#37352f] bg-white border border-[#e9e9e7] rounded-[3px] hover:bg-[#f7f6f3] transition-colors"
          >
            キャンセル
          </button>
        </div>
      </div>
    </div>
  )
}
