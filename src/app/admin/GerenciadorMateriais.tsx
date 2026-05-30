'use client'

import React, { useState, useTransition } from 'react'
import { BookOpen, Gamepad2, Pencil, Library, Trash2, Download, Tag } from 'lucide-react'
import { deletarMaterial } from './actions'

const CATEGORIAS = [
  { value: 'hq',      label: 'HQ (História em Quadrinhos)', icon: BookOpen, color: '#D4AF37' },
  { value: 'jogo',    label: 'Jogo Educativo',              icon: Gamepad2, color: '#10b981' },
  { value: 'desenho', label: 'Desenho para Colorir',        icon: Pencil,   color: '#818cf8' },
  { value: 'livro',   label: 'Livro Digital',               icon: Library,  color: '#f97316' },
  { value: 'adesivo',  label: 'Adesivos',                    icon: Tag,      color: '#ec4899' },
]

type Material = {
  id: string
  slug: string
  titulo: string
  descricao: string | null
  categoria: string
  capa_url: string | null
  link_pdf: string | null
  planos_acesso: string[]
  ativo: boolean
  criado_em: string
}

export function GerenciadorMateriais({ materiaisIniciais }: { materiaisIniciais: Material[] }) {
  const [isPending, startTransition] = useTransition()
  const [materiais, setMateriais] = useState(materiaisIniciais)

  const handleDeletar = (id: string, titulo: string) => {
    if (!confirm(`Deletar "${titulo}"? Essa ação não pode ser desfeita.`)) return
    startTransition(async () => {
      const res = await deletarMaterial(id)
      if (res?.success) {
        setMateriais(prev => prev.filter(m => m.id !== id))
      } else {
        alert(`Erro ao deletar: ${res?.error || 'Erro desconhecido'}`)
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-white text-2xl font-black">Materiais Didáticos</h2>
        <p className="text-white/40 text-sm mt-1">Lista de HQs, Jogos e Desenhos cadastrados na plataforma.</p>
      </div>

      {/* Lista por categoria */}
      <div className="space-y-10">
        {CATEGORIAS.map(cat => {
          const itens = materiais.filter(m => m.categoria === cat.value)
          return (
            <div key={cat.value} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}20` }}>
                  <cat.icon size={14} style={{ color: cat.color }} />
                </div>
                <h3 className="text-white font-bold">{cat.label}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${cat.color}20`, color: cat.color }}>
                  {itens.length}
                </span>
              </div>

              {itens.length === 0 ? (
                <div className="text-white/20 text-sm text-center py-8 border border-white/5 rounded-2xl bg-white/[0.01]">
                  Nenhum item publicado ainda nesta categoria.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {itens.map(m => (
                    <div key={m.id} className="group relative bg-[#111827] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                      <div className="aspect-[3/4] bg-black/40 relative">
                        {m.capa_url ? (
                          <img src={m.capa_url} alt={m.titulo} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <cat.icon size={32} style={{ color: cat.color, opacity: 0.3 }} />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase"
                          style={{ background: `${cat.color}30`, color: cat.color, border: `1px solid ${cat.color}40` }}>
                          {cat.value.toUpperCase()}
                        </div>
                        {m.link_pdf && (
                          <div className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center bg-black/60">
                            <Download size={11} className="text-green-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-white text-xs font-bold leading-tight line-clamp-2 mb-1">{m.titulo}</p>
                        <p className="text-white/30 text-[10px]">{(m.planos_acesso || []).join(', ')}</p>
                      </div>
                      <button
                        onClick={() => handleDeletar(m.id, m.titulo)}
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
          )
        })}
      </div>
    </div>
  )
}
