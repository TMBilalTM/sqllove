export default {
  titleTemplate: '%s | SQLLove - Sevgilinizle Bağlantıda Kalın',
  defaultTitle: 'SQLLove - Sevgilinizle Gerçek Zamanlı Konum Paylaşımı',
  description: 'SQLLove ile sevgilinizle konumunuzu paylaşın, özel günlerinizi takip edin ve her an bağlantıda kalın.',
  canonical: 'https://sqllove.vercel.app',
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://sqllove.vercel.app',
    site_name: 'SQLLove',
    title: 'SQLLove - Sevgilinizle Her An Bağlantıda Kalın',
    description: 'SQLLove ile sevgilinizle konumunuzu paylaşın, özel günlerinizi takip edin ve her an bağlantıda kalın.',
    images: [
      {
        url: 'https://sqllove.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SQLLove - Sevgililer için konum paylaşım uygulaması',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    handle: '@sqlloveapp',
    site: '@sqlloveapp',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    {
      name: 'keywords',
      content: 'sevgili konum paylaşımı, ilişki takibi, çiftler için uygulama, özel günler takibi, sevgili takibi'
    },
    {
      name: 'application-name',
      content: 'SQLLove'
    },
    {
      name: 'apple-mobile-web-app-capable',
      content: 'yes'
    },
    {
      name: 'theme-color',
      content: '#ff6b6b'
    }
  ],
  additionalLinkTags: [
    {
      rel: 'icon',
      href: '/favicon.ico',
    },
    {
      rel: 'apple-touch-icon',
      href: '/icons/apple-touch-icon.png',
      sizes: '180x180'
    },
    {
      rel: 'manifest',
      href: '/manifest.json'
    }
  ],
};
