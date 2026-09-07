import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/account'],
      },
    ],
    sitemap: 'https://bizzarefragrances.shop/sitemap.xml',
    host: 'https://bizzarefragrances.shop',
  };
}