import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fff',
          backgroundImage: 'linear-gradient(to bottom right, #dbeafe, #fff, #f3e8ff)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 'bold',
              background: 'linear-gradient(to right, #2563eb, #9333ea)',
              backgroundClip: 'text',
              color: 'transparent',
              display: 'flex',
            }}
          >
            AIsen
          </div>
          <div
            style={{
              fontSize: 48,
              color: '#111827',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>重要と緊急を、</div>
            <div>迷わず仕分ける</div>
          </div>
          <div
            style={{
              fontSize: 28,
              color: '#6b7280',
              textAlign: 'center',
              display: 'flex',
            }}
          >
            自動判定する4象限タスク管理
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
