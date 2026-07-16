'use client'

import React, { useState, useTransition } from 'react'
import { BookMarked, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { deletarRevista } from './actions'

type Revista = {
  id: string
  slug: string
  titulo: string
  descricao: string | null
  edicao: string | null
  capa_url: string | null
  link_pdf: string | null
  ativo: boolean
  criado_em: string
}

export function GerenciadorRevistas({ revistasIniciais }: { revistasIniciais: Revista[] }) {
  const [isPending, startTransition] = useTransition()
  const [revistas, setRevistas] = useState(revistasIniciais)
  const [aberto, setAberto] = useState(false)

  const handleDeletar = (id: string, titulo: string) => {
    if (!confirm(`Deletar "${titulo}"? Essa ação não pode ser desfeita.`)) return
    startTransition(async () => {
      const res = await deletarRevista(id)
      if (res?.success) {
        setRevistas(prev => prev.filter(r => r.id !== id))
      } else {
        alert(`Erro ao deletar: ${res?.error || 'Erro desconhecido'}`)
      }
    })
  }

  return (
    <div className="bg-[#0f171e] border border-white/5 rounded-3xl overflow-hidden shadow-lg">
      {/* Cabeçalho colapsável */}
      <button
        type="button"
        onClick={() => setAberto(p => !p)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#10b981]/10 border border-[#10b981]/20">
            <BookMarked size={18} className="text-[#10b981]" />
          </div>
          <div>
            <h3 className="text-white text-base font-extrabold tracking-tight">Revistas</h3>
            <p className="text-white/40 text-xs mt-0.5">
              {revistas.length} {revistas.length === 1 ? 'edição cadastrada' : 'edições cadastradas'}
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50">
          {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Conteúdo expandido */}
      {aberto && (
        <div className="border-t border-white/5 p-6 bg-black/10">
          {revistas.length === 0 ? (
            <div className="text-white/20 text-sm text-center py-8 border border-white/5 rounded-2xl bg-white/[0.01]">
              Nenhuma revista publicada ainda.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {revistas.map(r => (
                <div key={r.id} className="group relative bg-[#111827] border border-white/5 rounded-2xl overflow-hidden hover:border-[#10b981]/40 transition-all">
                  {/* Capa */}
                  <div className="aspect-[3/4] bg-black/40 relative">
                    {r.capa_url ? (
                      <img src={r.capa_url} alt={r.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookMarked size={32} className="text-[#10b981] opacity-30" />
                      </div>
                    )}
                    {/* Badge edição */}
                    {r.edicao && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-[#10b981]/30 text-[#34d399] border border-[#10b981]/40">
                        {r.edicao}
                      </div>
                    )}
                    {r.link_pdf && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center bg-black/60">
                        <Download size={11} className="text-green-400" />
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="p-3">
                    <p className="text-white text-xs font-bold leading-tight line-clamp-2 mb-1">{r.titulo}</p>
                    {r.descricao && (
                      <p className="text-white/30 text-[10px] line-clamp-1">{r.descricao}</p>
                    )}
                  </div>
                  {/* Botão deletar */}
                  <button
                    onClick={() => handleDeletar(r.id, r.titulo)}
                    disabled={isPending}
                    className="absolute bottom-2 right-2 w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
