export const metadata = {
  title: "特定商取引法に基づく表記 - AIsen",
  description: "AIsenの特定商取引法に基づく表記ページ",
  openGraph: {
    title: "特定商取引法に基づく表記 - AIsen",
    description: "AIsenの特定商取引法に基づく表記ページ",
    images: [
      {
        url: "/api/og?title=特定商取引法に基づく表記",
        width: 1200,
        height: 630,
        alt: "AIsen 特定商取引法に基づく表記",
      },
    ],
  },
};

export default function TokushoPage() {
  return (
    <div className="min-h-screen bg-[#ffffff] px-4 sm:px-8 md:px-12 lg:px-24 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-8">
          特定商取引法に基づく表記
        </h1>

        <div className="space-y-6 text-[#1a1a1a]">
          <section>
            <h2 className="text-xl font-bold mb-2">販売事業者名</h2>
            <p className="text-gray-700">Virex</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">運営責任者</h2>
            <p className="text-gray-700">伊野瀬出</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">電話番号</h2>
            <p className="text-gray-700">080-9705-0304</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">メールアドレス</h2>
            <p className="text-gray-700">inose.virex@gmail.com</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">サイトURL</h2>
            <p className="text-gray-700">https://aisen.virex-ai.jp</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">販売価格</h2>
            <div className="text-gray-700">
              <p>・無料プラン: 0円</p>
              <p>・Proプラン: 月額500円（税込）/ 年額5,000円（税込）</p>
              <p className="text-sm mt-2">
                ※ 価格は予告なく変更される場合がございます
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">商品代金以外の必要料金</h2>
            <p className="text-gray-700">
              なし（※ インターネット接続料金等の通信費はお客様負担となります）
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">支払方法</h2>
            <p className="text-gray-700">
              クレジットカード（決済代行：Stripe）
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">支払時期</h2>
            <div className="text-gray-700">
              <p>・初回申込時に即時決済</p>
              <p>・以降、毎月（または毎年）自動課金</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">役務の提供時期</h2>
            <p className="text-gray-700">決済完了後、直ちに利用可能</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">解約について</h2>
            <div className="text-gray-700">
              <p>アカウント設定画面からいつでも解約手続きが可能です。</p>
              <p>
                次回更新日の24時間前までに解約手続きを完了することで、次回以降の課金を停止できます。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">返金について</h2>
            <div className="text-gray-700">
              <p>
                デジタルサービスの性質上、日割り計算による返金や途中解約による返金は原則として承っておりません。
              </p>
              <p className="text-sm mt-2">
                ※
                サービスの重大な不具合により利用できない期間が発生した場合は、個別にご相談ください。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-2">動作環境</h2>
            <div className="text-gray-700">
              <p>推奨ブラウザ：</p>
              <ul className="list-disc list-inside ml-4">
                <li>Google Chrome 最新版</li>
                <li>Safari 最新版</li>
                <li>Microsoft Edge 最新版</li>
                <li>Firefox 最新版</li>
              </ul>
              <p className="mt-2">推奨OS：</p>
              <ul className="list-disc list-inside ml-4">
                <li>Windows 10 以降</li>
                <li>macOS 11 (Big Sur) 以降</li>
                <li>iOS 14 以降</li>
                <li>Android 10 以降</li>
              </ul>
              <p className="text-sm mt-2">
                ※ 上記環境以外では正常に動作しない場合がございます
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
  );
}
