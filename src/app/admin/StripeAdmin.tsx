'use client'

import { useState, useEffect } from 'react'
import { Plus, Tag, Settings, CreditCard, Trash2, X, RefreshCw, Check, Edit3, Save, Eye } from 'lucide-react'

type Preco = { id: string; valor: number; moeda: string; intervalo: string }
type Produto = { id: string; nome: string; ativo: boolean; precos: Preco[]; beneficios?: string; max_telas?: number }
type Cupom = { id: string; nome: string; desconto: string; usos_max: number | null; usos_atual: number; ativo: boolean; expira: string | null }

const BENEFICIOS_PADRAO = [
  'Acesso ilimitado ao catálogo',
  'Resolução Full HD',
  'Resolução 4K',
  'Suporte prioritário',
  'Acesso a lançamentos',
  'Cancele quando quiser'
]

export function StripeAdmin() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [loading, setLoading] = useState(true)

  const [novoProduto, setNovoProduto] = useState({ nome: 'Assinatura', preco: '29,90', intervalo: 'month', max_telas: 1 })
  const [beneficiosCheck, setBeneficiosCheck] = useState<string[]>(['Acesso ilimitado ao catálogo', 'Resolução Full HD'])
  const [beneficioCustom, setBeneficioCustom] = useState('')

  const [novoCupom, setNovoCupom] = useState({ nome: '', codigo: '', tipo: 'percentual', valor: '', usos_max: '' })
  const [loadingAction, setLoadingAction] = useState(false)

  // Edit states
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [produtoEdit, setProdutoEdit] = useState({ nome: '', beneficios: '', max_telas: 1 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resProd, resCupom] = await Promise.all([
        fetch('/api/stripe/produtos').then(r => r.json()),
        fetch('/api/stripe/cupons').then(r => r.json())
      ])
      if (resProd.produtos) setProdutos(resProd.produtos)
      if (resCupom.cupons) setCupons(resCupom.cupons)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const toggleBeneficio = (b: string) => {
    if (beneficiosCheck.includes(b)) {
      setBeneficiosCheck(prev => prev.filter(item => item !== b))
    } else {
      setBeneficiosCheck(prev => [...prev, b])
    }
  }

  const addBeneficioCustom = () => {
    if (beneficioCustom.trim() && !beneficiosCheck.includes(beneficioCustom.trim())) {
      setBeneficiosCheck(prev => [...prev, beneficioCustom.trim()])
      setBeneficioCustom('')
    }
  }

  const criarProduto = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingAction(true)
    const parsePreco = (val: string) => Number(val.replace(',', '.'))
    
    const payload = {
      ...novoProduto,
      preco: parsePreco(novoProduto.preco),
      beneficios: beneficiosCheck.join(', '),
      max_telas: novoProduto.max_telas,
    }

    try {
      const response = await fetch('/api/stripe/produtos', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (data.error) {
        alert('Erro ao criar produto: ' + data.error)
      } else {
        alert('Produto criado com sucesso no Stripe!')
      }
      await fetchData()
    } catch (error) {
      alert('Erro inesperado')
    }
    setLoadingAction(false)
  }

  const arquivarProduto = async (id: string) => {
    if (!confirm('Desativar este produto fará com que não seja mais possível assinar por ele. Confirmar?')) return
    setLoadingAction(true)
    await fetch('/api/stripe/produtos', { method: 'DELETE', body: JSON.stringify({ id }) })
    await fetchData()
    setLoadingAction(false)
  }

  const iniciarEdicao = (p: Produto) => {
    setEditandoId(p.id)
    setProdutoEdit({ nome: p.nome, beneficios: p.beneficios || '', max_telas: p.max_telas || 1 })
  }

  const salvarEdicao = async (id: string) => {
    setLoadingAction(true)
    try {
      const response = await fetch('/api/stripe/produtos', {
        method: 'PUT',
        body: JSON.stringify({ id, nome: produtoEdit.nome, beneficios: produtoEdit.beneficios, max_telas: produtoEdit.max_telas })
      })
      const data = await response.json()
      if (data.error) {
        alert('Erro: ' + data.error)
      } else {
        setEditandoId(null)
        await fetchData()
      }
    } catch (e) {
      alert('Erro ao editar')
    }
    setLoadingAction(false)
  }

  const criarCupom = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingAction(true)
    const res = await fetch('/api/stripe/cupons', { method: 'POST', body: JSON.stringify(novoCupom) })
    const data = await res.json()
    if (data.error) alert(data.error)
    else alert('Cupom criado com sucesso!')
    await fetchData()
    setLoadingAction(false)
  }

  const deletarCupom = async (id: string) => {
    if (!confirm('Tem certeza que quer apagar este cupom?')) return
    setLoadingAction(true)
    await fetch('/api/stripe/cupons', { method: 'DELETE', body: JSON.stringify({ id }) })
    await fetchData()
    setLoadingAction(false)
  }

  const inputCls = 'w-full bg-[#090B10] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm'
  const labelCls = 'block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold'

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 opacity-50">
      <RefreshCw size={32} className="animate-spin text-[#D4AF37] mb-4" />
      <div className="text-white font-medium">Sincronizando com a Stripe...</div>
    </div>
  )

  return (
    <div className="space-y-10">
      {/* PRODUTOS */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
            <Settings size={20} className="text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-white text-2xl font-black tracking-tight">Assinaturas e Planos</h2>
            <p className="text-white/40 text-xs mt-0.5">Gerencie os planos cobrados via Stripe.</p>
          </div>
        </div>

        {/* FORMULÁRIO DE CRIAÇÃO E PREVIEW CARD */}
        <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden mb-8 flex flex-col xl:flex-row shadow-2xl">
          {/* Lado Esquerdo: Formulário */}
          <div className="p-8 flex-1 border-b xl:border-b-0 xl:border-r border-white/5 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-transparent opacity-50" />
            
            <h3 className="text-white font-extrabold text-lg mb-6 flex items-center gap-2">
              <Plus size={18} className="text-[#D4AF37]" /> Criar Novo Plano
            </h3>
            
            <form onSubmit={criarProduto} className="space-y-5">
              <div>
                <label className={labelCls}>Nome do Plano</label>
                <input type="text" required value={novoProduto.nome} onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})} className={inputCls} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelCls}>Intervalo</label>
                  <select value={novoProduto.intervalo} onChange={e => setNovoProduto({...novoProduto, intervalo: e.target.value})} className={inputCls}>
                    <option value="month">Mensal</option>
                    <option value="year">Anual</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Valor (R$)</label>
                  <input type="text" required value={novoProduto.preco} onChange={e => setNovoProduto({...novoProduto, preco: e.target.value.replace(/[^0-9,.]/g, '')})} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>🖥️ Limite de Telas</label>
                  <input
                    type="number" min={1} max={10}
                    value={novoProduto.max_telas}
                    onChange={e => setNovoProduto({...novoProduto, max_telas: Number(e.target.value)})}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Benefícios do Plano</label>
                <div className="bg-[#090B10] border border-white/5 rounded-2xl p-4 space-y-3 max-h-48 overflow-y-auto mb-3 shadow-inner">
                  {BENEFICIOS_PADRAO.map(b => (
                    <label key={b} className="flex items-center gap-3 text-sm text-white/70 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" checked={beneficiosCheck.includes(b)} onChange={() => toggleBeneficio(b)} className="accent-[#D4AF37] w-4 h-4 rounded" />
                      {b}
                    </label>
                  ))}
                  {beneficiosCheck.filter(b => !BENEFICIOS_PADRAO.includes(b)).map(b => (
                    <label key={b} className="flex items-center gap-3 text-sm text-[#D4AF37] font-medium cursor-pointer">
                      <input type="checkbox" checked={true} onChange={() => toggleBeneficio(b)} className="accent-[#D4AF37] w-4 h-4 rounded" />
                      {b}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Adicionar outro benefício..." value={beneficioCustom} onChange={e => setBeneficioCustom(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBeneficioCustom())} className={inputCls} />
                  <button type="button" onClick={addBeneficioCustom} className="bg-white/5 border border-white/10 text-white/70 px-4 rounded-xl hover:bg-[#D4AF37] hover:text-black hover:border-transparent transition-all font-bold"><Plus size={18}/></button>
                </div>
              </div>

              <div className="pt-4">
                <button disabled={loadingAction} className="w-full bg-[#D4AF37] text-black px-6 py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                  <Plus size={18} strokeWidth={3} /> Publicar no Stripe
                </button>
              </div>
            </form>
          </div>

          {/* Lado Direito: Preview */}
          <div className="p-8 xl:w-[450px] bg-[#090B10] flex flex-col items-center justify-center relative">
            <div className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
               <Eye size={14} /> Preview
            </div>
            
            <div className="w-full max-w-[340px] bg-[#111827] border-2 border-[#D4AF37] rounded-[2rem] p-8 relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform hover:scale-105 transition-transform duration-500">
              <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 bg-[#22c55e] text-white text-[0.7rem] font-black px-4 py-1.5 rounded-full whitespace-nowrap shadow-md tracking-wider">
                ✦ Mais Popular
              </div>
              
              <h3 className="text-2xl font-black text-[#D4AF37] mb-1">{novoProduto.nome}</h3>
              <p className="text-white/40 text-xs font-medium mb-4 uppercase tracking-widest">Assinatura {novoProduto.intervalo === 'month' ? 'Mensal' : 'Anual'}</p>
              
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-black text-white">R$ {novoProduto.preco || '0,00'}</span>
                <span className="text-white/40 text-sm mb-1 font-medium">/mês</span>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37]">
                  <Settings size={13} />
                  <span className="text-[0.75rem] font-bold">
                    {novoProduto.max_telas} tela{novoProduto.max_telas > 1 ? 's' : ''} simultânea{novoProduto.max_telas > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-8">
                {beneficiosCheck.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/80 text-[0.9rem] font-medium">
                    <Check size={16} className="text-[#D4AF37] mt-0.5 shrink-0" strokeWidth={3} />
                    <span className="leading-tight">{b}</span>
                  </li>
                ))}
                {beneficiosCheck.length === 0 && (
                  <li className="text-white/30 text-sm italic">Nenhum benefício selecionado</li>
                )}
              </ul>
              
              <div className="w-full bg-[#D4AF37] text-black py-4 rounded-xl font-black text-center shadow-lg hover:brightness-110 cursor-pointer">
                Assinar agora →
              </div>
            </div>
          </div>
        </div>

        {/* LISTAGEM DOS PRODUTOS ATIVOS */}
        {produtos.length > 0 && (
          <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 shadow-xl">
            <h3 className="text-white font-extrabold text-xl mb-6">Planos Ativos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {produtos.map((p) => (
                <div key={p.id} className="relative group bg-[#090B10] border border-white/5 rounded-2xl p-6 hover:border-white/20 transition-all">
                  
                  {editandoId === p.id ? (
                    <div className="absolute inset-0 bg-[#111827] z-20 rounded-2xl border-2 border-[#D4AF37] p-6 shadow-2xl overflow-y-auto">
                      <div className="font-black text-[#D4AF37] text-sm uppercase tracking-wider mb-5 flex items-center justify-between">
                         <div className="flex items-center gap-2"><Edit3 size={16}/> Editar Plano</div>
                         <button onClick={() => setEditandoId(null)} className="text-white/40 hover:text-white p-1"><X size={18}/></button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className={labelCls}>Nome</label>
                          <input className={inputCls} value={produtoEdit.nome} onChange={e => setProdutoEdit({...produtoEdit, nome: e.target.value})} />
                        </div>
                        <div>
                          <label className={labelCls}>Benefícios (separe por vírgula)</label>
                          <input className={inputCls} value={produtoEdit.beneficios} onChange={e => setProdutoEdit({...produtoEdit, beneficios: e.target.value})} />
                        </div>
                        <div>
                          <label className={labelCls}>🖥️ Telas Simultâneas</label>
                          <input type="number" min={1} max={10} className={inputCls} value={produtoEdit.max_telas} onChange={e => setProdutoEdit({...produtoEdit, max_telas: Number(e.target.value)})} />
                        </div>
                        <button onClick={() => salvarEdicao(p.id)} disabled={loadingAction} className="w-full bg-[#D4AF37] text-black py-3 rounded-xl font-black mt-2 hover:brightness-110">Salvar Alterações</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-4">
                         <div>
                            <div className="text-white font-extrabold text-xl mb-1">{p.nome}</div>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[0.65rem] font-bold uppercase tracking-wider">
                               Telas Simultâneas: {p.max_telas || 1}
                            </div>
                         </div>
                         <div className="flex gap-1">
                            <button onClick={() => iniciarEdicao(p)} className="p-2 text-white/40 hover:text-[#D4AF37] hover:bg-white/5 rounded-lg transition-colors"><Edit3 size={16} /></button>
                            <button onClick={() => arquivarProduto(p.id)} className="p-2 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"><Trash2 size={16} /></button>
                         </div>
                      </div>
                      
                      <div className="flex gap-3 mt-6 pt-6 border-t border-white/5">
                        {p.precos.map(pr => (
                          <div key={pr.id} className="flex-1 bg-[#111827] p-4 rounded-xl border border-white/5">
                            <div className="text-[0.65rem] text-white/40 font-bold uppercase tracking-widest mb-1">
                              {pr.intervalo === 'month' ? 'Mensal' : pr.intervalo === 'year' ? 'Anual' : 'Personalizado'}
                            </div>
                            <div className="text-[#D4AF37] font-black text-lg">R$ {(pr.valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <hr className="border-white/5 my-10" />

      {/* CUPONS */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#00a8e1]/10 border border-[#00a8e1]/20 flex items-center justify-center">
            <Tag size={20} className="text-[#00a8e1]" />
          </div>
          <div>
            <h2 className="text-white text-2xl font-black tracking-tight">Cupons de Desconto</h2>
            <p className="text-white/40 text-xs mt-0.5">Crie promoções e ofertas especiais.</p>
          </div>
        </div>

        <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 mb-8 shadow-xl">
          <form onSubmit={criarCupom} className="grid grid-cols-1 md:grid-cols-5 gap-5 items-end">
            <div className="md:col-span-2">
              <label className={labelCls}>Nome Interno</label>
              <input required placeholder="Ex: Black Friday" value={novoCupom.nome} onChange={e => setNovoCupom({...novoCupom, nome: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Código (Opcional)</label>
              <input placeholder="Ex: BLACK50" value={novoCupom.codigo} onChange={e => setNovoCupom({...novoCupom, codigo: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tipo</label>
              <select value={novoCupom.tipo} onChange={e => setNovoCupom({...novoCupom, tipo: e.target.value})} className={inputCls}>
                <option value="percentual">Porcentagem (%)</option>
                <option value="fixo">Valor Fixo (R$)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Desconto</label>
              <input required type="number" placeholder="Ex: 50" value={novoCupom.valor} onChange={e => setNovoCupom({...novoCupom, valor: e.target.value})} className={inputCls} />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Limite de usos (Opcional)</label>
              <input type="number" placeholder="Ex: 100" value={novoCupom.usos_max} onChange={e => setNovoCupom({...novoCupom, usos_max: e.target.value})} className={inputCls} />
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button disabled={loadingAction} className="bg-[#00a8e1] text-white px-8 py-3.5 rounded-xl font-black flex items-center gap-2 hover:bg-[#008dbd] transition-colors w-full md:w-auto justify-center">
                <Plus size={18} strokeWidth={3} /> Gerar Cupom
              </button>
            </div>
          </form>
        </div>

        {cupons.length > 0 && (
          <div className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-xl">
            <div className="grid grid-cols-4 gap-4 px-8 py-4 border-b border-white/5 bg-[#090B10]/50">
              <div className="col-span-2 text-white/40 text-[0.65rem] uppercase font-bold tracking-widest">Cupom</div>
              <div className="text-white/40 text-[0.65rem] uppercase font-bold tracking-widest">Desconto</div>
              <div className="text-white/40 text-[0.65rem] uppercase font-bold tracking-widest text-right">Ação</div>
            </div>
            <div className="divide-y divide-white/5">
              {cupons.map((c) => (
                <div key={c.id} className="grid grid-cols-4 gap-4 px-8 py-5 items-center hover:bg-white/[0.02] transition-colors">
                  <div className="col-span-2">
                    <div className="text-white font-bold text-lg">{c.nome}</div>
                    <div className="text-white/30 text-xs font-mono mt-0.5">{c.id}</div>
                  </div>
                  <div className="text-[#00a8e1] font-black text-xl">{c.desconto}</div>
                  <div className="text-right flex justify-end">
                    <button onClick={() => deletarCupom(c.id)} className="text-red-400 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
