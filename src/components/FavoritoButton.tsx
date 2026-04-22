'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { toggleFavorito } from '@/app/perfil/actions'

interface Props {
  videoId: string
  initialFav: boolean
}

export default function FavoritoButton({ videoId, initialFav }: Props) {
  const [favoritado, setFavoritado] = useState(initialFav)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (loading) return
    setLoading(true)
    setFavoritado(prev => !prev)
    const result = await toggleFavorito(videoId)
    if (result.error) setFavoritado(prev => !prev)
    setLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
        favoritado
          ? 'border-red-500/40 text-red-400 hover:border-red-500/60'
          : 'border-white/10 text-white/60 hover:border-white/25 hover:text-white'
      }`}
      style={{
        background: favoritado ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
      }}
    >
      <Heart
        size={16}
        fill={favoritado ? '#ef4444' : 'none'}
        style={{ color: favoritado ? '#ef4444' : 'currentColor', transition: 'all 0.2s' }}
        className={loading ? 'animate-pulse' : ''}
      />
      {favoritado ? 'Nos favoritos ✓' : 'Favoritar'}
    </button>
  )
}
