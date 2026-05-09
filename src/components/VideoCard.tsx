'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play, Clock, Heart } from 'lucide-react'
import { toggleFavorito } from '@/app/perfil/actions'

// Fallback com imagens de oração/espiritualidade
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80',
  'https://images.unsplash.com/photo-1476725994324-6f6833cfb205?w=800&q=80',
  'https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?w=800&q=80',
  'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=800&q=80',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',
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

export default function VideoCard({ video, isFavoritado = false }: { video: VideoData, isFavoritado?: boolean }) {
  const [imgError, setImgError] = useState(false)
  const [favoritado, setFavoritado] = useState(isFavoritado)
  const [loadingFav, setLoadingFav] = useState(false)

  async function handleFavorito(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (loadingFav) return
    setLoadingFav(true)
    setFavoritado(prev => !prev)
    const result = await toggleFavorito(video.id)
    if (result.error) setFavoritado(prev => !prev)
    setLoadingFav(false)
  }

  const imageUrl = (!imgError && video.thumbnail_url)
    ? video.thumbnail_url
    : getFallback(video.id)

  return (
    <div
      className="group relative flex-shrink-0 block outline-none cursor-default"
      style={{ width: 'clamp(155px, 20vw, 240px)' }}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-video rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.06] group-hover:-translate-y-1"
        style={{
          background: '#15243E',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 6px 25px rgba(0,0,0,0.4)',
        }}
      >
        {/* Imagem de capa (thumbnail do Bunny via admin) */}
        <img
          src={imageUrl}
          alt={video.titulo}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Overlay gradiente */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(9,11,16,0.85) 0%, transparent 55%)' }}
        />


        {/* Título do Vídeo no canto inferior esquerdo */}
        <div className="absolute bottom-2 left-2 right-2 z-10">
          <p className="text-white text-[0.65rem] md:text-xs font-bold leading-tight drop-shadow-md line-clamp-2">
            {video.titulo}
          </p>
        </div>

      </div>
    </div>
  )
}
