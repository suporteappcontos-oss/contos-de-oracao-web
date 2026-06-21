'use client'

import { useState, useMemo } from 'react'
import { Users, Clock, Filter, ChevronDown, X, BarChart2, Eye, Monitor, Smartphone, Film } from 'lucide-react'
import { BotoesControleUsuario } from './BotoesControleUsuario'

type Usuario = {
  id: string
  email: string
  nome: string
  plano_ativo: boolean
  plano_nome: string
  criado_em: string
  vitalicio?: boolean
  ultimo_login?: string | null
  total_views?: number
  acessos_site?: number
  acessos_app?: number
}

type Props = {
  usuarios: Usuario[]
  membrosAtivos: number
}

type FiltroOrdem =
  | 'recentes'
  | 'mais_assistidos'
  | 'mais_acessos_site'
  | 'mais_acessos_app'
  | 'novos_7dias'
  | 'novos_30dias'
  | 'vitalicios'
  | 'ultimo_login'

const FILTROS: { id: FiltroOrdem; label: string; icon: string; color: string }[] = [
  { id: 'recentes',         label: 'Mais Recentes',         icon: '🆕', color: 'text-purple-400' },
  { id: 'mais_assistidos',  label: 'Mais Vídeos Assistidos', icon: '🎬', color: 'text-[#D4AF37]' },
  { id: 'mais_acessos_site',label: 'Mais Acessos no Site',  icon: '🖥️', color: 'text-blue-400' },
  { id: 'mais_acessos_app', label: 'Mais Acessos no App',   icon: '📱', color: 'text-green-400' },
  { id: 'ultimo_login',     label: 'Login Mais Recente',    icon: '⏱️', color: 'text-cyan-400' },
  { id: 'novos_7dias',      label: 'Novos (7 dias)',         icon: '🔥', color: 'text-orange-400' },
  { id: 'novos_30dias',     label: 'Novos (30 dias)',        icon: '📅', color: 'text-pink-400' },
  { id: 'vitalicios',       label: 'Vitalícios',            icon: '♾️', color: 'text-amber-300' },
]

function getRankBar(value: number, max: number, color: string) {
  const pct = max > 0 ? Math.max((value / max) * 100, 2) : 0
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1 rounded-full bg-white/5">
        <div className={`h-1 rounded-full ${color}`} style={{ width: `${pct}%`, transition: 'width 0.5s' }} />
      </div>
      <span className="text-[10px] font-bold text-white/40 w-8 text-right">{value}</span>
    </div>
  )
}

