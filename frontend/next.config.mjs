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
      // raffu.com is the only canonical domain; consolidate any raffu.in traffic onto it
      ...['raffu.in', 'www.raffu.in'].map((host) => ({
        source: '/:path*',
        has: [{ type: 'host', value: host }],
        destination: 'https://raffu.com/:path*',
        permanent: true,
      })),
      {
        source: '/support',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/support/:path*',
        destination: '/contact',
        permanent: true,
      },
      {
        source: '/order',
        destination: '/orders',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
