'use client'

import dynamic from 'next/dynamic'

const DynamicContactForm = dynamic(
  () => import('@/components/Contact/ContactForm').then((mod) => mod.ContactForm),
  { ssr: false }
)

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#ffffff] px-4 sm:px-8 md:px-12 lg:px-24 py-8 sm:py-12">
      <DynamicContactForm />
    </div>
  )
}
