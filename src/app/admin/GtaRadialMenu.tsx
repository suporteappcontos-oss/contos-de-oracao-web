'use client'

import React, { useState } from 'react'
import { Film, BookOpen, BookMarked, Video, X, ChevronLeft } from 'lucide-react'

// --- FUNÇÕES MATEMÁTICAS PARA O MENU RADIAL EM SVG ---
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  // -90 graus para que o ângulo 0 aponte para CIMA (12h)
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  }
}

function describeArc(x: number, y: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number, gap: number = 0) {
  const start = startAngle + gap
  const end = endAngle - gap
  
  const startOuter = polarToCartesian(x, y, outerRadius, end)
  const endOuter = polarToCartesian(x, y, outerRadius, start)
  const startInner = polarToCartesian(x, y, innerRadius, end)
  const endInner = polarToCartesian(x, y, innerRadius, start)

  const largeArcFlag = end - start <= 180 ? "0" : "1"

  return [
    "M", startOuter.x, startOuter.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOuter.x, endOuter.y,
    "L", endInner.x, endInner.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startInner.x, startInner.y,
    "Z"
  ].join(" ")
}
// -----------------------------------------------------

type Props = {
  onClose: () => void
  onSelect: (tipo: 'video' | 'material' | 'revista' | 'instagram') => void
}

export function GtaRadialMenu({ onClose, onSelect }: Props) {
  const [level, setLevel] = useState<1 | 2>(1)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Opções Nível 1
  const level1 = [
    { id: 'videos', label: 'Vídeos', icon: Film, startAngle: -60, endAngle: 60, iconAngle: 0, color: '#D4AF37' },
    { id: 'material', label: 'Material', icon: BookOpen, startAngle: 60, endAngle: 180, iconAngle: 120, color: '#10b981' },
    { id: 'revista', label: 'Revista', icon: BookMarked, startAngle: 180, endAngle: 300, iconAngle: 240, color: '#7c3aed' },
  ]

  // Opções Nível 2 (Submenu de Vídeos)
  const level2 = [
    { id: 'serie', label: 'Série', icon: Video, startAngle: -60, endAngle: 60, iconAngle: 0, color: '#D4AF37' },
    { id: 'insta', label: 'V. Insta', icon: IgIcon, startAngle: 60, endAngle: 180, iconAngle: 120, color: '#E1306C' },
    { id: 'back', label: 'Voltar', icon: ChevronLeft, startAngle: 180, endAngle: 300, iconAngle: 240, color: '#ffffff' },
  ]

  const currentOptions = level === 1 ? level1 : level2

  const handleSelect = (id: string) => {
    if (id === 'videos') {
      setLevel(2)
      setHoveredId(null)
    }
    else if (id === 'back') {
      setLevel(1)
      setHoveredId(null)
    }
    else if (id === 'serie') onSelect('video')
    else if (id === 'insta') onSelect('instagram')
    else if (id === 'material') onSelect('material')
    else if (id === 'revista') onSelect('revista')
  }

  // Dimensões do SVG
  const size = 420
  const center = size / 2
  const outerRadius = 200
  const innerRadius = 60

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-500 animate-in fade-in">
       
       <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 z-10 drop-shadow-2xl">
            <defs>
              {/* Filtros de Glow Dinâmicos baseados nas cores de cada item */}
              {currentOptions.map(opt => (
                <filter key={`glow-${opt.id}`} id={`glow-${opt.id}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="8" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            {currentOptions.map(opt => {
              const isHovered = hoveredId === opt.id
              const pathD = describeArc(center, center, innerRadius, outerRadius, opt.startAngle, opt.endAngle, 1.5)

              return (
                <g key={opt.id}>
                  {/* Fundo Base da Fatia */}
                  <path
                    d={pathD}
                    fill="rgba(17, 24, 39, 0.8)"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1"
                  />
                  {/* Overlay de Hover Interativo (A própria fatia) */}
                  <path
                    d={pathD}
                    fill={opt.color}
                    fillOpacity={isHovered ? 0.35 : 0}
                    stroke={opt.color}
                    strokeWidth={isHovered ? "2" : "0"}
                    filter={isHovered ? `url(#glow-${opt.id})` : undefined}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredId(opt.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => handleSelect(opt.id)}
                  />
                </g>
              )
            })}
          </svg>

          {/* O "Cubo" Central com as informações */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110px] h-[110px] rounded-full bg-[#111827] border-2 border-white/10 flex flex-col items-center justify-center shadow-inner z-20 pointer-events-none">
            <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] text-center px-2 leading-tight">
               {level === 1 ? 'Novo' : 'Tipo de'}<br/>
               <span className="text-white/90">{level === 1 ? 'Conteúdo' : 'Vídeo'}</span>
            </span>
          </div>

          {/* Ícones e Textos sobrepostos perfeitamente no centro de cada fatia */}
          {currentOptions.map(opt => {
             // O centro do ícone fica na metade do caminho entre o raio interno e externo
             const iconRadius = innerRadius + ((outerRadius - innerRadius) / 2)
             const pos = polarToCartesian(center, center, iconRadius, opt.iconAngle)
             const isHovered = hoveredId === opt.id

             return (
               <div 
                 key={`icon-${opt.id}`}
                 className="absolute z-30 flex flex-col items-center justify-center pointer-events-none transition-all duration-300"
                 style={{
                    left: pos.x,
                    top: pos.y,
                    transform: `translate(-50%, -50%) scale(${isHovered ? 1.15 : 1})`,
                 }}
               >
                 <opt.icon 
                    size={28} 
                    color={isHovered ? '#ffffff' : opt.color} 
                    className="drop-shadow-lg transition-colors duration-300" 
                 />
                 <span 
                    className={`font-extrabold text-[11px] tracking-[0.15em] uppercase mt-2 drop-shadow-md transition-colors duration-300 ${
                      isHovered ? 'text-white' : 'text-white/60'
                    }`}
                 >
                   {opt.label}
                 </span>
               </div>
             )
          })}
       </div>

       {/* Botão de Fechar */}
       <div className="mt-12 z-50">
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
