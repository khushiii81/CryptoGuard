import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/simulator', '/policies', '/logs', '/docs'],
        disallow: ['/*?*', '/api/'],
      },
    ],
    sitemap: 'https://cryptoguard.vercel.app/sitemap.xml',
    host: 'https://cryptoguard.vercel.app',
  };
}
