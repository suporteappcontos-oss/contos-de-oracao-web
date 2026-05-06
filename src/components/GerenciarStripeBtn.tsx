'use client'

import { useState } from 'react'

export default function GerenciarStripeBtn() {
  const [loading, setLoading] = useState(false)

  async function handleGerenciar() {
    try {
      setLoading(true)
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Erro ao abrir o portal')
        setLoading(false)
      }
    } catch (e) {
      console.error(e)
      alert('Erro de conexão')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGerenciar}
      disabled={loading}
      className="w-full text-center px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all hover:brightness-110 disabled:opacity-50 cursor-pointer"
      style={{ background: '#10B981', color: '#090B10' }}
    >
      {loading ? 'Abrindo...' : 'Gerenciar na Stripe'}
    </button>
  )
}
