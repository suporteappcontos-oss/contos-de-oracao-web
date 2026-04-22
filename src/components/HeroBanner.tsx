'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play } from 'lucide-react'
import { useState } from 'react'

type VideoData = {
  id: string
  titulo: string
  descricao: string | null
  bunny_library_id: string
  bunny_video_id: string
  thumbnail_url: string | null
}

const FALLBACK_BANNERS = [
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1600&auto=format&fit=crop', // Filme antigo
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1600&auto=format&fit=crop', // Claquete
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1600&auto=format&fit=crop', // Cinema Escuro
]

// Usamos o ID do vídeo para sempre retornar a mesma imagem pro mesmo filme, caso não tenha capa
function getFallback(id: string) {
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return FALLBACK_BANNERS[code % FALLBACK_BANNERS.length]
}

export default function HeroBanner({ video }: { video: VideoData }) {
  const [imgError, setImgError] = useState(false)
  
  const initialThumbnail = video.thumbnail_url || 
    `https://iframe.mediadelivery.net/embed/${video.bunny_library_id}/${video.bunny_video_id}/thumbnail.jpg`

  const finalImage = imgError ? getFallback(video.id) : initialThumbnail

  return (
    <div className="relative h-[70vh] min-h-[500px] w-full overflow-hidden bg-[#0f171e]">
      
      {/* Imagem de Fundo (Prime Video Style) */}
      <img
        src={finalImage}
        onError={() => setImgError(true)}
        className="absolute inset-0 w-full h-full object-cover object-center"
        alt={video.titulo}
      />
      
      {/* Vingnette e Gradientes */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0f171e] via-[#0f171e]/70 to-transparent w-full md:w-[65%]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-transparent to-transparent h-full" />

      {/* Conteúdo Animado */}
      <div className="relative z-20 h-full w-full px-5 md:px-12 flex flex-col justify-center max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <div className="text-white text-[11px] md:text-sm font-bold tracking-[0.2em] mb-2 uppercase opacity-80 flex items-center gap-2">
            <span className="text-primary italic font-black text-xl">✓</span>
            Incluído no Prime
          </div>
          
          <h1 className="text-white text-4xl md:text-6xl font-bold mb-4 leading-tight drop-shadow-xl">
            {video.titulo}
          </h1>
          
          {video.descricao && (
            <p className="text-text-muted text-sm md:text-lg mb-8 line-clamp-3 md:line-clamp-4 drop-shadow-md leading-relaxed">
              {video.descricao}
            </p>
          )}

          <div className="flex items-center gap-4">
            <Link 
              href={`/watch/${video.id}`}
              className="flex items-center gap-3 bg-white hover:bg-gray-200 text-black px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg transition-colors"
            >
              <Play fill="currentColor" size={24} className="ml-1" />
              Reproduzir
            </Link>
            <button className="hidden md:flex items-center justify-center p-4 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors border border-white/10">
              <span className="font-bold cursor-pointer text-xl">+</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
