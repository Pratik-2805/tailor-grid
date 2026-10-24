import type { MetadataRoute } from 'next'
import { SITE_CONFIG } from '@/lib/seo-schema'

/**
 * Bump these dates when the content of a page actually changes.
 * Search engines ignore lastModified when it changes on every build.
 */
const CONTENT_UPDATED = '2026-10-23'
const LEGAL_UPDATED = '2026-10-15'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.url

  return [
    { url: `${baseUrl}/`, lastModified: CONTENT_UPDATED, changeFrequency: 'weekly', priority: 1.0, images: [`${baseUrl}/og-image.jpg`] },
    { url: `${baseUrl}/how-it-works`, lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/for-partners`, lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: CONTENT_UPDATED, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/terms`, lastModified: LEGAL_UPDATED, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/privacy`, lastModified: LEGAL_UPDATED, changeFrequency: 'yearly', priority: 0.3 },
  ]

}
