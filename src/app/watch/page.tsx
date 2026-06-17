import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import HeroBanner from '@/components/HeroBanner'
import VideoCard from '@/components/VideoCard'
import CategoryCarousel from '@/components/CategoryCarousel'
import NotificationBell from '@/components/NotificationBell'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { LogOut, Settings, BookOpen, Plus } from 'lucide-react'

type Video = {
  id: string
  titulo: string
  descricao: string | null
  categoria: string
  thumbnail_url: string | null
  bunny_video_id: string | null
  bunny_library_id: string
  duracao: string | null
  criado_em: string
  ativo: boolean
  em_breve?: boolean
}

export default async function WatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: perfil } = await supabase
    .from('perfis').select('role, plano').eq('id', user.id).single()

  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'

  // 🔒 PROTEÇÃO DE PLANO: verifica se o assinante tem acesso ativo
  // plano_ativo vem do user_metadata (definido pelo webhook da Stripe)
  // Admin sempre tem acesso. Demais usuários precisam de plano_ativo = true
  const planoAtivo = user.user_metadata?.plano_ativo === true
  if (!isAdmin && !planoAtivo) {
    redirect('/?acesso=expirado')
  }

  // Etiqueta dinâmica vinda do metadata da Stripe (salva pelo webhook)
  const planoLabel = isAdmin ? 'Administrador' : (user.user_metadata?.etiqueta_plano || perfil?.plano || 'Assinante')

  const { data: videos } = await supabase
    .from('videos').select('*').eq('ativo', true)
    .order('criado_em', { ascending: false })

  const videoDestaque = (videos ?? []).find(v => !v.em_breve) || (videos ?? [])[0]

  // Busca IDs dos favoritos do usuário para destacar nos cards
  const { data: favoritosData } = await supabase
    .from('favoritos').select('video_id').eq('user_id', user!.id)
  const favoritosSet = new Set((favoritosData ?? []).map(f => f.video_id))

  // Etiqueta do plano para exibição
  const etiquetaPlano = user.user_metadata?.etiqueta_plano || ''
  const etiquetaPlanoStr = (user.user_metadata?.etiqueta_plano || perfil?.plano || '').toLowerCase()
  const isBasico = !isAdmin && (etiquetaPlanoStr.includes('basico') || etiquetaPlanoStr.includes('básico'))

  // 🕒 HISTÓRICO DE VISUALIZAÇÕES (Continue Assistindo)
  const { data: historico } = await supabase
    .from('visualizacoes')
    .select('video_id, criado_em, videos!inner(*)')
    .eq('user_id', user.id)
    .order('criado_em', { ascending: false })

  const recentes: Video[] = []
  const idsVistos = new Set<string>()
  for (const item of (historico ?? [])) {
    const videoData = Array.isArray(item.videos) ? item.videos[0] : item.videos;
    if (videoData && !idsVistos.has(item.video_id) && videoData.ativo) {
      idsVistos.add(item.video_id)
      recentes.push(videoData as Video)
    }
  }

  // 🎬 ORGANIZAÇÃO DE CATEGORIAS EXCLUSIVAS (Última Temporada e Clipes)
  const videosTemporadaTodos = (videos ?? []).filter(v => v.categoria === 'Temporada' && v.temporada_nome);
  let ultimaTemporadaNome: string | null = null;
  let videosUltimaTemporada: Video[] = [];

  if (videosTemporadaTodos.length > 0) {
    // Ordenamos por data de criação desc para achar o mais recente e descobrir o nome da última temporada
    const ordenadosPorCriadoEm = [...videosTemporadaTodos].sort((a, b) => {
      return new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();
    });
    ultimaTemporadaNome = ordenadosPorCriadoEm[0].temporada_nome;
    
    if (ultimaTemporadaNome) {
      // Filtramos todos os episódios dessa temporada específica e ordenamos por número de episódio em ordem crescente (1, 2, 3...)
      videosUltimaTemporada = (videos ?? [])
        .filter(v => v.categoria === 'Temporada' && v.temporada_nome === ultimaTemporadaNome)
        .sort((a, b) => {
          const epA = a.episodio_numero ?? 0;
          const epB = b.episodio_numero ?? 0;
          return epA - epB;
        });
    }
  }

  // Filtramos os clipes musicais (tolerando "Video Clip", "Vídeo Clipe", etc.) ordenados por criado_em decrescente
  const videosClipes = (videos ?? []).filter(v => 
    v.categoria && (
      v.categoria.toLowerCase().includes('clip') || 
      v.categoria.toLowerCase().includes('clipe')
    )
  );

  async function logout() {
    'use server'
    const supab = await createClient()
    await supab.auth.signOut()
    redirect('/')
  }

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#090B10', fontFamily: 'Outfit, sans-serif' }}>

      {/* ── NAVBAR UNIFICADA (com menu lateral) ── */}
      <Navbar />

      {/* ── CONTEÚDO ── */}
      <main className="pt-[72px]">

        {/* Estado vazio */}
        {(!videos || videos.length === 0) && (
          <div className="flex flex-col items-center justify-center pt-32 px-4 text-center gap-4">
            <Image src="/logo.png" alt="Logo" width={80} height={80} className="opacity-40 object-contain" />
            <h2 className="text-xl text-white font-bold">Nenhum conteúdo disponível ainda.</h2>
            <p className="text-[#94A3B8]">Em breve o catálogo será atualizado.</p>
          </div>
        )}

        {videos && videos.length > 0 && (
          <>
            {/* HeroBanner */}
            {videoDestaque && <HeroBanner video={videoDestaque as any} />}

            {/* Separador com estilo ouro */}
            <div className="flex items-center gap-4 px-5 md:px-10 lg:px-16 mt-10 mb-6">
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-[#D4AF37] text-[0.6rem] font-extrabold tracking-[0.2em] uppercase">Catálogo</span>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            <div className="space-y-4">
              {recentes.length > 0 && (
                <div className="mb-6">
                  <CategoryCarousel title="Continue Assistindo" count={1}>
                    {recentes.slice(0, 1).map((video: Video) => (
                      <VideoCard key={`hist-${video.id}`} video={video} isFavoritado={favoritosSet.has(video.id)} />
                    ))}
                  </CategoryCarousel>
                </div>
              )}

              {videosUltimaTemporada.length > 0 && (
                <CategoryCarousel title={ultimaTemporadaNome || 'Temporada'} count={videosUltimaTemporada.length}>
                  {videosUltimaTemporada.map((video: Video) => (
                    <VideoCard key={video.id} video={video} isFavoritado={favoritosSet.has(video.id)} />
                  ))}
                </CategoryCarousel>
              )}

              {videosClipes.length > 0 && (
                <CategoryCarousel title="Vídeos Clipes" count={videosClipes.length}>
                  {videosClipes.map((video: Video) => (
                    <VideoCard key={video.id} video={video} isFavoritado={favoritosSet.has(video.id)} />
                  ))}
                </CategoryCarousel>
              )}

              {!isBasico && (
                <div className="pt-8 pb-4">
                  <div className="px-5 md:px-10 lg:px-16 mb-4">
                    <h2 className="text-[#D4AF37] font-black text-lg md:text-xl tracking-tight uppercase">Conteúdo Exclusivo</h2>
                  </div>
                  <div className="px-5 md:px-10 lg:px-16">
                    <div className="flex flex-row gap-6 overflow-x-auto pb-2">

                      {/* Card — Material Didático */}
                      <div
                        className="flex flex-col gap-3 shrink-0 group transition-all duration-300 group-hover:scale-[1.04] group-hover:-translate-y-1"
                        style={{ width: 'clamp(240px, 28vw, 340px)' }}
                      >
                        <Link
                          href="/materiais"
                          className="relative block outline-none cursor-pointer rounded-xl shadow-2xl"
                          style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                            <img
                              src="/catequese.png"
                              alt="Material Didático"
                              className="w-full h-full object-cover"
                            />
                            <div
                              className="absolute inset-0"
                              style={{ background: 'linear-gradient(to top, rgba(9,11,16,0.3) 0%, transparent 100%)' }}
                            />
                          </div>
                        </Link>
                        <Link href="/materiais" className="block hover:no-underline">
                          <span className="text-[#D4AF37] text-[0.6rem] font-extrabold uppercase tracking-widest block mb-1">CONTEÚDO PEDAGÓGICO</span>
                          <h3 className="text-white text-base font-extrabold leading-tight group-hover:text-[#D4AF37] transition-colors">
                            Livros, HQs e Desenhos
                          </h3>
                          <p className="text-white/70 text-xs mt-1.5 leading-snug">
                            Acesse e faça download de livros pedagógicos, desenhos e histórias de santos.
                          </p>
                        </Link>
                      </div>

                      {/* Card — Vídeos Temáticos */}
                      <div className="flex flex-col gap-3 shrink-0 group" style={{ width: 'clamp(240px, 28vw, 340px)' }}>
                        <Link
                          href="/videos-tematicos"
                          className="relative block outline-none cursor-pointer rounded-xl shadow-2xl transition-all duration-300 group-hover:scale-[1.04] group-hover:-translate-y-1"
                          style={{ background: '#111827', border: '1px solid rgba(225,48,108,0.25)' }}
                        >
                          <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                            <img
                              src="/insta.png"
                              alt="Vídeos Instagram"
                              className="w-full h-full object-cover"
                            />
                            <div
                              className="absolute inset-0"
                              style={{ background: 'linear-gradient(to top, rgba(9,11,16,0.4) 0%, transparent 70%)' }}
                            />
                          </div>
                        </Link>
                        <Link href="/videos-tematicos" className="block hover:no-underline">
                          <span className="text-[0.6rem] font-extrabold uppercase tracking-widest block mb-1" style={{ color: '#E1306C' }}>VÍDEOS EXCLUSIVOS</span>
                          <h3 className="text-white text-base font-extrabold leading-tight transition-all"
                            style={{ backgroundImage: 'linear-gradient(135deg,#c084fc,#E1306C)', WebkitBackgroundClip: 'text' }}>
                            Vídeos Instagram
                          </h3>
                          <p className="text-white/70 text-xs mt-1.5 leading-snug">
                            Conteúdo exclusivo em vídeo. Assista e faça download direto pelo site.
                          </p>
                        </Link>
                      </div>


                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Rodapé */}
            <Footer />
          </>
        )}
      </main>
    </div>
  )
}
