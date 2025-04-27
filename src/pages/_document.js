import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="tr">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="application-name" content="SQLLove" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SQLLove" />
        <meta name="description" content="Sevgilinizle konum paylaşımı ve özel anlar" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ff6b6b" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#ff6b6b" />

        {/* Discord Embed Optimizasyonu */}
        <meta property="og:site_name" content="SQLLove" />
        <meta property="og:url" content="https://sqllove.vercel.app" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="SQLLove - Sevgilinizle Her An Bağlantıda Kalın" />
        <meta property="og:description" content="Sevgilinizle konumunuzu paylaşın, özel anlarınızı takip edin ve her an bağlantıda kalın." />
        <meta property="og:image" content="https://sqllove.vercel.app/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="SQLLove - Sevgililer için konum paylaşım uygulaması" />

        {/* Twitter Embed Optimizasyonu */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@sqlloveapp" />
        <meta name="twitter:creator" content="@sqlloveapp" />
        <meta name="twitter:title" content="SQLLove - Sevgilinizle Her An Bağlantıda Kalın" />
        <meta name="twitter:description" content="Sevgilinizle konumunuzu paylaşın, özel anlarınızı takip edin ve her an bağlantıda kalın." />
        <meta name="twitter:image" content="https://sqllove.vercel.app/og-image.png" />
        <meta name="twitter:image:alt" content="SQLLove - Sevgililer için konum paylaşım uygulaması" />

        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-touch-icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon-167x167.png" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#ff6b6b" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
