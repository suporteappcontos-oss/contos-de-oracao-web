import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contos de Oração – Streaming Católico",
  description: "A plataforma de streaming de orações, novenas e retiros espirituais. Assista onde quiser.",
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Contos de Oração",
    description: "A plataforma de streaming de orações, novenas e retiros espirituais.",
    images: "/logo.png",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="antialiased">
      <body className="min-h-full flex flex-col scroll-smooth" style={{ background: '#090B10' }}>
        {children}
      </body>
    </html>
  );
}
