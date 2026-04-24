import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import FavoritoButton from '@/components/FavoritoButton'
import VideoPlayerGuard from '@/components/VideoPlayerGuard'
import { ChevronLeft, Clock, Tag, Share2, ChevronRight } from 'lucide-react'

type Props = {
  params: Promise<{ videoId: string }>
}

export default async function VideoPlayerPage({ params }: Props) {
  const { videoId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: video } = await supabase
    .from('videos')
    .select('*')
    .eq('id', videoId)
    .eq('ativo', true)
    .single()

  if (!video) redirect('/watch')

  // Verifica se este vídeo já é favorito do usuário
  const { data: favCheck } = await supabase
    .from('favoritos')
    .select('id')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .single()
  const isFav = !!favCheck

  // Busca mais vídeos da mesma categoria (exceto o atual)
  const { data: relacionados } = await supabase
    .from('videos')
    .select('id, titulo, thumbnail_url, duracao, categoria')
    .eq('ativo', true)
    .eq('categoria', video.categoria)
    .neq('id', videoId)
    .limit(5)

  const nome = user.user_metadata?.nome || user.email?.split('@')[0] || 'Assinante'
  const embedUrl = `https://iframe.mediadelivery.net/embed/${video.bunny_library_id}/${video.bunny_video_id}?autoplay=true&responsive=true&preload=true&background=000000&lang=pt-br`

  const FALLBACK = [
    'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&q=70',
    'https://images.unsplash.com/photo-1476725994324-6f6833cfb205?w=400&q=70',
    'https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?w=400&q=70',
    'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=400&q=70',
  ]
  function getFallback(id: string) {
    const code = (id.charCodeAt(0) || 0) + (id.charCodeAt(id.length - 1) || 0)
    return FALLBACK[code % FALLBACK.length]
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#090B10', fontFamily: 'Outfit, sans-serif' }}>

      {/* ── NAVBAR ── */}
      <header className="fixed top-0 w-full z-50 flex items-center gap-3 px-4 md:px-8 h-14 md:h-[60px]"
        style={{ background: 'rgba(9,11,16,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

        <Link href="/watch" className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm shrink-0">
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Voltar</span>
        </Link>

        <div className="h-4 w-px bg-white/10" />

        <Link href="/watch" className="flex items-center gap-2.5 shrink-0">
          <Image src="/logo.png" alt="Contos de Oração" width={32} height={32} className="object-contain" />
          <span className="text-white font-black text-sm hidden sm:inline">Contos de Oração</span>
        </Link>

        <div className="flex-1 text-center hidden md:block">
          <span className="text-white/35 text-xs truncate">{video.titulo}</span>
        </div>
      </header>

      <main className="pt-14 md:pt-[60px]">

        {/* ── PLAYER (protegido pelo guarda de sessões) ── */}
        <VideoPlayerGuard videoId={videoId} embedUrl={embedUrl} />

        {/* ── INFO + RELACIONADOS ── */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-8 flex flex-col lg:flex-row gap-8">

          {/* Coluna principal */}
          <div className="flex-1 min-w-0">

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="text-[0.55rem] font-extrabold px-2 py-0.5 rounded uppercase tracking-widest"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
                ✦ CDO
              </div>
              <div className="flex items-center gap-1 text-[#8197a4] text-xs">
                <Tag size={11} /> {video.categoria}
              </div>
              {video.duracao && (
                <div className="flex items-center gap-1 text-[#8197a4] text-xs">
                  <Clock size={11} /> {video.duracao}
                </div>
              )}
            </div>

            {/* Título */}
            <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-black mb-5 leading-tight">
              {video.titulo}
            </h1>

            {/* Ações */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <FavoritoButton videoId={video.id} initialFav={isFav} />
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-all cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.04)' }}
                onClick={undefined}
                title="Compartilhar"
              >
                <Share2 size={15} />
                Compartilhar
              </button>
            </div>

            {/* Descrição */}
            {video.descricao && (
              <p className="text-[#8197a4] text-sm md:text-base leading-relaxed max-w-3xl mb-8">
                {video.descricao}
              </p>
            )}

            <div className="h-px mb-8" style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Rodapé: usuário logado */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border-2"
                style={{ borderColor: 'rgba(212,175,55,0.3)' }}>
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || '')}&backgroundColor=transparent`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">{nome}</div>
                <div className="text-[#64748B] text-xs">Assinante ativo</div>
              </div>
            </div>
          </div>

          {/* Coluna lateral: vídeos relacionados */}
          {relacionados && relacionados.length > 0 && (
            <div className="lg:w-[340px] shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-base">Mais de {video.categoria}</h2>
              </div>
              <div className="flex flex-col gap-3">
                {relacionados.map(v => (
                  <Link key={v.id} href={`/watch/${v.id}`}
                    className="flex gap-3 group rounded-xl p-2 transition-all hover:bg-white/5">
                    <div className="w-32 aspect-video rounded-lg shrink-0 overflow-hidden bg-[#15243E]"
                      style={{ backgroundImage: `url(${v.thumbnail_url || getFallback(v.id)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-white text-xs font-bold line-clamp-2 mb-1 group-hover:text-[#D4AF37] transition-colors">
                        {v.titulo}
                      </p>
                      <p className="text-[#64748B] text-[0.65rem] uppercase tracking-wider">{v.categoria}</p>
                      {v.duracao && <p className="text-[#64748B] text-[0.65rem] mt-0.5">⏱ {v.duracao}</p>}
                    </div>
                    <ChevronRight size={14} className="text-white/20 group-hover:text-white/60 transition-colors self-center shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
