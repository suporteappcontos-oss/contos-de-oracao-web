'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Info } from 'lucide-react'
import Image from 'next/image'

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1600&q=80',
  'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=1600&q=80',
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
    <div className="relative w-full overflow-hidden" style={{ height: 'min(82vh, 700px)', minHeight: '480px' }}>

      {/* Imagem de Fundo animada */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat ken-burns"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      </div>

      {/* Gradientes (mesma técnica do App: rgba(9,11,16,x)) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#090B10] via-[#090B10]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-transparent to-[#090B10]/25" />

      {/* Conteúdo */}
      <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-20 px-5 md:px-10 lg:px-16 max-w-3xl">

        {/* Badge dourado (estilo App) */}
        <div className="animate-fade-in delay-100 flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-3 py-1 rounded-full">
            <span className="text-[#D4AF37] text-[0.65rem] font-extrabold tracking-widest uppercase">✨ Em Destaque</span>
          </div>
        </div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1 }}
          className="text-white font-black leading-tight mb-4 drop-shadow-2xl"
          style={{ fontSize: 'clamp(1.8rem, 4.5vw, 3.8rem)' }}
        >
          {video.titulo}
        </motion.h1>

        {/* Descrição */}
        {video.descricao && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22 }}
            className="text-[#94A3B8] text-sm md:text-base leading-relaxed mb-8 line-clamp-3 max-w-xl"
          >
            {video.descricao}
          </motion.p>
        )}

        {/* Botões de Ação (estilo App: branco sólido + glass secundário) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex flex-wrap items-center gap-3"
        >
          <Link
            href={`/watch/${video.id}`}
            className="group flex items-center gap-2.5 bg-white hover:bg-[#f0f0f0] text-[#090B10] px-6 md:px-8 py-3.5 rounded-xl font-extrabold text-sm md:text-base transition-all duration-200 shadow-2xl"
          >
            <Play fill="currentColor" size={18} className="group-hover:scale-110 transition-transform" />
            Assistir Agora
          </Link>

          <button className="flex items-center gap-2.5 glass border border-white/10 hover:border-white/20 text-white px-5 md:px-7 py-3.5 rounded-xl font-semibold text-sm md:text-base transition-all duration-200">
            <Info size={17} />
            Detalhes
          </button>
        </motion.div>
      </div>
    </div>
  )
}
