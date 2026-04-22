'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Plus, ThumbsUp, Clock } from 'lucide-react'

// Imagens de fallback (cinematic)
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
  'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=800&q=80',
  'https://images.unsplash.com/photo-1476725994324-6f6833cfb205?w=800&q=80',
  'https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?w=800&q=80',
  'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=800&q=80',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
]

function getRandomFallback(id: string): string {
  const code = (id.charCodeAt(0) || 0) + (id.charCodeAt(id.length - 1) || 0)
  return FALLBACK_IMAGES[code % FALLBACK_IMAGES.length]
}

type VideoData = {
  id: string
  titulo: string
  categoria: string
  duracao: string | null
  bunny_library_id: string
  bunny_video_id: string
  thumbnail_url: string | null
}

export default function VideoCard({ video }: { video: VideoData }) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)
  
  const imageUrl = (!imgError && video.thumbnail_url) 
    ? video.thumbnail_url 
    : getRandomFallback(video.id)

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative flex-shrink-0 cursor-pointer"
      style={{ width: 'clamp(160px, 22vw, 260px)' }}
    >
      <Link href={`/watch/${video.id}`} className="block outline-none">
        
        {/* Container do Thumbnail */}
        <motion.div
          animate={{ 
            scale: hovered ? 1.06 : 1,
            zIndex: hovered ? 10 : 1,
          }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative aspect-video rounded-lg overflow-hidden bg-[#1a2733] border border-[#1e3040]"
          style={{
            boxShadow: hovered ? '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,168,225,0.3)' : '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          {/* Imagem */}
          <img
            src={imageUrl}
            alt={video.titulo}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Overlay escuro */}
          <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${hovered ? 'opacity-30' : 'opacity-0'}`} />

          {/* Badge Prime na thumbnail */}
          <div className="absolute top-2 left-2">
            <div className="bg-[#00a8e1] text-white text-[0.5rem] font-extrabold px-1.5 py-0.5 rounded tracking-wider uppercase">
              Prime
            </div>
          </div>

          {/* Duração */}
          {video.duracao && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-white text-[0.6rem] font-semibold">
              <Clock size={9} />
              {video.duracao}
            </div>
          )}

          {/* Botão Play central (aparece no hover) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.7 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-2xl">
              <Play fill="#0f171e" size={22} className="ml-0.5 text-[#0f171e]" />
            </div>
          </motion.div>
        </motion.div>

        {/* Mini Painel Hover (Expandido) */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : -4 }}
          transition={{ duration: 0.25, delay: hovered ? 0.1 : 0 }}
          className="overflow-hidden rounded-b-lg bg-[#1a2733] border-x border-b border-[#1e3040] px-3 pb-3 pt-2"
          style={{ boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.6)' : 'none' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                <Play fill="#0f171e" size={12} className="ml-0.5 text-[#0f171e]" />
              </div>
              <div className="w-7 h-7 rounded-full border border-[#8197a4] flex items-center justify-center">
                <Plus size={14} className="text-white" />
              </div>
              <div className="w-7 h-7 rounded-full border border-[#8197a4] flex items-center justify-center">
                <ThumbsUp size={12} className="text-white" />
              </div>
            </div>
          </div>
          <h3 className="text-white font-bold text-xs leading-tight mb-1 truncate">
            {video.titulo}
          </h3>
          <span className="text-[#00a8e1] text-[0.6rem] font-semibold uppercase tracking-wider">
            {video.categoria}
          </span>
        </motion.div>

      </Link>
    </motion.div>
  )
}
