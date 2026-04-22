'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play } from 'lucide-react'

// Adaptação da tipagem apenas para o que importa no HeroBanner
type VideoData = {
  id: string
  titulo: string
  descricao: string | null
  bunny_library_id: string
  bunny_video_id: string
  thumbnail_url: string | null
}

export default function HeroBanner({ video }: { video: VideoData }) {
  const thumbnailUrl = video.thumbnail_url || 
    `https://iframe.mediadelivery.net/embed/${video.bunny_library_id}/${video.bunny_video_id}/thumbnail.jpg`

  return (
    <div className="relative h-[60vh] min-h-[400px] max-h-[600px] w-full overflow-hidden flex items-end">
      
      {/* Imagem de Fundo com efeito Ken Burns suave */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${thumbnailUrl})` }}
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: 'reverse' }}
      />
      
      {/* Gradientes (Sombra por cima da imagem) */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0C121D] via-[#0C121D]/60 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0C121D] via-[#0C121D]/50 to-transparent z-10" />

      {/* Conteúdo Animado */}
      <div className="relative z-20 w-full px-4 md:px-8 pb-10 md:pb-16 max-w-4xl mx-auto md:mx-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="bg-[#FFD700] text-black text-[0.65rem] md:text-xs font-extrabold px-3 py-1.5 rounded-md tracking-wider mb-4 inline-block shadow-[0_0_15px_rgba(255,215,0,0.4)]">
            EM DESTAQUE
          </span>
          <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-black mb-4 leading-tight drop-shadow-xl">
            {video.titulo}
          </h1>
          
          {video.descricao && (
            <p className="text-white/70 text-sm md:text-base lg:text-lg mb-8 max-w-2xl line-clamp-3 md:line-clamp-none drop-shadow-md">
              {video.descricao}
            </p>
          )}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <Link 
              href={`/watch/${video.id}`}
              className="group flex items-center gap-2 bg-[#FFD700] hover:bg-[#ffe14d] text-black px-6 md:px-8 py-3 md:py-4 rounded-xl font-extrabold text-base md:text-lg transition-colors shadow-[0_4px_25px_rgba(255,215,0,0.3)]"
            >
              <Play fill="currentColor" size={20} className="group-hover:scale-110 transition-transform" />
              Assistir Agora
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
