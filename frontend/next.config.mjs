/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.raffu.com',
          },
        ],
        destination: 'https://raffu.com/:path*',
        permanent: true,
      },
      {
        source: '/support',
        destination: '/contact',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
