export const revalidate = 0;

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";
import Pricing from "@/components/Pricing";
import Footer from "@/components/Footer";

type Props = {
  searchParams: Promise<{ acesso?: string }>
}

export default async function Home({ searchParams }: Props) {
  const { acesso } = await searchParams

  const movieImages = [
    'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1600289031464-74d374b64991?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1460881680858-30d872d5b530?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&h=280&fit=crop'
  ];
  
  const trendingImages = [
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1572177259160-0a37ff1e9bb1?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1627873649417-c67f701f1949?w=500&h=280&fit=crop',
    'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=500&h=280&fit=crop'
  ];

  return (
    <main>
      <Navbar />

      {/* Banner de acesso expirado — aparece quando assinante é redirecionado do /watch */}
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
            href="/#planos"
            className="shrink-0 px-4 py-1.5 rounded-lg font-bold text-xs transition-all hover:brightness-110"
            style={{ background: '#D4AF37', color: '#090B10' }}
          >
            Renovar agora →
          </a>
        </div>
      )}

      <Hero />
      <div className={`relative z-10 mt-[-80px] ${acesso === 'expirado' ? 'pt-12' : ''}`}>
        <Carousel title="Lançamentos" images={movieImages} />
        <Carousel title="Em Alta" images={trendingImages} />
      </div>
      <Pricing />
      <Footer />
    </main>
  );
}

