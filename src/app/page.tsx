import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Carousel from "@/components/Carousel";
import AppBanner from "@/components/AppBanner";
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

      <Hero />
      <div className={`relative z-10 mt-[-80px] ${acesso === 'expirado' ? 'pt-12' : ''}`}>
        <Carousel title="Lançamentos" images={movieImages} />
        <Carousel title="Em Alta" images={trendingImages} />
      </div>
      <AppBanner />

      {/* Banner CTA → página de planos */}
      <section
        style={{
          background: 'linear-gradient(135deg, #0d1117 0%, #111827 100%)',
          padding: '80px 24px',
          textAlign: 'center',
          borderTop: '1px solid rgba(212,175,55,0.12)',
        }}
      >
        <p style={{ fontFamily: 'Outfit, sans-serif', color: '#D4AF37', fontSize: '13px', fontWeight: '700', letterSpacing: '2px', marginBottom: '16px', textTransform: 'uppercase' }}>
          ✝ Assine agora
        </p>
        <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(28px, 4vw, 46px)', color: '#FFF', marginBottom: '16px', lineHeight: '1.2' }}>
          Acesso completo ao melhor<br />
          <span style={{ color: '#D4AF37' }}>conteúdo católico do Brasil</span>
        </h2>
        <p style={{ fontFamily: 'Outfit, sans-serif', color: 'rgba(255,255,255,0.5)', fontSize: '16px', marginBottom: '36px', maxWidth: '480px', margin: '0 auto 36px' }}>
          Planos a partir de R$ 9,90/mês. Cancele quando quiser.
        </p>
        <a
          href="/planos"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(90deg, #D4AF37, #F5C842)',
            color: '#090B10',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: '800',
            fontSize: '16px',
            padding: '16px 48px',
            borderRadius: '50px',
            textDecoration: 'none',
            letterSpacing: '0.5px',
            boxShadow: '0 8px 30px rgba(212,175,55,0.35)',
            transition: 'all 0.2s',
          }}
        >
          Ver planos e preços →
        </a>
      </section>

      <Footer />
    </main>
  );
}
