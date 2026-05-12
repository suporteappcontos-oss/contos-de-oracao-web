'use client'

import { MonitorUp } from 'lucide-react'

export default function CastButton() {
  const handleClick = () => {
    alert("Para espelhar na TV, verifique se seu dispositivo está na mesma rede Wi-Fi e utilize o ícone de transmissão (Cast) que aparece diretamente no player de vídeo acima, ou a função de espelhamento nativa do seu celular.")
  }

  return (
    <button
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border border-white/10 text-white/50 hover:text-[#D4AF37] hover:border-[#D4AF37]/50 transition-all cursor-pointer"
      style={{ background: 'rgba(212,175,55,0.05)' }}
      onClick={handleClick}
      title="Como Espelhar na TV"
    >
      <MonitorUp size={15} />
      <span className="hidden sm:inline">Espelhar na TV</span>
      <span className="sm:hidden">Espelhar</span>
    </button>
  )
}
