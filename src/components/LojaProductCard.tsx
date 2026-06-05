'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ShoppingCart, ChevronLeft, ChevronRight, Image as ImageIcon, X } from 'lucide-react'

type ProdutoType = {
  id: string
  titulo: string
  descricao: string
  link_afiliado: string
  imagem_url_1: string | null
  imagem_url_2: string | null
  imagem_url_3: string | null
  imagens_urls?: string[] | null
  proporcao_imagem?: string
  ativo: boolean
  criado_em: string
}

export default function LojaProductCard({ produto }: { produto: ProdutoType }) {
  // Coleta as imagens válidas usando prioritariamente o array dinâmico
  const imagens = (
    produto.imagens_urls && produto.imagens_urls.length > 0
      ? produto.imagens_urls
      : [produto.imagem_url_1, produto.imagem_url_2, produto.imagem_url_3]
  ).filter((url): url is string => !!url)

  const [indexAtivo, setIndexAtivo] = useState(0)
  const [modalDetalhesAberto, setModalDetalhesAberto] = useState(false)

  // Autoplay de 2 segundos contínuo
  useEffect(() => {
    if (imagens.length <= 1) return

    const interval = setInterval(() => {
      setIndexAtivo((prev) => (prev + 1) % imagens.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [imagens.length])

  // Bloqueia a rolagem do body da página quando o modal de detalhes estiver aberto
  useEffect(() => {
    if (modalDetalhesAberto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [modalDetalhesAberto])

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
  let aspectClass = 'aspect-square max-h-[380px] sm:max-h-none'
  if (proporcao === '16:9') aspectClass = 'aspect-video'
  if (proporcao === '9:16') aspectClass = 'aspect-[9/16] max-h-[420px] sm:max-h-none'

  return (
    <>
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
          <div className="p-5 md:p-6 space-y-3">
            <h3 className="text-white font-extrabold text-lg md:text-xl tracking-tight leading-snug line-clamp-2 h-14" title={produto.titulo}>
              {produto.titulo}
            </h3>
            <p className="text-white/60 text-xs md:text-sm leading-relaxed line-clamp-3 h-14 md:h-16">
              {produto.descricao}
            </p>
          </div>
        </div>

        {/* Botões de Ação otimizados para Mobile */}
        <div className="p-5 md:p-6 pt-0 flex gap-2.5">
          <button
            onClick={() => setModalDetalhesAberto(true)}
            className="flex-1 py-3 px-3 font-bold rounded-xl text-white/80 hover:text-white bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-[11px] md:text-xs border border-white/10 cursor-pointer text-center"
          >
            Detalhes
          </button>
          <a
            href={produto.link_afiliado}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-[1.4] flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#FFD700] to-[#D4AF37] hover:brightness-110 active:scale-[0.98] text-black font-black text-[11px] md:text-xs py-3 px-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(212,175,55,0.15)] no-underline text-center"
          >
            <ShoppingCart size={13} className="shrink-0" />
            Comprar
          </a>
        </div>
      </div>

      {/* Modal de Detalhes Completo */}
      {modalDetalhesAberto && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-4 bg-black/90 backdrop-blur-md"
          style={{
            animation: 'fadeIn 0.25s ease-out forwards'
          }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes scaleIn {
              from { transform: scale(0.96); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
          
          <div 
            className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            style={{
              animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
              fontFamily: 'Outfit, sans-serif'
            }}
          >
            {/* Cabeçalho */}
            <div className="p-5 md:p-6 border-b border-white/5 flex justify-between items-center bg-[#090B10]/40">
              <h3 className="text-base md:text-lg font-black text-white tracking-tight leading-snug line-clamp-1 pr-4" title={produto.titulo}>
                {produto.titulo}
              </h3>
              <button 
                onClick={() => setModalDetalhesAberto(false)} 
                className="text-white/50 hover:text-white p-1.5 hover:bg-white/5 rounded-full transition-colors cursor-pointer shrink-0"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Conteúdo com rolagem */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 scrollbar-thin">
              {/* Carrossel de Imagens no Modal */}
              <div className="aspect-video relative bg-black/55 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
                {imagens.length > 0 ? (
                  <>
                    <Image 
                      src={imagens[indexAtivo]} 
                      alt={produto.titulo} 
                      fill 
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                    
                    {imagens.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#D4AF37] hover:text-black text-white w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 border border-white/10 active:scale-90"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-[#D4AF37] hover:text-black text-white w-8 h-8 rounded-full flex items-center justify-center transition-all z-10 border border-white/10 active:scale-90"
                        >
                          <ChevronRight size={16} />
                        </button>
                        
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
                      </>
                    )}
                  </>
                ) : (
                  <ImageIcon className="text-white/10" size={56} />
                )}
              </div>

              {/* Informações detalhadas */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-black">Sobre o Produto</h4>
                <p className="text-white/85 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-medium">
                  {produto.descricao}
                </p>
              </div>
            </div>
            
            {/* Rodapé com botões */}
            <div className="p-5 md:p-6 border-t border-white/5 bg-[#090B10]/40 flex gap-3">
              <button
                onClick={() => setModalDetalhesAberto(false)}
                className="flex-1 py-3 md:py-3.5 font-bold rounded-2xl text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all text-xs md:text-sm cursor-pointer border border-white/5"
              >
                Voltar
              </button>
              <a
                href={produto.link_afiliado}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-[#FFD700] to-[#D4AF37] hover:brightness-110 active:scale-[0.98] text-black font-black text-xs md:text-sm py-3 md:py-3.5 px-4 rounded-2xl transition-all shadow-[0_4px_20px_rgba(212,175,55,0.15)] no-underline text-center"
              >
                <ShoppingCart size={15} className="shrink-0" />
                Ir para o Site de Compra
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
