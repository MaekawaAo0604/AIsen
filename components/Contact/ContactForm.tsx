'use client'

import { useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { useAuthStore } from '@/lib/store/useAuthStore'

export function ContactForm() {
  const user = useAuthStore((state) => state.user)
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await addDoc(collection(db, 'contacts'), {
        ...formData,
        userId: user?.uid || null,
        status: 'unread',
        createdAt: serverTimestamp(),
      })

      setSubmitStatus('success')
      setFormData({
        name: user?.displayName || '',
        email: user?.email || '',
        subject: '',
        message: '',
      })

      // 3秒後に成功メッセージをクリア
      setTimeout(() => setSubmitStatus('idle'), 3000)
    } catch (error) {
      console.error('Failed to submit contact form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">お問い合わせ</h2>
        <p className="text-sm text-slate-600 mb-6">
          ご質問やご要望がございましたら、お気軽にお問い合わせください。
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 名前 */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="山田太郎"
            />
          </div>

          {/* メールアドレス */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              メールアドレス <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example@example.com"
            />
          </div>

          {/* 件名 */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-2">
              件名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="機能に関する質問"
            />
          </div>

          {/* メッセージ */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
              メッセージ <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              required
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="お問い合わせ内容をご記入ください"
            />
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 text-white bg-blue-600 rounded-full font-semibold hover:bg-blue-700 hover:shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '送信中...' : '送信する'}
          </button>

          {/* ステータスメッセージ */}
          {submitStatus === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-medium">
                ✓ お問い合わせを受け付けました。ご連絡ありがとうございます。
              </p>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">
                ✗ 送信に失敗しました。もう一度お試しください。
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
