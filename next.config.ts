import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Trigger rebuild
  async redirects() {
    return [
      {
        source: '/infrastructure',
        destination: '/node',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
