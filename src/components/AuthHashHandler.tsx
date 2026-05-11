'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

/**
 * Componente invisível que processa o #access_token do magic link.
 * Quando o Supabase redireciona com o token no hash (ex: QR Code login),
 * este componente detecta, cria a sessão e redireciona para /watch.
 */
export default function AuthHashHandler() {
  const router = useRouter()

  useEffect(() => {
    const hash = window.location.hash
    if (!hash || !hash.includes('access_token')) return

    // Extrai os parâmetros do hash
    const params = new URLSearchParams(hash.replace('#', ''))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')
    const type = params.get('type') // 'magiclink' | 'recovery' etc.

    if (!accessToken || !refreshToken) return

    const supabase = createClient()

    // Define a sessão no cliente com os tokens recebidos
    supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    }).then(({ error }) => {
      if (error) {
        console.error('Erro ao definir sessão via magic link:', error.message)
        return
      }

      // Remove o hash primeiro
      window.history.replaceState(null, '', window.location.pathname)

      // Usa o router do Next.js para redirecionar sem quebrar os cookies de sessão
      if (type === 'recovery') {
        router.replace('/atualizar-senha')
      } else {
        router.replace('/watch')
      }
    })
  }, [router])

  return null // Componente invisível
}
