/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/index.html',
      },
    ];
  },
};

export default nextConfig;
