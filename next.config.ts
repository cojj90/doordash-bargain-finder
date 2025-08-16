import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.cdn4dd.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'doordash-static.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);