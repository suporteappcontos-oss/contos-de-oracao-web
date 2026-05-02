'use client'

import { useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import { salvarNome } from './actions'

export default function ClientEditableName({ initialName, defaultName }: { initialName: string, defaultName: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    await salvarNome(formData)
    setLoading(false)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-1">
        <input
          name="nome"
          defaultValue={initialName}
          autoFocus
          placeholder="Seu nome"
          maxLength={40}
          className="bg-[#0f171e] border border-[#1e3040] focus:border-[#D4AF37] rounded-lg px-3 py-1 text-white placeholder-[#4a6373] focus:outline-none transition-colors text-sm w-[200px]"
          disabled={loading}
        />
        <button type="submit" disabled={loading} className="p-1.5 rounded-lg bg-[#D4AF37] text-[#090B10] hover:brightness-110 disabled:opacity-50">
          <Check size={14} />
        </button>
        <button type="button" onClick={() => setIsEditing(false)} disabled={loading} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50">
          <X size={14} />
        </button>
      </form>
    )
  }

  return (
    <div className="flex items-center gap-2 mb-1 group">
      <h1 className="text-white font-black text-xl md:text-2xl capitalize">{defaultName}</h1>
      <button 
        onClick={() => setIsEditing(true)}
        className="p-1.5 rounded-lg bg-white/5 hover:bg-[#D4AF37]/20 text-white/40 hover:text-[#D4AF37] transition-all"
        title="Editar Nome"
      >
        <Pencil size={14} />
      </button>
    </div>
  )
}
