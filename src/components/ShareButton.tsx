'use client'

import { Share2 } from 'lucide-react'

export default function ShareButton({ titulo }: { titulo: string }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: titulo,
          text: `Assista "${titulo}" no Contos de Oração Club`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Erro ao compartilhar', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Link copiado para a área de transferência!")
    }
  }

  return (
    <button
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-white/10 text-white/50 hover:text-white hover:border-white/25 transition-all cursor-pointer"
      style={{ background: 'rgba(255,255,255,0.04)' }}
      onClick={handleShare}
      title="Compartilhar"
    >
      <Share2 size={15} />
      Compartilhar
    </button>
  )
}
