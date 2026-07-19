'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { 
  MessageSquare, Cpu, BookOpen, Send, Save, Plus, 
  Trash2, Edit3, Check, Loader2, AlertCircle, X, Smile, Tag,
  Zap, Play, ToggleLeft, ToggleRight, Heart, Star
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { 
  salvarIaConfiguracao, adicionarFaq, editarFaq, 
  deletarFaq, toggleFaq, enviarMensagemWhatsappManual,
  buscarPlanosStripe, buscarCuponsStripe,
  adicionarAutomacaoWhatsapp, editarAutomacaoWhatsapp,
  deletarAutomacaoWhatsapp, toggleAutomacaoWhatsappAtiva,
  obterNumeroWhatsapp, salvarNumeroWhatsapp, fecharConversaWhatsapp,
  excluirConversaWhatsapp
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
  resolvida?: boolean
}

type AutomacaoWhatsapp = {
  id: string
  palavra_chave: string
  mensagem_link: string
  prompt_ia: string
  link_vendas?: string
  ativo: boolean
  is_fallback: boolean
  envios_sucesso?: number
  envios_erro?: number
  criado_em: string
}

type RatingMessageType = {
  id: string
  telefone: string
  nome_cliente: string | null
  nota: string // 'nota_excelente', 'nota_bom', 'nota_regular'
  criado_em: string
}

type GerenciadorWhatsappProps = {
  config: IaConfigType | null
  faq: FaqType[]
  chatHistory: ChatMessageType[]
  automacoesWhatsapp: AutomacaoWhatsapp[]
  avaliacoes?: RatingMessageType[]
}

