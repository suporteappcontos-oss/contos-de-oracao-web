'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react'

type ProdutoType = {
  id: string
  titulo: string
  descricao: string
  link_afiliado: string
  imagem_url_1: string | null
  imagem_url_2: string | null
  imagem_url_3: string | null
  proporcao_imagem?: string
  ativo: boolean
  criado_em: string
}

export default function LojaProductCard({ produto }: { produto: ProdutoType }) {
  // Coleta as imagens válidas
  const imagens = [
    produto.imagem_url_1,
    produto.imagem_url_2,
    produto.imagem_url_3
  ].filter((url): url is string => !!url)

  const [indexAtivo, setIndexAtivo] = useState(0)

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIndexAtivo((prev) => (prev + 1) % imagens.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIndexAtivo((prev) => (prev - 1 + imagens.length) % imagens.length)
  }

  const proporcao = produto.proporcao_imagem || '1:1'
  let aspectClass = 'aspect-square'
  if (proporcao === '16:9') aspectClass = 'aspect-video'
  if (proporcao === '9:16') aspectClass = 'aspect-[9/16]'

  return (
    <div 
      className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between group hover:border-[#D4AF37]/20 transition-all duration-300"
      style={{ fontFamily: 'Outfit, sans-serif' }}
    >
      <div>
        {/* Container da Imagem com Galeria */}
        <div className={`${aspectClass} relative bg-black/40 flex items-center justify-center overflow-hidden`}>
          {imagens.length > 0 ? (
            <>
              <Image 
                src={imagens[indexAtivo]} 
                alt={`${produto.titulo} - Imagem ${indexAtivo + 1}`} 
                fill 
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              
              {/* Setas de navegação (somente se houver mais de uma imagem) */}
              {imagens.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#D4AF37] hover:text-black text-white w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10 border border-white/10 hover:border-transparent active:scale-90"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#D4AF37] hover:text-black text-white w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10 border border-white/10 hover:border-transparent active:scale-90"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {/* Indicadores (Bolinhas) na parte inferior */}
              {imagens.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {imagens.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIndexAtivo(i)
                      }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        indexAtivo === i ? 'w-4 bg-[#D4AF37]' : 'w-1.5 bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </>
          ) : (
            <ImageIcon className="text-white/10" size={56} />
          )}
        </div>

        {/* Informações do Produto */}
        <div className="p-6 space-y-3.5">
          <h3 className="text-white font-extrabold text-lg md:text-xl tracking-tight leading-snug line-clamp-2 h-14" title={produto.titulo}>
            {produto.titulo}
          </h3>
          <p className="text-white/60 text-xs md:text-sm leading-relaxed line-clamp-3 h-16">
            {produto.descricao}
          </p>
        </div>
      </div>

      <div className="p-6 pt-0">
        <a
          href={produto.link_afiliado}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#FFD700] to-[#D4AF37] hover:brightness-110 active:scale-[0.98] text-black font-black text-xs md:text-sm py-3.5 px-6 rounded-2xl transition-all shadow-[0_4px_20px_rgba(212,175,55,0.15)] no-underline"
        >
          <ShoppingCart size={16} className="shrink-0" />
          Comprar Produto
        </a>
      </div>
    </div>
  )
}
