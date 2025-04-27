import NextPWA from 'next-pwa';

const withPWA = NextPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        // Tüm /api isteklerini kibrisquiz.com'a yönlendir
        source: '/api/:path*',
        destination: 'https://kibrisquiz.com/api/:path*'
      }
    ];
  }
};

export default withPWA(nextConfig);
