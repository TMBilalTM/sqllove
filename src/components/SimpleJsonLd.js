import React from 'react';

export default function SimpleJsonLd() {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'SQLLove',
    url: 'https://sqllove.vercel.app',
    description: 'Sevgilinizle gerçek zamanlı konum paylaşımı ve ilişki takibi uygulaması'
  };
  
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SQLLove',
    url: 'https://sqllove.vercel.app',
    logo: 'https://sqllove.vercel.app/logo.png'
  };
  
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SQLLove',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'iOS, Android, Windows, macOS',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'TRY'
    }
  };
  
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
    </>
  );
}
