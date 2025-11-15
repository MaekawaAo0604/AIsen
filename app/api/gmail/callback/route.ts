import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const state = searchParams.get('state') // userId
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL(`/inbox?error=${error}`, request.url))
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL('/inbox?error=missing_parameters', request.url)
    )
  }

  // codeとstateをクライアントサイドに渡す
  return NextResponse.redirect(
    new URL(`/inbox?code=${code}&state=${state}`, request.url)
  )
}
