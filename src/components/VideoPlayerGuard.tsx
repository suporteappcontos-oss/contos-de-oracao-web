'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

// Gera ou recupera um token único para este dispositivo/navegador
function getDeviceToken(): string {
  if (typeof window === 'undefined') return ''
  let token = localStorage.getItem('cdo_device_token')
  if (!token) {
    token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('cdo_device_token', token)
  }
  return token
}

type Props = {
  videoId: string
  embedUrl: string
}

export default function VideoPlayerGuard({ videoId, embedUrl }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<'verificando' | 'liberado' | 'bloqueado'>('verificando')
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const deviceToken = useRef<string>('')

  // Registra sessão e inicia heartbeat
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
        // Limite atingido
        setStatus('bloqueado')
        return
      }

      if (!res.ok) {
        // Erro inesperado: libera mesmo assim para não prejudicar o usuário
        console.warn('Erro ao registrar sessão, liberando player.')
        setStatus('liberado')
        return
      }

      setStatus('liberado')

      // Inicia heartbeat a cada 60 segundos para manter a sessão viva
      heartbeatRef.current = setInterval(async () => {
        await fetch('/api/sessoes', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ device_token: token }),
        })
      }, 60_000)
    } catch {
      // Em caso de falha de rede, libera o player sem bloquear o usuário
      setStatus('liberado')
    }
  }, [videoId])

  // Remove a sessão ao sair da página
  const encerrarSessao = useCallback(() => {
    if (!deviceToken.current) return
    // Usa sendBeacon para garantir que a requisição seja enviada mesmo ao fechar a aba
    navigator.sendBeacon(
      '/api/sessoes',
      JSON.stringify({ device_token: deviceToken.current })
    )
  }, [])

  useEffect(() => {
    iniciarSessao()

    // Listener para quando o usuário fecha ou muda de aba
    window.addEventListener('beforeunload', encerrarSessao)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') encerrarSessao()
    })

    return () => {
      // Limpeza ao desmontar o componente (navegação interna)
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      encerrarSessao()
      window.removeEventListener('beforeunload', encerrarSessao)
    }
  }, [iniciarSessao, encerrarSessao])

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

  // ── ESTADO: Bloqueado (limite atingido) ──
  if (status === 'bloqueado') {
    router.push('/tela-cheia')
    return null
  }

  // ── ESTADO: Liberado ──
  return (
    <div className="bg-black w-full">
      <div className="relative w-full aspect-video mx-auto" style={{ maxWidth: '1600px' }}>
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full border-none"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    </div>
  )
}
