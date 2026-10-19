export const SITE_CONFIG = {
  name: 'Raffu - Own Your Fit',
  shortName: 'Raffu',
  tagline: 'Own Your Fit',
  description:
    'Raffu connects you with verified local master tailors for precision clothes alterations, bespoke fittings, and clothing repairs with upfront fixed pricing and a 100% re-fit guarantee.',
  url: process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_CUSTOMER_SITE_URL || 'https://raffu.in',
  locale: 'en_IN',
  logoUrl: '/favicon-512x512.png',
  ogImage: '/og-image.jpg',
  supportEmail: 'support@raffu.in',
  supportPhone: '+91 800 555 RAFFU',
  socialHandles: {
    twitter: '@raffufit',
    instagram: '@raffu.fit',
  },
  keywords: [
    'Raffu',
    'Raffu Own Your Fit',
    'Own Your Fit',
    'clothes alteration',
    'doorstep tailor',
    'suit alterations',
    'dress alterations',
    'trouser hemming',
    'shirt fitting',
    'jeans alteration',
    'zipper replacement',
    'tailor near me',
    'clothing repair',
    'bespoke fitting',
    'master tailor network',
    'online tailor booking',
    'garment alterations',
    're-fit guarantee',
  ],
}

/**
 * Generate Schema.org WebSite JSON-LD
 */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    alternateName: ['Raffu', 'Raffu - Own Your Fit', 'Raffu Tailoring'],
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
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
 * Generate Schema.org Organization JSON-LD
 */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    legalName: 'Raffu Technologies Ltd.',
    alternateName: 'Raffu',
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/android-chrome-512x512.png`,
    slogan: 'Own Your Fit',
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.supportEmail,
    sameAs: [
      'https://twitter.com/raffufit',
      'https://www.instagram.com/raffu.fit',
      'https://www.linkedin.com/company/raffu',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE_CONFIG.supportPhone,
        contactType: 'customer support',
        availableLanguage: ['English', 'Hindi'],
        areaServed: ['IN', 'GB', 'US'],
      },
    ],
  }
}

/**
 * Generate Schema.org LocalBusiness / ProfessionalService JSON-LD
 */
export function buildLocalBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_CONFIG.url}/#localbusiness`,
    name: 'Raffu — The Neighborhood Alteration Network',
    alternateName: 'Raffu - Own Your Fit',
    url: SITE_CONFIG.url,
    image: `${SITE_CONFIG.url}/atelier_welcome_art.jpg`,
    priceRange: '₹₹ / ££',
    telephone: SITE_CONFIG.supportPhone,
    email: SITE_CONFIG.supportEmail,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressLocality: 'Mumbai',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '09:00',
        closes: '20:30',
      },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Tailoring & Alteration Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Trouser & Denim Hemming (Original Finish)',
            description: 'Factory-distressed chainstitch or blind-hem alteration with authentic original hem reattachment.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Suit Jacket & Blazer Alterations',
            description: 'Sleeve shortening, waist suppression, and collar re-pitching by master tailors.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Dress & Evening Gown Tapering',
            description: 'Bodice fitting, strap adjustment, and precision delicate hem alterations.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Shirt & Blouse Slimming',
            description: 'Side seam tapering, dart additions, and sleeve shortening.',
          },
        },
      ],
    },
  }
}

/**
 * Generate Schema.org FAQPage JSON-LD
 */
export function buildFAQSchema() {
  const faqs = [
    {
      q: 'Do I need to take measurements or pre-fit my clothes before booking on Raffu?',
      a: 'Not at all. You never need to measure, pin, or pre-fit anything yourself. Simply select your garment and service, and hand your clothes directly to your assigned master tailor, who handles all precision measurements and fitting in person.',
    },
    {
      q: 'What is the Raffu 100% Fit Guarantee?',
      a: 'Every single booking is protected by our 100% Fit Guarantee. Try on your altered garment upon pickup or delivery. If any minor tweak is needed, your partner atelier alters it complimentary within 24 hours.',
    },
    {
      q: 'How does Raffu preserve original hems on denim and designer jeans?',
      a: 'Our partner studios use precision original-hem preservation. The factory-washed distress and chainstitch hem is carefully detached, the leg shortened to your target inseam, and re-attached invisibly so original fading remains intact.',
    },
    {
      q: 'How are Raffu partner tailor studios audited and verified?',
      a: 'Every partner atelier undergoes an in-person equipment and skill audit before joining our network. We check industrial machine calibrations—including blind-stitch, chainstitch, multi-thread overlock, and steam press systems.',
    },
    {
      q: 'What are the turnaround times for clothing alterations on Raffu?',
      a: 'Standard alterations are completed within 48 to 72 hours. Express same-day or next-day turnaround options are also available across select partner ateliers.',
    },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
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
 * Generate Schema.org HowTo JSON-LD
 */
export function buildHowToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Book Precision Tailoring & Clothes Alterations with Raffu',
    description: 'A simple 4-step process to get master tailor alterations with doorstep fitting and guaranteed results.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select Garment & Alteration Type',
        text: 'Choose your garment category (trousers, suit, shirt, dress, jacket) and the specific alteration you require. View transparent, standardized fixed pricing upfront.',
        url: `${SITE_CONFIG.url}/#request-alteration`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Book Tailor Fitting or Doorstep Pickup',
        text: 'Select your preferred time slot for doorstep tailor collection or visit a verified neighborhood partner atelier.',
        url: `${SITE_CONFIG.url}/how-it-works`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Master Tailor Precision Crafting',
        text: 'Your clothes are tailored by verified master artisans using industrial machinery, OEM color-matched threads, and authentic factory hem preservation.',
        url: `${SITE_CONFIG.url}/how-it-works`,
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Try On & 100% Fit Guarantee',
        text: 'Receive your altered garments. Try them on with peace of mind backed by our complimentary 24-hour re-fit guarantee.',
        url: `${SITE_CONFIG.url}/how-it-works`,
      },
    ],
  }
}

/**
 * Generate Schema.org BreadcrumbList JSON-LD
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
