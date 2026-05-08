'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, X, PanelRight, PanelRightClose, Download, Lock, CheckCircle2 } from 'lucide-react'

interface HQReaderClientProps {
  slug: string
  titulo: string
  totalPaginas: number
  baseUrl: string
  podeDownload: boolean
}

export default function HQReaderClient({ slug, titulo, totalPaginas, baseUrl, podeDownload }: HQReaderClientProps) {
  const [pagina, setPagina] = useState(1)
  const [sidebarAberta, setSidebarAberta] = useState(true)
  const [imgError, setImgError] = useState(false)
  const [modalDownload, setModalDownload] = useState(false)
  const [baixando, setBaixando] = useState(false)
  const [progBaixar, setProgBaixar] = useState(0)
  const thumbAtiva = useRef<HTMLButtonElement>(null)

  const irPara = useCallback((n: number) => {
    if (n < 1 || n > totalPaginas) return
    setPagina(n)
    setImgError(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [totalPaginas])

  // Navegar com teclado
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') irPara(pagina + 1)
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') irPara(pagina - 1)
      if (e.key === 'Escape') setModalDownload(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pagina, irPara])

  // Scroll automático para miniatura ativa
  useEffect(() => {
    thumbAtiva.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [pagina])

  const numFormatado = String(pagina).padStart(2, '0')
  const urlImagem = `${baseUrl}/HQ_${numFormatado}.png`
  const progresso = Math.round((pagina / totalPaginas) * 100)

  // Baixar página atual
  function baixarPaginaAtual() {
    const link = document.createElement('a')
    link.href = urlImagem
    link.download = `${titulo.replace(/\s+/g, '-')}-pagina-${pagina}.png`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Baixar todas as páginas (uma a uma com intervalo)
  async function baixarTodasPaginas() {
    setBaixando(true)
    setProgBaixar(0)
    for (let i = 1; i <= totalPaginas; i++) {
      const num = String(i).padStart(2, '0')
      const url = `${baseUrl}/HQ_${num}.png`
      const link = document.createElement('a')
      link.href = url
      link.download = `${titulo.replace(/\s+/g, '-')}-pagina-${i}.png`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setProgBaixar(Math.round((i / totalPaginas) * 100))
      // Aguarda entre downloads para o browser aceitar
      await new Promise(r => setTimeout(r, 800))
    }
    setBaixando(false)
    setProgBaixar(100)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#0A0C11' }}>

      {/* ── TOPBAR ── */}
      <div className="shrink-0 z-50 border-b border-white/5 bg-[#0A0C11]/98 backdrop-blur-sm px-4 py-2.5 flex items-center justify-between gap-4">
        <Link href="/watch" className="flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm shrink-0">
          <X size={15} />
          <span className="hidden sm:inline text-xs">Fechar</span>
        </Link>

        {/* Barra de progresso central */}
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <span className="text-white/70 text-xs font-semibold truncate max-w-[200px]">{titulo}</span>
          <div className="w-full max-w-[260px] h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progresso}%`, background: 'linear-gradient(90deg, #D4AF37, #F5D67B)' }}
            />
          </div>
          <span className="text-white/30 text-[10px]">Página {pagina} de {totalPaginas}</span>
        </div>

        {/* Direita: Download + Toggle */}
        <div className="shrink-0 flex items-center gap-2">

          {/* Botão Download — ouro se pode baixar, cadeado se não pode */}
          {podeDownload ? (
            <button
              onClick={() => setModalDownload(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all hover:brightness-110 active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D67B)', color: '#000' }}
              title="Baixar HQ"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Baixar HQ</span>
            </button>
          ) : (
            <Link
              href="/planos"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all border border-white/10 hover:border-[#D4AF37]/40 text-white/40 hover:text-white/70"
              title="Faça upgrade para Essencial ou Pro para baixar"
            >
              <Lock size={13} />
              <span className="hidden sm:inline">Download</span>
            </Link>
          )}

          <button
            onClick={() => setSidebarAberta(s => !s)}
            className="p-2 rounded-lg text-white/40 hover:text-[#D4AF37] hover:bg-white/5 transition-all"
            title={sidebarAberta ? 'Ocultar páginas' : 'Ver todas as páginas'}
          >
            {sidebarAberta ? <PanelRightClose size={17} /> : <PanelRight size={17} />}
          </button>
        </div>

      </div>

      {/* ── CORPO ── */}
      <div className="flex flex-1 min-h-0">

        {/* ── ÁREA PRINCIPAL ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Imagem da página */}
          <div className="flex-1 overflow-y-auto flex items-start justify-center p-4 md:p-6">
            <div className="w-full max-w-2xl">
              {imgError ? (
                <div className="aspect-[2/3] flex flex-col items-center justify-center text-white/30 gap-4 bg-white/5 rounded-xl">
                  <span className="text-4xl">📖</span>
                  <p className="text-sm">Página não disponível</p>
                  <button onClick={() => irPara(pagina - 1)} className="text-[#D4AF37] text-sm underline">
                    Voltar
                  </button>
                </div>
              ) : (
                <Image
                  key={urlImagem}
                  src={urlImagem}
                  alt={`${titulo} — Página ${pagina}`}
                  width={800}
                  height={1200}
                  className="w-full h-auto rounded-xl shadow-2xl"
                  priority
                  onError={() => setImgError(true)}
                  unoptimized
                />
              )}
            </div>
          </div>

          {/* ── NAVEGAÇÃO INFERIOR ── */}
          <div className="shrink-0 border-t border-white/5 bg-[#0A0C11]/95 backdrop-blur-sm px-4 py-3 flex items-center justify-center gap-4">
            <button
              onClick={() => irPara(pagina - 1)}
              disabled={pagina <= 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all
                disabled:opacity-25 disabled:cursor-not-allowed
                bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95"
            >
              <ChevronLeft size={16} />
              <span>Anterior</span>
            </button>

            {/* Input de página rápida */}
            <div className="flex items-center gap-2 text-white/50 text-sm">
              <input
                type="number"
                min={1}
                max={totalPaginas}
                value={pagina}
                onChange={e => irPara(Number(e.target.value))}
                className="w-14 text-center bg-white/5 border border-white/10 rounded-lg py-1.5 text-white text-sm outline-none focus:border-[#D4AF37]/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span>/ {totalPaginas}</span>
            </div>

            <button
              onClick={() => irPara(pagina + 1)}
              disabled={pagina >= totalPaginas}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
                disabled:opacity-25 disabled:cursor-not-allowed active:scale-95"
              style={{
                background: pagina >= totalPaginas ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #D4AF37, #F5D67B)',
                color: pagina >= totalPaginas ? 'rgba(255,255,255,0.2)' : '#000',
              }}
            >
              <span>Próxima</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* ── PAINEL LATERAL DE MINIATURAS ── */}
        <div
          className={`shrink-0 border-l border-white/5 bg-[#080A0F] flex flex-col transition-all duration-300 overflow-hidden
            ${sidebarAberta ? 'w-[130px] md:w-[160px]' : 'w-0'}`}
        >
          <div className="p-2 border-b border-white/5 shrink-0">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest text-center">Páginas</p>
          </div>

          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 scrollbar-hide">
            {Array.from({ length: totalPaginas }, (_, i) => {
              const n = i + 1
              const numStr = String(n).padStart(2, '0')
              const isAtiva = n === pagina
              return (
                <button
                  key={n}
                  ref={isAtiva ? thumbAtiva : null}
                  onClick={() => irPara(n)}
                  className={`relative w-full rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0
                    ${isAtiva
                      ? 'border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.4)] scale-[1.02]'
                      : 'border-white/5 hover:border-white/20 opacity-60 hover:opacity-100'
                    }`}
                  title={`Página ${n}`}
                >
                  <div className={`absolute top-1 left-1 z-10 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black
                    ${isAtiva ? 'bg-[#D4AF37] text-black' : 'bg-black/70 text-white/60'}`}>
                    {n}
                  </div>

                  <Image
                    src={`${baseUrl}/HQ_${numStr}.png`}
                    alt={`Página ${n}`}
                    width={140}
                    height={200}
                    className="w-full h-auto object-cover"
                    unoptimized
                    loading={n <= 3 ? 'eager' : 'lazy'}
                  />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── MODAL DE DOWNLOAD ── */}
      {modalDownload && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalDownload(false) }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
            style={{ background: 'linear-gradient(145deg, #111827, #0D1117)' }}
          >
            {/* Header do modal */}
            <div className="px-6 pt-6 pb-4 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-white font-black text-lg">Baixar HQ</h2>
                <p className="text-white/40 text-xs mt-0.5">{titulo} · {totalPaginas} páginas</p>
              </div>
              <button onClick={() => setModalDownload(false)} className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Opções */}
            <div className="p-6 space-y-3">

              {/* Baixar página atual */}
              <button
                onClick={baixarPaginaAtual}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/8 hover:border-[#D4AF37]/30 bg-white/2 hover:bg-[#D4AF37]/5 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #F5D67B)' }}>
                  <Download size={18} className="text-black" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-sm group-hover:text-[#D4AF37] transition-colors">Baixar Página Atual</div>
                  <div className="text-white/40 text-xs">Apenas a página {pagina} (PNG)</div>
                </div>
              </button>

              {/* Baixar todas as páginas */}
              <button
                onClick={baixarTodasPaginas}
                disabled={baixando}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/8 hover:border-emerald-400/30 bg-white/2 hover:bg-emerald-400/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                  {baixando ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 size={18} className="text-white" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <div className="text-white font-bold text-sm group-hover:text-emerald-400 transition-colors">
                    {baixando ? `Baixando... ${progBaixar}%` : 'Baixar Todas as Páginas'}
                  </div>
                  <div className="text-white/40 text-xs">{totalPaginas} arquivos PNG individuais</div>
                  {baixando && (
                    <div className="mt-2 w-full h-1 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-400 transition-all duration-500" style={{ width: `${progBaixar}%` }} />
                    </div>
                  )}
                </div>
              </button>
            </div>

            {/* Rodapé */}
            <div className="px-6 pb-5">
              <p className="text-white/20 text-[10px] text-center leading-relaxed">
                ⚠️ Use apenas para uso pessoal. A reprodução e distribuição são proibidas pelos Termos de Uso.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
