'use client'

import React, { useState } from 'react'
import { Film, BookOpen, BookMarked, Video, X, ChevronLeft } from 'lucide-react'

type Props = {
  onClose: () => void
  onSelect: (tipo: 'video' | 'material' | 'revista' | 'instagram') => void
}

export function GtaRadialMenu({ onClose, onSelect }: Props) {
  const [level, setLevel] = useState<1 | 2>(1)

  // Opções Nível 1
  const level1 = [
    { id: 'videos', label: 'Vídeos', icon: Film, angle: -90, color: '#D4AF37' },
    { id: 'material', label: 'Material', icon: BookOpen, angle: 30, color: '#10b981' },
    { id: 'revista', label: 'Revista', icon: BookMarked, angle: 150, color: '#7c3aed' },
  ]

  // Opções Nível 2 (Submenu de Vídeos)
  const level2 = [
    { id: 'serie', label: 'Série', icon: Video, angle: -90, color: '#D4AF37' },
    { id: 'insta', label: 'V. Insta', icon: IgIcon, angle: 30, color: '#E1306C' },
    { id: 'back', label: 'Voltar', icon: ChevronLeft, angle: 150, color: '#ffffff' },
  ]

  const currentOptions = level === 1 ? level1 : level2

  const handleSelect = (id: string) => {
    if (id === 'videos') setLevel(2)
    else if (id === 'back') setLevel(1)
    else if (id === 'serie') onSelect('video')
    else if (id === 'insta') onSelect('instagram')
    else if (id === 'material') onSelect('material')
    else if (id === 'revista') onSelect('revista')
  }

  // Raio do círculo
  const radius = 130

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-500 animate-in fade-in">
       {/* Círculo Base (Roda) */}
       <div className="relative w-[380px] h-[380px] rounded-full border border-white/10 bg-[#111827]/60 flex items-center justify-center shadow-2xl backdrop-blur-xl ring-8 ring-black/40">
          
          {/* Centro (Cubo ou Info) */}
          <div className="absolute w-28 h-28 rounded-full bg-black/60 border-2 border-white/5 flex flex-col items-center justify-center shadow-inner z-10">
            <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] text-center px-4 leading-tight">
               {level === 1 ? 'Novo' : 'Tipo de'}<br/>
               <span className="text-white/80">{level === 1 ? 'Conteúdo' : 'Vídeo'}</span>
            </span>
          </div>

          {/* Divisórias Radiais Estilo GTA (Opcional, dá um efeito legal de fatias) */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent pointer-events-none" style={{ background: 'conic-gradient(from -30deg, transparent 0deg 118deg, rgba(255,255,255,0.05) 118deg 122deg, transparent 122deg 238deg, rgba(255,255,255,0.05) 238deg 242deg, transparent 242deg 358deg, rgba(255,255,255,0.05) 358deg 360deg)' }}></div>

          {currentOptions.map((opt) => {
             // Converter grau para radiano
             const rad = (opt.angle * Math.PI) / 180
             // Calcular posições X e Y
             const x = Math.cos(rad) * radius
             const y = Math.sin(rad) * radius

             return (
               <button
                 key={opt.id}
                 onClick={() => handleSelect(opt.id)}
                 className="absolute w-28 h-28 -ml-14 -mt-14 rounded-full flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.15] group z-20 focus:outline-none"
                 style={{
                   transform: `translate(${x}px, ${y}px)`,
                 }}
               >
                 {/* Fundo da Bolha com brilho na cor */}
                 <div 
                   className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                   style={{ backgroundColor: opt.color }}
                 />
                 <div className="absolute inset-0 rounded-full bg-black/40 border-2 border-white/5 group-hover:border-white/20 transition-all duration-300" />
                 
                 <opt.icon size={28} color={opt.color} className="relative z-10 group-hover:drop-shadow-[0_0_10px_currentColor] transition-all" />
                 <span className="relative z-10 text-white font-extrabold text-xs tracking-wider uppercase drop-shadow-md mt-1">
                   {opt.label}
                 </span>
               </button>
             )
          })}
       </div>

       {/* Botão de Fechar */}
       <div className="absolute bottom-12 left-0 right-0 flex justify-center">
          <button 
            onClick={onClose} 
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all text-sm font-bold uppercase tracking-widest border border-white/10 hover:border-white/20 shadow-lg"
          >
            <X size={18}/> Cancelar
          </button>
       </div>
    </div>
  )
}

function IgIcon({ size = 18, color = "currentColor", className = "" }: { size?: number, color?: string, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  )
}
