'use client'

import { useState, useEffect } from 'react'
import { Plus, Tag, Settings, CreditCard, Trash2, X, RefreshCw, Check, Edit3, Save } from 'lucide-react'

type Preco = { id: string; valor: number; moeda: string; intervalo: string }
type Produto = { id: string; nome: string; ativo: boolean; precos: Preco[]; beneficios?: string }
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

  const [novoProduto, setNovoProduto] = useState({ nome: 'Assinatura', preco: '29,90', intervalo: 'month' })
  const [beneficiosCheck, setBeneficiosCheck] = useState<string[]>(['Acesso ilimitado ao catálogo', 'Resolução Full HD'])
  const [beneficioCustom, setBeneficioCustom] = useState('')

  const [novoCupom, setNovoCupom] = useState({ nome: '', codigo: '', tipo: 'percentual', valor: '', usos_max: '' })
  const [loadingAction, setLoadingAction] = useState(false)

  // Edit states
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [produtoEdit, setProdutoEdit] = useState({ nome: '', beneficios: '' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [resProd, resCupom] = await Promise.all([
        fetch('/api/stripe/produtos').then(r => r.json()),
        fetch('/api/stripe/cupons').then(r => r.json())
      ])
      // Adicionar os beneficios que vem do metadata nos produtos
      if (resProd.produtos) {
        // Precisamos garantir que a rota GET produtos retorne os beneficios também!
        // Como o GET atual nao retorna beneficios diretamente do metadata sem expansao, vamos deixar isso como bonus ou editar pelo metadata qdo for buscar
        setProdutos(resProd.produtos)
      }
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
      beneficios: beneficiosCheck.join(', ')
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
    setProdutoEdit({ nome: p.nome, beneficios: p.beneficios || '' })
  }

  const salvarEdicao = async (id: string) => {
    setLoadingAction(true)
    try {
      const response = await fetch('/api/stripe/produtos', {
        method: 'PUT',
        body: JSON.stringify({ id, nome: produtoEdit.nome, beneficios: produtoEdit.beneficios })
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

  const inputCls = 'w-full bg-[#0f171e] border border-[#1e3040] focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-[#4a6373] focus:outline-none transition-colors text-sm'
  const labelCls = 'block text-[#8197a4] text-[0.7rem] uppercase tracking-widest mb-2 font-semibold'

  if (loading) return <div className="p-8 text-center text-[#8197a4]">Carregando dados do Stripe...</div>

  return (
    <div className="space-y-8">
      {/* PRODUTOS */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Settings size={18} style={{ color: '#D4AF37' }} />
          <h2 className="text-white text-lg font-bold">Produto Principal (Assinatura)</h2>
        </div>

        {/* FORMULÁRIO DE CRIAÇÃO E PREVIEW CARD */}
        <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl overflow-hidden mb-6 flex flex-col md:flex-row">
          {/* Lado Esquerdo: Formulário */}
          <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-[#1e3040]">
            <h3 className="text-white font-bold mb-4">Criar Novo Plano/Produto</h3>
            <form onSubmit={criarProduto} className="space-y-4">
              <div>
                <label className={labelCls}>Nome do Plano</label>
                <input type="text" required value={novoProduto.nome} onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className={labelCls}>Vantagens / Benefícios</label>
                <div className="bg-[#090B10] border border-[#1e3040] rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto mb-2">
                  {BENEFICIOS_PADRAO.map(b => (
                    <label key={b} className="flex items-center gap-2 text-sm text-white/80 cursor-pointer hover:text-white transition-colors">
                      <input type="checkbox" checked={beneficiosCheck.includes(b)} onChange={() => toggleBeneficio(b)} className="accent-[#D4AF37] w-4 h-4" />
                      {b}
                    </label>
                  ))}
                  {beneficiosCheck.filter(b => !BENEFICIOS_PADRAO.includes(b)).map(b => (
                    <label key={b} className="flex items-center gap-2 text-sm text-[#D4AF37] cursor-pointer">
                      <input type="checkbox" checked={true} onChange={() => toggleBeneficio(b)} className="accent-[#D4AF37] w-4 h-4" />
                      {b}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Adicionar outro benefício..." value={beneficioCustom} onChange={e => setBeneficioCustom(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBeneficioCustom())} className={`${inputCls} py-2`} />
                  <button type="button" onClick={addBeneficioCustom} className="bg-[#1e3040] text-white px-3 rounded-xl hover:bg-[#D4AF37] hover:text-black transition-colors"><Plus size={16}/></button>
                </div>
              </div>

              <div className="pt-2">
                <button disabled={loadingAction} className="w-full bg-[#D4AF37] text-[#090B10] px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#b08d28] transition-colors">
                  <Plus size={16} /> Criar Plano e Preço
                </button>
              </div>
            </form>
          </div>

          {/* Lado Direito: Preview */}
          <div className="p-6 md:w-[400px] bg-[#090B10] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-[#D4AF37]"></div>
            <div className="text-[#8197a4] text-xs font-bold uppercase tracking-widest mb-4">Preview em Tempo Real</div>
            
            <div className="w-full max-w-[320px] bg-[#1a2733] border border-[#D4AF37] rounded-3xl p-6 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                Mais popular
              </div>
              
              <h3 className="text-xl font-bold text-white mb-1">{novoProduto.nome}</h3>
              <p className="text-white/50 text-sm mb-4">Assinatura {novoProduto.intervalo === 'month' ? 'mensal' : 'anual'}</p>
              
              <div className="flex items-end gap-1 mb-6">
                <span className="text-3xl font-black text-white">R$ {novoProduto.preco || '0,00'}</span>
                <span className="text-white/50 text-sm mb-1">/{novoProduto.intervalo === 'month' ? 'mês' : 'mês'}</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                {beneficiosCheck.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
                    <Check size={16} className="text-[#D4AF37] mt-0.5 shrink-0" />
                    <span className="leading-tight">{b}</span>
                  </li>
                ))}
                {beneficiosCheck.length === 0 && (
                  <li className="text-white/40 text-sm italic">Nenhum benefício selecionado</li>
                )}
              </ul>
              
              <div className="w-full bg-[#D4AF37] text-black py-3 rounded-xl font-bold text-center">
                Assinar agora →
              </div>
            </div>
          </div>
        </div>

        {/* LISTAGEM DOS PRODUTOS ATIVOS */}
        {produtos.length > 0 && (
          <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl overflow-hidden p-6">
            <h3 className="text-white font-bold mb-4">Planos Ativos</h3>
            {produtos.map((p, i) => (
              <div key={p.id} className={`relative group ${i !== produtos.length - 1 ? 'border-b border-[#1e3040] pb-6 mb-6' : ''}`}>
                <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button onClick={() => iniciarEdicao(p)} className="text-[#00a8e1] hover:bg-[#00a8e1]/10 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold">
                    <Edit3 size={14} /> Editar
                  </button>
                  <button onClick={() => arquivarProduto(p.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold">
                    <Trash2 size={14} /> Apagar Produto e Preços
                  </button>
                </div>
                
                {editandoId === p.id ? (
                  <div className="bg-[#090B10] p-4 rounded-xl border border-[#D4AF37] mb-4">
                    <div className="font-bold text-[#D4AF37] text-sm uppercase mb-3 flex items-center gap-2"><Edit3 size={16}/> Modo de Edição</div>
                    <div className="space-y-4">
                      <div>
                        <label className={labelCls}>Nome do Produto</label>
                        <input className={inputCls} value={produtoEdit.nome} onChange={e => setProdutoEdit({...produtoEdit, nome: e.target.value})} />
                      </div>
                      <div>
                        <label className={labelCls}>Benefícios (separe por vírgula)</label>
                        <input className={inputCls} placeholder="Benefício 1, Benefício 2" value={produtoEdit.beneficios} onChange={e => setProdutoEdit({...produtoEdit, beneficios: e.target.value})} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => salvarEdicao(p.id)} disabled={loadingAction} className="bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2"><Save size={14}/> Salvar</button>
                        <button onClick={() => setEditandoId(null)} className="bg-transparent border border-[#1e3040] text-white px-4 py-2 rounded-lg font-bold text-sm">Cancelar</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-white font-black text-xl mb-3">📦 {p.nome}</div>
                    <div className="flex flex-wrap gap-3">
                      {p.precos.map(pr => (
                        <div key={pr.id} className="bg-[#090B10] p-3 rounded-xl flex-1 min-w-[150px] border border-[#1e3040]">
                          <div className="text-[10px] text-[#8197a4] font-bold uppercase mb-1">
                            PLANO {pr.intervalo === 'month' ? 'MENSAL' : pr.intervalo === 'year' ? 'ANUAL' : 'PERSONALIZADO'}
                          </div>
                          <div className="text-[#D4AF37] font-black">R$ {(pr.valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CUPONS */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Tag size={18} style={{ color: '#00a8e1' }} />
          <h2 className="text-white text-lg font-bold">Cupons de Desconto</h2>
        </div>

        <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl p-6 mb-6">
          <form onSubmit={criarCupom} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
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
              <label className={labelCls}>Valor/Porcentagem</label>
              <input required type="number" placeholder="Ex: 50" value={novoCupom.valor} onChange={e => setNovoCupom({...novoCupom, valor: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Limite de usos (Opcional)</label>
              <input type="number" placeholder="Ex: 30" value={novoCupom.usos_max} onChange={e => setNovoCupom({...novoCupom, usos_max: e.target.value})} className={inputCls} />
            </div>
            <div className="md:col-span-6">
              <button disabled={loadingAction} className="bg-[#00a8e1] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 w-fit">
                <Plus size={16} /> Criar Cupom
              </button>
            </div>
          </form>
        </div>

        {cupons.length > 0 && (
          <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 gap-3 px-5 py-3 border-b border-[#1e3040] bg-black/20">
              <div className="col-span-2 text-[#8197a4] text-[0.65rem] uppercase font-semibold">Cupom</div>
              <div className="text-[#8197a4] text-[0.65rem] uppercase font-semibold">Desconto</div>
              <div className="text-[#8197a4] text-[0.65rem] uppercase font-semibold text-right">Ação</div>
            </div>
            {cupons.map((c, i) => (
              <div key={c.id} className={`grid grid-cols-4 gap-3 px-5 py-4 items-center ${i !== cupons.length - 1 ? 'border-b border-[#1e3040]' : ''}`}>
                <div className="col-span-2">
                  <div className="text-white font-bold">{c.nome}</div>
                  <div className="text-[#8197a4] text-xs">ID: {c.id}</div>
                </div>
                <div className="text-[#00a8e1] font-black">{c.desconto}</div>
                <div className="text-right">
                  <button onClick={() => deletarCupom(c.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
