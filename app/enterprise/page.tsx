import { EnterprisePage } from '@/components/Enterprise/EnterprisePage'

export const metadata = {
  title: '企業用プラン - AIsen',
  description:
    '複数チームでの導入、カスタマイズ対応、専任サポートなど、企業様向けのエンタープライズプランをご用意しています。',
  openGraph: {
    title: '企業用プラン - AIsen',
    description: '複数チームでの導入、カスタマイズ対応、専任サポート。企業様向けプラン。',
    images: [
      {
        url: '/api/og?title=企業用プラン',
        width: 1200,
        height: 630,
        alt: 'AIsen 企業用プラン',
      },
    ],
  },
}

export default function EnterprisePageRoute() {
  return <EnterprisePage />
}
