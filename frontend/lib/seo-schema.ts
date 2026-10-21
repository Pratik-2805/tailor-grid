export const SITE_CONFIG = {
  name: 'Raffu — Own Your Fit',
  shortName: 'Raffu',
  brandName: 'raffu.com',
  tagline: 'Own Your Fit',
  description:
    'Raffu (raffu.com) connects you with certified neighborhood master tailor studios for precision garment alterations, suit refitting, jeans hemming with original finish preservation, and authentic darning with transparent upfront pricing and a 100% Fit Guarantee.',
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
    'Raffu Own Your Fit',
    'clothes alteration',
    'clothing alteration near me',
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
 * Generate Schema.org WebSite JSON-LD
 */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    alternateName: [
      'Raffu',
      'raffu.com',
      'Raffu - Own Your Fit',
      'Raffu Alteration Network',
      'Raffu Tailoring',
    ],
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
 * Generate Schema.org Organization JSON-LD with Entity Graph for GEO
 */
export function buildOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_CONFIG.url}/#organization`,
    name: 'Raffu',
    legalName: 'Raffu Labs Ltd.',
    alternateName: ['Raffu', 'raffu.com', 'Raffu Tailoring Network'],
    url: SITE_CONFIG.url,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.url}/android-chrome-512x512.png`,
      width: 512,
      height: 512,
      caption: 'Raffu - Own Your Fit',
    },
    slogan: 'Own Your Fit',
    description:
      'Raffu is an online-to-atelier clothing alteration and tailoring network connecting clients with certified local master tailor studios for precision garment adjustments, repairs, and bespoke refitting.',
    email: SITE_CONFIG.supportEmail,
    sameAs: [
      'https://twitter.com/raffufit',
      'https://www.instagram.com/raffu.fit',
      'https://www.linkedin.com/company/raffu',
    ],
    knowsAbout: [
      'Clothing Alterations',
      'Bespoke Tailoring',
      'Suit Jacket & Trouser Fitting',
      'Jeans Original Hem Chainstitch Preservation',
      'Dress Bodice & Hem Alterations',
      'Authentic Raffu Darning & Fabric Reweaving',
      'Garment Restyling & Repair',
      'Industrial Tailoring Workshop Standards',
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
    name: 'Raffu — Master Alteration & Tailoring Studio Network',
    alternateName: ['Raffu', 'raffu.com', 'Raffu - Own Your Fit'],
    url: SITE_CONFIG.url,
    image: `${SITE_CONFIG.url}/og-image.jpg`,
    priceRange: '₹₹ / $$ / ££',
    telephone: SITE_CONFIG.supportPhone,
    email: SITE_CONFIG.supportEmail,
    currenciesAccepted: 'INR, USD, GBP',
    paymentAccepted: 'Cash, Credit Card, Debit Card, UPI, Apple Pay, Google Pay',
    description:
      'Certified master tailor studios for precision garment alterations, suit restructuring, denim original-hem chainstitch preservation, dress adjustments, and artisanal darning with 100% Fit Guarantee.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'IN',
      addressLocality: 'Mumbai',
    },
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'Country', name: 'United States' },
    ],
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
      name: 'Precision Tailoring & Alteration Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Denim & Trouser Hemming (Original Finish Preservation)',
            description:
              'Factory-distressed chainstitch or blind-hem alteration. The original stone-washed hem is preserved and invisibly reattached to match factory aesthetic.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Suit Jacket & Blazer Alterations',
            description:
              'Sleeve shortening from cuff or shoulder, waist suppression, back collar roll correction, and chest tapering by veteran artisans.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Dress & Evening Gown Tapering',
            description:
              'Bodice fitting, strap adjustment, side seam contouring, and delicate silk/chiffon hem lifting.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Shirt & Blouse Tailoring',
            description:
              'Torso side seam slimming, sleeve shortening with placket repositioning, and tailored back darts.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Authentic Raffu Darning & Invisible Garment Mending',
            description:
              'Thread-by-thread artisan reweaving for fabric tears, moth holes, and denim blowouts using matching warp and weft fibers.',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Hardware Replacement & Restyling',
            description:
              'Heavy-duty YKK zipper replacement, slider fix, pocket bag renewal, and full jacket lining restoration.',
          },
        },
      ],
    },
  }
}

/**
 * Generate Schema.org FAQPage JSON-LD optimized for Generative Search (Perplexity, ChatGPT, Gemini, Google AI Overviews)
 */
export function buildFAQSchema() {
  const faqs = [
    {
      q: 'What is Raffu (raffu.com)?',
      a: 'Raffu (raffu.com) is an online-to-atelier clothing alteration and tailoring network that connects customers with verified local master tailor studios. Raffu provides transparent fixed menu pricing, factory-grade craftsmanship (such as original denim hem preservation, suit refitting, and authentic darning), and a 100% Fit Guarantee.',
    },
    {
      q: 'Is Raffu a doorstep tailoring service?',
      a: 'No. Raffu is not a doorstep tailoring service where a tailor sews on a living room couch. Professional garment alteration requires heavy industrial machinery—including OEM blindstitch machines, high-tension chainstitch units, 4-thread overlockers, and vacuum steam presses—which can only operate inside fully equipped studios. Customers can either visit their verified neighborhood partner atelier for an in-person master fitting or book secure courier garment collection and return.',
    },
    {
      q: 'Do I need to take measurements or pin my own clothes before booking on Raffu?',
      a: 'No, you never need to measure, pin, or guess your sizes. Simply select your garment and alteration type on raffu.com with clear upfront pricing. When you visit the certified partner atelier, the master tailor measures and chalks your garment in person. Alternatively, you can include a sample garment that fits you perfectly, and the studio will replicate its exact measurements.',
    },
    {
      q: 'How does Raffu preserve original hems on designer jeans and denim?',
      a: 'Our partner studios use authentic original-hem reattachment. The factory-washed distress, fading, and chainstitching are carefully detached, the denim leg is shortened to your exact inseam break, and the original hem is re-attached seamlessly with matching thread tension so your jeans look untouched.',
    },
    {
      q: 'What suit jacket and blazer alterations does Raffu handle?',
      a: 'Our certified master tailors perform sleeve shortening (both from the cuff and from the shoulder for working surgeon cuffs), waist suppression for a contoured silhouette, chest tapering, shoulder pad reduction, and collar-roll removal.',
    },
    {
      q: 'What is authentic Raffu (darning / invisible mending)?',
      a: 'Raffu (traditional rafugari) is the delicate art of invisible mending and thread-by-thread darning. Master artisans extract identical warp and weft threads from unexposed inner seams of the garment and weave them into tears, moth holes, or worn denim crotch blowouts, restoring the fabric weave without ugly visible patches.',
    },
    {
      q: 'What is the Raffu 100% Fit Guarantee?',
      a: 'Every single booking on raffu.com is backed by our 100% Fit Guarantee. When you pick up your garment, you try it on in the private studio fitting room. If any minor tweak or adjustment is required, the partner atelier refines it complimentary within 24 to 48 hours.',
    },
    {
      q: 'How does pricing work on Raffu?',
      a: 'All prices on raffu.com are standardized, fixed, and published upfront before you book. Unlike unorganized roadside tailoring where prices fluctuate unpredictably, Raffu offers clear menu pricing with zero hidden surcharges or surprise studio markups.',
    },
    {
      q: 'What are the turnaround times for clothing alterations on Raffu?',
      a: 'Standard alterations are finished within 48 to 72 hours. Same-day and next-day express turnaround options are also available across participating partner studios.',
    },
    {
      q: 'How are Raffu partner tailor studios audited and certified?',
      a: 'Every partner atelier undergoes an in-person craft and equipment audit before joining our network. We inspect machine calibrations (blindstitch, heavy-denim chainstitch, multi-thread overlockers), steam pressing systems, and artisan tailoring experience.',
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
 * Generate Schema.org HowTo JSON-LD (Zero doorstep mentions; real atelier workflow)
 */
export function buildHowToSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Get Professional Clothes Alterations with Raffu (raffu.com)',
    description:
      'A simple 4-step process to get verified master tailor alterations with transparent fixed pricing and guaranteed fit.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Select Garment & Alteration Type',
        text: 'Choose your garment (jeans, trousers, suits, shirts, dresses, or outerwear) and the required alteration on raffu.com. See transparent, fixed menu pricing upfront before confirming.',
        url: `${SITE_CONFIG.url}/book`,
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Studio Intake & Precision Fitting',
        text: 'Drop off your garment at your verified neighborhood master atelier for an in-person tailor chalk fitting, or schedule a secure garment courier collection.',
        url: `${SITE_CONFIG.url}/how-it-works`,
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Master Artisan Benchcraft',
        text: 'Your clothes are tailored by vetted artisans using calibrated industrial machinery, color-matched OEM threads, and factory hem preservation techniques.',
        url: `${SITE_CONFIG.url}/how-it-works`,
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Try On with 100% Fit Guarantee',
        text: 'Try on your freshly pressed garments. Enjoy peace of mind with our complimentary 24–48 hour re-fit guarantee if any micro-tweak is needed.',
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

