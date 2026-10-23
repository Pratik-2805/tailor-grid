import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Raffu - Book Clothing Alterations',
    short_name: 'Raffu',
    description: 'Book clothing alterations on raffu.com. A nearby partner studio accepts your order, you visit for the fitting, and collect your altered clothes there.',
    id: '/',
    lang: 'en-US',
    categories: ['lifestyle', 'shopping'],
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF8F5',
    theme_color: '#FAF8F5',
    icons: [
      {
        src: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
