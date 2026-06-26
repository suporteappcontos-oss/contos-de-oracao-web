import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/watch/'], // Evita expor caminhos administrativos publicamente, mantendo o bloqueio apenas para streaming interno
    },
    sitemap: 'https://contosdeoracao.com.br/sitemap.xml',
  };
}
