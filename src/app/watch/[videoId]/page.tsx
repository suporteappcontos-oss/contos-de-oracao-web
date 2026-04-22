import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle, Clock, Tag } from 'lucide-react'

type Props = {
  params: Promise<{ videoId: string }>
}

// Fallback
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80',
  'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=1600&q=80',
  'https://images.unsplash.com/photo-1476725994324-6f6833cfb205?w=1600&q=80',
  'https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?w=1600&q=80',
  'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=1600&q=80',
]
function getFallback(id: string) {
  const code = (id.charCodeAt(0) || 0) + (id.charCodeAt(id.length - 1) || 0)
  return FALLBACK_IMAGES[code % FALLBACK_IMAGES.length]
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

  const embedUrl = `https://iframe.mediadelivery.net/embed/${video.bunny_library_id}/${video.bunny_video_id}?autoplay=true&responsive=true&preload=true&background=000000`

  return (
    <div className="min-h-screen bg-[#0f171e] text-white font-sans">

      {/* ── NAVBAR ── */}
      <header className="fixed top-0 w-full z-50 bg-[#1a242f]/95 backdrop-blur-xl border-b border-[#1e3040] flex items-center gap-4 px-4 md:px-8 h-14 md:h-[60px]">
        <Link 
          href="/watch" 
          className="flex items-center gap-2 text-[#8197a4] hover:text-white transition-colors text-sm"
        >
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Voltar</span>
        </Link>

        <div className="h-4 w-px bg-[#1e3040]" />

        <div className="flex items-center gap-2">
          <div className="bg-[#00a8e1] text-white text-[0.55rem] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">Prime</div>
          <span className="text-white font-semibold text-sm hidden sm:inline opacity-70">Video</span>
        </div>

        <div className="flex-1 text-center hidden md:block">
          <span className="text-white/60 text-sm truncate">{video.titulo}</span>
        </div>
      </header>

      <main className="pt-14 md:pt-[60px]">

        {/* ── PLAYER ── */}
        <div className="bg-black w-full" style={{ maxHeight: '80vh' }}>
          <div className="relative w-full aspect-video max-h-[80vh] mx-auto" style={{ maxWidth: '1600px' }}>
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full border-none"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </div>

        {/* ── INFO ── */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-10">

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="bg-[#00a8e1] text-white text-[0.55rem] font-black px-2 py-1 rounded tracking-widest uppercase">
              Prime
            </div>
            <div className="flex items-center gap-1.5 text-[#8197a4] text-xs">
              <Tag size={12} />
              {video.categoria}
            </div>
            {video.duracao && (
              <div className="flex items-center gap-1.5 text-[#8197a4] text-xs">
                <Clock size={12} />
                {video.duracao}
              </div>
            )}
          </div>

          {/* Título */}
          <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-black mb-4 leading-tight">
            {video.titulo}
          </h1>

          {/* Descrição */}
          {video.descricao && (
            <p className="text-[#8197a4] text-sm md:text-base leading-relaxed max-w-3xl mb-8">
              {video.descricao}
            </p>
          )}

          <div className="h-px bg-[#1e3040] my-6 md:my-8" />

          {/* Linha de rodapé com assinatura ativa + link */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#4caf82]/10 border border-[#4caf82]/20 flex items-center justify-center">
                <CheckCircle size={18} className="text-[#4caf82]" />
              </div>
              <div>
                <div className="text-white text-sm font-semibold">Acesso Ativo</div>
                <div className="text-[#8197a4] text-xs">{user.email}</div>
              </div>
            </div>

            <Link 
              href="/watch"
              className="flex items-center gap-2 text-[#00a8e1] hover:text-white text-sm border border-[#00a8e1]/20 hover:border-[#00a8e1] px-4 py-2 rounded-lg transition-colors"
            >
              Ver mais conteúdos
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
