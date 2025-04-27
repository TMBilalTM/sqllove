import React from 'react';
import { useRouter } from 'next/router';

export default function JsonLd({ type, data = {} }) {
  const router = useRouter();
  const baseUrl = 'https://sqllove.vercel.app';
  const currentUrl = `${baseUrl}${router.asPath}`;
  
  // Define the schema data based on the type
  let schemaData = {};
  
  switch(type) {
    case 'website':
      schemaData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'SQLLove',
        alternateName: 'SQL Love',
        url: 'https://sqllove.vercel.app',
        description: 'Sevgilinizle gerçek zamanlı konum paylaşımı ve ilişki takibi uygulaması',
        ...data
      };
      break;
      
    case 'softwareApplication':
      schemaData = {
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
      };
      break;
      
    case 'organization':
      schemaData = {
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
      };
      break;
      
    case 'breadcrumb':
      schemaData = {
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
        ]
      };
      break;
      
    default:
      schemaData = {};
      break;
  }
  
  // Important: Convert schema object to JSON string
  const schemaString = JSON.stringify(schemaData);
  
  // Return a valid React element
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: schemaString }}
    />
  );
}
