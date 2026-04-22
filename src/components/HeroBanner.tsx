'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Info } from 'lucide-react'
import Image from 'next/image'

// Imagens cinematográficas de fallback (Unsplash - sem necessidade de API)
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80', // cinema
  'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=1600&q=80', // cruz
  'https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?w=1600&q=80', // luz
  'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=1600&q=80', // mãos
  'https://images.unsplash.com/photo-1476725994324-6f6833cfb205?w=1600&q=80', // amanhecer
]

type VideoData = {
  id: string
  titulo: string
  descricao: string | null
  bunny_library_id: string
  bunny_video_id: string
  thumbnail_url: string | null
}

function getRandomFallback(id: string): string {
  // Usa o ID para escolher sempre a mesma imagem consistentemente
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return FALLBACK_IMAGES[code % FALLBACK_IMAGES.length]
}

export default function HeroBanner({ video }: { video: VideoData }) {
  const bgImage = video.thumbnail_url || getRandomFallback(video.id)

  return (
    <div className="relative w-full overflow-hidden" style={{ height: 'min(85vh, 720px)', minHeight: '500px' }}>

      {/* Imagem de Fundo com Ken Burns */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat ken-burns"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
      </div>

      {/* Gradientes multicamada (estilo Prime Video) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f171e] via-[#0f171e]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-transparent to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e]/90 via-transparent to-[#0f171e]/20" />

      {/* Conteúdo */}
      <div className="absolute inset-0 flex flex-col justify-end pb-12 md:pb-20 px-6 md:px-12 lg:px-16 max-w-3xl">
        
        {/* Badge Prime */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="flex items-center gap-1.5 bg-[#00a8e1] px-2.5 py-1 rounded text-white text-[0.6rem] font-extrabold tracking-widest uppercase">
            Prime Video
          </div>
          <span className="text-[#8197a4] text-xs tracking-wider uppercase">Destaque</span>
        </motion.div>

        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-white font-black leading-tight mb-4"
          style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
        >
          {video.titulo}
        </motion.h1>

        {/* Descrição */}
        {video.descricao && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[#c8d8e4] text-sm md:text-base leading-relaxed mb-8 line-clamp-3 max-w-xl"
          >
            {video.descricao}
          </motion.p>
        )}

        {/* Botões de Ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="flex flex-wrap items-center gap-3"
        >
          <Link
            href={`/watch/${video.id}`}
            className="group flex items-center gap-2.5 bg-white hover:bg-[#e8e8e8] text-[#0f171e] px-6 md:px-8 py-3 md:py-3.5 rounded-md font-bold text-sm md:text-base transition-all duration-200 shadow-xl hover:shadow-2xl"
          >
            <Play fill="currentColor" size={18} className="group-hover:scale-110 transition-transform" />
            Reproduzir
          </Link>

          <button className="flex items-center gap-2.5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 px-5 md:px-7 py-3 md:py-3.5 rounded-md font-semibold text-sm md:text-base transition-all duration-200">
            <Info size={18} />
            Mais Detalhes
          </button>
        </motion.div>
      </div>
    </div>
  )
}
