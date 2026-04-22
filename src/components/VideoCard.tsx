'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Plus, Check } from 'lucide-react'
import { useState } from 'react'

type VideoData = {
  id: string
  titulo: string
  categoria: string
  duracao: string | null
  bunny_library_id: string
  bunny_video_id: string
  thumbnail_url: string | null
}

const FALLBACK_BANNERS = [
  'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop', // Cinema Escuro
  'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop', // Filme antigo
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop', // Claquete
]

function getFallback(id: string) {
  const code = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return FALLBACK_BANNERS[code % FALLBACK_BANNERS.length]
}

export default function VideoCard({ video }: { video: VideoData }) {
  const [imgError, setImgError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const initialThumbnail = video.thumbnail_url || 
    `https://iframe.mediadelivery.net/embed/${video.bunny_library_id}/${video.bunny_video_id}/thumbnail.jpg`

  const finalImage = imgError ? getFallback(video.id) : initialThumbnail

  return (
    <div 
      className="relative flex-shrink-0 w-[240px] md:w-[300px] h-[135px] md:h-[168px] z-10 hover:z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={isHovered ? {
          scale: 1.15,
          y: -10,
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
        } : {
          scale: 1,
          y: 0,
          boxShadow: 'none'
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="absolute inset-0 bg-[#1b2530] rounded-md overflow-hidden origin-bottom cursor-pointer border border-transparent group"
        style={{ borderColor: isHovered ? 'rgba(255,255,255,0.2)' : 'transparent' }}
      >
        <Link href={`/watch/${video.id}`} className="block outline-none text-white h-full w-full">
          {/* Thumb */}
          <div className={`${isHovered ? 'h-[60%]' : 'h-full'} w-full relative transition-all duration-300`}>
             <img
              src={finalImage}
              onError={() => setImgError(true)}
              alt={video.titulo}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {isHovered && <div className="absolute inset-0 bg-gradient-to-t from-[#1b2530] to-transparent" />}
          </div>

          {/* Painel Inferior (Mostra ao Passar o Mouse) */}
          <div className="absolute bottom-0 left-0 w-full p-3 opacity-0 transition-opacity duration-300" style={{ opacity: isHovered ? 1 : 0 }}>
            {/* Ações */}
            <div className="flex items-center gap-2 mb-2">
               <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition-colors">
                 <Play fill="black" size={16} className="ml-0.5 text-black" />
               </button>
               <button className="w-8 h-8 rounded-full bg-[#33373d] flex items-center justify-center border border-white/20 hover:border-white transition-colors">
                 <Plus size={16} />
               </button>
            </div>
            
            {/* Texto */}
            <h3 className="font-bold text-sm truncate mb-0.5">
              {video.titulo}
            </h3>
            <div className="flex items-center gap-2 text-[0.65rem] text-text-muted">
              <span className="font-bold text-white bg-white/10 px-1 rounded border border-white/20">
                {video.categoria}
              </span>
              {video.duracao && <span>{video.duracao}</span>}
              <span className="text-[#0f79af] font-semibold flex items-center gap-1">
                ✓ Prime
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  )
}
