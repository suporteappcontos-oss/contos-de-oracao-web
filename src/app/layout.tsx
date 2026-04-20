import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contos de Oração - Streaming",
  description: "Filmes, séries e muito mais. Assista onde quiser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} antialiased class`}
    >
      <body className="min-h-full flex flex-col scroll-smooth">{children}</body>
    </html>
  );
}
