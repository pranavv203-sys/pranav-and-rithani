import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { FloatingShapes } from '@/components/floating-shapes'
import './globals.css'

// Load the real italic: the ampersand, the story subtitle and the pull-quote
// all use `italic`, and without this the browser synthesises a slanted upright,
// which a high-contrast serif like Cormorant shows up badly. 600 dropped — no
// element uses it, so this costs one extra file rather than three.
const displayFont = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const bodyFont = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-body',
})

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''

const shareTitle = 'Pranav & Rithani — 17 September 2026'
const shareDescription =
  'Together with their families, we invite you to celebrate our wedding at the Hindu Temple of Atlanta, Riverdale, GA.'

export const metadata: Metadata = {
  // Needed so the share image is emitted as an absolute URL. Messaging apps
  // fetch og:image from their own servers and will not resolve a relative path.
  metadataBase: new URL('https://pranavrithani.com'),
  title: 'Pranav Vishnu & Rithani | Wedding Invitation',
  description:
    'Join us to celebrate the wedding of Pranav Vishnu & Rithani on September 17, 2026 at the Hindu Temple of Atlanta, Riverdale, GA.',
  icons: {
    // Metadata URLs are not basePath-prefixed automatically, so on a project
    // repo (served under /<repo>/) an unprefixed path 404s.
    icon: `${basePath}/icon.svg`,
  },
  // The card shown when the link is pasted into WhatsApp, iMessage, Facebook
  // or Slack. og.png is 1200x630 (the ratio every one of them expects) and is
  // PNG rather than WebP, which several of them still handle unreliably.
  openGraph: {
    type: 'website',
    url: 'https://pranavrithani.com',
    siteName: 'Pranav & Rithani',
    title: shareTitle,
    description: shareDescription,
    images: [
      {
        url: `${basePath}/og.png`,
        width: 1200,
        height: 630,
        alt: 'Pranav & Rithani — 17 September 2026, Hindu Temple of Atlanta',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: shareTitle,
    description: shareDescription,
    images: [`${basePath}/og.png`],
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
