'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  Search, Copy, Check, MessageSquare, 
  Smartphone, Tv, RefreshCw, CheckCircle2, AlertCircle, Trash2
} from 'lucide-react'
import { deletarTestador } from './actions'

type Testador = {
  id: string
  nome: string
  email: string
  whatsapp: string
  sistema_celular: string
  sistema_tv: string
  aceitou_termos: boolean
  criado_em: string
}

interface GerenciadorTestadoresProps {
  testadores: Testador[]
  linkWhatsappInicial: string
}

export function GerenciadorTestadores({ testadores: testadoresIniciais, linkWhatsappInicial }: GerenciadorTestadoresProps) {
  const [testadores, setTestadores] = useState<Testador[]>(testadoresIniciais)
  const [linkWhatsapp, setLinkWhatsapp] = useState(linkWhatsappInicial)
  const [filtro, setFiltro] = useState('')
  const [salvandoLink, setSalvandoLink] = useState(false)
  const [salvoFeedback, setSalvoFeedback] = useState(false)
  const [statusMsg, setStatusMsg] = useState({ tipo: '', texto: '' })

  // Estados de feedback de cópia individual
  const [copiadoId, setCopiadoId] = useState<string | null>(null)
  const [copiadoTipo, setCopiadoTipo] = useState<'email' | 'whatsapp' | 'lote' | null>(null)

  // Estado para controle de exclusão
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  const supabase = createClient()

  // Função para deletar um testador
  async function handleExcluir(id: string) {
    if (!window.confirm('Tem certeza de que deseja remover este voluntário de teste?')) return

    setExcluindoId(id)
    try {
      const res = await deletarTestador(id)
      if (res.success) {
        setTestadores(prev => prev.filter(t => t.id !== id))
      } else {
        alert('Erro ao excluir: ' + res.error)
      }
    } catch (err) {
      console.error('Erro ao excluir testador:', err)
      alert('Erro ao processar exclusão. Tente novamente.')
    } finally {
      setExcluindoId(null)
    }
  }

  // Salvar Link do WhatsApp no Banco
  async function handleSalvarLink(e: React.FormEvent) {
    e.preventDefault()
    setSalvandoLink(true)
    setStatusMsg({ tipo: '', texto: '' })

    try {
      const { error } = await supabase
        .from('configuracoes_sistema')
        .upsert({ 
          chave: 'whatsapp_link', 
          valor: linkWhatsapp.trim(),
          atualizado_em: new Date().toISOString()
        }, { onConflict: 'chave' })

      if (error) throw error

      setSalvoFeedback(true)
      setTimeout(() => setSalvoFeedback(false), 3000)
    } catch (err: any) {
      console.error('Erro ao salvar link do WhatsApp:', err)
      setStatusMsg({ tipo: 'erro', texto: 'Erro ao salvar o link no banco de dados.' })
    } finally {
      setSalvandoLink(false)
    }
  }

  // Recarregar lista de testadores do banco
  async function handleRecarregar() {
    try {
      const { data, error } = await supabase
        .from('testadores_playstore')
        .select('*')
        .order('criado_em', { ascending: false })
      
      if (error) throw error
      if (data) setTestadores(data)
    } catch (err) {
      console.error('Erro ao recarregar testadores:', err)
    }
  }

  // Copiar texto para clipboard com feedback temporário
  function copiarTexto(texto: string, id: string, tipo: 'email' | 'whatsapp') {
    navigator.clipboard.writeText(texto)
    setCopiadoId(id)
    setCopiadoTipo(tipo)
    setTimeout(() => {
      setCopiadoId(null)
      setCopiadoTipo(null)
    }, 2000)
  }

  // Copiar todos os e-mails em lote (Play Store aceita e-mails separados por vírgula)
  function copiarEmailsEmLote() {
    const emailsFiltrados = testadoresFiltrados.map(t => t.email).join(', ')
    if (!emailsFiltrados) return
    
    navigator.clipboard.writeText(emailsFiltrados)
    setCopiadoId('lote')
    setCopiadoTipo('lote')
    setTimeout(() => {
      setCopiadoId(null)
      setCopiadoTipo(null)
    }, 3000)
  }

  // Formata o link direto para o WhatsApp Web com mensagem pronta
  function obterLinkWhatsapp(whatsappNum: string) {
    const cleanPhone = whatsappNum.replace(/\D/g, '')
    const finalPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone
    
    const mensagem = `Olá! Sua vaga de testador para o aplicativo Contos de Oração foi selecionada.\n\n` +
      `Para iniciar os testes na Google Play Store e TV, por favor entre no nosso grupo de suporte fechado no WhatsApp clicando no link abaixo:\n` +
      `${linkWhatsapp || '[Link do Grupo pendente de cadastro]'}\n\n` +
      `Qualquer dúvida, estamos à disposição por lá!`

    return `https://api.whatsapp.com/send?phone=${finalPhone}&text=${encodeURIComponent(mensagem)}`
  }

  // Filtragem local
  const testadoresFiltrados = testadores.filter(t => 
    t.nome.toLowerCase().includes(filtro.toLowerCase()) || 
    t.email.toLowerCase().includes(filtro.toLowerCase()) || 
    t.whatsapp.includes(filtro)
  )

  // Estatísticas
  const totalCadastros = testadores.length
  const totalCelularesAndroid = testadores.filter(t => t.sistema_celular === 'android').length
  const totalTvsAndroid = testadores.filter(t => t.sistema_tv === 'android_tv').length
  const totalElegiveis = testadores.filter(t => t.sistema_celular === 'android' && t.sistema_tv === 'android_tv').length

  return (
    <div className="space-y-8 animate-fadeIn" style={{ fontFamily: 'Outfit, sans-serif' }}>
      
      {/* 🟢 CONFIGURAÇÃO DO LINK DO WHATSAPP */}
      <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-xl">
            <h3 className="text-white text-xl font-bold flex items-center gap-2 mb-2">
              <span className="text-[#D4AF37]">🔗</span> Link do Grupo de Testes no WhatsApp
            </h3>
            <p className="text-white/50 text-sm">
              Cole aqui o link do grupo do WhatsApp que você criou para os testadores. Esse link será incluído na mensagem ao clicar em "Enviar Convite".
            </p>
          </div>

          <form onSubmit={handleSalvarLink} className="flex-1 w-full max-w-md flex gap-3">
            <input
              type="url"
              required
              placeholder="https://chat.whatsapp.com/invite/..."
              value={linkWhatsapp}
              onChange={e => setLinkWhatsapp(e.target.value)}
              className="flex-1 bg-[#0f171e] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none transition-all shadow-inner text-sm"
            />
            <button
              type="submit"
              disabled={salvandoLink}
              className="bg-gradient-to-r from-[#FFD700] to-[#D4AF37] hover:brightness-110 active:scale-95 text-black font-black text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {salvandoLink ? (
                'Salvando...'
              ) : salvoFeedback ? (
                <><Check size={16} /> Salvo!</>
              ) : (
                'Salvar Link'
              )}
            </button>
          </form>
        </div>

        {statusMsg.texto && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle size={14} />
            {statusMsg.texto}
          </div>
        )}
      </div>

      {/* 📊 MINI-STATS DO RECRUTAMENTO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Total de Cadastros */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-white/40 text-[0.65rem] uppercase tracking-wider font-bold block mb-1">Total Voluntários</span>
            <span className="text-white text-3xl font-black">{totalCadastros}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/60">
            {totalCadastros}
          </div>
        </div>

        {/* Total Elegíveis */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-white/40 text-[0.65rem] uppercase tracking-wider font-bold block mb-1">Elegíveis (Ambos Android)</span>
            <span className="text-[#10B981] text-3xl font-black">{totalElegiveis}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
            <CheckCircle2 size={20} />
          </div>
        </div>

        {/* Celular Android */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-white/40 text-[0.65rem] uppercase tracking-wider font-bold block mb-1">Celular Android</span>
            <span className="text-white text-3xl font-black">{totalCelularesAndroid}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50">
            <Smartphone size={20} />
          </div>
        </div>

        {/* TV Android */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <span className="text-white/40 text-[0.65rem] uppercase tracking-wider font-bold block mb-1">Android TV / Fire Stick</span>
            <span className="text-white text-3xl font-black">{totalTvsAndroid}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/50">
            <Tv size={20} />
          </div>
        </div>

      </div>

      {/* 📋 LISTAGEM E CONTROLES */}
      <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
        
        {/* Barra de Filtros e Ações em Lote */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <input
              type="text"
              placeholder="Buscar por nome, email..."
              value={filtro}
              onChange={e => setFiltro(e.target.value)}
              className="w-full bg-[#0f171e] border border-white/5 focus:border-[#D4AF37] rounded-xl pl-11 pr-4 py-2.5 text-white placeholder-white/30 focus:outline-none transition-all text-xs"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleRecarregar}
              className="p-2.5 rounded-xl border border-white/5 hover:bg-white/5 text-white/60 hover:text-white transition-all cursor-pointer shrink-0 animate-pulse"
              title="Recarregar dados"
            >
              <RefreshCw size={16} />
            </button>
            
            <button
              onClick={copiarEmailsEmLote}
              disabled={testadoresFiltrados.length === 0}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {copiadoId === 'lote' ? (
                <><Check size={14} className="text-[#10B981]" /> E-mails Copiados!</>
              ) : (
                <><Copy size={14} /> Copiar E-mails p/ Play Store</>
              )}
            </button>
          </div>
        </div>

        {/* Tabela de Testadores */}
        <div className="overflow-x-auto rounded-2xl border border-white/5">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#090B10]/40 border-b border-white/5 text-white/40 text-[0.65rem] uppercase tracking-widest font-black">
                <th className="px-6 py-4">Voluntário</th>
                <th className="px-6 py-4">E-mail da Play Store</th>
                <th className="px-6 py-4">WhatsApp</th>
                <th className="px-6 py-4 text-center">Aparelhos</th>
                <th className="px-6 py-4 text-right">Data Cadastro</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {testadoresFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/30 text-xs">
                    Nenhum testador voluntário encontrado.
                  </td>
                </tr>
              ) : (
                testadoresFiltrados.map(t => {
                  const isCelularOk = t.sistema_celular === 'android'
                  const isTvOk = t.sistema_tv === 'android_tv'
                  const elegivel = isCelularOk && isTvOk

                  return (
                    <tr key={t.id} className={`hover:bg-white/[0.01] transition-colors ${!elegivel ? 'opacity-50' : ''}`}>
                      
                      {/* Nome e Elegibilidade */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white leading-tight flex items-center gap-1.5">
                            {t.nome}
                            {!elegivel && (
                              <span className="text-[0.6rem] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">
                                Incompatível
                              </span>
                            )}
                          </span>
                        </div>
                      </td>

                      {/* E-mail */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 group">
                          <span className="text-white/70 font-medium text-xs font-mono">{t.email}</span>
                          <button
                            onClick={() => copiarTexto(t.email, t.id, 'email')}
                            className="text-white/30 hover:text-white transition-colors cursor-pointer"
                            title="Copiar e-mail"
                          >
                            {copiadoId === t.id && copiadoTipo === 'email' ? (
                              <Check size={12} className="text-[#10B981]" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* WhatsApp */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-white/70 font-mono text-xs">{t.whatsapp}</span>
                          <button
                            onClick={() => copiarTexto(t.whatsapp, t.id, 'whatsapp')}
                            className="text-white/30 hover:text-white transition-colors cursor-pointer"
                            title="Copiar número"
                          >
                            {copiadoId === t.id && copiadoTipo === 'whatsapp' ? (
                              <Check size={12} className="text-[#10B981]" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Aparelhos (Celular / TV) */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Badge Celular */}
                          <span 
                            className={`flex items-center gap-1 text-[0.65rem] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${isCelularOk ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                            title={`Celular: ${t.sistema_celular}`}
                          >
                            <Smartphone size={10} />
                            {isCelularOk ? 'Android' : 'iOS/Outro'}
                          </span>
                          
                          {/* Badge TV */}
                          <span 
                            className={`flex items-center gap-1 text-[0.65rem] px-2.5 py-1 rounded-full font-black uppercase tracking-wider ${isTvOk ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                            title={`Aparelho TV: ${t.sistema_tv}`}
                          >
                            <Tv size={10} />
                            {isTvOk ? 'Android TV' : 'Outro'}
                          </span>
                        </div>
                      </td>

                      {/* Data de Criação */}
                      <td className="px-6 py-4 text-right text-white/40 text-xs font-medium">
                        {new Date(t.criado_em).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Ação de Enviar Convite / Excluir */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={obterLinkWhatsapp(t.whatsapp)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-3.5 py-2 rounded-xl transition-all select-none border cursor-pointer hover:brightness-110 active:scale-95 ${elegivel ? 'bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border-[#25D366]/20' : 'bg-white/5 text-white/30 border-white/5 pointer-events-none'}`}
                            title="Enviar convite com link de testes no WhatsApp"
                          >
                            <MessageSquare size={13} />
                            Mandar Convite
                          </a>

                          <button
                            onClick={() => handleExcluir(t.id)}
                            disabled={excluindoId === t.id}
                            className="p-2.5 rounded-xl border border-red-500/10 hover:bg-red-500/10 text-red-500/60 hover:text-red-400 transition-all cursor-pointer shrink-0 disabled:opacity-40 flex items-center justify-center"
                            title="Excluir voluntário"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dica para o Admin */}
        <div className="flex gap-3 rounded-2xl p-4 text-xs bg-white/[0.02] border border-white/5 text-white/50">
          <span className="text-[#D4AF37] text-base shrink-0">💡</span>
          <div className="leading-relaxed">
            <strong className="text-white block mb-0.5">Como recrutar os 16 testadores na Play Store:</strong>
            1. Copie a lista de e-mails em lote clicando no botão acima.
            2. Vá no Painel da Google Play Console, acesse <strong>Testes Fechados</strong>, crie uma lista de testadores e cole os e-mails lá.
            3. Clique em <strong>Mandar Convite</strong> para cada voluntário qualificado na tabela acima para abrir uma conversa no WhatsApp contendo o link do grupo de testes.
          </div>
        </div>

      </div>

    </div>
  )
}
