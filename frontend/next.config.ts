import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn1.ozone.ru',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
