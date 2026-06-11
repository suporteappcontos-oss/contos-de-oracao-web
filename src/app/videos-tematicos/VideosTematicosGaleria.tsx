'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Download, Play, SkipForward } from 'lucide-react'

// O ícone do Instagram
function IgIcon({ size = 10 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

type VideoTematico = {
  id: string
  titulo: string
  descricao: string | null
  video_url: string
  capa_url: string | null
  criado_em: string
}

function extrairVideoId(embedUrl: string): string | null {
  const partes = embedUrl.split('/')
  return partes[partes.length - 1] || null
}

export default function VideosTematicosGaleria({ videos }: { videos: VideoTematico[] }) {
  const [videoAtualIndex, setVideoAtualIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  // Estado para o contador do próximo vídeo
  const [mostrarProximo, setMostrarProximo] = useState(false)
  const [segundosProximo, setSegundosProximo] = useState(10)
  const [cancelouProximo, setCancelouProximo] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Limpa timer quando o modal fecha ou troca de vídeo
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setMostrarProximo(false)
    setSegundosProximo(10)
    setCancelouProximo(false)
  }, [videoAtualIndex])

  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Lida com as mensagens do iframe (Bunny.net usa o protocolo player.js)
  useEffect(() => {
    if (videoAtualIndex === null) return

    // Tenta forçar a inscrição caso o "ready" tenha sido disparado antes do nosso useEffect
    const inscreverEventos = () => {
      if (iframeRef.current?.contentWindow) {
        const win = iframeRef.current.contentWindow
        win.postMessage(JSON.stringify({
          context: 'player.js', version: '0.0.11', method: 'addEventListener', value: 'ended', listener: 'ended-listener'
        }), '*')
        win.postMessage(JSON.stringify({
          context: 'player.js', version: '0.0.11', method: 'addEventListener', value: 'timeupdate', listener: 'time-listener'
        }), '*')
      }
    }

    // Tenta agora e mais uma vez depois de 1.5s pra garantir
    inscreverEventos()
    const fallbackTimer = setTimeout(inscreverEventos, 1500)

    const handleMessage = (e: MessageEvent) => {
      let data
      try {
        data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
      } catch (err) { return }

      // Aceita apenas mensagens no formato player.js
      if (data.context !== 'player.js') return

      // Quando o player estiver pronto, nos inscrevemos nos eventos
      if (data.event === 'ready') {
        inscreverEventos()
      }

      // Processa os eventos recebidos
      if (data.event === 'ended') {
        iniciarContagemProximo()
      } else if (data.event === 'timeupdate' && data.value) {
        const current = data.value.seconds || 0
        const duration = data.value.duration || 0
        
        // Se faltar 10 segundos ou menos, inicia a contagem do card
        if (duration > 10 && (duration - current) <= 10 && (duration - current) > 0) {
          iniciarContagemProximo((duration - current).toFixed(0))
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
      clearTimeout(fallbackTimer)
    }
  }, [videoAtualIndex])

  const iniciarContagemProximo = (initialSeconds?: string) => {
    if (videoAtualIndex === null || cancelouProximo || mostrarProximo) return
    const temProximo = videoAtualIndex + 1 < videos.length
    if (!temProximo) return

    setMostrarProximo(true)
    let secs = initialSeconds ? parseInt(initialSeconds) : 10
    setSegundosProximo(secs)

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      secs -= 1
      if (secs <= 0) {
        if (timerRef.current) clearInterval(timerRef.current)
        irParaProximo()
      } else {
        setSegundosProximo(secs)
      }
    }, 1000)
  }

  const irParaProximo = () => {
    if (videoAtualIndex !== null && videoAtualIndex + 1 < videos.length) {
      setVideoAtualIndex(videoAtualIndex + 1)
    }
  }

  const fecharModal = () => {
    setVideoAtualIndex(null)
  }

  const videoAtivo = videoAtualIndex !== null ? videos[videoAtualIndex] : null
  const proximoVideo = videoAtualIndex !== null && videoAtualIndex + 1 < videos.length ? videos[videoAtualIndex + 1] : null

  return (
    <>
      {/* ── GRADE DE VÍDEOS ── */}
      {videos.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <IgIcon size={48} />
          <p className="text-lg font-bold mt-4">Nenhum vídeo disponível ainda.</p>
          <p className="text-sm mt-1">Em breve novos conteúdos serão publicados aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {videos.map((video, idx) => {
            const capaUrl = video.capa_url || '/insta.png'
            return (
              <div
                key={video.id}
                className="group flex flex-col rounded-[20px] overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl"
                style={{ background: 'rgba(15,22,35,0.9)', border: '1px solid rgba(225,48,108,0.2)' }}
              >
                <div
                  className="relative w-full overflow-hidden cursor-pointer"
                  style={{ aspectRatio: '9/16' }}
                  onClick={() => setVideoAtualIndex(idx)}
                >
                  <img
                    src={capaUrl}
                    alt={video.titulo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div
                    className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-wider z-10"
                    style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)', color: '#fff' }}
                  >
                    <IgIcon size={10} /> Instagram
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
                      style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C)', boxShadow: '0 0 30px rgba(225,48,108,0.6)' }}
                    >
                      <Play size={22} fill="white" className="text-white ml-1" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 p-5 flex-1">
                  <h3 className="text-white font-extrabold text-base leading-tight">
                    {video.titulo}
                  </h3>
                  {video.descricao && (
                    <p className="text-white/55 text-xs leading-relaxed line-clamp-2">{video.descricao}</p>
                  )}
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => setVideoAtualIndex(idx)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all hover:scale-[1.03] hover:brightness-110"
                      style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)', color: '#fff', boxShadow: '0 4px 20px rgba(225,48,108,0.3)' }}
                    >
                      <Play size={13} fill="white" />
                      Assistir
                    </button>
                    <a
                      href={`/api/download-video?videoId=${extrairVideoId(video.video_url)}&titulo=${encodeURIComponent(video.titulo)}`}
                      download
                      title="Baixar vídeo"
                      className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-black transition-all hover:scale-[1.03]"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    >
                      <Download size={14} />
                      Baixar
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── MODAL PLAYER (RENDERIZADO VIA PORTAL) ── */}
      {videoAtivo && mounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-0 md:p-8"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(15px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) fecharModal() }}
        >
          {/* Main Modal Container */}
          <div 
            className="relative w-full h-full md:h-auto md:max-w-[1100px] flex flex-col-reverse md:flex-row bg-[#0A0D14] md:rounded-[32px] overflow-hidden shadow-2xl border-0 md:border"
            style={{ 
              borderColor: 'rgba(225,48,108,0.2)', 
            }}
          >
            {/* Botão fechar */}
            <button
              onClick={fecharModal}
              className="absolute top-4 right-4 md:top-6 md:right-6 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}
            >
              <X size={20} className="text-white" />
            </button>

            {/* Lado Esquerdo: Detalhes e Descrição */}
            <div className="flex-1 p-8 md:p-14 flex flex-col justify-center relative overflow-y-auto"
                 style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(225,48,108,0.5) transparent' }}>
              
              {/* Efeito de brilho de fundo */}
              <div 
                className="absolute top-0 left-0 w-full h-full opacity-[0.08] pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, #E1306C 0%, transparent 60%)' }}
              />
              
              <div className="relative z-10 flex flex-col">
                {/* Badge */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[0.75rem] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(225,48,108,0.3)]"
                    style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)', color: '#fff' }}
                  >
                    <IgIcon size={12} /> Exclusivo Instagram
                  </div>
                </div>

                {/* Título */}
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                  {videoAtivo.titulo}
                </h2>

                {/* Descrição */}
                <div className="text-white/70 text-base md:text-lg leading-relaxed space-y-4 whitespace-pre-wrap font-medium">
                  {videoAtivo.descricao || <span className="italic opacity-50 font-normal">Nenhuma descrição disponível para este vídeo.</span>}
                </div>

                {/* Card de Próximo Vídeo (Automático) */}
                {mostrarProximo && proximoVideo && (
                  <div className="mt-8 p-5 rounded-[20px] overflow-hidden relative shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                       style={{ background: 'linear-gradient(145deg, rgba(20,25,40,0.95), rgba(10,15,25,0.95))', border: '1px solid rgba(225,48,108,0.3)' }}>
                    
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {/* Thumb */}
                      <div className="w-16 h-24 sm:w-20 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden border border-white/10 relative">
                        <img src={proximoVideo.capa_url || '/insta.png'} alt="Próximo" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play size={20} fill="white" className="text-white opacity-80" />
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className="text-[#E1306C] font-black text-xs tracking-widest uppercase mb-1">
                          Próximo em {segundosProximo}s...
                        </div>
                        <h4 className="text-white font-bold text-sm sm:text-base leading-snug line-clamp-2 mb-4">
                          {proximoVideo.titulo}
                        </h4>
                        
                        {/* Botões */}
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={irParaProximo}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-105"
                            style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C)', color: '#fff' }}
                          >
                            <SkipForward size={14} fill="white" /> Assistir Agora
                          </button>
                          <button
                            onClick={() => {
                              setMostrarProximo(false)
                              setCancelouProximo(true)
                              if (timerRef.current) clearInterval(timerRef.current)
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-white/10"
                            style={{ background: 'rgba(255,255,255,0.05)', color: '#ccc' }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de progresso do timer no fundo */}
                    <div className="absolute bottom-0 left-0 h-1 bg-[#E1306C] transition-all duration-1000 ease-linear"
                         style={{ width: `${(segundosProximo / 10) * 100}%` }} />
                  </div>
                )}

                {/* Ações / Footer da esquerda */}
                <div className="mt-10 pt-8 flex flex-wrap gap-4 shrink-0">
                  <a
                    href={`/api/download-video?videoId=${extrairVideoId(videoAtivo.video_url)}&titulo=${encodeURIComponent(videoAtivo.titulo)}`}
                    download
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-[18px] text-sm font-black transition-all hover:scale-[1.03] hover:shadow-[0_0_30px_rgba(225,48,108,0.5)] w-full sm:w-auto"
                    style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)', color: '#fff' }}
                  >
                    <Download size={20} />
                    Fazer Download
                  </a>
                </div>
              </div>
            </div>

            {/* Lado Direito: Player (9:16) */}
            <div className="relative bg-black flex-shrink-0 md:border-l border-white/5">
              <div 
                className="relative w-full aspect-[9/16] md:aspect-auto md:h-[min(85vh,800px)] md:w-[calc(min(85vh,800px)*9/16)]"
              >
                <iframe
                  ref={iframeRef}
                  key={`iframe-${videoAtivo.id}`}
                  src={`${videoAtivo.video_url}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen"
                  allowFullScreen
                />
              </div>
            </div>

          </div>
        </div>
      , document.body)}
    </>
  )
}
