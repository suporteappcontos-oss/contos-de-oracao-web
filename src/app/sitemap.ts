import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://contosdeoracao.com.br';
  
  // Rotas públicas principais do site para indexação no Google
  const routes = [
    '',
    '/planos',
    '/faq',
    '/login',
    '/termos',
    '/privacidade',
    '/loja',
    '/materiais',
    '/material-catequese',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));
}
