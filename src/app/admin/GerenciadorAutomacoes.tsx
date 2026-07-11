'use client'

import React, { useState, useTransition } from 'react'
import {
  Trash2, Plus, Edit3, X, Check, Loader2, Zap, Play, ToggleLeft, ToggleRight
} from 'lucide-react'
import {
  adicionarAutomacaoInstagram,
  editarAutomacaoInstagram,
  deletarAutomacaoInstagram,
  toggleAutomacaoInstagramAtiva
} from './actions'

type Automacao = {
  id: string
  palavra_chave: string
  resposta: string
  resposta_2: string | null
  resposta_3: string | null
  resposta_4: string | null
  resposta_5: string | null
  video_id: string | null
  link_vendas: string | null
  ativo: boolean
  criado_em: string
}

type Props = {
  automacoes: Automacao[]
}

export default function GerenciadorAutomacoes({ automacoes: initialAutomacoes }: Props) {
  const [automacoesList, setAutomacoesList] = useState<Automacao[]>(initialAutomacoes)
  const [modalAberto, setModalAberto] = useState(false)
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false)
  const [automacaoEditando, setAutomacaoEditando] = useState<Automacao | null>(null)

  // Form State
  const [palavraChave, setPalavraChave] = useState('')
  const [resposta, setResposta] = useState('')
  const [resposta2, setResposta2] = useState('')
  const [resposta3, setResposta3] = useState('')
  const [resposta4, setResposta4] = useState('')
  const [resposta5, setResposta5] = useState('')
  const [videoId, setVideoId] = useState('')
  const [linkVendas, setLinkVendas] = useState('')
  const [erro, setErro] = useState('')
  const [isPending, startTransition] = useTransition()

  const inputCls = 'w-full bg-[#0f171e] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm'
  const labelCls = 'block text-white/50 text-[0.7rem] uppercase tracking-widest mb-1.5 font-bold'

  // Reset form states
  const resetForm = () => {
    setPalavraChave('')
    setResposta('')
    setResposta2('')
    setResposta3('')
    setResposta4('')
    setResposta5('')
    setVideoId('')
    setLinkVendas('')
    setErro('')
  }

  // Handle Add
  const handleAdicionar = () => {
    if (!palavraChave.trim()) { setErro('Palavra-chave é obrigatória.'); return }
    if (!resposta.trim()) { setErro('Resposta é obrigatória.'); return }
    setErro('')

    const fd = new FormData()
    fd.append('palavra_chave', palavraChave.trim())
    fd.append('resposta', resposta.trim())
    fd.append('resposta_2', resposta2.trim())
    fd.append('resposta_3', resposta3.trim())
    fd.append('resposta_4', resposta4.trim())
    fd.append('resposta_5', resposta5.trim())
    fd.append('video_id', videoId.trim() || '')
    fd.append('link_vendas', linkVendas.trim() || '')

    startTransition(async () => {
      const res = await adicionarAutomacaoInstagram(fd)
      if (res?.success) {
        // Recarregar a página ou atualizar o estado local. Como estamos em Next.js App Router, revalidatePath fará o fetch no server,
        // mas para atualizarmos o estado local de forma imediata (SPA feeling):
        // Nota: O ideal é forçar um reload para sincronizar o UUID real retornado do Supabase.
        window.location.reload()
      } else {
        setErro(res?.error ?? 'Erro ao adicionar automação.')
      }
    })
  }

  // Handle Edit Save
  const handleEditar = () => {
    if (!automacaoEditando) return
    if (!palavraChave.trim()) { setErro('Palavra-chave é obrigatória.'); return }
    if (!resposta.trim()) { setErro('Resposta é obrigatória.'); return }
    setErro('')

    const fd = new FormData()
    fd.append('id', automacaoEditando.id)
    fd.append('palavra_chave', palavraChave.trim())
    fd.append('resposta', resposta.trim())
    fd.append('resposta_2', resposta2.trim())
    fd.append('resposta_3', resposta3.trim())
    fd.append('resposta_4', resposta4.trim())
    fd.append('resposta_5', resposta5.trim())
    fd.append('video_id', videoId.trim() || '')
    fd.append('link_vendas', linkVendas.trim() || '')

    startTransition(async () => {
      const res = await editarAutomacaoInstagram(fd)
      if (res?.success) {
        setAutomacoesList(prev => prev.map(a => a.id === automacaoEditando.id ? {
          ...a,
          palavra_chave: palavraChave.trim(),
          resposta: resposta.trim(),
          resposta_2: resposta2.trim(),
          resposta_3: resposta3.trim(),
          resposta_4: resposta4.trim(),
          resposta_5: resposta5.trim(),
          video_id: videoId.trim() || null,
          link_vendas: linkVendas.trim() || null
        } : a))
        setModalEdicaoAberto(false)
        resetForm()
      } else {
        setErro(res?.error ?? 'Erro ao editar automação.')
      }
    })
  }

  // Handle Delete
  const handleDeletar = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta automação do Instagram?')) return
    const res = await deletarAutomacaoInstagram(id)
    if (res?.success) {
      setAutomacoesList(prev => prev.filter(a => a.id !== id))
    } else {
      alert('Erro ao excluir: ' + (res?.error ?? 'Erro desconhecido'))
    }
  }

  // Handle Toggle Active
  const handleToggle = async (a: Automacao) => {
    const novoStatus = !a.ativo
    // Otimista
    setAutomacoesList(prev => prev.map(item => item.id === a.id ? { ...item, ativo: novoStatus } : item))
    const res = await toggleAutomacaoInstagramAtiva(a.id, novoStatus)
    if (!res?.success) {
      // Reverter se falhar
      setAutomacoesList(prev => prev.map(item => item.id === a.id ? { ...item, ativo: !novoStatus } : item))
      alert('Erro ao alternar status: ' + (res?.error ?? 'Erro desconhecido'))
    }
  }

  // Abrir Modal de Edição
  const abrirEdicao = (a: Automacao) => {
    setAutomacaoEditando(a)
    setPalavraChave(a.palavra_chave)
    setResposta(a.resposta)
    setResposta2(a.resposta_2 ?? '')
    setResposta3(a.resposta_3 ?? '')
    setResposta4(a.resposta_4 ?? '')
    setResposta5(a.resposta_5 ?? '')
    setVideoId(a.video_id ?? '')
    setLinkVendas(a.link_vendas ?? '')
    setModalEdicaoAberto(true)
  }

  return (
    <div className="space-y-6">
      {/* Header do Gerenciador */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h3 className="text-white text-xl font-black tracking-tight flex items-center gap-2">
            <Zap size={20} className="text-[#D4AF37]" />
            Automações de Comentários (Instagram)
          </h3>
          <p className="text-white/40 text-xs mt-1">
            Configure palavras-chave ("palavras mágicas") para responder automaticamente via Direct Message (DM).
          </p>
        </div>

        <button
          onClick={() => { resetForm(); setModalAberto(true) }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-black transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' }}
        >
          <Plus size={14} />
          Nova Regra
        </button>
      </div>

      {/* Lista de Automações */}
      {automacoesList.length === 0 ? (
        <div className="bg-[#111827] border border-white/5 rounded-3xl p-12 text-center">
          <Zap size={36} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm">Nenhuma regra de automação cadastrada ainda.</p>
          <button
            onClick={() => { resetForm(); setModalAberto(true) }}
            className="mt-4 px-4 py-2 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all text-xs font-bold rounded-xl"
          >
            Criar primeira regra
          </button>
        </div>
      ) : (
        <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="p-5 text-white/50 text-[0.65rem] uppercase tracking-widest font-black">Palavra Mágica</th>
                  <th className="p-5 text-white/50 text-[0.65rem] uppercase tracking-widest font-black">Resposta Automática (Direct)</th>
                  <th className="p-5 text-white/50 text-[0.65rem] uppercase tracking-widest font-black">ID do Reels/Post (Opcional)</th>
                  <th className="p-5 text-white/50 text-[0.65rem] uppercase tracking-widest font-black">Status</th>
                  <th className="p-5 text-white/50 text-[0.65rem] uppercase tracking-widest font-black text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {automacoesList.map(a => (
                  <tr key={a.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="p-5 font-black text-sm text-[#D4AF37] font-mono uppercase">
                      {a.palavra_chave}
                    </td>
                    <td className="p-5 text-white/80 text-sm max-w-md truncate" title={a.resposta}>
                      {a.resposta}
                    </td>
                    <td className="p-5 text-white/40 text-xs font-mono">
                      {a.video_id ? a.video_id : <span className="opacity-40 italic">Global (Qualquer post)</span>}
                    </td>
                    <td className="p-5">
                      <button
                        onClick={() => handleToggle(a)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] font-black uppercase transition-all ${
                          a.ativo
                            ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${a.ativo ? 'bg-[#10b981]' : 'bg-red-400'}`} />
                        {a.ativo ? 'Ativo' : 'Pausado'}
                      </button>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => abrirEdicao(a)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeletar(a.id)}
                          className="p-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-400 transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL ADICIONAR REGRA */}
      {modalAberto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0A0C12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gradient-to-r from-yellow-500/5 to-amber-500/10">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#D4AF37]" />
                <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Nova Regra de Automação</h4>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Palavra Mágica */}
              <div>
                <label className={labelCls}>Palavra Mágica (Palavra-Chave) *</label>
                <input
                  value={palavraChave}
                  onChange={e => setPalavraChave(e.target.value)}
                  placeholder="Ex: QUERO, ORACAO, EUQUERO"
                  className={inputCls + ' uppercase font-mono'}
                />
                <p className="text-white/20 text-[0.65rem] mt-1.5">
                  Evite acentos e caracteres especiais se possível para facilitar o matching do seguidor.
                </p>
              </div>

              {/* ID do Reels */}
              <div>
                <label className={labelCls}>ID do Reels / Post (Opcional)</label>
                <input
                  value={videoId}
                  onChange={e => setVideoId(e.target.value)}
                  placeholder="Ex: C8xfG_fP1aB (Vazio = vale para qualquer post)"
                  className={inputCls + ' font-mono'}
                />
                <p className="text-white/20 text-[0.65rem] mt-1.5">
                  Se preenchido, a automação só responderá a comentários feitos neste post específico.
                </p>
              </div>

              {/* Link de Vendas */}
              <div>
                <label className={labelCls}>Link de Vendas / Destino (Opcional)</label>
                <input
                  type="url"
                  value={linkVendas}
                  onChange={e => setLinkVendas(e.target.value)}
                  placeholder="Ex: https://bibliotecacatolica.lovable.app"
                  className={inputCls}
                />
                <p className="text-white/20 text-[0.65rem] mt-1.5">
                  Se preenchido, o robô irá anexar esse link automaticamente no final da resposta sorteada.
                </p>
              </div>

              {/* Respostas com variações */}
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Mensagem de Resposta 1 (Padrão) *</label>
                  <textarea
                    value={resposta}
                    onChange={e => setResposta(e.target.value)}
                    rows={3}
                    placeholder="Primeira variação de texto ou link principal..."
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Mensagem de Resposta 2 (Opcional)</label>
                  <textarea
                    value={resposta2}
                    onChange={e => setResposta2(e.target.value)}
                    rows={2}
                    placeholder="Segunda variação opcional de texto..."
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Mensagem de Resposta 3 (Opcional)</label>
                  <textarea
                    value={resposta3}
                    onChange={e => setResposta3(e.target.value)}
                    rows={2}
                    placeholder="Terceira variação opcional de texto..."
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Mensagem de Resposta 4 (Opcional)</label>
                  <textarea
                    value={resposta4}
                    onChange={e => setResposta4(e.target.value)}
                    rows={2}
                    placeholder="Quarta variação opcional de texto..."
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Mensagem de Resposta 5 (Opcional)</label>
                  <textarea
                    value={resposta5}
                    onChange={e => setResposta5(e.target.value)}
                    rows={2}
                    placeholder="Quinta variação opcional de texto..."
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Erro */}
              {erro && (
                <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {erro}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={() => setModalAberto(false)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionar}
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-black disabled:opacity-60 transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' }}
              >
                {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                {isPending ? 'Criando...' : 'Salvar Regra'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR REGRA */}
      {modalEdicaoAberto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0A0C12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gradient-to-r from-yellow-500/5 to-amber-500/10">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#D4AF37]" />
                <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Editar Regra de Automação</h4>
              </div>
              <button
                onClick={() => { setModalEdicaoAberto(false); resetForm(); }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Palavra Mágica */}
              <div>
                <label className={labelCls}>Palavra Mágica (Palavra-Chave) *</label>
                <input
                  value={palavraChave}
                  onChange={e => setPalavraChave(e.target.value)}
                  placeholder="Ex: QUERO, ORACAO, EUQUERO"
                  className={inputCls + ' uppercase font-mono'}
                />
              </div>

              {/* ID do Reels */}
              <div>
                <label className={labelCls}>ID do Reels / Post (Opcional)</label>
                <input
                  value={videoId}
                  onChange={e => setVideoId(e.target.value)}
                  placeholder="Ex: C8xfG_fP1aB (Vazio = vale para qualquer post)"
                  className={inputCls + ' font-mono'}
                />
              </div>

              {/* Link de Vendas */}
              <div>
                <label className={labelCls}>Link de Vendas / Destino (Opcional)</label>
                <input
                  type="url"
                  value={linkVendas}
                  onChange={e => setLinkVendas(e.target.value)}
                  placeholder="Ex: https://bibliotecacatolica.lovable.app"
                  className={inputCls}
                />
                <p className="text-white/20 text-[0.65rem] mt-1.5">
                  Se preenchido, o robô irá anexar esse link automaticamente no final da resposta sorteada.
                </p>
              </div>

              {/* Respostas com variações (Edição) */}
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Mensagem de Resposta 1 (Padrão) *</label>
                  <textarea
                    value={resposta}
                    onChange={e => setResposta(e.target.value)}
                    rows={3}
                    placeholder="Primeira variação de texto ou link principal..."
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Mensagem de Resposta 2 (Opcional)</label>
                  <textarea
                    value={resposta2}
                    onChange={e => setResposta2(e.target.value)}
                    rows={2}
                    placeholder="Segunda variação opcional de texto..."
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Mensagem de Resposta 3 (Opcional)</label>
                  <textarea
                    value={resposta3}
                    onChange={e => setResposta3(e.target.value)}
                    rows={2}
                    placeholder="Terceira variação opcional de texto..."
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Mensagem de Resposta 4 (Opcional)</label>
                  <textarea
                    value={resposta4}
                    onChange={e => setResposta4(e.target.value)}
                    rows={2}
                    placeholder="Quarta variação opcional de texto..."
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls}>Mensagem de Resposta 5 (Opcional)</label>
                  <textarea
                    value={resposta5}
                    onChange={e => setResposta5(e.target.value)}
                    rows={2}
                    placeholder="Quinta variação opcional de texto..."
                    className={inputCls}
                  />
                </div>
              </div>

              {/* Erro */}
              {erro && (
                <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {erro}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={() => { setModalEdicaoAberto(false); resetForm(); }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditar}
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-black disabled:opacity-60 transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' }}
              >
                {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                {isPending ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
