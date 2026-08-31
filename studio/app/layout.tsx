import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Darzi Studio Atelier — Partner Workshop Portal',
  description: 'Master Tailor order intake, live alteration pipeline, queue management, and daily payouts for partner ateliers.',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0F1115' },
    { media: '(prefers-color-scheme: dark)', color: '#0F1115' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-[#FAF8F5] text-[#1D2024] selection:bg-[#9E593B]/20 selection:text-[#9E593B]">
        {children}
      </body>
    </html>
  )
}
