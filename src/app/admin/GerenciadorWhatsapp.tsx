'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { 
  MessageSquare, Cpu, BookOpen, Send, Save, Plus, 
  Trash2, Edit3, Check, Loader2, AlertCircle, X, Smile, Tag
} from 'lucide-react'
import { 
  salvarIaConfiguracao, adicionarFaq, editarFaq, 
  deletarFaq, toggleFaq, enviarMensagemWhatsappManual,
  buscarPlanosStripe, buscarCuponsStripe
} from './actions'

type IaConfigType = {
  id: string
  chave: string
  prompt_sistema: string
  modelo_ia: string
  temperatura: number
  atualizado_em: string
}

type FaqType = {
  id: string
  pergunta: string
  conteudo: string
  categoria: string
  ativo: boolean
  criado_em: string
}

type ChatMessageType = {
  id: string
  sender_phone: string
  author: 'user' | 'assistant'
  message_text: string
  criado_em: string
}

type GerenciadorWhatsappProps = {
  config: IaConfigType | null
  faq: FaqType[]
  chatHistory: ChatMessageType[]
}

export default function GerenciadorWhatsapp({ config, faq, chatHistory }: GerenciadorWhatsappProps) {
  // Abas internas
  const [subTab, setSubTab] = useState<'ia' | 'faq' | 'chat' | 'planos'>('chat')
  const [isPending, startTransition] = useTransition()

  // --- Estado Stripe Planos e Cupons ---
  const [stripePlanos, setStripePlanos] = useState<any[]>([])
  const [stripeCupons, setStripeCupons] = useState<any[]>([])
  const [isLoadingStripe, setIsLoadingStripe] = useState(false)

  // --- Estado IA ---
  const [prompt, setPrompt] = useState(config?.prompt_sistema || '')
  const [modelo, setModelo] = useState(config?.modelo_ia || 'gemini-1.5-flash')
  const [temperatura, setTemperatura] = useState(config?.temperatura || 0.3)
  const [iaStatus, setIaStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // --- Estado FAQ ---
  const [faqs, setFaqs] = useState<FaqType[]>(faq)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null)
  const [faqForm, setFaqForm] = useState({ pergunta: '', conteudo: '', categoria: 'Geral' })
  const [faqStatus, setFaqStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // --- Estado Chat ---
  const [messages, setMessages] = useState<ChatMessageType[]>(chatHistory)
  const [activePhone, setActivePhone] = useState<string | null>(null)
  const [typedMessage, setTypedMessage] = useState('')
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Sincroniza props se atualizarem
  useEffect(() => {
    if (config) {
      setPrompt(config.prompt_sistema)
      setModelo(config.modelo_ia)
      setTemperatura(config.temperatura)
    }
  }, [config])

  useEffect(() => {
    setFaqs(faq)
  }, [faq])

  useEffect(() => {
    setMessages(chatHistory)
  }, [chatHistory])

  useEffect(() => {
    if (subTab === 'planos') {
      setIsLoadingStripe(true)
      startTransition(async () => {
        const resPlanos = await buscarPlanosStripe()
        const resCupons = await buscarCuponsStripe()
        if (resPlanos.success) {
          setStripePlanos(resPlanos.planos || [])
        }
        if (resCupons.success) {
          setStripeCupons(resCupons.cupons || [])
        }
        setIsLoadingStripe(false)
      })
    }
  }, [subTab])

  // Agrupa conversas recentes por telefone e pega o último horário
  const contatos = Object.entries(
    messages.reduce((acc, msg) => {
      const phone = msg.sender_phone
      if (!acc[phone]) {
        acc[phone] = {
          phone,
          lastMessage: msg.message_text,
          lastTime: msg.criado_em,
          msgs: []
        }
      }
      acc[phone].msgs.push(msg)
      // Garante que pegamos a última mensagem e hora real
      if (new Date(msg.criado_em) > new Date(acc[phone].lastTime)) {
        acc[phone].lastMessage = msg.message_text
        acc[phone].lastTime = msg.criado_em
      }
      return acc
    }, {} as Record<string, { phone: string; lastMessage: string; lastTime: string; msgs: ChatMessageType[] }>)
  )
  .map(([_, v]) => v)
  .sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime())

  // Se não tiver telefone ativo selecionado, seleciona o primeiro da lista automaticamente
  useEffect(() => {
    if (!activePhone && contatos.length > 0) {
      setActivePhone(contatos[0].phone)
    }
  }, [contatos, activePhone])

  // Scroll automático no chat
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activePhone, messages])

  // Mensagens filtradas para o chat selecionado
  const activeMessages = messages
    .filter(m => m.sender_phone === activePhone)
    .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime())

  // --- Ações IA ---
  const handleSaveIa = () => {
    setIaStatus(null)
    startTransition(async () => {
      const formData = new FormData()
      formData.append('prompt_sistema', prompt)
      formData.append('modelo_ia', modelo)
      formData.append('temperatura', temperatura.toString())

      const res = await salvarIaConfiguracao(formData)
      if (res.success) {
        setIaStatus({ type: 'success', text: 'Configurações da IA salvas com sucesso!' })
      } else {
        setIaStatus({ type: 'error', text: res.error || 'Erro ao salvar configurações.' })
      }
    })
  }

  // --- Ações FAQ ---
  const handleToggleFaq = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    // --- Atualização otimista local ---
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, ativo: newStatus } : f))

    const res = await toggleFaq(id, newStatus)
    if (!res.success) {
      setFaqs(prev => prev.map(f => f.id === id ? { ...f, ativo: currentStatus } : f))
      alert('Erro ao alterar status do FAQ: ' + res.error)
    }
  }

  const handleDeleteFaq = async (id: string) => {
    if (!confirm('Deseja realmente excluir este item da base de conhecimento?')) return

    setFaqs(prev => prev.filter(f => f.id !== id))
    const res = await deletarFaq(id)
    if (!res.success) {
      alert('Erro ao deletar item: ' + res.error)
    }
  }

  const handleOpenAddModal = () => {
    setModalMode('add')
    setFaqForm({ pergunta: '', conteudo: '', categoria: 'Geral' })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item: FaqType) => {
    setModalMode('edit')
    setEditingFaqId(item.id)
    setFaqForm({ pergunta: item.pergunta, conteudo: item.conteudo, categoria: item.categoria })
    setIsModalOpen(true)
  }

  const handleSaveFaqForm = (e: React.FormEvent) => {
    e.preventDefault()
    setFaqStatus(null)

    startTransition(async () => {
      const formData = new FormData()
      formData.append('pergunta', faqForm.pergunta)
      formData.append('conteudo', faqForm.conteudo)
      formData.append('categoria', faqForm.categoria)

      if (modalMode === 'edit' && editingFaqId) {
        formData.append('id', editingFaqId)
        const res = await editarFaq(formData)
        if (res.success) {
          setFaqs(prev => prev.map(f => f.id === editingFaqId ? { ...f, ...faqForm } : f))
          setIsModalOpen(false)
        } else {
          setFaqStatus({ type: 'error', text: res.error || 'Erro ao editar FAQ.' })
        }
      } else {
        const res = await adicionarFaq(formData)
        if (res.success) {
          setIsModalOpen(false)
        } else {
          setFaqStatus({ type: 'error', text: res.error || 'Erro ao adicionar FAQ.' })
        }
      }
    })
  }

  // --- Enviar Mensagem Manual ---
  const handleSendMessage = () => {
    if (!activePhone || !typedMessage.trim() || isPending) return

    const messageText = typedMessage.trim()
    setTypedMessage('')

    // Inserção otimista local para feedback instantâneo no chat
    const tempId = `temp-${Date.now()}`
    const optMessage: ChatMessageType = {
      id: tempId,
      sender_phone: activePhone,
      author: 'assistant',
      message_text: messageText,
      criado_em: new Date().toISOString()
    }
    setMessages(prev => [optMessage, ...prev])

    startTransition(async () => {
      const res = await enviarMensagemWhatsappManual(activePhone, messageText)
      if (!res.success) {
        setMessages(prev => prev.filter(m => m.id !== tempId))
        alert('Erro ao enviar mensagem: ' + res.error)
      }
    })
  }

  // Formata o telefone para exibição
  const formatPhone = (phone: string) => {
    if (!phone) return ''
    let clean = phone.replace(/\D/g, '')
    if (clean.startsWith('55') && clean.length >= 12) {
      const ddd = clean.substring(2, 4)
      const num = clean.substring(4)
      return `+55 (${ddd}) ${num.substring(0, num.length - 4)}-${num.substring(num.length - 4)}`
    }
    return `+${phone}`
  }

  // Formata data e hora legível
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString)
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return ''
    }
  }

  return (
    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl space-y-8 min-h-[600px] flex flex-col">
      
      {/* Topo com Nome do Lucas e Abas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#D4AF37] flex items-center justify-center shadow-lg transform -rotate-3">
            <Smile size={24} className="text-black" />
          </div>
          <div>
            <h2 className="text-white text-xl font-black tracking-tight">Atendente Lucas (Whats)</h2>
            <p className="text-white/40 text-xs">Monitore conversas e gerencie o cérebro da inteligência artificial.</p>
          </div>
        </div>

        {/* Guia de sub-abas */}
        <div className="flex bg-[#0b0f19] border border-white/5 rounded-xl p-1 w-fit flex-wrap">
          {[
            { id: 'chat', label: 'Conversas', icon: MessageSquare },
            { id: 'faq', label: 'FAQ Suporte', icon: BookOpen },
            { id: 'ia', label: 'Diretrizes da IA', icon: Cpu },
            { id: 'planos', label: 'Planos e Cupons', icon: Tag },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${subTab === tab.id ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37]' : 'text-white/40 hover:text-white/70'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ────────────────── SUB-ABA: CONVERSAS E CHAT ────────────────── */}
      {subTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-white/5 rounded-3xl overflow-hidden bg-[#0b0f19] h-[550px] flex-1">
          
          {/* Coluna Esquerda: Contatos */}
          <div className="lg:col-span-4 border-r border-white/5 flex flex-col h-full bg-[#0d1220]">
            <div className="p-4 border-b border-white/5 bg-[#0b0f19]">
              <span className="text-white/50 text-[0.65rem] uppercase tracking-widest font-black">Conversas Ativas ({contatos.length})</span>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {contatos.length === 0 ? (
                <div className="text-center py-10 text-white/30 text-sm">Nenhuma conversa registrada.</div>
              ) : (
                contatos.map(c => (
                  <button
                    key={c.phone}
                    onClick={() => setActivePhone(c.phone)}
                    className={`w-full text-left p-4 flex flex-col gap-1 transition-all hover:bg-white/[0.02] ${activePhone === c.phone ? 'bg-white/5 border-l-4 border-[#D4AF37]' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">{formatPhone(c.phone)}</span>
                      <span className="text-[0.65rem] text-white/30">{formatTime(c.lastTime)}</span>
                    </div>
                    <p className="text-xs text-white/50 truncate pr-4">{c.lastMessage}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Coluna Direita: Janela de Chat */}
          <div className="lg:col-span-8 flex flex-col h-full bg-[#080b13]">
            {activePhone ? (
              <>
                {/* Header do Chat */}
                <div className="p-4 border-b border-white/5 bg-[#0b0f19] flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-black text-sm text-white">{formatPhone(activePhone)}</span>
                    <span className="text-[0.65rem] text-green-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                      Assistência Ativada
                    </span>
                  </div>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col-reverse justify-start">
                  <div ref={chatBottomRef} />
                  
                  {activeMessages.map((m, idx) => {
                    const isUser = m.author === 'user'
                    const showDate = idx === 0 || formatDate(m.criado_em) !== formatDate(activeMessages[idx - 1]?.criado_em)
                    
                    return (
                      <div key={m.id} className="flex flex-col">
                        {showDate && (
                          <div className="text-center my-3">
                            <span className="bg-white/5 border border-white/5 text-white/30 text-[0.65rem] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              {formatDate(m.criado_em)}
                            </span>
                          </div>
                        )}
                        <div className={`flex w-full ${isUser ? 'justify-start' : 'justify-end'}`}>
                          <div 
                            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-md flex flex-col gap-1 transition-all ${isUser ? 'bg-white/5 text-white rounded-tl-none' : 'bg-gradient-to-br from-[#FFD700]/10 to-[#D4AF37]/10 text-white border border-[#D4AF37]/20 rounded-tr-none'}`}
                          >
                            <span className="leading-relaxed whitespace-pre-wrap">{m.message_text}</span>
                            <span className="text-[0.6rem] text-white/30 self-end font-bold mt-1">
                              {formatTime(m.criado_em)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Input de Mensagem Manual */}
                <div className="p-4 border-t border-white/5 bg-[#0b0f19] flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Digite uma resposta manual para enviar via WhatsApp..."
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-[#05070c] border border-white/5 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder-white/20"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!typedMessage.trim() || isPending}
                    className="h-11 w-11 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#D4AF37] text-black flex items-center justify-center hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-lg active:scale-95"
                  >
                    {isPending ? (
                      <Loader2 size={16} className="animate-spin text-black" />
                    ) : (
                      <Send size={16} className="text-black" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-white/30">
                <MessageSquare size={48} className="mb-4 opacity-20" />
                <p className="text-sm">Selecione um contato na barra lateral para ver o histórico e enviar mensagens.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ────────────────── SUB-ABA: BASE DE CONHECIMENTO (FAQ) ────────────────── */}
      {subTab === 'faq' && (
        <div className="space-y-6 flex-1">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-white font-bold text-lg">Base de Dados e Suporte</h3>
              <p className="text-white/40 text-xs">Essas informações são consultadas pelo Lucas na hora de dar suporte ou vender planos.</p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#D4AF37] text-black font-bold text-xs hover:brightness-110 transition-all shadow-lg active:scale-95"
            >
              <Plus size={14} />
              Adicionar Pergunta
            </button>
          </div>

          {/* Grid de Cards de FAQ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.length === 0 ? (
              <div className="col-span-2 text-center py-20 text-white/30 border border-dashed border-white/10 rounded-2xl">
                Nenhum item cadastrado no suporte. Cadastre o primeiro acima!
              </div>
            ) : (
              faqs.map(item => (
                <div key={item.id} className={`bg-[#0d1220] border rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all hover:border-white/10 ${item.ativo ? 'border-white/5' : 'border-white/5 opacity-50'}`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-[#D4AF37] border border-white/5 text-[0.65rem] font-bold uppercase tracking-wider">
                        {item.categoria}
                      </span>
                      
                      {/* Switch Ativo/Inativo */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={item.ativo} 
                          onChange={() => handleToggleFaq(item.id, item.ativo)}
                          className="sr-only peer" 
                        />
                        <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>

                    <div>
                      <h4 className="text-white font-bold text-sm leading-snug">{item.pergunta}</h4>
                      <p className="text-white/50 text-xs mt-2 leading-relaxed whitespace-pre-wrap">{item.conteudo}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                    <button
                      onClick={() => handleOpenEditModal(item)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(item.id)}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ────────────────── SUB-ABA: CONFIGURAÇÃO IA ────────────────── */}
      {subTab === 'ia' && (
        <div className="space-y-6 max-w-3xl flex-1">
          <div>
            <h3 className="text-white font-bold text-lg">Diretrizes de Comportamento</h3>
            <p className="text-white/40 text-xs">Instruções que moldam a personalidade, limites e tom de voz do robô.</p>
          </div>

          <div className="space-y-4">
            
            {/* Input Prompt de Sistema */}
            <div className="space-y-2">
              <label className="block text-white/50 text-[0.65rem] uppercase tracking-wider font-bold">Prompt de Sistema (Instrução Mestre)</label>
              <textarea
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Você é o Lucas, atendente de vendas e suporte do Contos de Oração..."
                className="w-full bg-[#0d1220] border border-white/5 focus:border-[#D4AF37]/50 rounded-2xl p-4 text-sm text-white focus:outline-none transition-all placeholder-white/20 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Modelo de IA */}
              <div className="space-y-2">
                <label className="block text-white/50 text-[0.65rem] uppercase tracking-wider font-bold">Modelo da Inteligência Artificial</label>
                <select
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="w-full bg-[#0d1220] border border-white/5 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
                >
                  <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Recomendado - Mais Rápido)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Clássico)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Mais inteligente - Mais lento)</option>
                </select>
              </div>

              {/* Temperatura */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="block text-white/50 text-[0.65rem] uppercase tracking-wider font-bold">Temperatura (Criatividade)</label>
                  <span className="text-xs text-[#D4AF37] font-bold">{temperatura}</span>
                </div>
                <div className="flex items-center gap-3 bg-[#0d1220] border border-white/5 rounded-xl px-4 py-3 h-11">
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.05"
                    value={temperatura}
                    onChange={(e) => setTemperatura(parseFloat(e.target.value))}
                    className="flex-1 accent-[#D4AF37]"
                  />
                </div>
              </div>

            </div>

            {/* Mensagem de Feedback */}
            {iaStatus && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${iaStatus.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {iaStatus.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                {iaStatus.text}
              </div>
            )}

            {/* Botão Salvar */}
            <div className="pt-4 border-t border-white/5 flex justify-end">
              <button
                onClick={handleSaveIa}
                disabled={isPending || !prompt.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#D4AF37] text-black font-bold text-xs hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-lg active:scale-95"
              >
                {isPending ? (
                  <Loader2 size={14} className="animate-spin text-black" />
                ) : (
                  <Save size={14} className="text-black" />
                )}
                Salvar Configurações
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ────────────────── MODAL: ADICIONAR / EDITAR FAQ ────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-white/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0d1220]">
              <h4 className="text-white font-extrabold text-base">
                {modalMode === 'edit' ? 'Editar FAQ' : 'Adicionar Nova Pergunta'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Formulário Modal */}
            <form onSubmit={handleSaveFaqForm} className="p-6 space-y-4">
              
              {/* Categoria */}
              <div className="space-y-1.5">
                <label className="block text-white/50 text-[0.65rem] uppercase tracking-wider font-bold">Categoria</label>
                <select
                  value={faqForm.categoria}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, categoria: e.target.value }))}
                  className="w-full bg-[#05070c] border border-white/5 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all"
                >
                  <option value="Geral">Suporte Geral</option>
                  <option value="Preços">Valores e Planos</option>
                  <option value="Conteúdo">Conteúdos da Plataforma</option>
                  <option value="Acesso">Problemas de Login/Acesso</option>
                </select>
              </div>

              {/* Pergunta */}
              <div className="space-y-1.5">
                <label className="block text-white/50 text-[0.65rem] uppercase tracking-wider font-bold">Pergunta</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Qual o valor da assinatura anual?"
                  value={faqForm.pergunta}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, pergunta: e.target.value }))}
                  className="w-full bg-[#05070c] border border-white/5 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder-white/20"
                />
              </div>

              {/* Conteúdo / Resposta */}
              <div className="space-y-1.5">
                <label className="block text-white/50 text-[0.65rem] uppercase tracking-wider font-bold">Resposta detalhada</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Forneça as diretrizes reais para o Lucas responder..."
                  value={faqForm.conteudo}
                  onChange={(e) => setFaqForm(prev => ({ ...prev, conteudo: e.target.value }))}
                  className="w-full bg-[#05070c] border border-white/5 focus:border-[#D4AF37]/50 rounded-xl p-4 text-sm text-white focus:outline-none transition-all placeholder-white/20 leading-relaxed"
                />
              </div>

              {/* Feedback de erro */}
              {faqStatus && faqStatus.type === 'error' && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-xs font-bold text-red-400">
                  <AlertCircle size={14} />
                  {faqStatus.text}
                </div>
              )}

              {/* Footer Modal */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3 bg-[#0b0f19] -mx-6 -mb-6 p-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-white/60 hover:text-white font-bold text-xs transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || !faqForm.pergunta.trim() || !faqForm.conteudo.trim()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#FFD700] to-[#D4AF37] text-black font-bold text-xs hover:brightness-110 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-lg active:scale-95"
                >
                  {isPending && <Loader2 size={13} className="animate-spin text-black" />}
                  Salvar FAQ
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ────────────────── SUB-ABA: PLANOS E CUPONS STRIPE ────────────────── */}
      {subTab === 'planos' && (
        <div className="space-y-8 flex-1">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-white font-bold text-lg">Planos e Cupons do Stripe</h3>
              <p className="text-white/40 text-xs">Valores e códigos promocionais ativos que o Lucas consulta dinamicamente.</p>
            </div>
          </div>

          {isLoadingStripe ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/30">
              <Loader2 className="animate-spin mb-3 text-[#D4AF37]" size={28} />
              <p className="text-xs">Buscando informações em tempo real no Stripe...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Tabela de Planos */}
              <div className="space-y-4">
                <h4 className="text-white font-extrabold text-sm border-b border-white/5 pb-2">Planos Ativos no Stripe</h4>
                {stripePlanos.length === 0 ? (
                  <div className="text-center py-10 text-white/30 text-xs border border-white/5 rounded-2xl bg-white/[0.01]">
                    Nenhum plano ativo encontrado no Stripe.
                  </div>
                ) : (
                  <div className="border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 bg-[#0b0f19]">
                    {stripePlanos.map((p) => (
                      <div key={p.id} className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-all">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-sm text-white">{p.produtoNome}</span>
                          <span className="text-[0.65rem] text-white/30 font-bold font-mono">{p.id}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-[#D4AF37]">R$ {p.valor.toFixed(2)}</span>
                          <span className="text-[0.65rem] text-white/40 block">Cobrança: {p.intervalo}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="p-4 rounded-2xl bg-[#D4AF37]/5 border border-[#D4AF37]/10 text-xs text-white/60 leading-relaxed">
                  ⚠️ **Planos errados ou inexistentes?** O Lucas lê os planos ativos diretamente da sua conta oficial do Stripe. Para apagar planos antigos ou valores errados, você precisa desativá-los ou arquivá-los diretamente no seu painel do Stripe (stripe.com).
                </div>
              </div>

              {/* Tabela de Cupons */}
              <div className="space-y-4">
                <h4 className="text-white font-extrabold text-sm border-b border-white/5 pb-2">Cupons de Desconto Criados</h4>
                {stripeCupons.length === 0 ? (
                  <div className="text-center py-10 text-white/30 text-xs border border-white/5 rounded-2xl bg-white/[0.01]">
                    Nenhum cupom ativo encontrado no Stripe.
                  </div>
                ) : (
                  <div className="border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/5 bg-[#0b0f19]">
                    {stripeCupons.map((c) => (
                      <div key={c.id} className="p-4 flex items-center justify-between hover:bg-white/[0.01] transition-all">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-sm text-white font-mono">{c.id}</span>
                          <span className="text-[0.65rem] text-white/40">Duração: {c.duration}</span>
                        </div>
                        <div className="text-right">
                          {c.percent_off ? (
                            <span className="text-sm font-black text-green-400">{c.percent_off}% OFF</span>
                          ) : (
                            <span className="text-sm font-black text-green-400">R$ {c.amount_off?.toFixed(2)} OFF</span>
                          )}
                          <span className={`text-[0.6rem] block font-bold uppercase tracking-wider ${c.valid ? 'text-emerald-500' : 'text-red-400'}`}>
                            {c.valid ? 'Válido' : 'Inválido'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/50 leading-relaxed">
                  💡 **Dica de Vendas**: Se você quiser criar cupons para campanhas específicas ou resgatar clientes, crie-os no seu painel do Stripe com um código simples (ex: `FESTAS10`). O Lucas conseguirá ver o cupom criado e aplicá-lo na hora de responder sobre promoções no WhatsApp!
                </div>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  )
}

