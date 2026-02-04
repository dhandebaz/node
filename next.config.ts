import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
