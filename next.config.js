/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Webpack konfigürasyonu (output klasörü ayarları için)
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // PWA için dosya kopyalama ayarları burada yapılabilir
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/service-worker.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
  // PWA için ikon dosyalarının public klasörüne kopyalanmasını sağlayan ayarlar
  // (Bu işlem için normalde ayrı bir script yazılabilir)
}

module.exports = nextConfig
