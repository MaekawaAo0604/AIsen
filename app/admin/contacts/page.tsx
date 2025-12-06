'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'

interface Contact {
  id: string
  name: string
  email: string
  subject: string
  message: string
  userId: string | null
  status: 'unread' | 'read' | 'replied'
  createdAt: any
}

export default function AdminContactsPage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // 管理者認証チェック
  useEffect(() => {
    const adminAuth = sessionStorage.getItem('isAdmin')
    if (adminAuth !== 'true') {
      router.push('/admin/login')
      return
    }
    setIsAdmin(true)
    setIsLoading(false)
  }, [router])

  // お問い合わせデータの取得
  useEffect(() => {
    if (!isAdmin) return

    const q = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contactsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Contact[]
      setContacts(contactsData)
    })

    return () => unsubscribe()
  }, [isAdmin])

  const handleMarkAsRead = async (contactId: string) => {
    await updateDoc(doc(db, 'contacts', contactId), {
      status: 'read',
    })
  }

  const handleMarkAsReplied = async (contactId: string) => {
    await updateDoc(doc(db, 'contacts', contactId), {
      status: 'replied',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
        <div className="text-slate-600">読み込み中...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#ffffff] px-4 sm:px-8 md:px-12 lg:px-24 py-8 sm:py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">お問い合わせ管理</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* お問い合わせ一覧 */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">
              お問い合わせ一覧 ({contacts.length}件)
            </h2>

            {contacts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                <p className="text-slate-600">お問い合わせはありません</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setSelectedContact(contact)
                      if (contact.status === 'unread') {
                        handleMarkAsRead(contact.id)
                      }
                    }}
                    className={`w-full text-left bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all ${
                      contact.status === 'unread'
                        ? 'border-blue-300 bg-blue-50'
                        : contact.status === 'replied'
                          ? 'border-green-300 bg-green-50'
                          : 'border-slate-200'
                    } ${selectedContact?.id === contact.id ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 line-clamp-1">
                        {contact.subject}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          contact.status === 'unread'
                            ? 'bg-blue-100 text-blue-700'
                            : contact.status === 'replied'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {contact.status === 'unread'
                          ? '未読'
                          : contact.status === 'replied'
                            ? '返信済み'
                            : '既読'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{contact.name}</p>
                    <p className="text-xs text-slate-500">
                      {contact.createdAt?.toDate?.()?.toLocaleString('ja-JP') || '日時不明'}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* お問い合わせ詳細 */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            {selectedContact ? (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-2xl font-bold text-slate-900">
                      {selectedContact.subject}
                    </h2>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedContact.status === 'unread'
                          ? 'bg-blue-100 text-blue-700'
                          : selectedContact.status === 'replied'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {selectedContact.status === 'unread'
                        ? '未読'
                        : selectedContact.status === 'replied'
                          ? '返信済み'
                          : '既読'}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-slate-700 w-24">名前:</span>
                      <span className="text-slate-900">{selectedContact.name}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-slate-700 w-24">メール:</span>
                      <a
                        href={`mailto:${selectedContact.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {selectedContact.email}
                      </a>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-slate-700 w-24">日時:</span>
                      <span className="text-slate-900">
                        {selectedContact.createdAt?.toDate?.()?.toLocaleString('ja-JP') ||
                          '日時不明'}
                      </span>
                    </div>
                    {selectedContact.userId && (
                      <div className="flex items-center text-sm">
                        <span className="font-medium text-slate-700 w-24">ユーザーID:</span>
                        <span className="text-slate-900 font-mono text-xs">
                          {selectedContact.userId}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="font-semibold text-slate-900 mb-2">メッセージ:</h3>
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedContact.message}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {selectedContact.status !== 'replied' && (
                    <button
                      onClick={() => handleMarkAsReplied(selectedContact.id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      返信済みにする
                    </button>
                  )}
                  <a
                    href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
                  >
                    メールで返信
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
                <p className="text-slate-600">お問い合わせを選択してください</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
