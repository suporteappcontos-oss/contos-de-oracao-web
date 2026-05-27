'use client'

import React, { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, LayoutGrid, ChevronDown } from 'lucide-react'

const CARD_MIN = 200  // px mínimo de cada card
const CARD_MAX = 320  // px máximo de cada card

export default function CategoryCarousel({ 
  title, count, children 
}: { 
  title?: string, count: number, children: React.ReactNode 
}) {
  // Descobre quantos cards cabem por linha com base na largura da janela
  const [cardsPerRow, setCardsPerRow] = useState(6)
  const [showAll, setShowAll] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll horizontal (para o modo single-row)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeft(scrollLeft > 10)
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const calcCardsPerRow = () => {
    const container = containerRef.current
    if (!container) return
    const width = container.clientWidth
    const gap = 16 // gap-4
    // Quantos cards cabem com o mínimo de CARD_MIN?
    const n = Math.floor((width + gap) / (CARD_MIN + gap))
    setCardsPerRow(Math.max(2, n))
  }

  useEffect(() => {
    calcCardsPerRow()
    const el = scrollRef.current
    if (el) {
      setTimeout(checkScroll, 100)
      el.addEventListener('scroll', checkScroll, { passive: true })
    }
    window.addEventListener('resize', () => { calcCardsPerRow(); checkScroll() })
    return () => {
      el?.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', calcCardsPerRow)
    }
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -scrollRef.current.clientWidth * 0.75 : scrollRef.current.clientWidth * 0.75, behavior: 'smooth' })
    setTimeout(checkScroll, 500)
  }

  const childrenArray = React.Children.toArray(children)
  const total = childrenArray.length

  // Quantas linhas cabem "fechadas" = 1 linha
  const limitadoA = cardsPerRow                   // cards na 1ª linha
  const temMais = total > limitadoA               // há mais que 1 linha?
  const exibir = (showAll || !temMais) ? childrenArray : childrenArray.slice(0, limitadoA)

  // Se só tem 1 linha (ou está expandido), usa grid wrap. Senão usa scroll horizontal.
  const modoGrid = showAll || !temMais

  return (
    <section ref={containerRef} className="mb-8 relative group" style={{ overflow: 'visible' }}>

      {/* Título + badge de contagem + toggle grid */}
      <div className="flex items-center justify-between gap-3 mb-4 px-5 md:px-10 lg:px-16">
        <div className="flex items-baseline gap-3">
          {title && (
            <h2 className="text-white font-extrabold text-base md:text-xl tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {title}
            </h2>
          )}
          {count > 0 && (
            <span className="text-[#D4AF37]/60 text-xs font-bold">
              {count} {count === 1 ? 'vídeo' : 'vídeos'}
            </span>
          )}
        </div>

        {/* Botão expandir/recolher (só aparece se tem mais de 1 linha) */}
        {temMais && (
          <button
            onClick={() => setShowAll(v => !v)}
            className="flex items-center gap-1.5 text-[0.7rem] font-bold text-[#D4AF37]/70 hover:text-[#D4AF37] transition-colors shrink-0"
          >
            {showAll ? (
              <>
                <ChevronDown size={14} className="rotate-180 transition-transform" />
                Recolher
              </>
            ) : (
              <>
                <LayoutGrid size={13} />
                Ver todos ({total})
              </>
            )}
          </button>
        )}
      </div>

      {/* ── MODO GRID (expandido ou quando cabe tudo em 1 linha) ── */}
      {modoGrid ? (
        <div
          className="px-5 md:px-10 lg:px-16 pb-4"
          style={{ overflow: 'visible' }}
        >
          <div
            className="flex flex-wrap gap-3 md:gap-4"
            style={{ overflow: 'visible' }}
          >
            {exibir.map((child, i) => (
              <div key={i} className="flex-shrink-0 py-2" style={{ overflow: 'visible' }}>
                {child}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ── MODO SCROLL HORIZONTAL (1 linha, há mais cards além) ── */
        <div className="relative" style={{ overflow: 'visible' }}>
          {/* Seta Esquerda */}
          {showLeft && (
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex absolute left-0 top-0 bottom-8 z-10 w-14 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(to right, #090B10, transparent)' }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-110"
                style={{ background: '#15243E', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                <ChevronLeft size={16} />
              </div>
            </button>
          )}

          <div
            ref={scrollRef}
            className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-8 pt-3 px-5 md:px-10 lg:px-16 snap-x snap-mandatory"
            style={{ overflowY: 'visible' }}
          >
            {childrenArray.map((child, i) => (
              <div key={i} className="flex-shrink-0 snap-start py-2">{child}</div>
            ))}
          </div>

          {/* Seta Direita */}
          {showRight && (
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex absolute right-0 top-0 bottom-8 z-10 w-14 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(to left, #090B10, transparent)' }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-110"
                style={{ background: '#15243E', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                <ChevronRight size={16} />
              </div>
            </button>
          )}
        </div>
      )}
    </section>
  )
}
