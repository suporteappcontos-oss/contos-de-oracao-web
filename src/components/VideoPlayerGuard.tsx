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
}

export default function VideoPlayerGuard({ videoId, embedUrl }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<'verificando' | 'liberado' | 'bloqueado' | 'derrubado'>('verificando')
  const [isPaused, setIsPaused] = useState(false)
  const [anuncioAtivo, setAnuncioAtivo] = useState<any>(null)
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const realtimeRef = useRef<ReturnType<typeof createClient> | null>(null)
  const deviceToken = useRef<string>('')
  const statusRef = useRef<string>('verificando')

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

  // ── ESTADO: Verificando ──
  if (status === 'verificando') {
    return (
      <div
        className="bg-black w-full flex items-center justify-center"
        style={{ aspectRatio: '16/9', maxWidth: '1600px', margin: '0 auto' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: '#D4AF37', borderTopColor: 'transparent' }}
          />
          <p className="text-white/40 text-sm">Verificando acesso...</p>
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
      <div
        className="bg-black w-full flex items-center justify-center"
        style={{ aspectRatio: '16/9', maxWidth: '1600px', margin: '0 auto' }}
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
    )
  }

  // ── ESTADO: Liberado ──
  return (
    <div className="bg-black w-full relative">
      <div className="relative w-full aspect-video mx-auto group" style={{ maxWidth: '1600px' }}>
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
      </div>
    </div>
  )
}
