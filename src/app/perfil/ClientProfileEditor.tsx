'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, X, Check, Loader2, Smile, Trash2 } from 'lucide-react'
import { salvarNome, salvarAvatar, salvarTelefone, alterarSenha } from './actions'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

type AvatarType = {
  id: string
  nome: string
  avatar_url: string
}

export default function ClientProfileEditor({
  initialName,
  initialPhone = '',
  initialAvatarUrl,
  fallbackAvatarUrl
}: {
  initialName: string
  initialPhone?: string
  initialAvatarUrl: string | null
  fallbackAvatarUrl: string
}) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [avatars, setAvatars] = useState<AvatarType[]>([])
  const [loadingAvatars, setLoadingAvatars] = useState(false)
  const [saving, setSaving] = useState(false)

  // Estados temporários do modal
  const [tempName, setTempName] = useState(initialName)
  const [tempPhone, setTempPhone] = useState(initialPhone)
  const [tempSenha, setTempSenha] = useState('')
  const [tempConfirmarSenha, setTempConfirmarSenha] = useState('')
  const [tempAvatarUrl, setTempAvatarUrl] = useState<string | null>(initialAvatarUrl)
  const [tempPedidoSanto, setTempPedidoSanto] = useState('')
  const [showAvatarSelector, setShowAvatarSelector] = useState(false)

  const handlePhoneChange = (val: string) => {
    let value = val.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`
    } else if (value.length > 0) {
      value = `(${value}`
    }
    setTempPhone(value)
  }

  // Garante que o portal só é renderizado no cliente (evita erros SSR)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Escuta o evento global para abrir o modal (ex: clique no avatar)
  useEffect(() => {
    const handler = () => abrirModal()
    window.addEventListener('open-profile-editor', handler)
    return () => window.removeEventListener('open-profile-editor', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialName, initialAvatarUrl])

  // Bloqueia/desbloqueia scroll do body quando o modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const abrirModal = () => {
    setTempName(initialName)
    setTempAvatarUrl(initialAvatarUrl)
    setTempPedidoSanto('')
    setShowAvatarSelector(false)
    setIsOpen(true)
  }

  const fecharModal = () => {
    setIsOpen(false)
  }

  const carregarAvatares = async () => {
    if (avatars.length > 0) {
      setShowAvatarSelector(!showAvatarSelector)
      return
    }
    setLoadingAvatars(true)
    setShowAvatarSelector(true)
    try {
      const res = await fetch('/api/avatars-santos')
      const data = await res.json()
      if (data.avatars) {
        setAvatars(data.avatars)
      }
    } catch (e) {
      console.error('Erro ao buscar avatares:', e)
    } finally {
      setLoadingAvatars(false)
    }
  }

  const handleExcluirFoto = () => {
    if (confirm('Tem certeza que deseja remover sua foto de perfil? Ela será substituída pelas iniciais do seu nome.')) {
      setTempAvatarUrl(null)
      setTempPedidoSanto('')
      setShowAvatarSelector(false)
    }
  }

  const handleSalvar = async () => {
    if (!tempName.trim()) {
      alert('O nome não pode ficar em branco.')
      return
    }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('nome', tempName.trim())

      await Promise.all([
        salvarNome(formData),
        salvarAvatar(tempAvatarUrl, tempPedidoSanto)
      ])

      // Atualiza a sessão local do Supabase no cliente para refletir novos metadados
      const supabase = createClient()
      await supabase.auth.refreshSession()

      // Revalida a rota para re-renderizar Server Components com os novos dados
      router.refresh()

      fecharModal()
      alert('Perfil atualizado com sucesso!')
    } catch (e) {
      alert('Erro de conexão ao salvar alterações.')
    } finally {
      setSaving(false)
    }
  }

  // ── Conteúdo do Modal (renderizado via Portal no document.body) ──
  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-start overflow-y-auto bg-black/85 backdrop-blur-md p-4 py-8 md:py-16"
      onClick={(e) => { if (e.target === e.currentTarget) fecharModal() }}
    >
      <div
        className="relative w-full max-w-xl rounded-[2rem] p-6 sm:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.8)] space-y-6 my-auto"
        style={{
          background: 'linear-gradient(145deg, #141c2e 0%, #0f1724 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brilho decorativo no topo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-white text-xl sm:text-2xl font-black tracking-tight">Editar seu Perfil</h3>
            <p className="text-white/40 text-xs mt-1">Atualize seus dados e escolha seu santo protetor</p>
          </div>
          <button
            onClick={fecharModal}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Preview do Avatar Atual */}
        <div className="flex flex-col items-center justify-center py-2 gap-2">
          <div
            className="relative w-24 h-24 rounded-full shadow-xl border-2 border-[#D4AF37]/40"
            style={{ background: '#111827' }}
          >
            <img
              src={tempAvatarUrl || fallbackAvatarUrl}
              alt="Preview do avatar"
              className="w-full h-full rounded-full object-contain"
              style={{ display: 'block', transform: 'scale(1.12)' }}
            />
          </div>
          {tempAvatarUrl && (
            <span className="bg-[#D4AF37]/15 text-[#D4AF37] px-3 py-0.5 rounded-full border border-[#D4AF37]/25 text-[9px] font-bold uppercase tracking-wider shadow">
              Santo Ativo
            </span>
          )}
        </div>

        {/* Formulário Nome, WhatsApp e Senha */}
        <div className="space-y-4">
          <div>
            <label className="block text-white/70 text-xs font-bold uppercase tracking-wider px-1 mb-1.5">Nome Completo</label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Seu nome completo"
              maxLength={40}
              className="w-full border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
              style={{ background: 'rgba(0,0,0,0.35)' }}
            />
          </div>

          <div>
            <label className="block text-white/70 text-xs font-bold uppercase tracking-wider px-1 mb-1.5">WhatsApp / Celular (com DDD)</label>
            <input
              type="tel"
              value={tempPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="(11) 99999-9999"
              maxLength={15}
              className="w-full border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
              style={{ background: 'rgba(0,0,0,0.35)' }}
            />
          </div>

          {/* Alterar Senha */}
          <div className="pt-2 border-t border-white/5 space-y-3">
            <label className="block text-[#D4AF37] text-xs font-bold uppercase tracking-wider px-1">Alterar Senha (Opcional)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="password"
                value={tempSenha}
                onChange={(e) => setTempSenha(e.target.value)}
                placeholder="Nova Senha (mín. 6 chars)"
                className="w-full border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
                style={{ background: 'rgba(0,0,0,0.35)' }}
              />
              <input
                type="password"
                value={tempConfirmarSenha}
                onChange={(e) => setTempConfirmarSenha(e.target.value)}
                placeholder="Confirme a Nova Senha"
                className="w-full border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
                style={{ background: 'rgba(0,0,0,0.35)' }}
              />
            </div>
          </div>
        </div>

        {/* Ações de Imagem (Trocar e Excluir) */}
        <div className="flex gap-3">
          <button
            onClick={carregarAvatares}
            className={`flex-1 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
              showAvatarSelector
                ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                : 'border-white/8 bg-white/5 hover:bg-white/10 text-white/90'
            }`}
          >
            <Smile size={15} />
            Trocar Foto
          </button>
          {tempAvatarUrl && (
            <button
              onClick={handleExcluirFoto}
              className="flex-1 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border border-red-500/20 bg-red-500/10 hover:bg-red-500/25 text-red-400 transition-all cursor-pointer"
            >
              <Trash2 size={15} />
              Excluir Foto
            </button>
          )}
        </div>

        {/* Seletor de Avatares dos Santos */}
        {showAvatarSelector && (
          <div className="space-y-4 p-4 rounded-2xl border border-white/8" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <div className="text-white/50 text-[10px] font-bold uppercase tracking-wider">Selecione o seu Santo Protetor:</div>

            {loadingAvatars ? (
              <div className="flex flex-col items-center justify-center py-6">
                <Loader2 className="animate-spin text-[#D4AF37]" size={28} />
                <span className="text-white/40 text-[10px] mt-2">Carregando avatares...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[220px] overflow-y-auto pr-1">
                  {avatars.map((a) => {
                    const isSelected = tempAvatarUrl === a.avatar_url
                    return (
                      <div
                        key={a.id}
                        onClick={() => {
                          setTempAvatarUrl(a.avatar_url)
                          setTempPedidoSanto('')
                        }}
                        className="flex flex-col items-center gap-1.5 cursor-pointer group"
                      >
                        <div className={`relative w-14 h-14 rounded-full border-2 transition-all duration-300 overflow-hidden ${
                          isSelected
                            ? 'border-[#D4AF37] scale-105 shadow-[0_0_15px_rgba(212,175,55,0.5)]'
                            : 'border-white/10 group-hover:border-white/30'
                        }`}>
                          <img
                            src={a.avatar_url}
                            alt={a.nome}
                            className="w-full h-full object-contain"
                            style={{ display: 'block' }}
                          />
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#090B10] rounded-full p-0.5 shadow-md border border-[#090B10] z-10 flex items-center justify-center">
                              <Check size={8} strokeWidth={4} />
                            </div>
                          )}
                        </div>
                        <span className={`text-[9px] font-bold text-center transition-colors line-clamp-2 px-0.5 w-full ${
                          isSelected ? 'text-[#D4AF37]' : 'text-white/60 group-hover:text-white'
                        }`}>
                          {a.nome}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Pedir Santo não listado */}
                <div className="pt-3 border-t border-white/5">
                  <label className="block text-white/50 text-[9px] font-bold uppercase tracking-wider mb-2">
                    Não encontrou seu santo protetor? Peça aqui:
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: São Judas Tadeu, Santa Rita..."
                    value={tempPedidoSanto}
                    onChange={(e) => {
                      setTempPedidoSanto(e.target.value)
                      setTempAvatarUrl(null)
                    }}
                    className="w-full border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-[#D4AF37] focus:outline-none transition-colors"
                    style={{ background: 'rgba(0,0,0,0.35)' }}
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Ações Finais */}
        <div className="flex gap-3 pt-2 border-t border-white/5">
          <button
            onClick={fecharModal}
            disabled={saving}
            className="flex-1 py-3.5 font-bold rounded-xl text-sm border border-white/8 bg-transparent hover:bg-white/5 transition-all text-white/70 disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={saving}
            className="flex-1 py-3.5 font-extrabold rounded-xl text-sm transition-all hover:brightness-110 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Botão Principal de Editar Perfil */}
      <button
        onClick={abrirModal}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 bg-white/5 border border-white/10 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 text-white/80 hover:text-white active:scale-95 cursor-pointer shadow-lg"
      >
        <Pencil size={13} className="text-[#D4AF37]" />
        Editar Perfil
      </button>

      {/* Modal renderizado via Portal no document.body para escapar do backdrop-filter do container pai */}
      {mounted && isOpen && createPortal(modalContent, document.body)}
    </>
  )
}
