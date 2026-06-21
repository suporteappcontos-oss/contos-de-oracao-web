'use client'

import React, { useState } from 'react'
import { Film, BookOpen, BookMarked, Video } from 'lucide-react'

function IgIcon({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

type CatalogoTabsLayoutProps = {
  criador: React.ReactNode
  series: React.ReactNode
  materiais: React.ReactNode
  instagram: React.ReactNode
  revistas: React.ReactNode
}

type TabType = 'series' | 'materiais' | 'revistas' | 'instagram'

export function CatalogoTabsLayout({
  criador,
  series,
  materiais,
  instagram,
  revistas
}: CatalogoTabsLayoutProps) {
  const [activeSubTab, setActiveSubTab] = useState<TabType>('series')

  return (
    <div className="space-y-8">
      {/* 1. Área de Criação Global */}
      <div className="w-full">
        {criador}
      </div>

      {/* 2. Layout com Menu Lateral */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Menu Lateral Esquerdo */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-[#111827] rounded-2xl border border-white/5 p-4 sticky top-6">
            <h2 className="text-white font-bold text-lg mb-4 px-2 tracking-tight">Acervo</h2>
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSubTab('series')}
                className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 \${
                  activeSubTab === 'series'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }\`}
              >
                <Film size={18} />
                Séries e Temporadas
              </button>

              <button
                onClick={() => setActiveSubTab('materiais')}
                className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 \${
                  activeSubTab === 'materiais'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }\`}
              >
                <BookOpen size={18} />
                Materiais Didáticos
              </button>

              <button
                onClick={() => setActiveSubTab('revistas')}
                className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 \${
                  activeSubTab === 'revistas'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }\`}
              >
                <BookMarked size={18} />
                Revistas
              </button>

              <button
                onClick={() => setActiveSubTab('instagram')}
                className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 \${
                  activeSubTab === 'instagram'
                    ? 'bg-gradient-to-r from-[#E1306C] to-[#C13584] text-white shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }\`}
              >
                <IgIcon size={18} />
                Instagram (Clipes)
              </button>
            </nav>
          </div>
        </div>

        {/* Área de Conteúdo Direito */}
        <div className="flex-grow min-w-0">
          <div className="bg-[#111827] rounded-2xl border border-white/5 p-6 md:p-8">
            {/* O conteúdo exibido depende da aba lateral selecionada */}
            <div className={activeSubTab === 'series' ? 'block' : 'hidden'}>
              {series}
            </div>

            <div className={activeSubTab === 'materiais' ? 'block' : 'hidden'}>
              {materiais}
            </div>

            <div className={activeSubTab === 'revistas' ? 'block' : 'hidden'}>
              {revistas}
            </div>

            <div className={activeSubTab === 'instagram' ? 'block' : 'hidden'}>
              {instagram}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
