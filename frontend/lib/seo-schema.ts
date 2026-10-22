import { FAQS, type StoreOption } from '@/components/data'

export const SITE_CONFIG = {
  name: 'Raffu',
  shortName: 'Raffu',
  brandName: 'raffu.com',
  tagline: 'Clothing Alterations & Tailoring Studios',
  description:
    'Find verified tailoring and alteration studios with transparent pricing. Explore trouser and denim hemming, suit alterations, and clothing repairs with Raffu.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://raffu.com',
  locale: 'en_IN',
  logoUrl: '/favicon-512x512.png',
  ogImage: '/og-image.jpg',
  supportEmail: 'support@raffu.com',
  supportPhone: '+1 (800) 555-RAFFU',
  socialHandles: {
    twitter: '@raffufit',
    instagram: '@raffu.fit',
  },
  keywords: [
    'Raffu',
    'raffu.com',
    'clothing alterations',
    'tailor near me',
    'suit alterations',
    'blazer fitting',
    'jeans hemming original hem',
    'denim chainstitch hemming',
    'trouser shortening',
    'dress alterations',
    'gown fitting',
    'shirt slimming darts',
    'zipper replacement',
    'tailor near me',
    'master tailor studio',
    'clothing repair',
    'invisible darning',
    'raffu darning service',
    'garment refitting',
    'bespoke alteration network',
    'atelier tailoring',
    '100% fit guarantee',
  ],
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
    alternateName: ['raffu.com', 'Raffu Studios'],
    url: `${SITE_CONFIG.url}/`,
    description: SITE_CONFIG.description,
    publisher: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    inLanguage: 'en-IN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_CONFIG.url}/book?service={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
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
    slogan: 'Own Your Fit',
    description: SITE_CONFIG.description,
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
        telephone: SITE_CONFIG.supportPhone,
        contactType: 'customer support',
        availableLanguage: ['English', 'Hindi'],
        areaServed: ['IN', 'US', 'GB'],
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Raffu Alteration & Tailoring Services',
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
    description: SITE_CONFIG.description,
    provider: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'Country', name: 'United States' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Raffu Alteration Services',
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
    '@type': 'TailorStore',
    '@id': `${SITE_CONFIG.url}/partner/${store.id}#studio`,
    name: store.name,
    parentOrganization: {
      '@id': `${SITE_CONFIG.url}/#organization`,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.address,
      addressLocality: store.area,
      postalCode: store.postcode,
      addressCountry: 'IN',
    },
    ...(store.coords && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: store.coords.lat,
        longitude: store.coords.lng,
      },
    }),
    telephone: store.phone || SITE_CONFIG.supportPhone,
    priceRange: '₹₹',
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
    name: 'How to Book Clothing Alterations with Raffu',
    description:
      'A simple 4-step process to get professional clothing alterations with upfront pricing and guaranteed fit.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select Garment & Service',
        text: 'Choose your garment and alteration type on raffu.com to see fixed upfront pricing.',
        url: `${SITE_CONFIG.url}/book`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Studio Fitting or Pickup',
        text: 'Visit a nearby partner studio for an in-person fitting, or schedule a courier pickup.',
        url: `${SITE_CONFIG.url}/how-it-works`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Tailoring & Alteration',
        text: 'Your clothes are altered by experienced tailors using professional sewing and pressing equipment.',
        url: `${SITE_CONFIG.url}/how-it-works`,
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Try On with Fit Guarantee',
        text: 'Try on your freshly altered clothes. If any adjustment is needed, the studio refines it for free.',
        url: `${SITE_CONFIG.url}/how-it-works`,
      },
    ],
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
