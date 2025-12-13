export const metadata = {
  title: 'プライバシーポリシー - AIsen',
  description: 'AIsenのプライバシーポリシーページ',
  openGraph: {
    title: 'プライバシーポリシー - AIsen',
    description: 'AIsenのプライバシーポリシーページ',
    images: [
      {
        url: '/api/og?title=プライバシーポリシー',
        width: 1200,
        height: 630,
        alt: 'AIsen プライバシーポリシー',
      },
    ],
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#ffffff] px-4 sm:px-8 md:px-12 lg:px-24 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-8">
          プライバシーポリシー
        </h1>

        <div className="space-y-8 text-[#1a1a1a]">
          <section>
            <p className="text-gray-700">
              伊野瀬出（以下「当社」）は、「AIsen」（以下「本サービス」）におけるユーザー情報の取扱いを以下のとおり定めます。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">第1条（事業者情報）</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                <strong>事業者名：</strong>伊野瀬出
              </p>
              <p>
                <strong>所在地：</strong>［住所］
              </p>
              <p>
                <strong>連絡先：</strong>［メールアドレス / お問い合わせフォームURL］
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              第2条（取得する情報）
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>当社は、本サービスの提供にあたり、以下の情報を取得します。</p>

              <h3 className="text-xl font-bold mt-4 mb-2">
                1. アカウント情報
              </h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>メールアドレス</li>
                <li>パスワード（暗号化して保存）</li>
                <li>ユーザー名</li>
                <li>プロフィール画像（任意）</li>
              </ul>

              <h3 className="text-xl font-bold mt-4 mb-2">2. 利用ログ情報</h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>IPアドレス</li>
                <li>端末情報（OS、ブラウザ種類等）</li>
                <li>アクセス日時</li>
                <li>閲覧ページ</li>
                <li>操作履歴</li>
              </ul>

              <h3 className="text-xl font-bold mt-4 mb-2">
                3. 決済に関する情報
              </h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>決済結果（成功/失敗）</li>
                <li>請求状況</li>
                <li>
                  ※
                  クレジットカード番号等の決済情報は、決済代行事業者（Stripe）が取り扱い、当社は保持しません
                </li>
              </ul>

              <h3 className="text-xl font-bold mt-4 mb-2">
                4. お問い合わせ情報
              </h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>お問い合わせ内容</li>
                <li>連絡先情報</li>
              </ul>

              <h3 className="text-xl font-bold mt-4 mb-2">
                5. タスク・ボード情報
              </h3>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>作成したタスクの内容</li>
                <li>ボードの設定情報</li>
                <li>共有設定</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">第3条（利用目的）</h2>
            <div className="text-gray-700 space-y-2">
              <p>当社は、取得した情報を以下の目的で利用します。</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>本サービスの提供、運営、維持</li>
                <li>本人確認、アカウント管理</li>
                <li>料金の請求、決済確認</li>
                <li>不正利用の防止、セキュリティの確保</li>
                <li>本サービスの改善、利用状況の分析</li>
                <li>新機能、キャンペーン等のご案内</li>
                <li>お問い合わせ対応、カスタマーサポート</li>
                <li>利用規約違反への対応</li>
              </ul>
              <p className="mt-4 text-sm">
                ※
                ユーザー入力画面で連絡先等を取得する場合、上記の利用目的を明示します。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              第4条（第三者提供）
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                当社は、以下のいずれかに該当する場合を除き、ユーザーの同意なく個人データを第三者に提供しません。
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>法令に基づく場合</li>
                <li>
                  人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき
                </li>
                <li>
                  公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき
                </li>
                <li>
                  国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">第5条（委託）</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                当社は、本サービスの提供にあたり、以下の業務を外部事業者に委託する場合があります。
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>決済処理（Stripe Inc.）</li>
                <li>データ保管・管理（Google Cloud Platform / Firebase）</li>
                <li>メール配信</li>
                <li>アクセス解析（Google Analytics等）</li>
                <li>カスタマーサポート</li>
              </ul>
              <p className="mt-4">
                委託先に対しては、個人情報の適切な管理を求め、必要かつ適切な監督を行います。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              第6条（安全管理措置）
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                当社は、個人情報の漏えい、滅失またはき損の防止その他の個人情報の安全管理のため、以下の措置を講じます。
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>アクセス制御（認証、権限管理）</li>
                <li>通信の暗号化（SSL/TLS）</li>
                <li>データの暗号化</li>
                <li>定期的なセキュリティ診断</li>
                <li>従業員（委託先を含む）への教育</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              第7条（開示等の請求）
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                ユーザーは、当社が保有する自己の個人データについて、以下の請求を行うことができます。
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>開示</li>
                <li>訂正、追加または削除</li>
                <li>利用の停止または消去</li>
                <li>第三者への提供の停止</li>
              </ul>
              <p className="mt-4">
                請求方法については、「第1条（事業者情報）」記載の窓口へご連絡ください。
              </p>
              <p className="mt-2 text-sm">
                ※
                請求に応じることができない場合（法令に基づく場合等）は、その旨を通知いたします。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              第8条（Cookie・類似技術）
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                本サービスでは、利用状況の分析、広告配信の最適化等のため、Cookie及び類似の技術を使用します。
              </p>
              <p className="mt-2">
                詳細は、
                <a
                  href="/external-transmission"
                  className="text-blue-600 hover:underline"
                >
                  外部送信（Cookie/SDK）の利用について
                </a>
                をご覧ください。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              第9条（プライバシーポリシーの改定）
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                1.
                当社は、法令の変更、本サービスの内容変更等に応じて、本プライバシーポリシーを改定する場合があります。
              </p>
              <p>
                2.
                改定後のプライバシーポリシーは、本サービス上に掲示した時点で効力を生じるものとします。
              </p>
              <p>
                3.
                重要な変更がある場合は、本サービス上またはメール等で事前に告知します。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">第10条（お問い合わせ）</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                本プライバシーポリシーに関するお問い合わせは、「第1条（事業者情報）」記載の窓口までご連絡ください。
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
