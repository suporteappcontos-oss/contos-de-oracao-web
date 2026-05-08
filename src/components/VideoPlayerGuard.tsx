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
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const realtimeRef = useRef<ReturnType<typeof createClient> | null>(null)
  const deviceToken = useRef<string>('')
  const statusRef = useRef<string>('verificando')

  // Atualiza status e o ref junto
  const updateStatus = (s: typeof status) => {
    statusRef.current = s
    setStatus(s)
  }

  // Registra sessão e inicia escuta em tempo real
  const iniciarSessao = useCallback(async () => {
    const token = getDeviceToken()
    deviceToken.current = token

    // 🔒 VERIFICAÇÃO DE PLANO ATIVO
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const planoAtivo = user.user_metadata?.plano_ativo === true
    const isAdmin = user.email === 'suporte.appcontos@gmail.com'

    if (!isAdmin && !planoAtivo) {
      updateStatus('bloqueado')
      return
    }

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

  useEffect(() => {
    iniciarSessao()

    window.addEventListener('beforeunload', encerrarSessao)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') encerrarSessao()
    })

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current)
      // Desconecta o canal Realtime
      if (realtimeRef.current) {
        realtimeRef.current.channel('sessao-radar').unsubscribe()
      }
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
