'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Layers } from 'lucide-react'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80'

export type SerieType = {
  id: string
  titulo: string
  descricao?: string | null
  capa_url?: string | null
  temporadasCount?: number
  episodiosCount?: number
}

export default function SerieCard({ serie }: { serie: SerieType }) {
  const [imgError, setImgError] = useState(false)

  const imageUrl = (!imgError && serie.capa_url)
    ? serie.capa_url
    : FALLBACK_IMAGE

  return (
    <Link
      href={`/watch/serie/${encodeURIComponent(serie.id)}`}
      className="group relative flex-shrink-0 block outline-none cursor-pointer transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1"
      style={{ width: 'clamp(200px, 26vw, 320px)' }}
    >
      <div
        className="relative aspect-video rounded-xl overflow-hidden"
        style={{
          background: '#15243E',
          border: '1px solid rgba(212,175,55,0.25)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Imagem de Capa da Série */}
        <img
          src={imageUrl}
          alt={serie.titulo}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Overlay escuro com gradiente */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(9,11,16,0.95) 0%, rgba(9,11,16,0.3) 50%, transparent 100%)' }}
        />

        {/* Badge SÉRIE no topo esquerdo */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded border text-[0.6rem] font-black uppercase tracking-wider bg-[#D4AF37] text-black border-[#D4AF37]/50 shadow-[0_0_10px_rgba(212,175,55,0.4)] z-10">
          <Layers className="w-3 h-3 stroke-[2.5]" />
          Série
        </div>

        {/* Informações da Série no canto inferior */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <h3 className="text-white text-xs md:text-sm font-extrabold leading-tight drop-shadow-md line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
            {serie.titulo}
          </h3>
          <p className="text-white/60 text-[10px] md:text-xs font-semibold mt-0.5">
            {serie.temporadasCount ? `${serie.temporadasCount} ${serie.temporadasCount === 1 ? 'Temporada' : 'Temporadas'}` : 'Série Exclusiva'}
          </p>
        </div>
      </div>
    </Link>
  )
}
