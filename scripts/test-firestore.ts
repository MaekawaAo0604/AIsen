/**
 * Firestore接続テストスクリプト
 *
 * 実行方法:
 * npx tsx scripts/test-firestore.ts
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { randomUUID } from 'crypto'

// Firebase設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Firebase初期化
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function testFirestoreConnection() {
  console.log('🔥 Firestore接続テスト開始...\n')

  try {
    // 1. テストボード作成
    console.log('1️⃣  テストボード作成中...')
    const testBoard = {
      title: 'テストボード',
      editKey: randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const boardRef = await addDoc(collection(db, 'boards'), testBoard)
    console.log('✅ ボード作成成功:', boardRef.id)

    // 2. ボード読み取り
    console.log('\n2️⃣  ボード読み取り中...')
    const boardDoc = await getDoc(doc(db, 'boards', boardRef.id))
    if (boardDoc.exists()) {
      console.log('✅ ボード読み取り成功:', boardDoc.data())
    }

    // 3. タスク追加
    console.log('\n3️⃣  タスク追加中...')
    const testTask = {
      title: 'テストタスク',
      notes: 'これはテストです',
      due: null,
      createdAt: new Date().toISOString(),
      quadrant: 'q1',
    }
    const taskRef = await addDoc(collection(db, 'boards', boardRef.id, 'tasks'), testTask)
    console.log('✅ タスク作成成功:', taskRef.id)

    // 4. タスク一覧取得
    console.log('\n4️⃣  タスク一覧取得中...')
    const tasksSnap = await getDocs(collection(db, 'boards', boardRef.id, 'tasks'))
    console.log('✅ タスク数:', tasksSnap.size)
    tasksSnap.forEach((doc) => {
      console.log('  -', doc.id, doc.data())
    })

    // 5. タスク更新
    console.log('\n5️⃣  タスク更新中...')
    await updateDoc(doc(db, 'boards', boardRef.id, 'tasks', taskRef.id), {
      title: '更新されたタスク',
    })
    const updatedTask = await getDoc(doc(db, 'boards', boardRef.id, 'tasks', taskRef.id))
    console.log('✅ タスク更新成功:', updatedTask.data())

    // 6. タスク削除
    console.log('\n6️⃣  タスク削除中...')
    await deleteDoc(doc(db, 'boards', boardRef.id, 'tasks', taskRef.id))
    const deletedTask = await getDoc(doc(db, 'boards', boardRef.id, 'tasks', taskRef.id))
    console.log('✅ タスク削除成功:', !deletedTask.exists())

    // 7. ボード削除
    console.log('\n7️⃣  ボード削除中...')
    await deleteDoc(doc(db, 'boards', boardRef.id))
    const deletedBoard = await getDoc(doc(db, 'boards', boardRef.id))
    console.log('✅ ボード削除成功:', !deletedBoard.exists())

    console.log('\n🎉 すべてのテストが成功しました！')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
    process.exit(1)
  }
}

testFirestoreConnection()
