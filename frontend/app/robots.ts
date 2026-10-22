import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/seo-schema'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url

  const publicAllowed = [
    '/',
    '/how-it-works',
    '/about',
    '/for-partners',
    '/contact',
    '/terms',
    '/privacy',
    '/llms.txt',
    '/llms-full.txt',
    '/favicon.ico',
    '/site.webmanifest',
    '/*.png',
    '/*.jpg',
    '/*.svg',
    '/*.webp',
  ]

  const privateDisallowed = [
    '/book',
    '/orders',
    '/orders/*',
    '/profile',
    '/profile/*',
    '/order/*',
    '/partner',
    '/partner/*',
    '/auth/*',
    '/api/*',
  ]

  return {
    rules: [
      {
        userAgent: '*',
        allow: publicAllowed,
        disallow: privateDisallowed,
      },
      // Explicit AI & Generative Search Engine rules for high GEO visibility
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'anthropic-ai',
          'Google-Extended',
          'Applebot-Extended',
          'cohere-ai',
          'Bingbot',
        ],
        allow: publicAllowed,
        disallow: privateDisallowed,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: ['/images/*', '/*.jpg', '/*.png', '/*.svg', '/*.webp'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

