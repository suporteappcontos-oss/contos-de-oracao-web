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

  const [novoProduto, setNovoProduto] = useState({ nome: 'Assinatura', preco: '29,90', intervalo: 'month', beneficios: 'Acesso ilimitado ao catálogo, Resolução Full HD, Suporte prioritário' })
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
    // Formata o preco trocando virgula por ponto
    const parsePreco = (val: string) => Number(val.replace(',', '.'))
    
    const payload = {
      ...novoProduto,
      preco: parsePreco(novoProduto.preco),
      beneficios: novoProduto.beneficios
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
    } catch (e) {
      alert('Falha na comunicação com o servidor.')
    }
    await fetchData()
    setLoadingAction(false)
  }

  const arquivarProduto = async (id: string) => {
    if (!confirm('Tem certeza que deseja APAGAR este produto? Isso fará ele sumir da página de planos.')) return
    setLoadingAction(true)
    await fetch('/api/stripe/produtos', { method: 'DELETE', body: JSON.stringify({ id }) })
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

        {/* FORMULÁRIO DE CRIAÇÃO */}
        <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl p-6 mb-6">
          <h3 className="text-white font-bold mb-4">Criar Novo Plano/Produto</h3>
          <form onSubmit={criarProduto} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Nome do Plano</label>
              <input type="text" required value={novoProduto.nome} onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Intervalo de Cobrança</label>
              <select value={novoProduto.intervalo} onChange={e => setNovoProduto({...novoProduto, intervalo: e.target.value})} className={inputCls}>
                <option value="month">Mensal</option>
                <option value="year">Anual</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Valor (R$)</label>
              <input type="text" required value={novoProduto.preco} onChange={e => setNovoProduto({...novoProduto, preco: e.target.value.replace(/[^0-9,.]/g, '')})} className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Vantagens / Benefícios (separe por vírgula)</label>
              <input type="text" placeholder="Ex: Acesso ilimitado, Resolução Full HD" required value={novoProduto.beneficios} onChange={e => setNovoProduto({...novoProduto, beneficios: e.target.value})} className={inputCls} />
            </div>
            <div className="sm:col-span-3">
              <button disabled={loadingAction} className="bg-[#D4AF37] text-[#090B10] px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                <Plus size={16} /> Criar Plano e Preço
              </button>
            </div>
          </form>
        </div>

        {/* LISTAGEM DOS PRODUTOS */}
        {produtos.length > 0 && (
          <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl overflow-hidden p-6">
            <h3 className="text-white font-bold mb-4">Planos Ativos</h3>
            {produtos.map((p, i) => (
              <div key={p.id} className={`relative group ${i !== produtos.length - 1 ? 'border-b border-[#1e3040] pb-6 mb-6' : ''}`}>
                <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => arquivarProduto(p.id)} className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold">
                    <Trash2 size={14} /> Apagar Produto e Preços
                  </button>
                </div>
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
