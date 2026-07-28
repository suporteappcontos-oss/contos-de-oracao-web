import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import GlobalLoader from "@/components/GlobalLoader";
import AuthHashHandler from "@/components/AuthHashHandler";
import Navbar from "@/components/Navbar";
import { PostHogProvider } from "@/components/PostHogProvider";

export const metadata: Metadata = {
  title: {
    default: 'Contos de Oração Club — Streaming Católico',
    template: '%s | Contos de Oração Club',
  },
  description: 'A maior plataforma de streaming católico do Brasil. Assista orações, novenas, terços, histórias de santos e retiros espirituais onde quiser, quando quiser.',
  keywords: ['orações', 'novenas', 'católico', 'streaming', 'retiro espiritual', 'terço', 'santos', 'fé', 'contos de oração'],
  authors: [{ name: 'Contos de Oração Club' }],
  creator: 'Contos de Oração Club',
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
    title: 'Contos de Oração Club — Streaming Católico',
    description: 'Orações, novenas, terços e histórias de santos. A maior plataforma de espiritualidade católica do Brasil.',
    url: 'https://contosdeoracao.com.br',
    siteName: 'Contos de Oração Club',
    images: [{ url: '/logo_stripe.png', width: 512, height: 512, alt: 'Contos de Oração Club' }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contos de Oração Club — Streaming Católico',
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
                  "name": "Contos de Oração Club",
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
                  "name": "Contos de Oração Club",
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
        <PostHogProvider>
          <GlobalLoader />
          <AuthHashHandler />
          <Navbar />
          {children}
        </PostHogProvider>

        {/* Suporte Automático para Google Ads / Google Analytics (GTag) */}
        {process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics-ads" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}');
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
