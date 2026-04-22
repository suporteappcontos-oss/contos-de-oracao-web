'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Plus, ThumbsUp, Clock } from 'lucide-react'

// Fallback com imagens de oração/espiritualidade
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80', // vela/luz
  'https://images.unsplash.com/photo-1512070679279-8988d32161be?w=800&q=80', // cruz
  'https://images.unsplash.com/photo-1476725994324-6f6833cfb205?w=800&q=80', // amanhecer
  'https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?w=800&q=80', // catedral
  'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=800&q=80', // mãos rezando
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80', // luz celeste
]

function getFallback(id: string) {
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
    : getFallback(video.id)

  return (
    <motion.div
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className="group relative flex-shrink-0 cursor-pointer"
      style={{ width: 'clamp(155px, 20vw, 250px)' }}
    >
      <Link href={`/watch/${video.id}`} className="block outline-none">

        {/* Thumbnail */}
        <motion.div
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative aspect-video rounded-2xl overflow-hidden"
          style={{
            background: '#15243E',
            border: `1px solid ${hovered ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.05)'}`,
            boxShadow: hovered 
              ? '0 20px 55px rgba(0,0,0,0.8), 0 0 0 1px rgba(212,175,55,0.3)' 
              : '0 6px 25px rgba(0,0,0,0.4)',
            transition: 'border 0.3s, box-shadow 0.3s',
          }}
        >
          {/* Imagem de capa */}
          <img
            src={imageUrl}
            alt={video.titulo}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />

          {/* Overlay */}
          <div 
            className="absolute inset-0 transition-opacity duration-300"
            style={{ 
              background: 'linear-gradient(to top, rgba(9,11,16,0.85) 0%, transparent 60%)',
              opacity: hovered ? 0.4 : 1
            }}
          />

          {/* Badge dourado (igual ao App) */}
          <div className="absolute top-2 left-2 z-10">
            <div
              className="text-[0.5rem] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-widest"
              style={{ background: 'rgba(212,175,55,0.85)', color: '#090B10' }}
            >
              ✦ CDO
            </div>
          </div>

          {/* Duração */}
          {video.duracao && (
            <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 rounded-md px-1.5 py-0.5 text-white text-[0.6rem] font-semibold"
              style={{ background: 'rgba(9,11,16,0.75)', backdropFilter: 'blur(4px)' }}>
              <Clock size={9} />
              {video.duracao}
            </div>
          )}

          {/* Play Central */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.6 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 flex items-center justify-center z-20"
          >
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-2xl gold-pulse"
              style={{ background: 'rgba(255,255,255,0.92)' }}>
              <Play fill="#090B10" size={20} className="ml-0.5 text-[#090B10]" />
            </div>
          </motion.div>
        </motion.div>

        {/* Mini Info Expande no Hover */}
        <motion.div
          initial={false}
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : -4, height: hovered ? 'auto' : 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden rounded-b-2xl px-3 pb-3 pt-2"
          style={{ 
            background: '#15243E', 
            border: '1px solid rgba(212,175,55,0.15)',
            borderTop: 'none',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
              <Play fill="#090B10" size={12} className="ml-0.5" />
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ border: '1.5px solid rgba(255,255,255,0.2)' }}>
              <Plus size={14} className="text-white" />
            </div>
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ border: '1.5px solid rgba(255,255,255,0.2)' }}>
              <ThumbsUp size={11} className="text-white" />
            </div>
          </div>
          <h3 className="text-white font-bold text-xs leading-tight mb-1 truncate">
            {video.titulo}
          </h3>
          <span className="text-[0.6rem] font-extrabold uppercase tracking-wider" style={{ color: '#D4AF37' }}>
            {video.categoria}
          </span>
        </motion.div>

      </Link>
    </motion.div>
  )
}
