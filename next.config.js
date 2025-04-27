/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // ESLint checking during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Add favicon.ico to the root for favicon auto-discovery
  webpack(config) {
    return config;
  },
  // Show error page for missing favicon.ico
  async headers() {
    return [
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, must-revalidate',
          },
        ],
      },
    ];
  },
}

module.exports = nextConfig
