import { PricingPage } from '@/components/Pricing/PricingPage'

export const metadata = {
  title: '料金プラン - AIsen',
  description:
    '個人は無料ではじめて、仕事で効かせたい人だけProへ。メール・カレンダー・自動仕分けまではPro。まずはブラウザだけで4象限を試せます。',
  openGraph: {
    title: '料金プラン - AIsen',
    description:
      '個人は無料ではじめて、仕事で効かせたい人だけProへ。メール・カレンダー・自動仕分けまではPro。',
    images: [
      {
        url: '/api/og?title=料金プラン',
        width: 1200,
        height: 630,
        alt: 'AIsen 料金プラン',
      },
    ],
  },
}

export default function PricingPageRoute() {
  return <PricingPage />
}
