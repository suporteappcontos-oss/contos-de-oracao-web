'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

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
  const [isPaused, setIsPaused] = useState(false)
  const [anuncioAtivo, setAnuncioAtivo] = useState<any>(null)
  const [showNextOverlay, setShowNextOverlay] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(10)
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

  // Reseta estados do próximo vídeo quando muda de vídeo
  useEffect(() => {
    setShowNextOverlay(false);
    setSecondsRemaining(10);
    overlayDismissedRef.current = false;
    navigatingRef.current = false;
  }, [videoId]);

  // Busca o anúncio ativo aleatório do banco de dados
  const fetchAnuncio = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('anuncios_pausa').select('*').eq('ativo', true)
    if (data && data.length > 0) {
      // Pega um aleatório para rotacionar
      const randomIndex = Math.floor(Math.random() * data.length)
      setAnuncioAtivo(data[randomIndex])
    }
  }, [])

  // Atualiza status e o ref junto
  const updateStatus = (s: typeof status) => {
    statusRef.current = s
    setStatus(s)
  }

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
      // Quando uma nova sessão for criada para o mesmo user (outro device),
      // e o device_token não for o nosso → fomos chutados!
      const supabase = createClient()
      realtimeRef.current = supabase

      supabase
        .channel('sessao-radar')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'sessoes_ativas' },
          async (payload) => {
            if (statusRef.current === 'derrubado') return

            // Checa se ainda existe nossa sessão
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
      // ──────────────────────────────────────────────────────────────────

      // Heartbeat de segurança a cada 10s (fallback caso o Realtime falhe)
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
  }, [videoId])

  // Remove a sessão ao sair da página
  const encerrarSessao = useCallback(() => {
    if (!deviceToken.current) return
    navigator.sendBeacon(
      '/api/sessoes',
      JSON.stringify({ device_token: deviceToken.current })
    )
  }, [])

  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    iniciarSessao()
    fetchAnuncio()

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        
        // Padrão Player.js (usado pelo Bunny) ou eventos genéricos
        if (data && (data.event === 'pause' || data.type === 'pause')) {
          setIsPaused(true)
        } else if (data && (data.event === 'play' || data.event === 'playing' || data.type === 'play' || data.type === 'playing')) {
          setIsPaused(false)
        } else if (data && (data.event === 'timeupdate' || data.type === 'timeupdate')) {
          const value = data.value || data.data
          if (value && typeof value.seconds === 'number' && typeof value.duration === 'number') {
            const seconds = value.seconds
            const duration = value.duration
            const remaining = Math.max(0, Math.ceil(duration - seconds))
            
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
        
        // Se o player estiver pronto, nos inscrevemos nos eventos
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
        }
      } catch (e) {}
    }

    window.addEventListener('message', handleMessage)
    window.addEventListener('beforeunload', encerrarSessao)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') encerrarSessao()
    })

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
    }
  }, [iniciarSessao, encerrarSessao, fetchAnuncio])

  // Retoma o vídeo enviando comando play via Player.js para o iframe
  const handleResume = useCallback(() => {
    setIsPaused(false)
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ context: 'player.js', method: 'play' }),
      '*'
    )
  }, [])

  // ── ESTADO: Em Breve ──
  if (emBreve) {
    const bgUrl = thumbnailUrl || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1600&q=80';
    return (
      <div className="w-full relative px-0 md:px-6 lg:px-8 xl:px-12 pt-0 md:pt-6 pb-2 md:pb-6" style={{ background: '#090B10' }}>
        <div 
          className="relative w-full aspect-video mx-auto flex items-center justify-center overflow-hidden bg-cover bg-center md:rounded-2xl border-y md:border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
          style={{ 
            maxWidth: '1280px', 
            backgroundImage: `url(${bgUrl})` 
          }}
        >
          {/* Blur background overlay */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          
          {/* Card Central */}
          <div className="relative z-10 text-center px-6 py-8 md:py-12 max-w-md bg-[#090B10]/80 backdrop-blur-md rounded-3xl border border-[#D4AF37]/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
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
    const bgUrl = thumbnailUrl || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1600&q=80';
    return (
      <div className="w-full relative px-0 md:px-6 lg:px-8 xl:px-12 pt-0 md:pt-6 pb-2 md:pb-6" style={{ background: '#090B10' }}>
        <div
          className="relative bg-black w-full flex items-center justify-center mx-auto md:rounded-2xl border-y md:border border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden bg-cover bg-center"
          style={{ aspectRatio: '16/9', maxWidth: '1280px', backgroundImage: `url(${bgUrl})` }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
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
        
        {/* OVERLAY DE ANÚNCIO (MOSTRADO NA PAUSA) */}
        {isPaused && anuncioAtivo && (
          <div 
            onClick={handleResume}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300 cursor-pointer group/overlay"
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {anuncioAtivo.imagem_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={anuncioAtivo.imagem_url} 
                  alt={anuncioAtivo.titulo} 
                  className="w-full h-full object-contain" 
                />
              ) : (
                <div className="p-12 text-center w-full h-full flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #111827 0%, #1a2332 100%)' }}>
                  <div className="text-[#D4AF37] text-6xl mb-6">📢</div>
                  <p className="text-white font-black text-3xl leading-snug">{anuncioAtivo.titulo}</p>
                </div>
              )}
              
              {/* Overlay de Play Hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/overlay:opacity-100 transition-opacity duration-300 bg-black/40">
                <div className="w-24 h-24 bg-[#D4AF37] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(212,175,55,0.4)] transform hover:scale-110 transition-transform">
                   <svg width="40" height="40" viewBox="0 0 24 24" fill="black" className="ml-2">
                     <path d="M8 5v14l11-7z"/>
                   </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OVERLAY DE PRÓXIMO VÍDEO (ESTILO YOUTUBE) */}
        {showNextOverlay && proximoVideo && (
          <div className="absolute bottom-16 sm:bottom-20 right-4 sm:right-8 z-40 bg-[#0B0F19]/95 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl p-4 w-[290px] min-[380px]:w-[320px] sm:w-[360px] shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col gap-3 animate-in slide-in-from-bottom duration-300">
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
