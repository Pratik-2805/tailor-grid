import type { Metadata } from 'next'
import { FAQS, type StoreOption } from '@/components/data'

/**
 * The one and only canonical domain. Deliberately not read from env so a
 * staging/preview or legacy domain can never leak into canonicals, sitemaps,
 * or structured data.
 */
const CANONICAL_URL = 'https://raffu.com'

export const SITE_CONFIG = {
  name: 'Raffu',
  shortName: 'Raffu',
  brandName: 'raffu.com',
  tagline: 'Book Alteration Online - Own Your Fit',
  title: 'Raffu - Book Alteration Online',
  description:
    'Book clothing alterations online with Raffu. A nearby verified partner studio accepts your order, you visit for a precision fitting, and collect your perfectly altered clothes.',
  url: CANONICAL_URL,
  locale: 'en_US',
  logoUrl: '/android-chrome-512x512.png',
  ogImage: '/og-image.jpg',
  supportEmail: 'support@raffu.com',
  socialHandles: {
    twitter: '@raffufit',
    instagram: '@raffu.fit',
  },
  keywords: [
    'Raffu',
    'Raffu - Book Alteration Online',
    'Book Alteration Online',
    'raffu.com',
    'Raffu Own Your Fit',
    'Raffu official website',
    'alteration',
    'clothes alteration',
    'clothing alterations',
    'clothing alterations online',
    'alteration near me',
    'alteration shop near me',
    'tailor near me',
    'book alteration online',
    'tailoring studio',
    'suit alterations',
    'blazer fitting',
    'jeans hemming',
    'trouser shortening',
    'dress alterations',
    'pants hemming',
    'wedding dress alterations',
    'shirt alteration',
    'zipper replacement',
    'clothing repair',
    'invisible darning',
    'raffu darning service',
    'fit guarantee',
  ],
}

/** How a Raffu order works: booked online, altered and handed over in-studio. */
export const SERVICE_FLOW_STEPS = [
  {
    name: 'Book your alteration on raffu.com',
    text: 'Choose your garment and the alteration you need on raffu.com. Fixed prices are shown before you confirm the booking.',
  },
  {
    name: 'A nearby studio accepts your order',
    text: 'A verified partner tailor studio near you picks up and accepts your order, and you get the studio location and details.',
  },
  {
    name: 'Visit the studio',
    text: 'Travel to the partner studio with your garment. The tailor takes every measurement and pins the fit for you in person.',
  },
  {
    name: 'The tailor alters your garment',
    text: 'The tailor starts the alteration in the studio using professional sewing and pressing equipment. You can follow the order status online.',
  },
  {
    name: 'Collect it from the studio',
    text: 'The tailor hands the altered garment over to you at the studio. Try it on there; if anything needs a tweak, it is adjusted free under the Fit Guarantee.',
  },
]

/**
 * Complete metadata for an indexable page. Next.js replaces (not merges)
 * `openGraph` and `twitter` per page, so each page sends the full set here.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string
  description: string
  path: string
  /** For titles that already carry the brand and domain (the home page) */
  absoluteTitle?: boolean
}): Metadata {
  const url = path === '/' ? SITE_CONFIG.url : `${SITE_CONFIG.url}${path}`
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_CONFIG.brandName}`
  const image = {
    url: SITE_CONFIG.ogImage,
    width: 1200,
    height: 630,
    alt: 'Raffu - Own Your Fit: book clothing alterations at raffu.com',
  }

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type: 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      site: SITE_CONFIG.socialHandles.twitter,
      creator: SITE_CONFIG.socialHandles.twitter,
      images: [image.url],
    },
  }
}

/**
 * WebSite structured data for search engine discovery and sitelinks
 */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_CONFIG.url}/#website`,
    name: 'Raffu',
    alternateName: ['raffu.com'],
    url: `${SITE_CONFIG.url}/`,
    description: SITE_CONFIG.description,
    publisher: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    inLanguage: 'en-US',
  }
}

