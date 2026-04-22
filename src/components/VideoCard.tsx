'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Clock } from 'lucide-react'

// Adaptação da tipagem
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
  const thumbnailUrl = video.thumbnail_url || 
    `https://iframe.mediadelivery.net/embed/${video.bunny_library_id}/${video.bunny_video_id}/thumbnail.jpg`

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="group relative flex-shrink-0 w-[180px] md:w-[240px] cursor-pointer"
    >
      <Link href={`/watch/${video.id}`} className="block outline-none">
        <div className="relative aspect-video rounded-xl md:rounded-2xl overflow-hidden bg-[#1E2E3E] border border-white/5 transition-all duration-300 shadow-lg group-hover:shadow-[0_10px_35px_rgba(255,215,0,0.15)] group-hover:border-[#FFD700]/50">
          
          {/* Imagem de Capa */}
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
          />
          
          {/* Overlay escuro */}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 transition-colors duration-300" />
          
          {/* Botão Play invisível que aparece no Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center border-2 border-[#FFD700]">
              <Play fill="#FFD700" size={24} className="text-[#FFD700] ml-1" />
            </div>
          </div>

          {/* Tag de Duração */}
          {video.duracao && (
            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-white text-[0.6rem] md:text-xs font-semibold flex items-center gap-1">
              <Clock size={10} />
              {video.duracao}
            </div>
          )}
        </div>

        {/* Informações abaixo do card */}
        <div className="mt-3 px-1">
          <h3 className="text-white font-bold text-xs md:text-sm truncate" title={video.titulo}>
            {video.titulo}
          </h3>
          <p className="text-[#FFD700] text-[0.65rem] md:text-xs mt-1 font-medium">
            {video.categoria}
          </p>
        </div>
      </Link>
    </motion.div>
  )
}
