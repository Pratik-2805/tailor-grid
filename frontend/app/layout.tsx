import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import 'react-toastify/dist/ReactToastify.css'
import './globals.css'
import { AppProvider } from '@/components/app-provider'
import { ClientLayout } from '@/components/client-layout'
import { SITE_CONFIG, buildOrganizationSchema, buildWebSiteSchema } from '@/lib/seo-schema'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: 'Raffu — Own Your Fit | Doorstep Tailoring & Alteration Network',
    template: '%s | Raffu - Own Your Fit',
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [{ name: 'Raffu Technologies Ltd.', url: SITE_CONFIG.url }],
  creator: 'Raffu',
  publisher: 'Raffu Technologies Ltd.',
  applicationName: 'Raffu - Own Your Fit',
  category: 'Fashion & Tailoring Services',
  formatDetection: {
    telephone: true,
    date: false,
    address: true,
    email: true,
  },
  alternates: {
    canonical: '/',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Raffu — Own Your Fit | Doorstep Tailoring & Alteration Network',
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: 'Raffu - Own Your Fit',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Raffu - Own Your Fit | Modern Tailoring & Alteration Network',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Raffu — Own Your Fit | Doorstep Tailoring & Alteration Network',
    description: SITE_CONFIG.description,
    creator: '@raffufit',
    site: '@raffufit',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'android-chrome-192x192',
        url: '/android-chrome-192x192.png',
      },
      {
        rel: 'android-chrome-512x512',
        url: '/android-chrome-512x512.png',
      },
    ],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF8F5' },
    { media: '(prefers-color-scheme: dark)', color: '#18191B' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const organizationSchema = buildOrganizationSchema()
  const webSiteSchema = buildWebSiteSchema()

  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} scroll-smooth`}>
      <head>
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(webSiteSchema),
          }}
        />
      </head>
      <body className="font-sans antialiased bg-[#FAF8F5] text-[#1D2024] selection:bg-[#18191B]/15 selection:text-[#18191B]">
        <AppProvider>
          <ClientLayout>{children}</ClientLayout>
        </AppProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}


