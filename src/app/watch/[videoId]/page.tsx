import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import FavoritoButton from '@/components/FavoritoButton'

import VideoPlayerGuard from '@/components/VideoPlayerGuard'
import Footer from '@/components/Footer'
import { Clock, ChevronRight } from 'lucide-react'
import crypto from 'crypto'

type Props = {
  params: Promise<{ videoId: string }>
}

export default async function VideoPlayerPage({ params }: Props) {
  const { videoId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: perfil } = await supabase
    .from('perfis')
    .select('role, plano')
    .eq('id', user.id)
    .single()

  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'
  const planoAtivo = user.user_metadata?.plano_ativo === true

  if (!isAdmin && !planoAtivo) {
    redirect('/?acesso=expirado')
  }

  const { data: video } = await supabase
    .from('videos')
    .select('*')
    .eq('id', videoId)
    .eq('ativo', true)
    .single()

  if (!video) redirect('/watch')

  // Busca o próximo vídeo da sequência (com suporte a temporadas e episódios ou ordem cronológica)
  let proximoVideo = null
  if (video) {
    if (video.categoria === 'Temporada' && video.temporada_nome && video.episodio_numero !== null) {
      // Busca o próximo episódio da mesma temporada
      const { data: nextEp } = await supabase
        .from('videos')
        .select('id, titulo, thumbnail_url, bunny_video_id, bunny_library_id, duracao')
        .eq('categoria', 'Temporada')
        .eq('temporada_nome', video.temporada_nome)
        .eq('ativo', true)
        .eq('em_breve', false)
        .gt('episodio_numero', video.episodio_numero)
        .order('episodio_numero', { ascending: true })
        .limit(1)
        .maybeSingle()
      
      proximoVideo = nextEp
    } else {
      // Busca o próximo vídeo da mesma categoria em ordem cronológica (mais antigo criado antes deste)
      const { data: nextVid } = await supabase
        .from('videos')
        .select('id, titulo, thumbnail_url, bunny_video_id, bunny_library_id, duracao')
        .eq('categoria', video.categoria)
        .eq('ativo', true)
        .eq('em_breve', false)
        .lt('criado_em', video.criado_em)
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle()
        
      proximoVideo = nextVid
    }

    // Fallback: se for o último vídeo da sequência, volta para o primeiro (mais recente) da categoria
    if (!proximoVideo) {
      const { data: newestVid } = await supabase
        .from('videos')
        .select('id, titulo, thumbnail_url, bunny_video_id, bunny_library_id, duracao')
        .eq('categoria', video.categoria)
        .eq('ativo', true)
        .eq('em_breve', false)
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (newestVid && newestVid.id !== video.id) {
        proximoVideo = newestVid
      }
    }
  }

  // Registra a visualização (ignorando erros caso já exista ou haja falha)
  await supabase.from('visualizacoes').insert({
    video_id: videoId,
    user_id: user.id
  })

  // Verifica se este vídeo já é favorito do usuário
  const { data: favCheck } = await supabase
    .from('favoritos')
    .select('id')
    .eq('user_id', user.id)
    .eq('video_id', videoId)
    .single()
  const isFav = !!favCheck

  // Busca mais vídeos (exceto o atual)
  const { data: relacionados } = await supabase
    .from('videos')
    .select('id, titulo, thumbnail_url, duracao')
    .eq('ativo', true)
    .neq('id', videoId)
    .limit(5)

  const nome = user.user_metadata?.nome || user.email?.split('@')[0] || 'Assinante'
  
  let embedUrl = `https://iframe.mediadelivery.net/embed/${video.bunny_library_id}/${video.bunny_video_id}?autoplay=true&responsive=true&preload=true&background=000000&lang=pt-br`
  
  // Implementação da Dica de Ouro: Autenticação por Token (Protege e faz rodar no APK)
  const securityKey = process.env.BUNNY_STREAM_TOKEN_KEY
  if (securityKey) {
    // eslint-disable-next-line react-hooks/purity
    const expires = Math.floor(Date.now() / 1000) + (3600 * 6) // Expira em 6 horas
    const hashString = securityKey + video.bunny_video_id + expires
    const token = crypto.createHash('sha256').update(hashString).digest('hex')
    embedUrl += `&token=${token}&expires=${expires}`
  }

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

      {/* ── CONTEÚDO ── */}
      <main className="pt-[72px]">

        {/* ── YOUTUBE LAYOUT: CONTAINER PRINCIPAL ── */}
        <div className="max-w-[1600px] mx-auto pt-0 md:pt-6 pb-8 flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Coluna principal (Vídeo + Info) */}
          <div className="flex-1 min-w-0">

            {/* ── PLAYER (protegido pelo guarda de sessões) ── */}
            <div className="w-full md:px-6 lg:px-8 mb-4 md:mb-6">
              <VideoPlayerGuard 
                videoId={videoId} 
                embedUrl={embedUrl} 
                proximoVideo={proximoVideo} 
                emBreve={video.em_breve}
                thumbnailUrl={video.thumbnail_url}
              />
            </div>

            {/* ── INFORMAÇÕES DO VÍDEO ── */}
            <div className="px-4 md:px-6 lg:px-8">

              <div className="flex flex-wrap items-center gap-2 mb-3">
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
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=111827&color=D4AF37&bold=true&size=128`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">{nome}</div>
                <div className="text-[#64748B] text-xs">Assinante ativo</div>
              </div>
            </div>

            </div> {/* Fecha a div de padding do INFO */}
          </div>

          {/* Coluna lateral: vídeos relacionados */}
          {relacionados && relacionados.length > 0 && (
            <div className="px-4 md:px-6 lg:px-0 lg:pr-8 lg:w-[280px] xl:w-[320px] shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-base">Mais Vídeos</h2>
              </div>
              <div className="flex flex-col gap-3">
                {relacionados.map(v => (
                  <Link key={v.id} href={`/watch/${v.id}`}
                    className="flex gap-3 group rounded-xl p-2 transition-all hover:bg-white/5">
                    <div className="w-24 sm:w-28 aspect-video rounded-lg shrink-0 overflow-hidden bg-[#15243E]"
                      style={{ backgroundImage: `url(${v.thumbnail_url || getFallback(v.id)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-white text-xs font-bold line-clamp-2 mb-1 group-hover:text-[#D4AF37] transition-colors whitespace-normal">
                        {v.titulo}
                      </p>
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
      <Footer />
    </div>
  )
}
