import type { Metadata, Viewport } from "next";
import "./globals.css";
import GlobalLoader from "@/components/GlobalLoader";
import AuthHashHandler from "@/components/AuthHashHandler";

export const metadata: Metadata = {
  title: {
    default: 'Contos de Oração — Streaming Católico',
    template: '%s | Contos de Oração',
  },
  description: 'A maior plataforma de streaming católico do Brasil. Assista orações, novenas, terços, histórias de santos e retiros espirituais onde quiser, quando quiser.',
  keywords: ['orações', 'novenas', 'católico', 'streaming', 'retiro espiritual', 'terço', 'santos', 'fé', 'contos de oração'],
  authors: [{ name: 'Contos de Oração' }],
  creator: 'Contos de Oração',
  metadataBase: new URL('https://contosdeoracao.com.br'),
  alternates: { canonical: '/' },
  manifest: '/manifest.json',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: {
    icon: '/logo_stripe.png',
    apple: '/logo_stripe.png',
    shortcut: '/logo_stripe.png',
  },
  openGraph: {
    title: 'Contos de Oração — Streaming Católico',
    description: 'Orações, novenas, terços e histórias de santos. A maior plataforma de espiritualidade católica do Brasil.',
    url: 'https://contosdeoracao.com.br',
    siteName: 'Contos de Oração',
    images: [{ url: '/logo_stripe.png', width: 512, height: 512, alt: 'Contos de Oração' }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contos de Oração — Streaming Católico',
    description: 'Orações, novenas e histórias de santos. Assista onde quiser.',
    images: ['/logo_stripe.png'],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#090B10",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="pt-BR" className="antialiased overflow-x-hidden">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://contosdeoracao.com.br/#organization",
                  "name": "Contos de Oração",
                  "url": "https://contosdeoracao.com.br",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://contosdeoracao.com.br/logo_stripe.png"
                  }
                },
                {
                  "@type": "WebSite",
                  "@id": "https://contosdeoracao.com.br/#website",
                  "url": "https://contosdeoracao.com.br",
                  "name": "Contos de Oração",
                  "publisher": {
                    "@id": "https://contosdeoracao.com.br/#organization"
                  },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://contosdeoracao.com.br/?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col scroll-smooth relative overflow-x-hidden" style={{ background: '#090B10' }}>
        <GlobalLoader />
        <AuthHashHandler />
        {children}
      </body>
    </html>
  );
}
