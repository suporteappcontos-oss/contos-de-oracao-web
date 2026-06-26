'use client'

import React from 'react'
import { Pencil } from 'lucide-react'

export default function ClientAvatarButton({
  avatarUrl,
  fallbackAvatarUrl
}: {
  avatarUrl: string | null
  fallbackAvatarUrl: string
}) {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('open-profile-editor'))
  }

  return (
    <div
      onClick={handleClick}
      className="relative shrink-0 group cursor-pointer"
      title="Clique para editar seu perfil"
    >
      {/* Glow dourado de fundo no hover */}
      <div className="absolute inset-0 bg-[#D4AF37] blur-md opacity-15 group-hover:opacity-35 transition-opacity rounded-full" />
      <div className="relative w-28 h-28 rounded-full overflow-hidden border border-white/10 shadow-2xl" style={{ background: '#090B10' }}>
        <img
          src={avatarUrl || fallbackAvatarUrl}
          alt="Avatar"
          className="w-full h-full object-contain duration-500"
          style={{ display: 'block', transform: 'scale(1.12)', transition: 'transform 0.5s' }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.18)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1.12)')}
        />
        {/* Hover Overlay com lápis e texto */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] font-black uppercase tracking-wider gap-1.5 duration-300">
          <Pencil size={14} className="text-[#D4AF37]" />
          Editar
        </div>
      </div>
    </div>
  )
}
