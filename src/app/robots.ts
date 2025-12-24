import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/private/'], // Disallow API routes or private pages
    },
    sitemap: 'https://prokit.uk/sitemap.xml',
  };
}
