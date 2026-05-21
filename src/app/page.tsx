import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";

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
      <Navbar /> {/* sidebar fixa 220px no desktop */}

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

      {/* Conteúdo deslocado para direita da sidebar no desktop */}
      <div className="md:ml-[220px]">
        <Hero />
        <Footer />
      </div>
    </main>
  );
}

