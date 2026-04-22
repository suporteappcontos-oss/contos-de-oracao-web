import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2 } from 'lucide-react'

type Props = {
  params: Promise<{ videoId: string }>
}

export default async function VideoPlayerPage({ params }: Props) {
  const { videoId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Buscar dados do vídeo
  const { data: video } = await supabase
    .from('videos')
    .select('*')
    .eq('id', videoId)
    .eq('ativo', true)
    .single()

  if (!video) redirect('/watch')

  const embedUrl = `https://iframe.mediadelivery.net/embed/${video.bunny_library_id}/${video.bunny_video_id}?autoplay=false&responsive=true&preload=true`

  return (
    <div className="min-h-screen bg-[#070d16] font-sans text-white">

      {/* ── Navbar ── */}
      <header className="fixed top-0 w-full z-50 bg-black/95 backdrop-blur-xl border-b border-white/5 flex items-center gap-4 md:gap-6 px-4 md:px-8 py-3 md:py-4">
        <Link href="/watch" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm md:text-base">
          <ChevronLeft size={20} />
          <span className="hidden sm:inline">Voltar</span>
        </Link>
        <div className="text-[#FFD700] text-lg md:text-xl font-black drop-shadow-md truncate">
          Contos de Oração
        </div>
      </header>

      <main className="pt-[60px] md:pt-[72px]">

        {/* ── Player de Vídeo ── */}
        <div className="bg-black w-full max-w-[1400px] mx-auto shadow-2xl">
          <div className="relative w-full aspect-video">
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full border-none"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* ── Informações do Vídeo ── */}
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6 md:gap-10">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-3 md:mb-4">
                <span className="bg-[#FFD700]/15 text-[#FFD700] text-[0.65rem] md:text-xs font-bold px-2.5 py-1 rounded-md tracking-wider">
                  {video.categoria}
                </span>
                {video.duracao && (
                  <span className="text-white/40 text-[0.75rem] md:text-sm">
                    ⏱ {video.duracao}
                  </span>
                )}
              </div>

              <h1 className="text-white text-2xl md:text-3xl lg:text-4xl font-black mb-3 md:mb-4 leading-tight">
                {video.titulo}
              </h1>

              {video.descricao && (
                <p className="text-white/55 text-sm md:text-base leading-relaxed max-w-3xl">
                  {video.descricao}
                </p>
              )}
            </div>

            <Link href="/watch" className="shrink-0 flex items-center gap-2 text-white/60 hover:text-white text-sm md:text-base border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 px-5 py-2.5 rounded-xl transition-all">
              🎬 Ver mais vídeos
            </Link>
          </div>

          <div className="h-px bg-white/10 my-8 md:my-10" />

          {/* Card de assinatura ativa */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 flex items-center gap-4 max-w-sm">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-green-500/15 flex items-center justify-center text-green-400 shrink-0">
              <CheckCircle2 size={24} />
            </div>
            <div className="min-w-0">
              <div className="text-white font-bold text-sm md:text-base">
                Acesso Premium
              </div>
              <div className="text-white/40 text-xs md:text-sm mt-0.5 truncate">
                {user.email}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
