'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Play } from 'lucide-react'

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
  bunny_video_id: string | null
  thumbnail_url: string | null
  em_breve?: boolean
}

export default function VideoCard({ video, minimal = false }: { video: VideoData, minimal?: boolean }) {
  const [imgError, setImgError] = useState(false)

  const imageUrl = (!imgError && video.thumbnail_url)
    ? video.thumbnail_url
    : getFallback(video.id)

  if (video.em_breve) {
    return (
      <div
        className="group relative flex-shrink-0 block outline-none cursor-default transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1"
        style={{ width: 'clamp(200px, 26vw, 320px)' }}
      >
        {/* Thumbnail */}
        <div
          className="relative aspect-video rounded-xl overflow-hidden"
          style={{
            background: '#15243E',
            border: '1px solid rgba(255,255,255,0.06)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
          }}
        >
          {/* Imagem de capa */}
          <img
            src={imageUrl}
            alt={video.titulo}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {!minimal && (
            <>
              {/* Overlay gradiente */}
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{ background: 'linear-gradient(to top, rgba(9,11,16,0.95) 0%, rgba(9,11,16,0.2) 50%, transparent 100%)' }}
              />

              {/* Informações superiores (Em Breve) */}
              <div className="absolute top-2 left-2 right-2 flex justify-between items-start z-10">
                <div 
                  className="ml-auto px-2 py-0.5 rounded border text-[0.55rem] font-black uppercase tracking-wider animate-pulse"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)',
                    color: '#090B10',
                    borderColor: 'rgba(212,175,55,0.4)',
                    boxShadow: '0 0 10px rgba(212,175,55,0.3)'
                  }}
                >
                  Em Breve
                </div>
              </div>

              {/* Título do Vídeo no canto inferior */}
              <div className="absolute bottom-3 left-3 right-3 z-10">
                <p className="text-white text-[0.75rem] md:text-sm font-extrabold leading-tight drop-shadow-md line-clamp-2 transition-colors">
                  {video.titulo}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <Link
      href={`/watch/${video.id}`}
      className="group relative flex-shrink-0 block outline-none cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1"
      style={{ width: 'clamp(200px, 26vw, 320px)' }}
    >
      {/* Thumbnail */}
      <div
        className="relative aspect-video rounded-xl overflow-hidden"
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
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {!minimal && (
          <>
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

            {/* Título do Vídeo no canto inferior */}
            <div className="absolute bottom-3 left-3 right-3 z-10">
              <p className="text-white text-[0.75rem] md:text-sm font-extrabold leading-tight drop-shadow-md line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
                {video.titulo}
              </p>
            </div>
          </>
        )}
      </div>
    </Link>
  )
}