export default function GerenciadorWhatsapp({ config, faq, chatHistory, automacoesWhatsapp = [], avaliacoes = [] }: GerenciadorWhatsappProps) {
  // Abas internas
  const [subTab, setSubTab] = useState<'ia' | 'faq' | 'chat' | 'planos' | 'whats_auto' | 'avaliacoes'>('chat')
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
  const [ratings, setRatings] = useState<RatingMessageType[]>(avaliacoes)

  useEffect(() => {
    setRatings(avaliacoes)
  }, [avaliacoes])

  const [activePhone, setActivePhone] = useState<string | null>(null)
  const [typedMessage, setTypedMessage] = useState('')
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // --- Estado Whats Auto ---
  const [whatsappList, setWhatsappList] = useState<AutomacaoWhatsapp[]>(automacoesWhatsapp)
  const [modalWhatsAberto, setModalWhatsAberto] = useState(false)
  const [modalWhatsEdicaoAberto, setModalWhatsEdicaoAberto] = useState(false)
  const [whatsEditando, setWhatsEditando] = useState<AutomacaoWhatsapp | null>(null)
  const [whatsappNumero, setWhatsappNumero] = useState('5564992994823')
  const [salvandoNumero, setSalvandoNumero] = useState(false)
  const [numeroSalvoFeedback, setNumeroSalvoFeedback] = useState(false)
  const [adminConfirmSenha, setAdminConfirmSenha] = useState('')
  const [erroWhats, setErroWhats] = useState('')

  // WhatsApp Form State
  const [whatsPalavraChave, setWhatsPalavraChave] = useState('')
  const [whatsMensagemLink, setWhatsMensagemLink] = useState('Quero conhecer a Biblioteca')
  const [whatsPromptIa, setWhatsPromptIa] = useState('')
  const [whatsLinkVendas, setWhatsLinkVendas] = useState('')
  const [whatsIsFallback, setWhatsIsFallback] = useState(false)
  const [whatsAtivo, setWhatsAtivo] = useState(true)

  // Sync whatsapp list from prop
  useEffect(() => {
    setWhatsappList(automacoesWhatsapp)
  }, [automacoesWhatsapp])

  // Get WhatsApp number on mount
  useEffect(() => {
    obterNumeroWhatsapp().then(res => {
      if (res.success && res.valor) {
        setWhatsappNumero(res.valor)
      }
    })
  }, [])

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

  // --- Supabase Realtime para chat em tempo real ---
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('whatsapp-chat-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_chat_history' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as ChatMessageType
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev
              return [newMsg, ...prev]
            })
          } else if (payload.eventType === 'DELETE') {
            const oldId = payload.old.id
            setMessages((prev) => prev.filter((m) => m.id !== oldId))
          } else if (payload.eventType === 'UPDATE') {
            const updatedMsg = payload.new as ChatMessageType
            if (updatedMsg.resolvida) {
              setMessages((prev) => prev.filter((m) => m.sender_phone !== updatedMsg.sender_phone))
              // Se a conversa ativa foi resolvida, deseleciona ela
              setActivePhone((current) => {
                if (current === updatedMsg.sender_phone) {
                  return null
                }
                return current
              })
            } else {
              setMessages((prev) =>
                prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
              )
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // --- Supabase Realtime para avaliações em tempo real ---
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('pesquisa-satisfacao-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'pesquisa_satisfacao' },
        (payload) => {
          const newRating = payload.new as RatingMessageType
          setRatings((prev) => {
            if (prev.some((r) => r.id === newRating.id)) return prev
            return [newRating, ...prev]
          })
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'pesquisa_satisfacao' },
        (payload) => {
          const oldId = payload.old.id
          setRatings((prev) => prev.filter((r) => r.id !== oldId))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])


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

  // --- Fechar Conversa (Arquivar/Ocultar logicamente) ---
  const handleFecharConversa = (phone: string) => {
    if (!confirm('Deseja realmente fechar esta conversa? O histórico de mensagens será mantido no banco, mas ela sumirá das conversas ativas.')) return

    startTransition(async () => {
      const res = await fecharConversaWhatsapp(phone)
      if (res.success) {
        setMessages(prev => prev.filter(m => m.sender_phone !== phone))
        const outrosContatos = contatos.filter(c => c.phone !== phone)
        if (outrosContatos.length > 0) {
          setActivePhone(outrosContatos[0].phone)
        } else {
          setActivePhone(null)
        }
      } else {
        alert('Erro ao fechar conversa: ' + res.error)
      }
    })
  }

  // --- Excluir Conversa (Apagar fisicamente) ---
  const handleExcluirConversa = (phone: string) => {
    if (!confirm('ATENÇÃO: Deseja realmente EXCLUIR permanentemente esta conversa? Todo o histórico de mensagens deste número será apagado do banco de dados de forma irreversível.')) return

    startTransition(async () => {
      const res = await excluirConversaWhatsapp(phone)
      if (res.success) {
        setMessages(prev => prev.filter(m => m.sender_phone !== phone))
        const outrosContatos = contatos.filter(c => c.phone !== phone)
        if (outrosContatos.length > 0) {
          setActivePhone(outrosContatos[0].phone)
        } else {
          setActivePhone(null)
        }
      } else {
        alert('Erro ao excluir conversa: ' + res.error)
      }
    })
  }


  // --- CRUD e Lógicas do Whats Auto ---
  const resetWhatsForm = () => {
    setWhatsPalavraChave('')
    setWhatsMensagemLink('Quero conhecer a Biblioteca')
    setWhatsPromptIa('')
    setWhatsLinkVendas('')
    setWhatsIsFallback(false)
    setWhatsAtivo(true)
    setErroWhats('')
  }

  const handleAdicionarWhats = async () => {
    if (!whatsIsFallback && !whatsPalavraChave.trim()) {
      setErroWhats('A Palavra-Chave é obrigatória para regras comuns.')
      return
    }
    
    startTransition(async () => {
      const payload = {
        palavra_chave: whatsIsFallback ? '' : whatsPalavraChave.trim().toUpperCase(),
        mensagem_link: whatsIsFallback ? 'Suporte Geral' : whatsMensagemLink.trim(),
        prompt_ia: 'manual',
        link_vendas: whatsLinkVendas.trim() || undefined,
        ativo: whatsAtivo,
        is_fallback: whatsIsFallback
      }
      const res = await adicionarAutomacaoWhatsapp(payload)
      if (res?.success) {
        setWhatsappList(prev => [
          {
            id: Math.random().toString(),
            ...payload,
            criado_em: new Date().toISOString()
          },
          ...prev
        ])
        setModalWhatsAberto(false)
        resetWhatsForm()
      } else {
        setErroWhats(res?.error ?? 'Erro ao criar regra de WhatsApp.')
      }
    })
  }

  const handleEditarWhats = async () => {
    if (!whatsEditando) return
    if (!whatsIsFallback && !whatsPalavraChave.trim()) {
      setErroWhats('A Palavra-Chave é obrigatória para regras comuns.')
      return
    }

    startTransition(async () => {
      const payload = {
        palavra_chave: whatsIsFallback ? '' : whatsPalavraChave.trim().toUpperCase(),
        mensagem_link: whatsIsFallback ? 'Suporte Geral' : whatsMensagemLink.trim(),
        prompt_ia: 'manual',
        link_vendas: whatsLinkVendas.trim() || undefined,
        ativo: whatsAtivo,
        is_fallback: whatsIsFallback
      }
      const res = await editarAutomacaoWhatsapp(whatsEditando.id, payload)
      if (res?.success) {
        setWhatsappList(prev => prev.map(w => w.id === whatsEditando.id ? {
          ...w,
          ...payload
        } : w))
        setModalWhatsEdicaoAberto(false)
        resetWhatsForm()
      } else {
        setErroWhats(res?.error ?? 'Erro ao editar regra de WhatsApp.')
      }
    })
  }

  const handleDeletarWhats = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta regra do WhatsApp?')) return
    const res = await deletarAutomacaoWhatsapp(id)
    if (res?.success) {
      setWhatsappList(prev => prev.filter(w => w.id !== id))
    } else {
      alert('Erro ao excluir: ' + (res?.error ?? 'Erro desconhecido'))
    }
  }

  const handleToggleWhats = async (w: AutomacaoWhatsapp) => {
    const novoStatus = !w.ativo
    setWhatsappList(prev => prev.map(item => item.id === w.id ? { ...item, ativo: novoStatus } : item))
    const res = await toggleAutomacaoWhatsappAtiva(w.id, novoStatus)
    if (!res?.success) {
      setWhatsappList(prev => prev.map(item => item.id === w.id ? { ...item, ativo: !novoStatus } : item))
      alert('Erro ao alternar status: ' + (res?.error ?? 'Erro desconhecido'))
    }
  }

  const abrirEdicaoWhats = (w: AutomacaoWhatsapp) => {
    setWhatsEditando(w)
    setWhatsPalavraChave(w.palavra_chave)
    setWhatsMensagemLink(w.mensagem_link)
    setWhatsPromptIa(w.prompt_ia)
    setWhatsLinkVendas(w.link_vendas ?? '')
    setWhatsIsFallback(w.is_fallback)
    setWhatsAtivo(w.ativo)
    setModalWhatsEdicaoAberto(true)
  }

  const handleSalvarNumeroWhats = async () => {
    if (!whatsappNumero.trim()) {
      alert('Por favor, insira um número de WhatsApp válido.')
      return
    }
    if (!adminConfirmSenha.trim()) {
      alert('Por favor, digite a senha do administrador para confirmar a alteração.')
      return
    }
    setSalvandoNumero(true)
    const res = await salvarNumeroWhatsapp(whatsappNumero.trim(), adminConfirmSenha)
    setSalvandoNumero(false)
    if (res.success) {
      setNumeroSalvoFeedback(true)
      setAdminConfirmSenha('')
      setTimeout(() => setNumeroSalvoFeedback(false), 3000)
    } else {
      alert('Erro ao salvar número do WhatsApp: ' + (res.error ?? 'Erro desconhecido'))
    }
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
            { id: 'whats_auto', label: 'Whats Auto', icon: Zap },
            { id: 'faq', label: 'FAQ Suporte', icon: BookOpen },
            { id: 'ia', label: 'Diretrizes da IA', icon: Cpu },
            { id: 'planos', label: 'Planos e Cupons', icon: Tag },
            { id: 'avaliacoes', label: 'Satisfação', icon: Heart },
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
        <div className="grid grid-cols-1 lg:grid-cols-12 border border-white/5 rounded-3xl overflow-hidden bg-[#0b0f19] h-[calc(100vh-380px)] min-h-[450px] max-h-[650px] flex-1">
          
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
          <div className="lg:col-span-8 flex flex-col h-full min-h-0 bg-[#080b13] overflow-hidden">
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

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleFecharConversa(activePhone)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-green-500/20 bg-green-500/10 text-green-400 text-xs font-bold hover:bg-green-500/20 disabled:opacity-50 transition-all active:scale-95"
                      title="Oculta a conversa sem apagar o histórico de mensagens"
                    >
                      <Check size={13} />
                      Fechar Conversa
                    </button>
                    <button
                      onClick={() => handleExcluirConversa(activePhone)}
                      disabled={isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-bold hover:bg-red-500/20 disabled:opacity-50 transition-all active:scale-95"
                      title="Apaga permanentemente o histórico do banco"
                    >
                      <Trash2 size={13} />
                      Excluir
                    </button>
                  </div>
                </div>

                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 flex flex-col justify-start">
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
                  <div ref={chatBottomRef} />
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

      {/* ────────────────── SUB-ABA: SATISFAÇÃO / AVALIAÇÕES ────────────────── */}
      {subTab === 'avaliacoes' && (
        <div className="space-y-8 flex-1 animate-fadeIn">
          <div>
            <h3 className="text-white font-bold text-lg">Pesquisa de Satisfação</h3>
            <p className="text-white/40 text-xs">Acompanhe o nível de satisfação das famílias que conversam com o Lucas.</p>
          </div>

          {/* Métricas rápidas */}
          {(() => {
            const total = ratings.length
            const excelentes = ratings.filter(r => r.nota === 'nota_excelente').length
            const bons = ratings.filter(r => r.nota === 'nota_bom').length
            const regulares = ratings.filter(r => r.nota === 'nota_regular').length

            const excelentesPct = total > 0 ? Math.round((excelentes / total) * 100) : 0
            const bonsPct = total > 0 ? Math.round((bons / total) * 100) : 0
            const regularesPct = total > 0 ? Math.round((regulares / total) * 100) : 0

            return (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {/* Total */}
                  <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                    <div>
                      <span className="text-white/40 text-[0.65rem] uppercase tracking-wider font-bold block mb-1">Total Respostas</span>
                      <span className="text-white text-3xl font-black">{total}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50">
                      <Star size={20} />
                    </div>
                  </div>

                  {/* Excelente */}
                  <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                    <div>
                      <span className="text-white/40 text-[0.65rem] uppercase tracking-wider font-bold block mb-1">🌟 Excelentes</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-green-400 text-3xl font-black">{excelentes}</span>
                        <span className="text-green-400/60 text-xs font-bold">({excelentesPct}%)</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                      👍
                    </div>
                  </div>

                  {/* Bom */}
                  <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                    <div>
                      <span className="text-white/40 text-[0.65rem] uppercase tracking-wider font-bold block mb-1">👍 Bons</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[#D4AF37] text-3xl font-black">{bons}</span>
                        <span className="text-[#D4AF37]/60 text-xs font-bold">({bonsPct}%)</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
                      😊
                    </div>
                  </div>

                  {/* Regular */}
                  <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-lg">
                    <div>
                      <span className="text-white/40 text-[0.65rem] uppercase tracking-wider font-bold block mb-1">👎 Regulares / Ruins</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-red-400 text-3xl font-black">{regulares}</span>
                        <span className="text-red-400/60 text-xs font-bold">({regularesPct}%)</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                      👎
                    </div>
                  </div>
                </div>

                {/* Tabela de Avaliações */}
                <div className="bg-[#0b0f19] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl space-y-4">
                  <h4 className="text-white font-extrabold text-sm border-b border-white/5 pb-2">Feedbacks Recebidos</h4>
                  
                  <div className="overflow-x-auto rounded-2xl border border-white/5">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-[#090B10]/40 border-b border-white/5 text-white/40 text-[0.65rem] uppercase tracking-widest font-black">
                          <th className="px-6 py-4">Cliente / Voluntário</th>
                          <th className="px-6 py-4">WhatsApp</th>
                          <th className="px-6 py-4 text-center">Nota</th>
                          <th className="px-6 py-4 text-right">Data/Hora</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {ratings.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-12 text-white/30 text-xs">
                              Nenhuma avaliação registrada ainda no sistema.
                            </td>
                          </tr>
                        ) : (
                          ratings.map((r) => {
                            let badgeClass = ""
                            let label = ""
                            if (r.nota === 'nota_excelente') {
                              badgeClass = "bg-green-500/10 text-green-400 border border-green-500/20"
                              label = "🌟 Excelente"
                            } else if (r.nota === 'nota_bom') {
                              badgeClass = "bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20"
                              label = "👍 Bom"
                            } else {
                              badgeClass = "bg-red-500/10 text-red-400 border border-red-500/20"
                              label = "👎 Regular"
                            }

                            return (
                              <tr key={r.id} className="hover:bg-white/[0.01] transition-colors">
                                <td className="px-6 py-4 font-bold text-white">
                                  {r.nome_cliente || "Visitante Anônimo"}
                                </td>
                                <td className="px-6 py-4 text-white/70 font-mono text-xs">
                                  {formatPhone(r.telefone)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${badgeClass}`}>
                                    {label}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right text-white/40 text-xs font-medium">
                                  {new Date(r.criado_em).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )
          })()}
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

      {/* ────────────────── SUB-ABA: WHATSAPP AUTO (Whats Auto) ────────────────── */}
      {subTab === 'whats_auto' && (
        <div className="space-y-6 flex-1">
          {/* Header do Gerenciador */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-white text-lg font-black tracking-tight flex items-center gap-2">
                <Zap size={20} className="text-[#10b981]" />
                Automações de WhatsApp (Whats Auto)
              </h3>
              <p className="text-white/40 text-xs mt-1">
                Configure palavras-chave associadas a links wa.me, Prompts do Gemini e suporte com IA.
              </p>
            </div>

            <button
              onClick={() => { resetWhatsForm(); setModalWhatsAberto(true) }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' }}
            >
              <Plus size={14} />
              Nova Regra Zap
            </button>
          </div>

          {/* Configuração Global do WhatsApp para Redirecionamento */}
          <div className="bg-[#111827] border rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 border-[#10b981]/20"
               style={{ boxShadow: '0 0 25px -5px rgba(16, 185, 129, 0.05)' }}>
            <div className="flex-1">
              <h4 className="text-white text-base font-black tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full animate-pulse bg-[#10b981]" />
                Número de WhatsApp do Suporte (Whats Auto)
              </h4>
              <p className="text-white/40 text-xs mt-1">
                Este número será utilizado para gerar os links "wa.me" automaticamente. Se você alterar este número, todas as regras do Instagram que enviam links do WhatsApp serão atualizadas em cascata.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                placeholder="Ex: 5564992994823"
                value={whatsappNumero}
                onChange={(e) => setWhatsappNumero(e.target.value.replace(/\D/g, ''))}
                className="bg-[#0f171e] border border-white/10 focus:border-[#10b981] rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm w-full md:w-48"
              />
              <input
                type="password"
                placeholder="Confirmar Senha Admin"
                value={adminConfirmSenha}
                onChange={(e) => setAdminConfirmSenha(e.target.value)}
                className="bg-[#0f171e] border border-white/10 focus:border-red-500 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm w-full md:w-48 text-center"
              />
              <button
                onClick={handleSalvarNumeroWhats}
                disabled={salvandoNumero}
                className="px-5 py-2.5 text-xs font-black rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 bg-[#10b981] hover:bg-[#34D399] text-white"
              >
                {salvandoNumero ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Salvando...
                  </>
                ) : numeroSalvoFeedback ? (
                  <>
                    <Check size={14} />
                    Salvo!
                  </>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </div>

          {/* Lista de Automações WhatsApp */}
          {whatsappList.length === 0 ? (
            <div className="bg-[#111827] border border-[#10b981]/20 rounded-3xl p-12 text-center" style={{ boxShadow: '0 0 25px -5px rgba(16, 185, 129, 0.08)' }}>
              <Zap size={36} className="text-[#10b981]/30 mx-auto mb-4 animate-pulse" />
              <p className="text-white/30 text-sm">Nenhuma regra de WhatsApp cadastrada ainda.</p>
              <button
                onClick={() => { resetWhatsForm(); setModalWhatsAberto(true) }}
                className="mt-4 px-4 py-2 border border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981]/5 transition-all text-xs font-bold rounded-xl"
              >
                Criar primeira regra Zap
              </button>
            </div>
          ) : (
            <div className="bg-[#111827] border border-[#10b981]/20 rounded-3xl overflow-hidden shadow-xl transition-all duration-300" style={{ boxShadow: '0 0 25px -5px rgba(16, 185, 129, 0.08)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="p-5 text-white/50 text-[0.65rem] uppercase tracking-widest font-black">Palavra Mágica / Função</th>
                      <th className="p-5 text-white/50 text-[0.65rem] uppercase tracking-widest font-black">Mensagem do Link (wa.me)</th>
                      <th className="p-5 text-white/50 text-[0.65rem] uppercase tracking-widest font-black">Link de Vendas</th>
                      <th className="p-5 text-white/50 text-[0.65rem] uppercase tracking-widest font-black">Métricas</th>
                      <th className="p-5 text-white/50 text-[0.65rem] uppercase tracking-widest font-black">Status</th>
                      <th className="p-5 text-white/50 text-[0.65rem] uppercase tracking-widest font-black text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {/* Fallback de Suporte Geral */}
                    {whatsappList.filter(w => w.is_fallback).map(w => (
                      <tr key={w.id} className="bg-emerald-500/[0.02] border-l-4 border-emerald-500 hover:bg-emerald-500/[0.04] transition-colors">
                        <td className="p-5 font-black text-sm text-emerald-400 font-mono">
                          PADRÃO (SUPORTE GERAL)
                        </td>
                        <td className="p-5 text-white/40 text-xs italic">
                          Acionado quando o cliente clica em "Falar com Suporte" ou não envia palavra-chave.
                        </td>
                        <td className="p-5 text-white/40 text-xs font-mono max-w-[150px] truncate" title={w.link_vendas || ''}>
                          {w.link_vendas ? w.link_vendas : <span className="opacity-40 italic">Nenhum</span>}
                        </td>
                        <td className="p-5 text-xs font-bold font-mono text-white/60">
                          —
                        </td>
                        <td className="p-5">
                          <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Sempre Ativo
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <button
                            onClick={() => abrirEdicaoWhats(w)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                            title="Editar"
                          >
                            <Edit3 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {/* Regras comuns */}
                    {whatsappList.filter(w => !w.is_fallback).map(w => (
                      <tr key={w.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="p-5 font-black text-sm text-[#10b981] font-mono">
                          <span className="uppercase">{w.palavra_chave}</span>
                        </td>
                        <td className="p-5 text-white/80 text-sm max-w-xs truncate" title={w.mensagem_link}>
                          <span>"{w.mensagem_link}"</span>
                        </td>
                        <td className="p-5 text-white/40 text-xs font-mono max-w-[150px] truncate" title={w.link_vendas || ''}>
                          {w.link_vendas ? w.link_vendas : <span className="opacity-40 italic">Nenhum</span>}
                        </td>
                        <td className="p-5 text-xs font-bold font-mono">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[#10b981]">
                              {w.envios_sucesso || 0} OK
                            </span>
                            <span className="text-red-400">
                              {w.envios_erro || 0} Erro
                            </span>
                          </div>
                        </td>
                        <td className="p-5">
                          <button
                            onClick={() => handleToggleWhats(w)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] font-black uppercase transition-all ${
                              w.ativo
                                ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${w.ativo ? 'bg-[#10b981]' : 'bg-red-400'}`} />
                            {w.ativo ? 'Ativo' : 'Pausado'}
                          </button>
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => abrirEdicaoWhats(w)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                              title="Editar"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeletarWhats(w.id)}
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
        </div>
      )}

      {/* ────────────────── MODAIS WHATSAPP AUTO ────────────────── */}
      {modalWhatsAberto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0A0C12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-green-500/10">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#10b981]" />
                <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Nova Regra de WhatsApp</h4>
              </div>
              <button
                onClick={() => { setModalWhatsAberto(false); resetWhatsForm(); }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <input
                  type="checkbox"
                  id="whatsIsFallback"
                  checked={whatsIsFallback}
                  onChange={e => {
                    setWhatsIsFallback(e.target.checked)
                    if (e.target.checked) {
                      setWhatsPalavraChave('')
                      setWhatsPromptIa('')
                      setWhatsMensagemLink('Suporte Geral')
                    } else {
                      setWhatsMensagemLink('Quero conhecer a Biblioteca')
                    }
                  }}
                  className="rounded border-white/10 text-[#10b981] focus:ring-0 cursor-pointer"
                />
                <label htmlFor="whatsIsFallback" className="text-xs text-white/70 font-bold cursor-pointer select-none">
                  Definir como Regra Padrão de Suporte Geral (Fallback)
                </label>
              </div>

              {!whatsIsFallback && (
                <div>
                  <label className="block text-white/50 text-[0.65rem] uppercase tracking-widest mb-1.5 font-bold">Palavra Mágica do Instagram (Associação) *</label>
                  <input
                    value={whatsPalavraChave}
                    onChange={e => setWhatsPalavraChave(e.target.value)}
                    placeholder="Ex: BIBLIOTECA, CURSO"
                    className="w-full bg-[#0f171e] border border-white/10 focus:border-[#10b981] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm uppercase font-mono"
                  />
                </div>
              )}

              {!whatsIsFallback && (
                <div>
                  <label className="block text-white/50 text-[0.65rem] uppercase tracking-widest mb-1.5 font-bold">Mensagem de Boas-Vindas (Frase do Link) *</label>
                  <input
                    value={whatsMensagemLink}
                    onChange={e => setWhatsMensagemLink(e.target.value)}
                    placeholder="Ex: Quero conhecer a Biblioteca"
                    className="w-full bg-[#0f171e] border border-white/10 focus:border-[#10b981] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm"
                  />
                  <div className="mt-3 p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                    <span className="text-[0.6rem] uppercase tracking-wider text-white/40 font-bold block">Link WhatsApp Gerado automaticamente:</span>
                    <span className="text-[0.7rem] text-[#10b981] truncate font-mono select-all block">
                      {`https://wa.me/${whatsappNumero}?text=${encodeURIComponent(whatsMensagemLink)}`}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-white/50 text-[0.65rem] uppercase tracking-widest mb-1.5 font-bold">Link de Vendas / Checkout (Opcional)</label>
                <input
                  type="url"
                  value={whatsLinkVendas}
                  onChange={e => setWhatsLinkVendas(e.target.value)}
                  placeholder="Ex: https://pay.kiwify.com.br/..."
                  className="w-full bg-[#0f171e] border border-white/10 focus:border-[#10b981] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm"
                />
              </div>

              {erroWhats && (
                <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {erroWhats}
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setModalWhatsAberto(false); resetWhatsForm(); }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarWhats}
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white disabled:opacity-60 transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' }}
              >
                {isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                {isPending ? 'Criando...' : 'Salvar Regra'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalWhatsEdicaoAberto && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0A0C12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-gradient-to-r from-emerald-500/5 to-green-500/10">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-[#10b981]" />
                <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">Editar Regra de WhatsApp</h4>
              </div>
              <button
                onClick={() => { setModalWhatsEdicaoAberto(false); resetWhatsForm(); }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center gap-2 p-3 bg-white/[0.02] border border-white/5 rounded-xl opacity-80">
                <input
                  type="checkbox"
                  id="whatsIsFallbackEdit"
                  checked={whatsIsFallback}
                  disabled
                  className="rounded border-white/10 text-[#10b981] focus:ring-0 cursor-not-allowed"
                />
                <label htmlFor="whatsIsFallbackEdit" className="text-xs text-white/40 font-bold cursor-not-allowed select-none">
                  Regra Padrão de Suporte Geral (Fallback)
                </label>
              </div>

              {!whatsIsFallback && (
                <div>
                  <label className="block text-white/50 text-[0.65rem] uppercase tracking-widest mb-1.5 font-bold">Palavra Mágica do Instagram (Associação) *</label>
                  <input
                    value={whatsPalavraChave}
                    onChange={e => setWhatsPalavraChave(e.target.value)}
                    placeholder="Ex: BIBLIOTECA, CURSO"
                    className="w-full bg-[#0f171e] border border-white/10 focus:border-[#10b981] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm uppercase font-mono"
                  />
                </div>
              )}

              {!whatsIsFallback && (
                <div>
                  <label className="block text-white/50 text-[0.65rem] uppercase tracking-widest mb-1.5 font-bold">Mensagem de Boas-Vindas (Frase do Link) *</label>
                  <input
                    value={whatsMensagemLink}
                    onChange={e => setWhatsMensagemLink(e.target.value)}
                    placeholder="Ex: Quero conhecer a Biblioteca"
                    className="w-full bg-[#0f171e] border border-white/10 focus:border-[#10b981] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm"
                  />
                  <div className="mt-3 p-3 bg-black/40 border border-white/5 rounded-xl space-y-1">
                    <span className="text-[0.6rem] uppercase tracking-wider text-white/40 font-bold block">Link WhatsApp Gerado automaticamente:</span>
                    <span className="text-[0.7rem] text-[#10b981] truncate font-mono select-all block">
                      {`https://wa.me/${whatsappNumero}?text=${encodeURIComponent(whatsMensagemLink)}`}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-white/50 text-[0.65rem] uppercase tracking-widest mb-1.5 font-bold">Link de Vendas / Checkout (Opcional)</label>
                <input
                  type="url"
                  value={whatsLinkVendas}
                  onChange={e => setWhatsLinkVendas(e.target.value)}
                  placeholder="Ex: https://pay.kiwify.com.br/..."
                  className="w-full bg-[#0f171e] border border-white/10 focus:border-[#10b981] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm"
                />
              </div>

              {erroWhats && (
                <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {erroWhats}
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setModalWhatsEdicaoAberto(false); resetWhatsForm(); }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditarWhats}
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white disabled:opacity-60 transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)' }}
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

