/**
 * Firebase テストアカウント作成スクリプト
 *
 * Usage:
 *   npx tsx scripts/create-test-account.ts
 *
 * テスト用アカウント情報:
 *   Email: test@aisen.dev
 *   Password: testpass123
 *   Plan: Free (default)
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Firebase Admin SDK の初期化
if (!getApps().length) {
  // ローカル環境では GOOGLE_APPLICATION_CREDENTIALS 環境変数を使用
  // または、サービスアカウントキーのパスを直接指定
  initializeApp({
    projectId: 'asian-mvp',
  })
}

const auth = getAuth()
const db = getFirestore()

const TEST_ACCOUNT = {
  email: 'test@aisen.dev',
  password: 'testpass123',
  displayName: 'Test User',
}

async function createTestAccount() {
  try {
    console.log('🔧 Creating test account...')
    console.log(`Email: ${TEST_ACCOUNT.email}`)
    console.log(`Password: ${TEST_ACCOUNT.password}`)

    // 既存のアカウントを確認
    let userRecord
    try {
      userRecord = await auth.getUserByEmail(TEST_ACCOUNT.email)
      console.log('✅ Test account already exists')
      console.log(`UID: ${userRecord.uid}`)
    } catch (error: unknown) {
      const err = error as { code?: string }
      if (err.code === 'auth/user-not-found') {
        // アカウントが存在しない場合は作成
        console.log('📝 Creating new test account...')
        userRecord = await auth.createUser({
          email: TEST_ACCOUNT.email,
          password: TEST_ACCOUNT.password,
          displayName: TEST_ACCOUNT.displayName,
          emailVerified: true, // テスト用なのでメール認証済みにする
        })
        console.log('✅ Test account created')
        console.log(`UID: ${userRecord.uid}`)
      } else {
        throw error
      }
    }

    // Firestore にユーザードキュメントを作成（存在しない場合）
    const userDocRef = db.collection('users').doc(userRecord.uid)
    const userDoc = await userDocRef.get()

    if (!userDoc.exists) {
      console.log('📝 Creating user document in Firestore...')
      await userDocRef.set({
        email: TEST_ACCOUNT.email,
        displayName: TEST_ACCOUNT.displayName,
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      console.log('✅ User document created')
    } else {
      console.log('✅ User document already exists')
    }

    // ブレインストーミング使用回数をリセット（テスト用）
    const usageRef = db.collection('users').doc(userRecord.uid).collection('usage').doc('brainstorm')
    await usageRef.delete()
    console.log('✅ Brainstorm usage data reset')

    console.log('\n🎉 Test account is ready!')
    console.log('\n📋 Test Account Credentials:')
    console.log(`   Email: ${TEST_ACCOUNT.email}`)
    console.log(`   Password: ${TEST_ACCOUNT.password}`)
    console.log(`   UID: ${userRecord.uid}`)
    console.log(`   Plan: free`)
    console.log('\n💡 Use these credentials in your Playwright tests')

  } catch (error) {
    console.error('❌ Error creating test account:', error)
    process.exit(1)
  }
}

createTestAccount()
