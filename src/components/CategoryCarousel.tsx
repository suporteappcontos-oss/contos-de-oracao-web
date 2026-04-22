'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArr, setShowLeftArr] = useState(false)
  const [showRightArr, setShowRightArr] = useState(true)

  const checkScroll = () => {
    if (!scrollContainerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
    setShowLeftArr(scrollLeft > 0)
    // Se ainda puder rolar para a direita
    setShowRightArr(scrollLeft < scrollWidth - clientWidth - 5)
  }

  // Verificar caso no primeiro render o conteúdo não ocupe tela toda
  useEffect(() => {
    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    const scroller = scrollContainerRef.current
    const scrollAmount = direction === 'left' ? -scroller.clientWidth * 0.75 : scroller.clientWidth * 0.75
    
    scroller.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    setTimeout(checkScroll, 400) // Recheca o botão após a rolagem suave
  }

  return (
    <section className="mb-10 pl-4 md:pl-8 overflow-hidden group">
      {/* Título da Categoria */}
      <h2 className="text-white text-lg md:text-2xl font-bold mb-4 flex items-baseline gap-3">
        {title} 
        <span className="text-white/30 text-xs md:text-sm font-normal">
          {count} {count === 1 ? 'vídeo' : 'vídeos'}
        </span>
      </h2>

      {/* Container com Botões de Navegação */}
      <div className="relative">
        
        {/* Setas Esquerda */}
        {showLeftArr && (
          <button 
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-8 top-1/2 -translate-y-1/2 z-10 w-12 h-full items-center justify-center bg-gradient-to-r from-[#0C121D] to-transparent opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#FFD700] text-white"
          >
            <ChevronLeft size={40} className="drop-shadow-lg" />
          </button>
        )}

        {/* Lista Arrastável */}
        <motion.div 
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-6 pr-4"
        >
          {React.Children.map(children, child => (
            <div className="snap-start snap-always">
              {child}
            </div>
          ))}
        </motion.div>

        {/* Seta Direita */}
        {showRightArr && (
          <button 
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-16 h-full items-center justify-center bg-gradient-to-l from-[#0C121D] to-transparent opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#FFD700] text-white"
          >
            <ChevronRight size={40} className="drop-shadow-lg" />
          </button>
        )}
      </div>
    </section>
  )
}
