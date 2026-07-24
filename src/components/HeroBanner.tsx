'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play } from 'lucide-react'

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1600&q=80',
  'https://images.unsplash.com/photo-1476725994324-6f6833cfb205?w=1600&q=80',
  'https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?w=1600&q=80',
  'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=1600&q=80',
]

function getRandomFallback(id: string): string {
  const code = (id.charCodeAt(0) || 0) + (id.charCodeAt(id.length - 1) || 0)
  return FALLBACK_IMAGES[code % FALLBACK_IMAGES.length]
}

type VideoData = {
  id: string
  titulo: string
  descricao: string | null
  bunny_library_id: string
  bunny_video_id: string
  thumbnail_url: string | null
}

export default function HeroBanner({ video }: { video: VideoData }) {
  const bgImage = video.thumbnail_url || getRandomFallback(video.id)

  return (
    <div className="relative w-full overflow-hidden h-[450px] sm:h-[520px] md:h-[min(82vh,700px)]">

      {/* Imagem de Fundo animada */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Desktop: bg-cover centralizado */}
        <div
          className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat ken-burns"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        {/* Mobile: 100% de largura no topo para exibir toda a arte da capa sem cortar as laterais */}
        <div
          className="md:hidden absolute inset-0 bg-[length:100%_auto] bg-no-repeat bg-top"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      </div>

      {/* Gradientes responsivos para suavizar a transição no celular e desktop */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090B10]/40 via-transparent to-[#090B10] md:bg-gradient-to-r md:from-[#090B10] md:via-[#090B10]/80 md:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-[#090B10]/90 md:via-transparent to-transparent" />

      {/* Conteúdo */}
      <div className="absolute inset-0 flex flex-col justify-end pb-6 sm:pb-12 md:pb-20 px-4 sm:px-5 md:px-10 lg:px-16 max-w-3xl z-10">

        {/* Badge dourado (estilo App) */}
        <div className="animate-fade-in delay-100 flex items-center gap-3 mb-2.5 sm:mb-4">
          <div className="flex items-center gap-1.5 bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-3 py-1 rounded-full">
            <span className="text-[#D4AF37] text-[0.65rem] font-extrabold tracking-widest uppercase">✨ Em Destaque</span>
          </div>
        </div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
          className="text-white font-black leading-tight mb-2 sm:mb-4 drop-shadow-2xl"
          style={{ fontSize: 'clamp(1.5rem, 4.5vw, 3.8rem)' }}
        >
          {video.titulo}
        </motion.h1>

        {/* Descrição */}
        {video.descricao && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="text-[#94A3B8] text-xs sm:text-sm md:text-base leading-relaxed mb-5 sm:mb-8 line-clamp-2 sm:line-clamp-3 max-w-xl"
          >
            {video.descricao}
          </motion.p>
        )}

        {/* Botões de Ação */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex flex-wrap items-center gap-3"
        >
          <Link
            href={`/watch/${video.id}`}
            className="group flex items-center gap-2.5 bg-white hover:bg-[#f0f0f0] text-[#090B10] px-5 sm:px-6 md:px-8 py-3 sm:py-3.5 rounded-xl font-extrabold text-xs sm:text-sm md:text-base transition-all duration-200 shadow-2xl cursor-pointer"
          >
            <Play fill="currentColor" size={16} className="group-hover:scale-110 transition-transform" />
            Assistir Agora
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
