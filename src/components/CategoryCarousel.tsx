'use client'

import React, { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CategoryCarousel({ 
  title, 
  count, 
  children 
}: { 
  title: string
  count: number
  children: React.ReactNode 
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeft(scrollLeft > 10)
    setShowRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      setTimeout(checkScroll, 100)
      el.addEventListener('scroll', checkScroll, { passive: true })
      window.addEventListener('resize', checkScroll)
      return () => {
        el.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.75
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
    setTimeout(checkScroll, 500)
  }

  return (
    <section className="mb-8 md:mb-12 relative">

      {/* Título da Categoria */}
      <div className="flex items-baseline gap-3 mb-4 md:mb-5 px-6 md:px-12 lg:px-16">
        <h2 className="text-white text-base md:text-xl font-bold tracking-tight">
          {title}
        </h2>
        <span className="text-[#00a8e1] text-xs md:text-sm font-semibold hidden md:inline">
          Ver tudo
        </span>
        <span className="text-[#8197a4] text-[0.7rem] font-normal ml-auto">
          {count} {count === 1 ? 'título' : 'títulos'}
        </span>
      </div>

      {/* Wrapper com setas */}
      <div className="relative group">

        {/* Seta Esquerda */}
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-6 z-10 w-12 md:w-14 flex items-center justify-center bg-gradient-to-r from-[#0f171e] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-[#00a8e1] text-white"
          >
            <div className="w-9 h-9 rounded-full bg-[#1a2733]/90 border border-[#1e3040] flex items-center justify-center hover:bg-[#00a8e1] hover:border-[#00a8e1] transition-all duration-200 shadow-xl">
              <ChevronLeft size={18} />
            </div>
          </button>
        )}

        {/* Container scrollável */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-8 px-6 md:px-12 lg:px-16"
        >
          {React.Children.map(children, child => (
            <div className="flex-shrink-0">
              {child}
            </div>
          ))}
        </div>

        {/* Seta Direita */}
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-0 bottom-6 z-10 w-12 md:w-14 flex items-center justify-center bg-gradient-to-l from-[#0f171e] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-[#00a8e1] text-white"
          >
            <div className="w-9 h-9 rounded-full bg-[#1a2733]/90 border border-[#1e3040] flex items-center justify-center hover:bg-[#00a8e1] hover:border-[#00a8e1] transition-all duration-200 shadow-xl">
              <ChevronRight size={18} />
            </div>
          </button>
        )}
      </div>
    </section>
  )
}
