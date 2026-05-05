import type { Metadata } from "next";
import "./globals.css";
import GlobalLoader from "@/components/GlobalLoader";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: {
    default: 'Contos de Oração — Streaming Católico',
    template: '%s | Contos de Oração',
  },
  description: 'A maior plataforma de streaming católico do Brasil. Assista orações, novenas, terços, histórias de santos e retiros espirituais onde quiser, quando quiser.',
  keywords: ['orações', 'novenas', 'católico', 'streaming', 'retiro espiritual', 'terço', 'santos', 'fé', 'contos de oração'],
  authors: [{ name: 'Contos de Oração' }],
  creator: 'Contos de Oração',
  metadataBase: new URL('https://www.contosdeoracao.com.br'),
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  icons: {
    icon: '/logo_stripe.png',
    apple: '/logo_stripe.png',
    shortcut: '/logo_stripe.png',
  },
  openGraph: {
    title: 'Contos de Oração — Streaming Católico',
    description: 'Orações, novenas, terços e histórias de santos. A maior plataforma de espiritualidade católica do Brasil.',
    url: 'https://www.contosdeoracao.com.br',
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


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let backgroundUrl = '';
  try {
    const res = await fetch('https://contos-apks.b-cdn.net/config.json', { next: { revalidate: 60 } });
    if (res.ok) {
      const config = await res.json();
      backgroundUrl = config.background_url || '';
    }
  } catch (e) {
    console.error('Erro ao buscar configuração global:', e);
  }

  return (
    <html lang="pt-BR" className="antialiased">
      <body className="min-h-full flex flex-col scroll-smooth relative" style={{ background: '#090B10' }}>
        {/* Fundo dinâmico global configurado no Admin */}
        {backgroundUrl && (
          <div 
            className="fixed inset-0 z-[-1] opacity-20 pointer-events-none" 
            style={{ 
              backgroundImage: `url(${backgroundUrl})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }} 
          />
        )}
        <GlobalLoader />
        {children}
        <WhatsAppButton />
      </body>
    </html>
  );
}
