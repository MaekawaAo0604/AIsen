export const metadata = {
  title: "利用規約 - AIsen",
  description: "AIsenの利用規約ページ",
  openGraph: {
    title: "利用規約 - AIsen",
    description: "AIsenの利用規約ページ",
    images: [
      {
        url: "/api/og?title=利用規約",
        width: 1200,
        height: 630,
        alt: "AIsen 利用規約",
      },
    ],
  },
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#ffffff] px-4 sm:px-8 md:px-12 lg:px-24 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#1a1a1a] mb-8">
          利用規約
        </h1>

        <div className="space-y-8 text-[#1a1a1a]">
          <section>
            <p className="text-gray-700">
              本規約は、Virex（以下「当社」）が提供する「AIsen」（以下「本サービス」）の利用条件を定めるものです。
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">第1条（適用）</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                1.
                本規約は、本サービスの利用に関する当社とユーザーとの間の権利義務関係を定めることを目的とし、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されます。
              </p>
              <p>
                2.
                ユーザーは、本規約に同意した上で、本サービスを利用するものとします。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">第2条（定義）</h2>
            <div className="text-gray-700 space-y-2">
              <p>本規約において使用する用語の定義は、以下の通りとします。</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  「本サービス」とは、当社が提供する「AIsen」という名称のタスク管理サービスをいいます。
                </li>
                <li>
                  「ユーザー」とは、本規約に同意の上、本サービスを利用する個人または法人をいいます。
                </li>
                <li>
                  「アカウント」とは、本サービスを利用するために作成される個別のユーザー識別情報をいいます。
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">第3条（アカウント登録）</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                1.
                ユーザーは、本規約に同意の上、当社所定の方法でアカウント登録を行うことにより、本サービスを利用できます。
              </p>
              <p>
                2.
                ユーザーは、登録情報について、正確かつ最新の情報を提供しなければなりません。
              </p>
              <p>
                3.
                ユーザーは、自己の責任においてアカウント情報を適切に管理しなければなりません。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">第4条（禁止事項）</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>
                  本サービスの運営を妨害するおそれのある行為（過度な負荷をかける行為を含む）
                </li>
                <li>他のユーザーに対する迷惑行為</li>
                <li>
                  当社、他のユーザー、または第三者の知的財産権を侵害する行為
                </li>
                <li>本サービスのネットワークまたはシステムへの不正アクセス</li>
                <li>本サービスの脆弱性を探索、試行または利用する行為</li>
                <li>
                  リバースエンジニアリング、逆コンパイル、逆アセンブル等の行為
                </li>
                <li>
                  他のユーザーのアカウント情報を不正に取得、使用または開示する行為
                </li>
                <li>
                  当社の事前の書面による承諾なく本サービスを商用利用する行為
                </li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              第5条（有料プラン・定期課金）
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                1. <strong>料金プラン</strong>
              </p>
              <ul className="list-disc list-inside ml-8 space-y-1">
                <li>無料プラン：0円</li>
                <li>Proプラン（月額）：980円（税込）/ 月</li>
                <li>Proプラン（年額）：9,800円（税込）/ 年</li>
              </ul>

              <p className="mt-4">
                2. <strong>課金タイミング</strong>
              </p>
              <ul className="list-disc list-inside ml-8 space-y-1">
                <li>有料プランへの申込時に初回課金が行われます。</li>
                <li>
                  以降、毎月（月額プラン）または毎年（年額プラン）の同日に自動的に更新され、課金が行われます。
                </li>
                <li>
                  更新日が存在しない月（例：1月31日申込→2月31日は存在しない）の場合、その月の最終日に課金されます。
                </li>
              </ul>

              <p className="mt-4">
                3. <strong>解約手続き</strong>
              </p>
              <ul className="list-disc list-inside ml-8 space-y-1">
                <li>
                  ユーザーは、アカウント設定画面からいつでも有料プランの解約手続きを行うことができます。
                </li>
                <li>
                  解約手続きは、次回更新日の24時間前までに完了する必要があります。
                </li>
                <li>
                  解約手続き完了後も、次回更新日までは有料プランの機能を引き続きご利用いただけます。
                </li>
              </ul>

              <p className="mt-4">
                4. <strong>返金ポリシー</strong>
              </p>
              <ul className="list-disc list-inside ml-8 space-y-1">
                <li>
                  本サービスはデジタルコンテンツの性質上、原則として日割り計算による返金や途中解約による返金は行いません。
                </li>
                <li>
                  ただし、当社の責に帰すべき事由により本サービスが利用できない期間が発生した場合は、個別に対応を検討いたします。
                </li>
              </ul>

              <p className="mt-4">
                5. <strong>料金の変更</strong>
              </p>
              <p className="ml-4">
                当社は、料金プランの内容および価格を変更する場合があります。変更は、本サービス上での告知により効力を生じるものとします。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              第6条（サービスの変更・停止）
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                1.
                当社は、事前の通知なく、本サービスの内容を変更し、または提供を停止することができるものとします。
              </p>
              <p>
                2.
                当社は、以下のいずれかに該当する場合、ユーザーへの事前通知なく、本サービスの全部または一部の提供を停止または中断できるものとします。
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>
                  本サービスに係るコンピューターシステムの点検または保守作業を定期的または緊急に行う場合
                </li>
                <li>コンピューター、通信回線等が事故により停止した場合</li>
                <li>
                  地震、落雷、火災、風水害、停電、天災地変などの不可抗力により本サービスの運営ができなくなった場合
                </li>
                <li>その他、当社が停止または中断を必要と判断した場合</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">第7条（免責事項）</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                1.
                当社は、本サービスの完全性、正確性、確実性、有用性等について、いかなる保証も行いません。
              </p>
              <p>
                2.
                当社は、本サービスに起因してユーザーに生じたあらゆる損害について、当社の故意または重過失による場合を除き、一切の責任を負いません。
              </p>
              <p>
                3.
                当社は、ユーザーが本サービスを通じて他のユーザーと行った取引、連絡、紛争等について一切責任を負いません。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">第8条（知的財産権）</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                1.
                本サービスに関する知的財産権は、すべて当社または当社にライセンスを許諾している第三者に帰属します。
              </p>
              <p>
                2.
                本規約に基づく本サービスの利用許諾は、本サービスに関する当社または当社にライセンスを許諾している第三者の知的財産権の使用許諾を意味するものではありません。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">第9条（規約の変更）</h2>
            <div className="text-gray-700 space-y-2">
              <p>
                1.
                当社は、ユーザーの承諾を得ることなく、いつでも本規約の内容を変更できるものとします。
              </p>
              <p>
                2.
                変更後の本規約は、本サービス上に掲示された時点で効力を生じるものとします。
              </p>
              <p>
                3.
                本規約の変更後、ユーザーが本サービスを利用した場合、ユーザーは変更後の本規約に同意したものとみなします。
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">
              第10条（準拠法・裁判管轄）
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>1. 本規約の準拠法は日本法とします。</p>
              <p>
                2.
                本規約または本サービスに関して紛争が生じた場合、［●●地方裁判所］を第一審の専属的合意管轄裁判所とします。
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
