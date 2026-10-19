import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/seo-schema'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/how-it-works',
          '/for-partners',
          '/contact',
          '/terms',
          '/privacy',
          '/favicon.ico',
          '/*.png',
          '/*.jpg',
          '/*.svg',
          '/*.webp',
        ],
        disallow: [
          '/book',
          '/orders',
          '/profile',
          '/order/*',
          '/partner',
          '/partner/*',
          '/auth/*',
          '/api/*',
        ],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/*', '/*.jpg', '/*.png', '/*.svg'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
