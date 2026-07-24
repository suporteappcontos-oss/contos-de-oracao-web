'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { RotateCcw, Play, X } from 'lucide-react'

// Gera ou recupera um token único para esta aba
function getDeviceToken(): string {
  if (typeof window === 'undefined') return ''
  let token = sessionStorage.getItem('cdo_device_token')
  if (!token) {
    token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    sessionStorage.setItem('cdo_device_token', token)
  }
  return token
}

function formatarSegundos(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

type Props = {
  videoId: string
  embedUrl: string
  proximoVideo?: {
    id: string
    titulo: string
    thumbnail_url: string | null
    bunny_video_id: string | null
    bunny_library_id: string
    duracao: string | null
  } | null
  emBreve?: boolean
  thumbnailUrl?: string | null
}

export default function VideoPlayerGuard({ videoId, embedUrl, proximoVideo, emBreve, thumbnailUrl }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<'verificando' | 'liberado' | 'bloqueado' | 'derrubado'>('verificando')
  const [showNextOverlay, setShowNextOverlay] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(10)

  // Estado para o card "Continuar de onde parou"
  const [showResumeCard, setShowResumeCard] = useState(false)
  const [resumeTime, setResumeTime] = useState<number>(0)

  const overlayDismissedRef = useRef(false)
  const navigatingRef = useRef(false)
  const proximoVideoRef = useRef(proximoVideo)

  useEffect(() => {
    proximoVideoRef.current = proximoVideo
  }, [proximoVideo])
  
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const realtimeRef = useRef<ReturnType<typeof createClient> | null>(null)
  const deviceToken = useRef<string>('')
  const statusRef = useRef<string>('verificando')

  const hasResumedRef = useRef(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Atualiza status e o ref junto
  const updateStatus = useCallback((s: typeof status) => {
    statusRef.current = s
    setStatus(s)
  }, [])

  // Registra sessão e inicia escuta em tempo real
  const iniciarSessao = useCallback(async () => {
    const token = getDeviceToken()
    deviceToken.current = token

    try {
      const res = await fetch('/api/sessoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_token: token, video_id: videoId }),
      })

      if (res.status === 429) {
        updateStatus('bloqueado')
        return
      }

      if (!res.ok) {
        console.warn('Erro ao registrar sessão, liberando player.')
        updateStatus('liberado')
        return
      }

      updateStatus('liberado')

      // ── REALTIME: escuta mudanças na tabela sessoes_ativas ─────────────
      const supabase = createClient()
      realtimeRef.current = supabase

      supabase
        .channel('sessao-radar')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sessoes_ativas' },
          async () => {
            if (statusRef.current === 'derrubado') return

            const hbRes = await fetch('/api/sessoes', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ device_token: token }),
            })

            if (hbRes.status === 403) {
              updateStatus('derrubado')
              if (heartbeatRef.current) clearInterval(heartbeatRef.current)
            }
          }
        )
        .subscribe()

      // Heartbeat de segurança a cada 10s
      heartbeatRef.current = setInterval(async () => {
        if (statusRef.current === 'derrubado') {
          clearInterval(heartbeatRef.current!)
          return
        }
        const hbRes = await fetch('/api/sessoes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_token: token }),
        })
        if (hbRes.status === 403) {
          updateStatus('derrubado')
          if (heartbeatRef.current) clearInterval(heartbeatRef.current)
        }
      }, 10_000)

    } catch {
      updateStatus('liberado')
    }
  }, [videoId, updateStatus])

  // Remove a sessão ao sair da página
  const encerrarSessao = useCallback(() => {
    if (!deviceToken.current) return
    navigator.sendBeacon(
      '/api/sessoes',
      JSON.stringify({ device_token: deviceToken.current })
    )
  }, [])

  // Checa progresso salvo no localStorage ao carregar o vídeo
  useEffect(() => {
    setShowNextOverlay(false)
    setSecondsRemaining(10)
    overlayDismissedRef.current = false
    navigatingRef.current = false
    hasResumedRef.current = false

    try {
      const raw = localStorage.getItem(`cdo_progress_${videoId}`)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed.seconds === 'number' && parsed.seconds > 10) {
          setResumeTime(Math.floor(parsed.seconds))
          setShowResumeCard(true)

          // Auto-oculta o card de resumir após 12 segundos se não for clicado
          const t = setTimeout(() => {
            setShowResumeCard(false)
          }, 12000)
          return () => clearTimeout(t)
        }
      }
    } catch {}
    setShowResumeCard(false)
    setResumeTime(0)
  }, [videoId])

  const handleContinuarDeOndeParou = () => {
    hasResumedRef.current = true
    if (iframeRef.current && resumeTime > 0) {
      try {
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({
            context: 'player.js',
            method: 'setCurrentTime',
            value: resumeTime
          }),
          '*'
        )
        iframeRef.current.contentWindow?.postMessage(
          JSON.stringify({
            context: 'player.js',
            method: 'play',
            value: ''
          }),
          '*'
        )
      } catch (err) {
        console.error('Erro ao buscar tempo salvo:', err)
      }
    }
    setShowResumeCard(false)
  }

  useEffect(() => {
    iniciarSessao()

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        
        // Padrão Player.js (usado pelo Bunny) ou eventos genéricos
        if (data && (data.event === 'timeupdate' || data.type === 'timeupdate')) {
          const value = data.value || data.data
          if (value && typeof value.seconds === 'number' && typeof value.duration === 'number') {
            const seconds = value.seconds
            const duration = value.duration
            const remaining = Math.max(0, Math.ceil(duration - seconds))

            // Salva progresso no localStorage se tiver avançado mais de 5s
            if (seconds > 5) {
              if (remaining <= 10) {
                localStorage.removeItem(`cdo_progress_${videoId}`)
              } else {
                localStorage.setItem(`cdo_progress_${videoId}`, JSON.stringify({ seconds, timestamp: Date.now() }))
              }
            }
            
            if (remaining <= 10 && remaining > 0 && !overlayDismissedRef.current && proximoVideoRef.current) {
              setShowNextOverlay(true)
              setSecondsRemaining(remaining)
            } else {
              setShowNextOverlay(false)
            }
            
            if (remaining === 0 && !overlayDismissedRef.current && proximoVideoRef.current && !navigatingRef.current) {
              navigatingRef.current = true
              router.push(`/watch/${proximoVideoRef.current.id}`)
            }
          }
        }
        
        // Se o player estiver pronto, nos inscrevemos nos eventos e forçamos 0s
        if (data && data.event === 'ready') {
           iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
             context: 'player.js',
             method: 'addEventListener',
             value: 'pause'
           }), '*')
           iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
             context: 'player.js',
             method: 'addEventListener',
             value: 'play'
           }), '*')
           iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
             context: 'player.js',
             method: 'addEventListener',
             value: 'timeupdate'
           }), '*')

           if (!hasResumedRef.current) {
             iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
               context: 'player.js',
               method: 'setCurrentTime',
               value: 0
             }), '*')
           }
        }
      } catch {}
    }

    window.addEventListener('message', handleMessage)
    window.addEventListener('beforeunload', encerrarSessao)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') encerrarSessao()
    })

    // ── FIX PARA BUG DE TOQUE CONGELADO AO SAIR DA TELA CHEIA EM CELULARES (ANDROID/CAPACITOR) ──
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )

      if (!isFullscreen) {
        // Ao sair da tela cheia no Android, garante restauração imediata do toque e do foco da janela
        document.body.style.pointerEvents = 'auto'
        document.body.style.overflow = 'auto'
        if (iframeRef.current) {
          iframeRef.current.blur()
        }
        window.focus()
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    // Fallback: tentar inscrever logo de cara
    setTimeout(() => {
       iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
         context: 'player.js',
         method: 'addEventListener',
         value: 'pause'
       }), '*')
       iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
         context: 'player.js',
         method: 'addEventListener',
         value: 'play'
       }), '*')
       iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
         context: 'player.js',
         method: 'addEventListener',
         value: 'timeupdate'
       }), '*')
    }, 2000)

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      if (realtimeRef.current) realtimeRef.current.channel('sessao-radar').unsubscribe()
      encerrarSessao()
      window.removeEventListener('message', handleMessage)
      window.removeEventListener('beforeunload', encerrarSessao)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [iniciarSessao, encerrarSessao, router, videoId])

  // ── ESTADO: Em Breve ──
  if (emBreve) {
    return (
      <div className="w-full relative px-0 md:px-6 lg:px-8 xl:px-12 pt-0 md:pt-6 pb-2 md:pb-6" style={{ background: '#090B10' }}>
        <div 
          className="relative w-full aspect-video mx-auto flex items-center justify-center overflow-hidden bg-black md:rounded-2xl border-y md:border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          style={{ maxWidth: '1280px' }}
        >
          {/* Card Central */}
          <div className="relative z-10 text-center px-6 py-8 md:py-12 max-w-md bg-[#090B10]/90 backdrop-blur-md rounded-3xl border border-[#D4AF37]/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <span className="inline-block text-[#D4AF37] text-4xl mb-4 animate-bounce">⏳</span>
            <h2 className="text-white text-xl md:text-2xl font-black uppercase tracking-wider mb-2">Em Breve</h2>
            <p className="text-[#8197a4] text-xs md:text-sm leading-relaxed">
              Este conteúdo está sendo preparado com muito carinho para você e estará disponível em breve!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── ESTADO: Verificando ──
  if (status === 'verificando') {
    return (
      <div className="w-full relative px-0 md:px-6 lg:px-8 xl:px-12 pt-0 md:pt-6 pb-2 md:pb-6" style={{ background: '#090B10' }}>
        <div
          className="relative bg-black w-full flex items-center justify-center mx-auto md:rounded-2xl border-y md:border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          style={{ aspectRatio: '16/9', maxWidth: '1280px' }}
        >
          <div className="relative z-10 flex flex-col items-center gap-5">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#D4AF37]/20 animate-ping" />
              <div
                className="w-16 h-16 rounded-full border-4 border-t-[#D4AF37] border-r-[#D4AF37] border-b-transparent border-l-transparent animate-spin"
              />
              <div className="absolute text-[#D4AF37]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <p className="text-white font-bold tracking-widest uppercase text-[11px] sm:text-xs animate-pulse opacity-80" style={{ letterSpacing: '0.2em' }}>
              Carregando Vídeo...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ── ESTADO: Bloqueado ──
  if (status === 'bloqueado') {
    router.push('/watch')
    return null
  }

  // ── ESTADO: Derrubado (Login em outro lugar) ──
  if (status === 'derrubado') {
    return (
      <div className="w-full relative px-0 md:px-6 lg:px-8 xl:px-12 pt-0 md:pt-6 pb-2 md:pb-6" style={{ background: '#090B10' }}>
        <div
          className="bg-black w-full flex items-center justify-center mx-auto md:rounded-2xl border-y md:border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          style={{ aspectRatio: '16/9', maxWidth: '1280px' }}
        >
          <div className="flex flex-col items-center gap-5 px-6 text-center">
            <div className="w-14 h-14 rounded-full border-2 border-[#EF4444] flex items-center justify-center animate-pulse">
              <span className="text-[#EF4444] text-2xl font-bold">!</span>
            </div>
            <h2 className="text-white text-lg font-bold">Acesso Interrompido</h2>
            <p className="text-[#94A3B8] text-sm max-w-sm">
              Sua conta entrou em outro dispositivo e a reprodução foi encerrada automaticamente.
            </p>
            <button
              onClick={() => router.push('/watch')}
              className="mt-2 px-8 py-3 font-bold rounded-xl hover:brightness-110 transition-all"
              style={{ background: '#D4AF37', color: '#090B10' }}
            >
              Voltar ao Catálogo
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── ESTADO: Liberado ──
  return (
    <div className="w-full relative px-0 md:px-6 lg:px-8 xl:px-12 pt-0 md:pt-6 pb-2 md:pb-6" style={{ background: '#090B10' }}>
      <div className="relative w-full aspect-video mx-auto group md:rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-y md:border border-white/5 bg-black" style={{ maxWidth: '1280px' }}>
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-none"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />

        {/* CARD DE CONTINUAR DE ONDE PAROU */}
        {showResumeCard && resumeTime > 0 && (
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 bg-[#0B0F19]/95 backdrop-blur-md border border-[#D4AF37]/40 rounded-2xl p-4 w-[280px] sm:w-[320px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-2.5 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                  <RotateCcw size={16} />
                </div>
                <div>
                  <span className="text-white text-xs font-extrabold block">Continuar de onde parou?</span>
                  <span className="text-white/60 text-[11px] font-medium block">
                    Você parou em <strong className="text-[#D4AF37]">{formatarSegundos(resumeTime)}</strong>
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResumeCard(false)}
                className="text-white/40 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                title="Ignorar"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => setShowResumeCard(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer text-center"
              >
                Do Início
              </button>

              <button
                type="button"
                onClick={handleContinuarDeOndeParou}
                className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider text-[#090B10] hover:brightness-110 transition-all cursor-pointer text-center shadow-md flex items-center justify-center gap-1"
                style={{ background: '#D4AF37' }}
              >
                <Play size={12} fill="#090B10" /> Continuar
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY DE PRÓXIMO VÍDEO (ESTILO YOUTUBE) */}
        {showNextOverlay && proximoVideo && (
          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 bg-[#0B0F19]/95 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl p-4 w-[290px] min-[380px]:w-[320px] sm:w-[360px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-3 animate-in slide-in-from-bottom duration-300">
            <div className="flex gap-3">
              <div 
                className="w-24 sm:w-28 aspect-video rounded-lg shrink-0 overflow-hidden bg-[#15243E]"
                style={{ 
                  backgroundImage: `url(${proximoVideo.thumbnail_url || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&q=70'})`, 
                  backgroundSize: 'cover', 
                  backgroundPosition: 'center' 
                }}
              />
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-wider mb-0.5">Próximo Vídeo</span>
                <p className="text-white text-xs sm:text-sm font-bold line-clamp-2 leading-snug">
                  {proximoVideo.titulo}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/5">
              <span className="text-white/50 text-[11px] font-medium">
                Iniciando em <span className="text-[#D4AF37] font-bold">{secondsRemaining}s</span>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    overlayDismissedRef.current = true;
                    setShowNextOverlay(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!navigatingRef.current) {
                      navigatingRef.current = true;
                      router.push(`/watch/${proximoVideo.id}`);
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider text-[#090B10] hover:brightness-110 transition-all cursor-pointer"
                  style={{ background: '#D4AF37' }}
                >
                  Assistir Agora
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
