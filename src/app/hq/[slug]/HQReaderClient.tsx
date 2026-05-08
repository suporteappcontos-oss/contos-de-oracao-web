'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, BookOpen, X, ZoomIn, ZoomOut } from 'lucide-react'

interface HQReaderClientProps {
  slug: string
  titulo: string
  totalPaginas: number
  baseUrl: string
}

export default function HQReaderClient({ slug, titulo, totalPaginas, baseUrl }: HQReaderClientProps) {
  const [pagina, setPagina] = useState(1)
  const [zoom, setZoom] = useState(false)
  const [imgError, setImgError] = useState(false)

  const irPara = useCallback((n: number) => {
    if (n < 1 || n > totalPaginas) return
    setPagina(n)
    setImgError(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [totalPaginas])

  const numFormatado = String(pagina).padStart(2, '0')
  const urlImagem = `${baseUrl}/HQ_${numFormatado}.png`

  const progresso = Math.round((pagina / totalPaginas) * 100)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#090B10' }}>

      {/* Barra superior */}
      <div className="sticky top-0 z-50 border-b border-white/5 bg-[#090B10]/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <Link href="/hq" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm">
          <X size={16} />
          <span className="hidden sm:inline">Fechar</span>
        </Link>

        <div className="flex items-center gap-3">
          <BookOpen size={15} className="text-[#D4AF37]" />
          <span className="text-white/80 text-sm font-semibold">{titulo}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(z => !z)}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
            title={zoom ? 'Reduzir' : 'Ampliar'}
          >
            {zoom ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
          </button>
          <span className="text-white/30 text-xs hidden sm:inline">
            Pág. {pagina}/{totalPaginas}
          </span>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="h-0.5 bg-white/5">
        <div
          className="h-full bg-[#D4AF37] transition-all duration-500"
          style={{ width: `${progresso}%` }}
        />
      </div>

      {/* Imagem da página */}
      <div className="flex-1 flex items-start justify-center py-6 px-4">
        <div
          className={`relative transition-all duration-300 rounded-xl overflow-hidden shadow-2xl border border-white/10
            ${zoom ? 'w-full max-w-4xl' : 'w-full max-w-2xl'}`}
        >
          {imgError ? (
            <div className="aspect-[2/3] flex flex-col items-center justify-center text-white/30 gap-4 bg-white/5">
              <BookOpen size={48} className="opacity-30" />
              <p className="text-sm">Página não encontrada</p>
              <button
                onClick={() => irPara(pagina - 1)}
                className="text-[#D4AF37] text-sm underline"
              >
                Voltar para página anterior
              </button>
            </div>
          ) : (
            <Image
              key={urlImagem}
              src={urlImagem}
              alt={`${titulo} — Página ${pagina}`}
              width={800}
              height={1200}
              className="w-full h-auto object-contain"
              priority
              onError={() => setImgError(true)}
              unoptimized
            />
          )}
        </div>
      </div>

      {/* Navegação inferior */}
      <div className="sticky bottom-0 z-50 bg-[#090B10]/95 backdrop-blur-sm border-t border-white/5 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">

          {/* Botão anterior */}
          <button
            onClick={() => irPara(pagina - 1)}
            disabled={pagina <= 1}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all
              disabled:opacity-30 disabled:cursor-not-allowed
              bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          {/* Seletor de página */}
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 overflow-x-auto flex gap-1.5 py-1 scrollbar-hide">
              {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  onClick={() => irPara(n)}
                  className={`flex-shrink-0 w-8 h-8 rounded-lg text-xs font-bold transition-all
                    ${n === pagina
                      ? 'bg-[#D4AF37] text-black'
                      : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Botão próxima */}
          <button
            onClick={() => irPara(pagina + 1)}
            disabled={pagina >= totalPaginas}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all
              disabled:opacity-30 disabled:cursor-not-allowed
              border text-black font-bold"
            style={{
              background: pagina >= totalPaginas ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #D4AF37, #F5D67B)',
              borderColor: pagina >= totalPaginas ? 'rgba(255,255,255,0.1)' : '#D4AF37',
              color: pagina >= totalPaginas ? 'rgba(255,255,255,0.3)' : '#000',
            }}
          >
            <span className="hidden sm:inline">Próxima</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
