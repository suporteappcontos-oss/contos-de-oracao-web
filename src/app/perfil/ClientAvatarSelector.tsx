'use client'

import React, { useState } from 'react'
import { Pencil, X, Check, Loader2, Smile } from 'lucide-react'
import { salvarAvatar } from './actions'

type AvatarType = {
  id: string
  nome: string
  avatar_url: string
}

export default function ClientAvatarSelector({
  initialAvatarUrl,
  fallbackAvatarUrl
}: {
  initialAvatarUrl: string | null
  fallbackAvatarUrl: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [avatars, setAvatars] = useState<AvatarType[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedUrl, setSelectedUrl] = useState<string | null>(initialAvatarUrl)
  const [pedidoSanto, setPedidoSanto] = useState('')

  const abrirModal = async () => {
    setIsOpen(true)
    setLoading(true)
    try {
      const res = await fetch('/api/avatars-santos')
      const data = await res.json()
      if (data.avatars) {
        setAvatars(data.avatars)
      }
    } catch (e) {
      console.error('Erro ao buscar avatares:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSalvar = async () => {
    setSaving(true)
    try {
      const res = await salvarAvatar(selectedUrl, pedidoSanto)
      if (res.success) {
        setIsOpen(false)
        setPedidoSanto('')
        alert('Avatar atualizado com sucesso!')
      } else {
        alert(res.error || 'Erro ao salvar avatar')
      }
    } catch (e) {
      alert('Erro de conexão ao salvar avatar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      {/* Avatar Display */}
      <div className="relative shrink-0 group cursor-pointer" onClick={abrirModal}>
        <div className="absolute inset-0 bg-[#D4AF37] blur-md opacity-25 group-hover:opacity-45 transition-opacity rounded-[2rem]" />
        <div className="relative w-28 h-28 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-[#090B10]">
          <img
            src={selectedUrl || fallbackAvatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
          />
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-bold gap-1.5">
            <Pencil size={16} className="text-[#D4AF37]" />
            Alterar
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-lg bg-[#111827] border border-white/5 rounded-[2rem] p-6 shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white text-xl font-bold flex items-center gap-2">
                  <Smile className="text-[#D4AF37]" size={20} />
                  Selecione seu Avatar
                </h3>
                <p className="text-white/40 text-xs mt-1">Escolha um dos santos protetores abaixo</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Grid de Santos */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="animate-spin text-[#D4AF37]" size={36} />
                <span className="text-white/40 text-xs mt-2">Carregando avatares...</span>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[220px] overflow-y-auto pr-1">
                {/* Fallback Option (Sem Avatar - Iniciais) */}
                <div
                  onClick={() => {
                    setSelectedUrl(null)
                    setPedidoSanto('')
                  }}
                  className={`group relative bg-black/40 border rounded-2xl p-2.5 flex flex-col items-center text-center cursor-pointer transition-all duration-300 ${
                    selectedUrl === null ? 'border-[#D4AF37] bg-[#D4AF37]/5 scale-[1.02] shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 mb-1.5 shrink-0 flex items-center justify-center bg-[#111827] text-[#D4AF37] font-bold text-sm">
                    Aa
                  </div>
                  <span className="text-white text-[10px] font-bold line-clamp-1 w-full">Iniciais do Nome</span>
                </div>

                {avatars.map((a) => {
                  const isSelected = selectedUrl === a.avatar_url
                  return (
                    <div
                      key={a.id}
                      onClick={() => {
                        setSelectedUrl(a.avatar_url)
                        setPedidoSanto('')
                      }}
                      className={`group relative bg-black/40 border rounded-2xl p-2.5 flex flex-col items-center text-center cursor-pointer transition-all duration-300 ${
                        isSelected ? 'border-[#D4AF37] bg-[#D4AF37]/5 scale-[1.02] shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 'border-white/5 hover:border-white/15'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 mb-1.5 shrink-0">
                        <img src={a.avatar_url} alt={a.nome} className="w-full h-full object-cover" />
                      </div>
                      <span className="text-white text-[10px] font-bold line-clamp-1 w-full">{a.nome}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Pedir Santo */}
            <div className="pt-4 border-t border-white/5">
              <label className="block text-white/50 text-[10px] font-bold uppercase tracking-wider mb-2">
                Não encontrou seu santo protetor? Peça aqui:
              </label>
              <input
                type="text"
                placeholder="Ex: São Judas Tadeu, Santa Rita..."
                value={pedidoSanto}
                onChange={(e) => {
                  setPedidoSanto(e.target.value)
                  setSelectedUrl(null) // Limpa escolha se digitar
                }}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>

            {/* Ações */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsOpen(false)}
                className="flex-1 py-3 font-bold rounded-xl text-sm border border-white/5 hover:bg-white/5 transition-all text-white/70"
              >
                Cancelar
              </button>
              <button
                onClick={handleSalvar}
                disabled={saving}
                className="flex-1 py-3 font-extrabold rounded-xl text-sm transition-all hover:brightness-110 flex items-center justify-center gap-1.5"
                style={{ background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)', color: '#000' }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Salvar Avatar
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
