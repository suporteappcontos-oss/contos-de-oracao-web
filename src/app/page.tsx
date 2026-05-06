import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import AppBanner from "@/components/AppBanner";
import Footer from "@/components/Footer";
import CategoryCarousel from "@/components/CategoryCarousel";
import VideoCard from "@/components/VideoCard";
import { createClient } from "@/utils/supabase/server";

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

  // Agrupa por categoria para as linhas por categoria (como o App)
  const videosPorCategoria: Record<string, typeof videos> = {};
  const categorias: string[] = [];
  if (videos && videos.length > 0) {
    videos.forEach(v => {
      if (!videosPorCategoria[v.categoria]) {
        videosPorCategoria[v.categoria] = [];
        categorias.push(v.categoria);
      }
      videosPorCategoria[v.categoria]!.push(v);
    });
  }

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

      <div className={`relative z-10 mt-[-80px] pb-10 ${acesso === 'expirado' ? 'pt-12' : ''}`}>
        {videos && videos.length > 0 ? (
          <>
            {/* 🎬 Lançamentos — TODOS os vídeos, scroll horizontal */}
            <CategoryCarousel title="Lançamentos" count={videos.length}>
              {videos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </CategoryCarousel>

            {/* 📂 Linhas por Categoria (igual ao App) */}
            {categorias.map(cat => (
              <CategoryCarousel key={cat} title={cat} count={videosPorCategoria[cat]!.length}>
                {videosPorCategoria[cat]!.map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </CategoryCarousel>
            ))}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-white/30 gap-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <span className="text-4xl">✝</span>
            <p className="text-base">Nenhum conteúdo disponível no momento.</p>
            <p className="text-sm">Acesse o <a href="/admin" className="text-[#D4AF37] hover:underline">painel Admin</a> para adicionar vídeos.</p>
          </div>
        )}
      </div>

      <AppBanner />
      <Footer />
    </main>
  );
}
