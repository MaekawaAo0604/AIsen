/**
 * Firebase Authentication エラーコードを日本語のユーザーフレンドリーなメッセージにマッピング
 */

interface FirebaseError {
  code?: string
  message?: string
}

export function getAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return '予期しないエラーが発生しました。もう一度お試しください。'
  }

  const firebaseError = error as FirebaseError
  const errorCode = firebaseError.code || ''

  // Firebase Auth エラーコードのマッピング
  const errorMessages: Record<string, string> = {
    // Email/Password エラー
    'auth/invalid-email': 'メールアドレスの形式が正しくありません。',
    'auth/user-disabled': 'このアカウントは無効化されています。サポートにお問い合わせください。',
    'auth/user-not-found': 'メールアドレスまたはパスワードが正しくありません。',
    'auth/wrong-password': 'メールアドレスまたはパスワードが正しくありません。',
    'auth/invalid-credential': 'メールアドレスまたはパスワードが正しくありません。',
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています。ログインするか、別のメールアドレスをお試しください。',
    'auth/weak-password': 'パスワードは6文字以上で設定してください。',
    'auth/operation-not-allowed': 'この認証方法は現在利用できません。',
    'auth/requires-recent-login': 'セキュリティのため、再度ログインしてください。',

    // Google SSO エラー
    'auth/popup-blocked': 'ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。',
    'auth/popup-closed-by-user': 'ログインがキャンセルされました。',
    'auth/cancelled-popup-request': 'ログインがキャンセルされました。',
    'auth/account-exists-with-different-credential': 'このメールアドレスは既に別の方法で登録されています。別のログイン方法をお試しください。',
    'auth/credential-already-in-use': 'この認証情報は既に別のアカウントで使用されています。',
    'auth/auth-domain-config-required': '認証設定に問題があります。管理者にお問い合わせください。',

    // ネットワーク・一般エラー
    'auth/network-request-failed': 'ネットワークエラーが発生しました。インターネット接続を確認してください。',
    'auth/timeout': '接続がタイムアウトしました。もう一度お試しください。',
    'auth/too-many-requests': 'ログイン試行回数が多すぎます。しばらく時間をおいてから再度お試しください。',
    'auth/internal-error': 'サーバーエラーが発生しました。しばらく時間をおいてから再度お試しください。',

    // パスワードリセット
    'auth/missing-email': 'メールアドレスを入力してください。',
    'auth/invalid-action-code': 'リセットリンクが無効または期限切れです。再度リセットメールを送信してください。',
    'auth/expired-action-code': 'リセットリンクの有効期限が切れています。再度リセットメールを送信してください。',
  }

  // エラーコードに対応するメッセージを返す
  if (errorCode && errorMessages[errorCode]) {
    return errorMessages[errorCode]
  }

  // 不明なエラーの場合は元のメッセージを返す（開発時用）
  if (firebaseError.message) {
    // 本番環境では汎用メッセージを返す
    if (process.env.NODE_ENV === 'production') {
      return 'ログインに失敗しました。入力内容をご確認の上、もう一度お試しください。'
    }
    return firebaseError.message
  }

  return 'ログインに失敗しました。入力内容をご確認の上、もう一度お試しください。'
}
