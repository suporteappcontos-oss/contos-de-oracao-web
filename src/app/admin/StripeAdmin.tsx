'use client'

import { useState, useEffect } from 'react'
import { Plus, Tag, Settings, CreditCard, Trash2, X, RefreshCw } from 'lucide-react'

type Preco = { id: string; valor: number; moeda: string; intervalo: string }
type Produto = { id: string; nome: string; ativo: boolean; precos: Preco[] }
type Cupom = { id: string; nome: string; desconto: string; usos_max: number | null; usos_atual: number; ativo: boolean; expira: string | null }

export function StripeAdmin() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [loading, setLoading] = useState(true)

  const [novoProduto, setNovoProduto] = useState({ nome: 'Assinatura Premium', preco_mensal: 29.9, preco_anual: 299.9 })
  const [novoCupom, setNovoCupom] = useState({ nome: '', codigo: '', tipo: 'percentual', valor: '', usos_max: '' })
  const [loadingAction, setLoadingAction] = useState(false)

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

  const criarProduto = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingAction(true)
    await fetch('/api/stripe/produtos', {
      method: 'POST',
      body: JSON.stringify(novoProduto)
    })
    await fetchData()
    setLoadingAction(false)
  }

  const criarCupom = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingAction(true)
    await fetch('/api/stripe/cupons', {
      method: 'POST',
      body: JSON.stringify(novoCupom)
    })
    setNovoCupom({ nome: '', codigo: '', tipo: 'percentual', valor: '', usos_max: '' })
    await fetchData()
    setLoadingAction(false)
  }

  const deletarCupom = async (id: string) => {
    if (!confirm('Desativar este cupom?')) return
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

        {produtos.length === 0 ? (
          <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Criar Produto de Assinatura</h3>
            <form onSubmit={criarProduto} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>Nome</label>
                <input required value={novoProduto.nome} onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Valor Mensal (R$)</label>
                <input type="number" step="0.01" required value={novoProduto.preco_mensal} onChange={e => setNovoProduto({...novoProduto, preco_mensal: Number(e.target.value)})} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Valor Anual (R$)</label>
                <input type="number" step="0.01" required value={novoProduto.preco_anual} onChange={e => setNovoProduto({...novoProduto, preco_anual: Number(e.target.value)})} className={inputCls} />
              </div>
              <div className="sm:col-span-3">
                <button disabled={loadingAction} className="bg-[#D4AF37] text-[#090B10] px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                  <Plus size={16} /> Criar Produto e Preços
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl overflow-hidden p-6">
            {produtos.map(p => (
              <div key={p.id}>
                <div className="text-white font-black text-xl mb-2">📦 {p.nome}</div>
                <div className="flex flex-wrap gap-3">
                  {p.precos.map(pr => (
                    <div key={pr.id} className="bg-[#0f171e] border border-[#1e3040] px-4 py-2 rounded-lg">
                      <span className="text-[#8197a4] text-xs uppercase block">{pr.intervalo === 'year' ? 'Plano Anual' : 'Plano Mensal'}</span>
                      <span className="text-white font-bold">R$ {(pr.valor / 100).toFixed(2)}</span>
                      <div className="text-[0.6rem] text-[#D4AF37] mt-1 select-all">{pr.id} <span className="text-[#4a6373]">(Price ID)</span></div>
                    </div>
                  ))}
                </div>
                <p className="text-[#8197a4] text-xs mt-4 bg-white/5 p-3 rounded-lg border border-white/5">
                  ⚠️ <b>Importante:</b> Copie os &quot;Price ID&quot; acima e coloque nas variáveis <code className="text-[#D4AF37]">STRIPE_PRICE_MENSAL</code> e <code className="text-[#D4AF37]">STRIPE_PRICE_ANUAL</code> na Vercel!
                </p>
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
            <div className="md:col-span-5">
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
