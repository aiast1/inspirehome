import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://inspirehome.gr';
const SITE_NAME = 'InspireHome';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_DESCRIPTION = 'Ανακαλύψτε μοναδικά έπιπλα και διακοσμητικά στο InspireHome. Καναπέδες, πολυθρόνες, τραπέζια, φωτιστικά και αξεσουάρ για κάθε χώρο του σπιτιού σας.';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
  jsonLd?: Record<string, any> | Record<string, any>[];
}

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Έπιπλα & Διακόσμηση Σπιτιού`;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;

  const jsonLdArray = jsonLd
    ? Array.isArray(jsonLd) ? jsonLd : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="el_GR" />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {jsonLdArray.map((ld, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(ld)}
        </script>
      ))}
    </Helmet>
  );
}

// ─── JSON-LD Schema Helpers ──────────────────────────────────────

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    name: 'InspireHome',
    alternateName: 'InspireHome Καμπλατζής',
    description: 'Κατάστημα επίπλων και διακόσμησης σπιτιού στη Θεσσαλονίκη. Καναπέδες, πολυθρόνες, τραπέζια, κρεβάτια, φωτιστικά και διακοσμητικά.',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    image: DEFAULT_IMAGE,
    telephone: '+30 2310 000 000',
    email: 'info@inspirehome.gr',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Εθνικής Αμύνης 15',
      addressLocality: 'Θεσσαλονίκη',
      postalCode: '54621',
      addressRegion: 'Κεντρική Μακεδονία',
      addressCountry: 'GR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.6401,
      longitude: 22.9444,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '18:00',
      },
    ],
    priceRange: '€€',
    currenciesAccepted: 'EUR',
    paymentAccepted: 'Cash, Credit Card, Bank Transfer',
    sameAs: [
      'https://www.facebook.com/inspire.home.kaplantzis/',
    ],
  };
}

export function breadcrumbSchema(items: { name: string; url?: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url ? { item: `${SITE_URL}${item.url}` } : {}),
    })),
  };
}

export function productSchema(product: {
  title: string;
  slug: string;
  description?: string;
  price: number;
  salePrice?: number;
  images: string[];
  inStock: boolean;
  categories?: string[];
  color?: string;
  material?: string;
  dimensions?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.title,
    url: `${SITE_URL}/product/${product.slug}`,
    image: product.images.length > 0 ? product.images : undefined,
    brand: {
      '@type': 'Brand',
      name: 'InspireHome',
    },
    ...(product.color ? { color: product.color } : {}),
    ...(product.material ? { material: product.material } : {}),
    ...(product.dimensions ? {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'Dimensions',
        value: product.dimensions,
      }
    } : {}),
    category: product.categories?.[0]?.split('>')[0]?.trim(),
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: 'EUR',
      price: (product.salePrice || product.price).toFixed(2),
      ...(product.salePrice && product.salePrice < product.price ? {
        priceValidUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      } : {}),
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'InspireHome',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'GR',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' },
        },
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'EUR',
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'GR',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
      },
    },
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function searchActionSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function collectionPageSchema(name: string, url: string, description: string, productCount: number) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    url: `${SITE_URL}${url}`,
    description,
    numberOfItems: productCount,
    provider: {
      '@type': 'Organization',
      name: 'InspireHome',
    },
  };
}
