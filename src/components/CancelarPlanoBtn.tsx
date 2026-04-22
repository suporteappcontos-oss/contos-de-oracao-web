'use client'

import { useState } from 'react'
import { cancelarPlano } from '@/app/perfil/actions'

export default function CancelarPlanoBtn() {
  const [confirmando, setConfirmando] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleCancelar() {
    setLoading(true)
    await cancelarPlano()
  }

  if (!confirmando) {
    return (
      <button
        onClick={() => setConfirmando(true)}
        className="shrink-0 px-4 py-2 rounded-xl font-bold text-xs transition-all border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer"
        style={{ background: 'rgba(239,68,68,0.05)' }}
      >
        Cancelar Plano
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-2 items-end">
      <p className="text-red-400 text-xs font-semibold text-right">
        Tem certeza? Você perderá o acesso.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => setConfirmando(false)}
          className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
        >
          Não
        </button>
        <button
          onClick={handleCancelar}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/80 hover:bg-red-500 text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Cancelando...' : 'Sim, cancelar'}
        </button>
      </div>
    </div>
  )
}
