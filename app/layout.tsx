import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { FloatingShapes } from '@/components/floating-shapes'
import './globals.css'

const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
})

const bodyFont = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Pranav Vishnu & Rithani | Wedding Invitation',
  description:
    'Join us to celebrate the wedding of Pranav Vishnu & Rithani on September 17, 2026 at the Hindu Temple of Atlanta, Riverdale, GA.',
  icons: {
    icon: '/icon.svg',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f5ecd8',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${displayFont.variable} ${bodyFont.variable}`}>
      <body className="font-sans antialiased">
        <FloatingShapes />
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