// Gráfico de cadastros por mês (últimos 6 meses)
function GraficoCadastrosMes({ usuarios }: { usuarios: Usuario[] }) {
  const meses = useMemo(() => {
    const agora = new Date()
    const labels: string[] = []
    const counts: number[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
      const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        .replace('.', '').replace(' de ', '/')
      const inicio = new Date(d.getFullYear(), d.getMonth(), 1).getTime()
      const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).getTime()
      const count = usuarios.filter(u => {
        const t = new Date(u.criado_em).getTime()
        return t >= inicio && t <= fim
      }).length
      labels.push(label)
      counts.push(count)
    }
    return { labels, counts }
  }, [usuarios])

  const maxCount = Math.max(...meses.counts, 1)

  return (
    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 shadow-xl mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <BarChart2 size={16} className="text-purple-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm">Novos Cadastros por Mês</h3>
          <p className="text-white/30 text-[11px]">Últimos 6 meses</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-2xl font-black text-white">{usuarios.length}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-widest">total</div>
        </div>
      </div>
      <div className="flex items-end gap-2 h-28">
        {meses.labels.map((label, i) => {
          const pct = Math.max((meses.counts[i] / maxCount) * 100, 3)
          return (
            <div key={i} className="flex flex-col items-center flex-1 gap-1 h-full group">
              <div className="flex-1 w-full relative flex flex-col justify-end">
                {meses.counts[i] > 0 && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {meses.counts[i]} cadastros
                  </div>
                )}
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-purple-700/40 to-purple-400 transition-all duration-500 group-hover:brightness-125"
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-white/40 text-[9px] font-bold uppercase tracking-wide whitespace-nowrap">{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Gráfico de engajamento geral (pizza simplificada com barras)
function GraficoEngajamento({ usuarios }: { usuarios: Usuario[] }) {
  const totalViews = usuarios.reduce((a, u) => a + (u.total_views || 0), 0)
  const totalSite = usuarios.reduce((a, u) => a + (u.acessos_site || 0), 0)
  const totalApp = usuarios.reduce((a, u) => a + (u.acessos_app || 0), 0)
  const ativos = usuarios.filter(u => u.plano_ativo).length
  const inativos = usuarios.length - ativos

  const stats = [
    { label: 'Total de Acessos (Site)', value: totalSite, icon: Monitor, color: 'bg-blue-500', barColor: 'bg-blue-500/80' },
    { label: 'Total de Acessos (App)', value: totalApp, icon: Smartphone, color: 'bg-green-500', barColor: 'bg-green-500/80' },
    { label: 'Vídeos Assistidos', value: totalViews, icon: Film, color: 'bg-[#D4AF37]', barColor: 'bg-[#D4AF37]/80' },
  ]
  const maxStat = Math.max(totalSite, totalApp, totalViews, 1)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {/* Barras de engajamento */}
      <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Eye size={15} className="text-cyan-400" />
          <h3 className="text-white font-bold text-sm">Engajamento Geral</h3>
        </div>
        <div className="space-y-4">
          {stats.map(s => (
            <div key={s.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 text-white/60 text-xs">
                  <s.icon size={12} /> {s.label}
                </div>
                <span className="text-white font-black text-sm">{s.value.toLocaleString('pt-BR')}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5">
                <div
                  className={`h-2 rounded-full ${s.barColor} transition-all duration-700`}
                  style={{ width: `${Math.max((s.value / maxStat) * 100, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Donut simplificado: Ativos vs Inativos */}
      <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-4">
          <Users size={15} className="text-[#D4AF37]" />
          <h3 className="text-white font-bold text-sm">Distribuição de Planos</h3>
        </div>
        <div className="flex-1 flex flex-col justify-center space-y-3">
          {[
            { label: 'Com Plano Ativo', value: ativos, color: '#10b981', bg: 'bg-emerald-500' },
            { label: 'Sem Plano / Lead', value: inativos, color: '#D4AF37', bg: 'bg-[#D4AF37]' },
          ].map(item => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-white/60 text-xs">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-black">{item.value}</span>
                  <span className="text-white/30 text-[10px]">
                    ({usuarios.length > 0 ? Math.round((item.value / usuarios.length) * 100) : 0}%)
                  </span>
                </div>
              </div>
              <div className="w-full h-2 rounded-full bg-white/5">
                <div
                  className={`h-2 rounded-full ${item.bg} transition-all duration-700`}
                  style={{ width: `${usuarios.length > 0 ? (item.value / usuarios.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const SETE_DIAS = 7 * 24 * 60 * 60 * 1000
const TRINTA_DIAS = 30 * 24 * 60 * 60 * 1000

export function AssinantesComFiltros({ usuarios }: Props) {
  const [subAba, setSubAba] = useState<'ativos' | 'leads'>('ativos')
  const [filtro, setFiltro] = useState<FiltroOrdem>('recentes')
  const [comboOpen, setComboOpen] = useState(false)
  const [busca, setBusca] = useState('')

  const [agora] = useState(() => Date.now())

  const totalAtivos = useMemo(() => usuarios.filter(u => u.plano_ativo).length, [usuarios])
  const totalLeads = useMemo(() => usuarios.filter(u => !u.plano_ativo).length, [usuarios])

  const maxViews = useMemo(() => Math.max(...usuarios.map(u => u.total_views || 0), 1), [usuarios])
  const maxSite  = useMemo(() => Math.max(...usuarios.map(u => u.acessos_site || 0), 1), [usuarios])
  const maxApp   = useMemo(() => Math.max(...usuarios.map(u => u.acessos_app || 0), 1), [usuarios])

  const usuariosFiltrados = useMemo(() => {
    let lista = [...usuarios]

    // Primeiro filtra pela SubAba (Ativos vs Leads)
    if (subAba === 'ativos') {
      lista = lista.filter(u => u.plano_ativo)
    } else {
      lista = lista.filter(u => !u.plano_ativo)
    }

    // Filtros de tipo
    if (filtro === 'novos_7dias') lista = lista.filter(u => agora - new Date(u.criado_em).getTime() <= SETE_DIAS)
    if (filtro === 'novos_30dias') lista = lista.filter(u => agora - new Date(u.criado_em).getTime() <= TRINTA_DIAS)
    if (filtro === 'vitalicios') lista = lista.filter(u => u.vitalicio)

    // Ordenação
    if (filtro === 'mais_assistidos') lista.sort((a, b) => (b.total_views || 0) - (a.total_views || 0))
    else if (filtro === 'mais_acessos_site') lista.sort((a, b) => (b.acessos_site || 0) - (a.acessos_site || 0))
    else if (filtro === 'mais_acessos_app') lista.sort((a, b) => (b.acessos_app || 0) - (a.acessos_app || 0))
    else if (filtro === 'ultimo_login') lista.sort((a, b) => new Date(b.ultimo_login || 0).getTime() - new Date(a.ultimo_login || 0).getTime())
    else lista.sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())

    // Busca por nome ou email
    if (busca.trim()) {
      const q = busca.toLowerCase().trim()
      lista = lista.filter(u => u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }

    return lista
  }, [usuarios, subAba, filtro, busca, agora])

  const filtroAtual = FILTROS.find(f => f.id === filtro)!

  return (
    <div>
      {/* Gráficos */}
      <GraficoCadastrosMes usuarios={usuarios} />
      <GraficoEngajamento usuarios={usuarios} />

      {/* Seletor de Sub-Abas (Assinantes vs Leads) */}
      <div className="flex bg-[#111827] border border-white/5 rounded-2xl p-1.5 w-fit shadow-xl mb-6 flex-wrap">
        <button
          onClick={() => setSubAba('ativos')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${subAba === 'ativos' ? 'text-black shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
          style={subAba === 'ativos' ? { background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' } : {}}
        >
          <Users size={14} />
          Assinantes Ativos
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ml-1 ${subAba === 'ativos' ? 'bg-black/20 text-black' : 'bg-white/10 text-white/70'}`}>
            {totalAtivos}
          </span>
        </button>
        <button
          onClick={() => setSubAba('leads')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${subAba === 'leads' ? 'text-black shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
          style={subAba === 'leads' ? { background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' } : {}}
        >
          <Clock size={14} />
          Leads (Sem Plano)
          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ml-1 ${subAba === 'leads' ? 'bg-black/20 text-black' : 'bg-white/10 text-white/70'}`}>
            {totalLeads}
          </span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        {/* Busca */}
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="w-full bg-[#0f171e] border border-white/10 focus:border-[#D4AF37] rounded-2xl pl-4 pr-10 py-3 text-white placeholder-white/30 focus:outline-none transition-all text-sm"
          />
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Combobox de filtro */}
        <div className="relative">
          <button
            onClick={() => setComboOpen(!comboOpen)}
            className="flex items-center gap-3 bg-[#111827] border border-white/10 hover:border-[#D4AF37]/50 rounded-2xl px-4 py-3 text-sm font-bold text-white transition-all min-w-[220px] group"
          >
            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
              <Filter size={12} className="text-[#D4AF37]" />
            </div>
            <span className="flex-1 text-left">
              <span className="text-white/40 text-xs block leading-none mb-0.5">Filtrar por</span>
              <span className={`text-sm font-black ${filtroAtual.color}`}>
                {filtroAtual.icon} {filtroAtual.label}
              </span>
            </span>
            <ChevronDown
              size={16}
              className={`text-white/40 transition-transform shrink-0 ${comboOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown */}
          {comboOpen && (
            <div className="absolute right-0 top-full mt-2 z-50 w-64 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 space-y-0.5">
                {FILTROS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => { setFiltro(f.id); setComboOpen(false) }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-left transition-all ${filtro === f.id ? 'bg-white/10 border border-white/10' : 'hover:bg-white/5'}`}
                  >
                    <span className="text-base">{f.icon}</span>
                    <span className={f.color}>{f.label}</span>
                    {filtro === f.id && (
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-white/30 text-xs">
          Exibindo <span className="text-white font-bold">{usuariosFiltrados.length}</span> de <span className="text-white font-bold">{subAba === 'ativos' ? totalAtivos : totalLeads}</span> {subAba === 'ativos' ? 'assinantes' : 'leads'}
        </span>
        {(busca || filtro !== 'recentes') && (
          <button
            onClick={() => { setBusca(''); setFiltro('recentes') }}
            className="flex items-center gap-1 text-[10px] text-[#D4AF37] hover:text-white bg-[#D4AF37]/10 hover:bg-white/10 px-2 py-0.5 rounded-lg transition-all border border-[#D4AF37]/20 font-bold"
          >
            <X size={10} /> Limpar filtros
          </button>
        )}
      </div>

      {/* Tabela */}
      {usuariosFiltrados.length === 0 ? (
        <div className="bg-[#111827] border border-white/5 rounded-3xl p-16 text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={28} className="text-white/20" />
          </div>
          <p className="text-white/40 text-sm">
            Nenhum {subAba === 'ativos' ? 'assinante ativo' : 'lead'} encontrado com esse filtro.
          </p>
        </div>
      ) : (
        <div className="bg-[#111827] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-white/5 bg-[#090B10]/50">
            <div className="col-span-6 md:col-span-4 text-white/40 text-xs uppercase tracking-widest font-bold">{subAba === 'ativos' ? 'Assinante' : 'Lead'}</div>
            <div className="col-span-4 text-white/40 text-xs uppercase tracking-widest font-bold hidden md:block">Engajamento</div>
            <div className="col-span-3 md:col-span-2 text-white/40 text-xs uppercase tracking-widest font-bold">Status</div>
            <div className="col-span-3 md:col-span-2 text-white/40 text-xs uppercase tracking-widest font-bold text-right">Controle</div>
          </div>

          {/* Linhas */}
          <div className="divide-y divide-white/5">
            {usuariosFiltrados.map((u, idx) => {
              const diasNaSite = Math.floor((agora - new Date(u.criado_em).getTime()) / (24 * 60 * 60 * 1000))
              const ehNovo = diasNaSite <= 7

              return (
                <div key={u.id} className="grid grid-cols-12 gap-4 px-8 py-5 items-center transition-colors hover:bg-white/[0.02]">
                  {/* Ranking + Info */}
                  <div className="col-span-6 md:col-span-4 flex items-center gap-3 min-w-0">
                    {/* Posição no rank */}
                    {['mais_assistidos', 'mais_acessos_site', 'mais_acessos_app', 'ultimo_login'].includes(filtro) && (
                      <div className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center text-[11px] font-black"
                        style={{
                          background: idx === 0 ? 'linear-gradient(135deg,#FFD700,#D4AF37)' :
                                      idx === 1 ? 'rgba(156,163,175,0.15)' :
                                      idx === 2 ? 'rgba(180,83,9,0.2)' : 'rgba(255,255,255,0.05)',
                          color: idx === 0 ? '#000' : idx === 1 ? '#9ca3af' : idx === 2 ? '#b45309' : '#ffffff40',
                        }}
                      >
                        {idx + 1}
                      </div>
                    )}
                    <div className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center text-lg font-black shadow-inner border relative ${u.plano_ativo ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20' : 'bg-white/5 text-white/30 border-white/5'}`}>
                      {(u.nome !== '—' ? u.nome : u.email).charAt(0).toUpperCase()}
                      {ehNovo && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#111827]" title="Novo (últimos 7 dias)" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white text-[0.9rem] font-bold truncate flex items-center gap-2 flex-wrap">
                        {u.nome !== '—' ? u.nome : <span className="text-white/30">—</span>}
                        {u.vitalicio && (
                          <span className="bg-amber-500/20 text-[#D4AF37] text-[0.5rem] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-[#D4AF37]/30">
                            ♾️ Vitalício
                          </span>
                        )}
                        {ehNovo && (
                          <span className="bg-green-500/15 text-green-400 text-[0.5rem] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border border-green-500/20">
                            Novo
                          </span>
                        )}
                      </div>
                      <div className="text-white/40 text-xs truncate mt-0.5">{u.email}</div>
                      <div className="text-white/25 text-[10px] mt-0.5">
                        Ingresso: {new Date(u.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {u.ultimo_login && (
                          <> · Login: {new Date(u.ultimo_login).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} {new Date(u.ultimo_login).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Engajamento com mini-barras */}
                  <div className="col-span-4 hidden md:block">
                    <div className="space-y-1.5">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/40 text-[10px]">🎬 Assistidos</span>
                          <span className="text-[#D4AF37] text-[10px] font-black">{u.total_views || 0}</span>
                        </div>
                        {getRankBar(u.total_views || 0, maxViews, 'bg-[#D4AF37]')}
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/40 text-[10px]">🖥️ Site</span>
                          <span className="text-blue-400 text-[10px] font-black">{u.acessos_site || 0}</span>
                        </div>
                        {getRankBar(u.acessos_site || 0, maxSite, 'bg-blue-500')}
                      </div>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/40 text-[10px]">📱 App</span>
                          <span className="text-green-400 text-[10px] font-black">{u.acessos_app || 0}</span>
                        </div>
                        {getRankBar(u.acessos_app || 0, maxApp, 'bg-green-500')}
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-3 md:col-span-2">
                    <span className={`inline-flex items-center gap-1.5 text-[0.65rem] px-3 py-1.5 rounded-xl font-bold uppercase tracking-widest border ${u.plano_ativo ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20' : 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${u.plano_ativo ? 'bg-[#10b981]' : 'bg-[#D4AF37]'}`} />
                      {u.plano_ativo ? 'Ativo' : 'Lead'}
                    </span>
                    {u.plano_ativo && (
                      <div className="text-white/40 text-[0.6rem] uppercase tracking-widest font-black mt-1.5 truncate">
                        {u.plano_nome}
                      </div>
                    )}
                  </div>

                  {/* Controle */}
                  <div className="col-span-3 md:col-span-2 flex flex-col items-end gap-2">
                    <BotoesControleUsuario
                      userId={u.id}
                      nome={u.nome}
                      email={u.email}
                      planoAtivo={u.plano_ativo}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
