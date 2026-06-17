import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/watch/'], // Protege rotas internas de streaming e administrativas
    },
    sitemap: 'https://contosdeoracao.com.br/sitemap.xml',
  };
}
