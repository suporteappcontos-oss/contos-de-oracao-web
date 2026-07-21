'use client'

import { useState } from 'react'
import { Tv } from 'lucide-react'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80'

interface TemporadaCardProps {
  nomeTemporada: string
  capaUrl?: string | null
  episodiosCount: number
  isEmBreve?: boolean
  onClick: () => void
}

export default function TemporadaCard({
  nomeTemporada,
  capaUrl,
  episodiosCount,
  isEmBreve = false,
  onClick
}: TemporadaCardProps) {
  const [imgError, setImgError] = useState(false)

  const imageUrl = (!imgError && capaUrl)
    ? capaUrl
    : FALLBACK_IMAGE

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex-shrink-0 text-left outline-none cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1"
      style={{ width: 'clamp(200px, 26vw, 320px)' }}
    >
      <div
        className="relative aspect-video rounded-xl overflow-hidden"
        style={{
          background: '#15243E',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
        }}
      >
        {/* Thumbnail da Temporada */}
        <img
          src={imageUrl}
          alt={nomeTemporada}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradiente escuro */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{ background: 'linear-gradient(to top, rgba(9,11,16,0.95) 0%, rgba(9,11,16,0.2) 50%, transparent 100%)' }}
        />

        {/* Badge TEMPORADA no topo esquerdo */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded border text-[0.6rem] font-black uppercase tracking-wider bg-black/60 text-[#D4AF37] border-[#D4AF37]/30 backdrop-blur-sm z-10">
          <Tv className="w-3 h-3" />
          Temporada
        </div>

        {/* Badge EM BREVE no topo direito (se aplicável) */}
        {(isEmBreve || episodiosCount === 0) && (
          <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded border text-[0.6rem] font-black uppercase tracking-wider bg-black/80 text-[#FFD700] border-[#FFD700]/50 backdrop-blur-sm z-10 shadow-md">
            Em Breve
          </div>
        )}

        {/* Nome da Temporada e quantidade de episódios */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <h3 className="text-white text-xs md:text-sm font-extrabold leading-tight drop-shadow-md line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
            {nomeTemporada}
          </h3>
          <p className="text-white/60 text-[10px] md:text-xs font-semibold mt-0.5">
            {episodiosCount} {episodiosCount === 1 ? 'Episódio' : 'Episódios'}
          </p>
        </div>
      </div>
    </button>
  )
}
