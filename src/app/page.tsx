import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";
import LandingPage from "@/components/LandingPage";

export const metadata = {
  title: 'Contos de Oração — Catequese Digital para Crianças',
  description: 'Universo católico para crianças de forma divertida e encantadora. Vídeos, jogos, HQs, atividades, apostilas e conteúdos exclusivos para ensinar a fé católica.',
};

type Props = {
  searchParams: Promise<{ acesso?: string }>
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({ searchParams }: Props) {
  const { acesso } = await searchParams;

  return (
    <main>
      <DynamicBackground />
      <Navbar />

      {/* Banner de acesso expirado */}
      {acesso === 'expirado' && (
        <div
          className="fixed top-0 left-0 right-0 z-[999] flex items-center justify-between gap-4 px-5 py-3.5 text-sm font-semibold"
          style={{
            background: 'linear-gradient(90deg, #7c1d1d, #991b1b)',
            borderBottom: '1px solid rgba(239,68,68,0.4)',
            fontFamily: 'Outfit, sans-serif',
          }}
        >
          <div className="flex items-center gap-2 text-white">
            <span>🔒</span>
            <span>Seu acesso expirou ou foi cancelado. Para continuar assistindo, renove sua assinatura.</span>
          </div>
          <a
            href="/planos"
            className="shrink-0 px-4 py-1.5 rounded-lg font-bold text-xs transition-all hover:brightness-110"
            style={{ background: '#D4AF37', color: '#090B10' }}
          >
            Renovar agora →
          </a>
        </div>
      )}

      {/* Nova landing page inspirada na imagem de referência */}
      <LandingPage />
      <Footer />
    </main>
  );
}
