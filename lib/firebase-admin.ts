/**
 * Firebase Admin SDK
 * サーバーサイド（API Routes、Cloud Functions等）で使用
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'

let app: App
let adminDb: Firestore

if (!getApps().length) {
  // Vercel環境では環境変数から認証情報を取得
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    app = initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    })
  } else {
    // ローカル環境では GOOGLE_APPLICATION_CREDENTIALS を使用
    app = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'asian-mvp',
    })
  }
  adminDb = getFirestore(app)
} else {
  app = getApps()[0]
  adminDb = getFirestore(app)
}

export { adminDb }
