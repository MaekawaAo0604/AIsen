export const metadata = {
  title: '外部送信（Cookie/SDK）の利用について - AIsen',
  description: 'AIsenの外部送信（Cookie/SDK）利用に関する情報',
  openGraph: {
    title: '外部送信（Cookie/SDK）の利用について - AIsen',
    description: 'AIsenの外部送信（Cookie/SDK）利用に関する情報',
    images: [
      {
        url: '/api/og?title=外部送信（Cookie/SDK）の利用について',
        width: 1200,
        height: 630,
        alt: 'AIsen 外部送信（Cookie/SDK）の利用について',
      },
    ],
  },
}

export default function ExternalTransmissionPage() {
  return (
    <div className="min-h-screen bg-[#ffffff] px-4 sm:px-8 md:px-12 lg:px-24 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-8">
          外部送信（Cookie/SDK）の利用について
        </h1>

        <div className="space-y-8 text-[#1a1a1a]">
          <section>
            <p className="text-gray-700">
              当サイト「AIsen」では、アクセス解析、広告配信の最適化、サービス品質の向上等のため、Cookie及び類似の技術（以下「Cookie等」）を用いて、利用者の情報が外部事業者に送信される場合があります。
            </p>
            <p className="text-gray-700 mt-4">
              本ページでは、電気通信事業法に基づき、外部送信される情報の内容、送信先、利用目的、停止方法について説明します。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">1. Cookieとは</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                Cookieとは、Webサイトを訪問した際に、ブラウザに保存される小さなテキストファイルです。
              </p>
              <p>
                Cookieには、訪問者を識別するための情報や、サイトの設定情報などが含まれます。次回訪問時に、これらの情報をもとに、より快適なサービスを提供することができます。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              2. 外部送信される情報の詳細
            </h2>

            {/* Google Analytics */}
            <div className="border-l-4 border-[#4CAF50] pl-4 mb-6">
              <h3 className="text-xl font-bold mb-3">Google Analytics</h3>
              <div className="text-gray-700 space-y-2">
                <p>
                  <strong>送信先：</strong>Google LLC
                </p>
                <p>
                  <strong>送信される情報：</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Cookie識別子</li>
                  <li>閲覧ページのURL</li>
                  <li>閲覧日時</li>
                  <li>リファラー（どのページから来たか）</li>
                  <li>IPアドレス（匿名化処理済み）</li>
                  <li>端末情報（OS、ブラウザ種類、画面解像度等）</li>
                </ul>
                <p className="mt-2">
                  <strong>利用目的：</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>アクセス状況の分析</li>
                  <li>利用者の行動分析</li>
                  <li>サービス改善のための統計情報取得</li>
                </ul>
                <p className="mt-2">
                  <strong>停止方法：</strong>
                </p>
                <p className="ml-4">
                  Googleアナリティクスオプトアウトアドオンをインストールすることで無効化できます。
                  <br />
                  <a
                    href="https://tools.google.com/dlpage/gaoptout"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    https://tools.google.com/dlpage/gaoptout
                  </a>
                </p>
              </div>
            </div>

            {/* Firebase */}
            <div className="border-l-4 border-[#FFCA28] pl-4 mb-6">
              <h3 className="text-xl font-bold mb-3">Firebase (Google)</h3>
              <div className="text-gray-700 space-y-2">
                <p>
                  <strong>送信先：</strong>Google LLC
                </p>
                <p>
                  <strong>送信される情報：</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>認証状態（ログイン/未ログイン）</li>
                  <li>ユーザーID（匿名ID含む）</li>
                  <li>アプリケーションの利用状況</li>
                  <li>エラーログ</li>
                  <li>パフォーマンス情報</li>
                </ul>
                <p className="mt-2">
                  <strong>利用目的：</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>認証機能の提供</li>
                  <li>データベース機能の提供</li>
                  <li>不正利用の検知と防止</li>
                  <li>サービスの安定稼働・パフォーマンス向上</li>
                </ul>
                <p className="mt-2">
                  <strong>停止方法：</strong>
                </p>
                <p className="ml-4">
                  本サービスの認証・データ保存に必須のため、停止するとサービスを利用できなくなります。
                </p>
              </div>
            </div>

            {/* Stripe */}
            <div className="border-l-4 border-[#635BFF] pl-4 mb-6">
              <h3 className="text-xl font-bold mb-3">Stripe</h3>
              <div className="text-gray-700 space-y-2">
                <p>
                  <strong>送信先：</strong>Stripe, Inc.
                </p>
                <p>
                  <strong>送信される情報：</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>決済情報（カード番号等はStripeが暗号化処理）</li>
                  <li>決済結果</li>
                  <li>IPアドレス</li>
                  <li>ブラウザ情報</li>
                </ul>
                <p className="mt-2">
                  <strong>利用目的：</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>決済処理</li>
                  <li>不正利用の検知と防止</li>
                  <li>セキュリティ確保</li>
                </ul>
                <p className="mt-2">
                  <strong>停止方法：</strong>
                </p>
                <p className="ml-4">
                  有料プランの決済に必須のため、停止すると有料プランを利用できなくなります。
                </p>
              </div>
            </div>

            {/* その他の解析・広告ツール（必要に応じて追加） */}
            <div className="border-l-4 border-gray-400 pl-4 mb-6">
              <h3 className="text-xl font-bold mb-3">
                その他のツール（今後追加される可能性があります）
              </h3>
              <div className="text-gray-700 space-y-2">
                <p>
                  今後、サービス改善や機能追加に伴い、以下のようなツールを導入する可能性があります。
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>広告配信サービス（Google Ads、Facebook Pixel等）</li>
                  <li>ヒートマップ解析ツール</li>
                  <li>カスタマーサポートツール</li>
                  <li>メール配信サービス</li>
                </ul>
                <p className="mt-2">
                  導入の際は、本ページを更新し、事前に告知いたします。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              3. Cookieの無効化（全般）
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                ブラウザの設定により、Cookie等を無効化することができます。ただし、無効化すると本サービスの一部機能が正常に動作しない場合があります。
              </p>

              <h3 className="text-lg font-bold mt-4 mb-2">主要ブラウザの設定方法</h3>
              <ul className="list-disc list-inside ml-4 space-y-2">
                <li>
                  <strong>Google Chrome：</strong>
                  <br />
                  設定 &gt; プライバシーとセキュリティ &gt; Cookie と他のサイトデータ
                  <br />
                  <a
                    href="https://support.google.com/chrome/answer/95647"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    詳細はこちら
                  </a>
                </li>
                <li>
                  <strong>Safari：</strong>
                  <br />
                  環境設定 &gt; プライバシー &gt; Cookieとウェブサイトのデータ
                  <br />
                  <a
                    href="https://support.apple.com/ja-jp/guide/safari/sfri11471/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    詳細はこちら
                  </a>
                </li>
                <li>
                  <strong>Microsoft Edge：</strong>
                  <br />
                  設定 &gt; プライバシー、検索、サービス &gt; Cookie とサイトのアクセス許可
                  <br />
                  <a
                    href="https://support.microsoft.com/ja-jp/microsoft-edge"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    詳細はこちら
                  </a>
                </li>
                <li>
                  <strong>Firefox：</strong>
                  <br />
                  設定 &gt; プライバシーとセキュリティ &gt; Cookie とサイトデータ
                  <br />
                  <a
                    href="https://support.mozilla.org/ja/kb/cookies-information-websites-store-on-your-computer"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    詳細はこちら
                  </a>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. 本ページの更新</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                当社は、新しいツールの導入や法令の変更等に応じて、本ページの内容を更新する場合があります。
              </p>
              <p>
                重要な変更がある場合は、本サービス上またはメール等で事前に告知します。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. お問い合わせ</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                本ページに関するお問い合わせは、
                <a
                  href="/privacy"
                  className="text-blue-600 hover:underline"
                >
                  プライバシーポリシー
                </a>
                記載の窓口までご連絡ください。
              </p>
            </div>
          </section>

          <section className="border-t pt-6 mt-8">
            <p className="text-sm text-gray-600">制定日：2025-01-01</p>
            <p className="text-sm text-gray-600">最終更新日：2025-01-01</p>
          </section>
        </div>
      </div>
    </div>
  )
}
