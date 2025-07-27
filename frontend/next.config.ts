const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_BASE_URL}/api/:path*`
      }
    ];
  },
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
