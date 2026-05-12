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
    <Link
      href={`/watch/${video.id}`}
      className="group relative flex-shrink-0 block outline-none cursor-pointer"
      style={{ width: 'clamp(155px, 20vw, 240px)' }}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-video rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.04] group-hover:-translate-y-1"
        style={{
          background: '#15243E',
          border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Imagem de capa (thumbnail do Bunny via admin) */}
        <img
          src={imageUrl}
          alt={video.titulo}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay gradiente */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(9,11,16,0.95) 0%, rgba(9,11,16,0.2) 50%, transparent 100%)' }}
        />

        {/* Botão Play central (Visível no hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
            <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.5)]">
                <Play fill="#090B10" className="w-5 h-5 text-[#090B10] ml-1" />
            </div>
        </div>

        {/* Informações superiores (Duração/Favorito) */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
          {video.duracao ? (
            <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10 flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/80" />
                <span className="text-[0.6rem] font-bold text-white/90 tracking-wide">{video.duracao}</span>
            </div>
          ) : <div />}
          <button 
            onClick={handleFavorito}
            className="p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
          >
            <Heart className={`w-3.5 h-3.5 ${favoritado ? 'fill-red-500 text-red-500' : 'text-white/80'}`} />
          </button>
        </div>


        {/* Título do Vídeo no canto inferior */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <p className="text-white text-[0.75rem] md:text-sm font-extrabold leading-tight drop-shadow-md line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
            {video.titulo}
          </p>
          {video.categoria && (
            <p className="text-white/50 text-[0.6rem] font-bold mt-1 uppercase tracking-wider">
                {video.categoria}
            </p>
          )}
        </div>

      </div>
    </Link>
  )
}
