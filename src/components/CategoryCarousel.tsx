'use client'

import React, { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CategoryCarousel({ 
  title, count, children 
}: { 
  title: string, count: number, children: React.ReactNode 
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)

  const check = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeft(scrollLeft > 10)
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      setTimeout(check, 100)
      el.addEventListener('scroll', check, { passive: true })
      window.addEventListener('resize', check)
      return () => { el.removeEventListener('scroll', check); window.removeEventListener('resize', check) }
    }
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({ left: dir === 'left' ? -scrollRef.current.clientWidth * 0.75 : scrollRef.current.clientWidth * 0.75, behavior: 'smooth' })
    setTimeout(check, 500)
  }

  return (
    <section className="mb-8 relative group">

      {/* Título (estilo App: bold branco + ação dourada) */}
      <div className="flex items-baseline gap-3 mb-4 px-5 md:px-10 lg:px-16">
        <h2 className="text-white font-extrabold text-base md:text-xl tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {title}
        </h2>
        <span className="text-[#D4AF37] text-xs font-semibold hidden md:inline cursor-pointer hover:underline">
          Ver tudo →
        </span>
        <span className="ml-auto text-[#94A3B8] text-[0.7rem]">
          {count} {count === 1 ? 'título' : 'títulos'}
        </span>
      </div>

      <div className="relative">
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

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-8 px-5 md:px-10 lg:px-16"
        >
          {React.Children.map(children, child => (
            <div className="flex-shrink-0">{child}</div>
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
    </section>
  )
}