/**
 * Organization structured data representing Raffu and its service offerings
 */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.url}/#organization`,
    name: 'Raffu',
    legalName: 'Raffu Labs Ltd.',
    alternateName: ['raffu.com'],
    url: `${SITE_CONFIG.url}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.url}/android-chrome-512x512.png`,
      width: 512,
      height: 512,
      caption: 'Raffu',
    },
    slogan: SITE_CONFIG.tagline,
    description: SITE_CONFIG.description,
    disambiguatingDescription:
      'Raffu (raffu.com) is the premier online platform for booking clothing alterations and repairs with local partner tailoring studios. While "raffu" historically denotes the traditional craft of invisible darning, raffu.com is the official digital booking platform for precision alterations and tailoring.',
    email: SITE_CONFIG.supportEmail,
    sameAs: [
      'https://twitter.com/raffufit',
      'https://www.instagram.com/raffu.fit',
      'https://www.linkedin.com/company/raffu',
    ],
    knowsAbout: [
      'Clothing Alterations',
      'Suit Tailoring & Fitting',
      'Jeans Hemming',
      'Dress Adjustments',
      'Invisible Darning',
      'Zipper Replacement',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: SITE_CONFIG.supportEmail,
        contactType: 'customer support',
        availableLanguage: ['English', 'Hindi'],
        areaServed: ['US', 'IN', 'GB'],
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Clothing Alteration & Tailoring Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Denim & Trouser Hemming',
            description:
              'Shorten trousers or preserve original distressed factory hems on designer jeans.',
            provider: { '@id': `${SITE_CONFIG.url}/#organization` },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Suit Jacket & Blazer Alterations',
            description:
              'Sleeve shortening, waist suppression, and collar adjustments by experienced tailors.',
            provider: { '@id': `${SITE_CONFIG.url}/#organization` },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Dress & Gown Alterations',
            description:
              'Bodice taking-in, strap adjustments, and hem lifting for formal and casual dresses.',
            provider: { '@id': `${SITE_CONFIG.url}/#organization` },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Shirt & Blouse Tailoring',
            description:
              'Sleeve shortening, body tapering, and back dart adjustments.',
            provider: { '@id': `${SITE_CONFIG.url}/#organization` },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Invisible Darning (Raffu)',
            description:
              'Thread-by-thread hand mending for fabric tears, moth holes, and denim blowouts.',
            provider: { '@id': `${SITE_CONFIG.url}/#organization` },
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Zippers & Hardware Repairs',
            description:
              'Zipper replacement, slider fixes, and pocket bag repairs.',
            provider: { '@id': `${SITE_CONFIG.url}/#organization` },
          },
        },
      ],
    },
  }
}

/**
 * Service catalog structured data
 */
export function buildServiceCatalogSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${SITE_CONFIG.url}/#services`,
    name: 'Clothing Alterations & Tailoring',
    serviceType: 'Clothing alteration',
    description: SITE_CONFIG.description,
    url: `${SITE_CONFIG.url}/`,
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${SITE_CONFIG.url}/`,
      name: 'Book online at raffu.com, then visit the partner studio for fitting and collection',
    },
    provider: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    areaServed: [
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'India' },
      { '@type': 'Country', name: 'United Kingdom' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Clothing Alteration Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Denim & Trouser Hemming',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Suit & Blazer Alterations',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Dress & Gown Alterations',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Shirt Tailoring',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Invisible Darning & Mending',
          },
        },
      ],
    },
  }
}

/**
 * LocalBusiness schema for an individual physical partner tailor studio
 */
export function buildPartnerStudioSchema(store: StoreOption | {
  id: string
  name: string
  address: string
  area: string
  postcode: string
  phone?: string
  coords?: { lat: number; lng: number }
  openingHours?: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    additionalType: 'https://en.wikipedia.org/wiki/Tailor',
    '@id': `${SITE_CONFIG.url}/book?store=${store.id}#studio`,
    name: store.name,
    parentOrganization: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.address,
      addressLocality: store.area,
      postalCode: store.postcode,
      addressCountry: 'US',
    },
    ...(store.coords && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: store.coords.lat,
        longitude: store.coords.lng,
      },
    }),
    ...(store.phone && { telephone: store.phone }),
    priceRange: '$$',
    url: `${SITE_CONFIG.url}/book?store=${store.id}`,
    ...(store.image && { image: store.image }),
  }
}

export function buildLocalBusinessSchema() {
  return buildServiceCatalogSchema()
}

/**
 * FAQPage schema populated directly from visible FAQs
 */
export function buildFAQSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}

/**
 * HowTo schema for the 4-step booking process
 */
export function buildHowToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Book a Clothing Alteration with Raffu',
    description:
      'Book online on raffu.com, a nearby partner studio accepts the order, you visit the studio, the tailor alters your garment, and hands it over to you at the studio.',
    step: SERVICE_FLOW_STEPS.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      url: `${SITE_CONFIG.url}/how-it-works#step-${index + 1}`,
    })),
  }
}

/**
 * Breadcrumb structured data
 */
export function buildBreadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.path}`,
    })),
  }
}

/**
 * Speakable schema for voice assistants and AI answer engines
 */
export function buildSpeakableSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_CONFIG.url}/#webpage`,
    name: 'Raffu - Book Alteration Online',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#faq-question-0', '#faq-answer-0'],
    },
    url: `${SITE_CONFIG.url}/`,
  }
}
