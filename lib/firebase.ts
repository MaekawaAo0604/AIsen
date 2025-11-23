import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Initialize Firebase (シングルトンパターン)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// Firebase Authentication
export const auth = getAuth(app)

// 通常のGoogleログイン用Provider (スコープなし)
export const googleProvider = new GoogleAuthProvider()

// Gmail連携専用Provider (Gmail読み取りスコープ付き)
export const googleProviderWithGmail = new GoogleAuthProvider()
googleProviderWithGmail.addScope('https://www.googleapis.com/auth/gmail.readonly')

// Firestore
export const db = getFirestore(app)

// Cloud Functions
export const functions = getFunctions(app)
