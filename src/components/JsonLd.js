import { useRouter } from 'next/router';

export default function JsonLd({ type, data = {} }) {
  const router = useRouter();
  const baseUrl = 'https://sqllove.vercel.app';
  const currentUrl = `${baseUrl}${router.asPath}`;
  
  const schemas = {
    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'SQLLove',
      alternateName: 'SQL Love',
      url: 'https://sqllove.vercel.app',
      description: 'Sevgilinizle gerçek zamanlı konum paylaşımı ve ilişki takibi uygulaması',
      ...data
    },
    softwareApplication: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'SQLLove',
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'iOS, Android, Windows, macOS',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'TRY'
      },
      ...data
    },
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'SQLLove',
      url: 'https://sqllove.vercel.app',
      logo: 'https://sqllove.vercel.app/logo.png',
      sameAs: [
        'https://twitter.com/sqlloveapp',
        'https://www.instagram.com/sqlloveapp',
        'https://www.facebook.com/sqlloveapp'
      ],
      ...data
    },
    breadcrumb: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Ana Sayfa',
          item: 'https://sqllove.vercel.app/'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: data.pageName || 'Sayfa',
          item: currentUrl
        }
      ],
      ...data
    }
  };
  
  const schemaData = schemas[type] || {};
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
