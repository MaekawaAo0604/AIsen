import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const swPath = path.join(process.cwd(), 'public', 'sw.js')

    // ファイルの存在確認
    if (!fs.existsSync(swPath)) {
      console.error('❌ sw.js not found at:', swPath)
      return new NextResponse('Service Worker not found', { status: 404 })
    }

    const swContent = fs.readFileSync(swPath, 'utf-8')

    return new NextResponse(swContent, {
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Service-Worker-Allowed': '/',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('❌ Error serving Service Worker:', error)
    return new NextResponse(`Error: ${error}`, { status: 500 })
  }
}
