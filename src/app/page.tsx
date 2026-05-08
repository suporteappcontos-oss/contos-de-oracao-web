import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import CategoryCarousel from "@/components/CategoryCarousel";
import VideoCard from "@/components/VideoCard";
import { createClient } from "@/utils/supabase/server";
import DynamicBackground from "@/components/DynamicBackground";

type Props = {
  searchParams: Promise<{ acesso?: string }>
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home({ searchParams }: Props) {
  const { acesso } = await searchParams;

  // Busca todos os vídeos ativos, mais recentes primeiro (igual ao App)
  const supabase = await createClient();
  const { data: videos } = await supabase
    .from('videos')
    .select('id, titulo, categoria, duracao, bunny_library_id, bunny_video_id, thumbnail_url')
    .eq('ativo', true)
    .order('criado_em', { ascending: false });

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

      <Hero />

      <div className={`relative z-10 md:mt-[-80px] mt-8 pb-10 ${acesso === 'expirado' ? 'pt-12' : ''}`}>
        {videos && videos.length > 0 ? (
          <CategoryCarousel title="Portfólio" count={videos.length + 1}>
            {/* Card especial da HQ — sempre primeiro */}
            <a
              href="/hq/nossa-senhora-fatima"
              className="group relative shrink-0 w-[160px] md:w-[180px] rounded-xl overflow-hidden border border-white/10 hover:border-[#D4AF37]/50 transition-all duration-300"
              style={{ display: 'block' }}
            >
              <div className="aspect-[2/3] relative overflow-hidden">
                <img
                  src="https://contos-apks.b-cdn.net/hq/nossa-senhora-fatima/HQ_01.png"
                  alt="HQ Nossa Senhora de Fátima"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                {/* Badge HQ */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D67B)', color: '#000' }}>
                  📖 HQ
                </div>
                <div className="absolute bottom-2 left-0 right-0 px-2">
                  <p className="text-white text-xs font-bold leading-tight">Nossa Senhora de Fátima</p>
                </div>
              </div>
            </a>

            {videos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </CategoryCarousel>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="text-4xl">✝</span>
            <p className="text-base">Nenhum conteúdo disponível no momento.</p>
            <p className="text-sm">Acesse o <a href="/admin" className="text-[#D4AF37] hover:underline">painel Admin</a> para adicionar vídeos.</p>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
