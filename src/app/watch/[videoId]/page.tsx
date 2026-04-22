import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CheckCircle2, Play, Plus, Share2 } from 'lucide-react'

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
    <div className="min-h-screen bg-[#0f171e] font-sans text-white pb-20">

      {/* ── Navbar Restrita Clássica Prime ── */}
      <header className="absolute top-0 w-full z-50 bg-gradient-to-b from-[#0f171e]/90 to-transparent flex items-center justify-between px-4 md:px-8 py-4 h-[72px]">
        <Link href="/watch" className="flex items-center gap-2 text-white hover:text-white/80 transition-colors bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
          <ChevronLeft size={20} />
          <span className="hidden sm:inline font-semibold">Títulos Originiais</span>
        </Link>
        <Link href="/watch" className="flex items-center leading-none group mr-4">
           <span className="text-white text-xl font-black italic tracking-tighter drop-shadow-md">prime</span>
           <span className="text-[#0f79af] text-sm font-bold tracking-widest mt-0.5 drop-shadow-md">video</span>
        </Link>
      </header>

      <main className="w-full">

        {/* ── Player de Vídeo em Destaque Absoluto ── */}
        <div className="bg-black w-full shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="relative w-full aspect-video mx-auto max-w-[1600px] mt-10 md:mt-2">
            <iframe
              src={embedUrl}
              className="absolute top-0 left-0 w-full h-full border-none shadow-inner"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* ── Informações do Título (Estilo Amazon) ── */}
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 py-6 md:py-12">
          
          <div className="flex items-center gap-3 mb-2 opacity-80">
             <span className="text-white bg-[#0f79af] text-[0.65rem] font-bold px-2 py-0.5 rounded tracking-widest uppercase shadow">
               Prime
             </span>
             <span className="text-[#8197a4] text-xs font-semibold uppercase tracking-wider">{video.categoria}</span>
          </div>

          <h1 className="text-white text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
            {video.titulo}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[#8197a4] mb-6">
            <span className="text-white">{new Date(video.criado_em).getFullYear()}</span>
            {video.duracao && (
              <>
                 <span className="w-1 h-1 bg-[#8197a4] rounded-full" />
                 <span>{video.duracao}</span>
              </>
            )}
            <span className="w-1 h-1 bg-[#8197a4] rounded-full" />
            <span className="bg-white/10 px-1.5 rounded text-white shadow-sm border border-white/10">10+</span>
            <span className="w-1 h-1 bg-[#8197a4] rounded-full" />
            <span>X-Ray</span>
            <span className="w-1 h-1 bg-[#8197a4] rounded-full" />
            <span>HDR</span>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-wrap items-center gap-3 my-8">
            <button className="flex items-center gap-3 bg-[#0f79af] hover:bg-[#0b5e89] text-white px-8 md:px-10 py-3 md:py-4 rounded-md font-bold text-base transition-colors shadow-md w-full md:w-auto justify-center">
              <Play fill="currentColor" size={24} className="ml-1" />
              Retomar
            </button>
            <div className="flex items-center gap-3 w-full md:w-auto justify-evenly md:justify-start">
               <button className="flex flex-col items-center justify-center p-3 rounded-full bg-[#1b2530] hover:bg-white/10 text-white transition-colors border border-white/5 w-12 h-12">
                 <Plus size={22} className="opacity-80" />
               </button>
               <button className="flex flex-col items-center justify-center p-3 rounded-full bg-[#1b2530] hover:bg-white/10 text-white transition-colors border border-white/5 w-12 h-12">
                 <Share2 size={18} className="opacity-80" />
               </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-10 lg:gap-20">
             {/* Sinopse */}
             <div className="flex-1">
               {video.descricao ? (
                 <p className="text-white/90 text-sm md:text-[1.05rem] leading-[1.6] max-w-4xl text-pretty font-medium">
                   {video.descricao}
                 </p>
               ) : (
                 <p className="text-[#8197a4] italic text-sm">Nenhuma descrição foi fornecida para este título.</p>
               )}
             </div>

             {/* Painel lateral: Elenco, Info, Assinatura */}
             <div className="w-full lg:w-72 shrink-0 space-y-4 text-sm">
                <div className="flex gap-4">
                  <span className="text-[#8197a4] font-semibold w-20 shrink-0">Estrelando</span>
                  <span className="text-white font-medium hover:underline cursor-pointer">Elenco Original</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-[#8197a4] font-semibold w-20 shrink-0">Gêneros</span>
                  <span className="text-[#0f79af] hover:underline cursor-pointer font-medium">{video.categoria}</span>
                </div>
                
                <div className="mt-8 pt-6 border-t border-white/10">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-[#0f79af]/20 flex items-center justify-center text-[#0f79af] shrink-0 border border-[#0f79af]/30">
                       <CheckCircle2 size={20} />
                     </div>
                     <div className="min-w-0">
                       <div className="text-white font-bold text-sm">
                         Assinatura Ativa
                       </div>
                       <div className="text-[#8197a4] text-xs mt-0.5 truncate font-medium">
                         Você está assistindo como {user.email}
                       </div>
                     </div>
                   </div>
                </div>
             </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
