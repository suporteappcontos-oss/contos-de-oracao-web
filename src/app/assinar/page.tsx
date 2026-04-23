'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ChevronRight, Shield, Play, Heart, Download, Loader2 } from 'lucide-react'

type Step = 1 | 2 | 3

export default function AssinarPage() {
  const [step, setStep] = useState<Step>(1)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [planoSelecionado, setPlanoSelecionado] = useState<'mensal' | 'anual'>('mensal')
  const [erros, setErros] = useState<{ nome?: string; email?: string }>({})
  
  // Estados para carregamento dinâmico
  const [precoMensal, setPrecoMensal] = useState(7.90)
  const [precoAnual, setPrecoAnual] = useState(70.80)
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  // Busca preços reais ativos na montagem
  useEffect(() => {
    fetch('/api/stripe/produtos')
      .then(r => r.json())
      .then(data => {
        if (data.produtos && data.produtos.length > 0) {
          const precos = data.produtos[0].precos
          const pm = precos.find((p: any) => p.intervalo === 'month')
          const pa = precos.find((p: any) => p.intervalo === 'year')
          if (pm) setPrecoMensal(pm.valor / 100)
          if (pa) setPrecoAnual(pa.valor / 100)
        }
      })
      .catch(console.error)
  }, [])

  function validarStep1() {
    const novosErros: { nome?: string; email?: string } = {}
    if (!nome.trim() || nome.trim().split(' ').length < 2) {
      novosErros.nome = 'Digite seu nome completo (nome e sobrenome)'
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      novosErros.email = 'Digite um e-mail válido'
    }
    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  function irParaStep2() {
    if (validarStep1()) setStep(2)
  }

  function irParaStep3() {
    setStep(3)
  }

  async function finalizarPagamento() {
    setLoadingCheckout(true)
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          plano: planoSelecionado
        })
      })
      const data = await response.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Erro ao criar sessão de pagamento.')
        setLoadingCheckout(false)
      }
    } catch (e) {
      alert('Erro de conexão ao criar checkout.')
      setLoadingCheckout(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: '#090B10', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>

      {/* Fundo */}
      <div className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1920&q=60')" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-[#090B10]/80 to-transparent" />

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/" className="flex items-center gap-3 no-underline">
          <Image src="/logo.png" alt="Contos de Oração" width={36} height={36} className="object-contain" />
          <div>
            <div className="text-white font-black text-sm leading-tight">Contos de Oração</div>
            <div className="text-[0.5rem] font-extrabold uppercase tracking-widest" style={{ color: '#D4AF37' }}>Premium</div>
          </div>
        </Link>
        <Link href="/login" className="text-white/40 text-sm hover:text-white transition-colors no-underline">
          Já tenho conta
        </Link>
      </header>

      {/* Indicador de Steps */}
      <div className="relative z-10 flex items-center justify-center pt-8 pb-6 gap-3">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all ${
              step === s
                ? 'text-[#090B10] scale-110'
                : step > s
                  ? 'text-[#090B10]'
                  : 'text-white/30 border border-white/15'
            }`}
              style={step >= s ? { background: '#D4AF37' } : {}}>
              {step > s ? <Check size={14} /> : s}
            </div>
            <span className={`text-xs font-semibold hidden sm:inline ${step === s ? 'text-white' : 'text-white/30'}`}>
              {s === 1 ? 'Seus dados' : s === 2 ? 'Escolher plano' : 'Pagamento'}
            </span>
            {s < 3 && <div className="w-8 h-px" style={{ background: step > s ? '#D4AF37' : 'rgba(255,255,255,0.1)' }} />}
          </div>
        ))}
      </div>

      {/* Conteúdo */}
      <main className="relative z-10 max-w-lg mx-auto px-4 pb-16">

        {/* ── STEP 1: Nome e Email ── */}
        {step === 1 && (
          <div className="rounded-2xl p-8 md:p-10"
            style={{ background: 'rgba(21,36,62,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>

            <h1 className="text-white text-2xl font-black mb-1">Criar sua conta</h1>
            <p className="text-white/40 text-sm mb-8">Informe seus dados para começar</p>

            <div className="flex flex-col gap-5">
              {/* Nome */}
              <div>
                <label className="text-white/50 text-[0.7rem] uppercase tracking-widest font-semibold block mb-1.5">
                  Seu nome completo
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => { setNome(e.target.value); setErros(p => ({ ...p, nome: undefined })) }}
                  placeholder="João Silva"
                  className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${erros.nome ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    fontFamily: 'Outfit, sans-serif'
                  }}
                  onKeyDown={e => e.key === 'Enter' && irParaStep2()}
                />
                {erros.nome && <p className="text-red-400 text-xs mt-1.5">{erros.nome}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-white/50 text-[0.7rem] uppercase tracking-widest font-semibold block mb-1.5">
                  Seu e-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErros(p => ({ ...p, email: undefined })) }}
                  placeholder="joao@email.com"
                  className="w-full px-4 py-3.5 rounded-xl text-white text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${erros.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                    fontFamily: 'Outfit, sans-serif'
                  }}
                  onKeyDown={e => e.key === 'Enter' && irParaStep2()}
                />
                {erros.email && <p className="text-red-400 text-xs mt-1.5">{erros.email}</p>}
                <p className="text-white/25 text-xs mt-1.5">
                  📧 Você vai receber o acesso neste e-mail após o pagamento
                </p>
              </div>

              <button onClick={irParaStep2}
                className="w-full py-4 font-extrabold rounded-xl text-base transition-all hover:brightness-110 hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 mt-2"
                style={{ background: '#D4AF37', color: '#090B10' }}>
                Continuar <ChevronRight size={18} />
              </button>
            </div>

            <p className="text-center text-white/20 text-xs mt-6">
              Já tem uma conta?{' '}
              <Link href="/login" style={{ color: '#D4AF37' }} className="no-underline hover:underline font-semibold">
                Fazer login
              </Link>
            </p>
          </div>
        )}

        {/* ── STEP 2: Selecionar Plano ── */}
        {step === 2 && (
          <div>
            <h1 className="text-white text-2xl font-black mb-1 text-center">Escolha seu plano</h1>
            <p className="text-white/40 text-sm mb-8 text-center">Cancele quando quiser</p>

            <div className="flex flex-col gap-4 mb-6">
              {/* Plano Mensal */}
              <button
                onClick={() => setPlanoSelecionado('mensal')}
                className="w-full text-left rounded-2xl p-5 transition-all cursor-pointer relative"
                style={{
                  background: planoSelecionado === 'mensal' ? 'rgba(212,175,55,0.08)' : 'rgba(21,36,62,0.7)',
                  border: `2px solid ${planoSelecionado === 'mensal' ? '#D4AF37' : 'rgba(255,255,255,0.08)'}`,
                }}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-black text-lg">Mensal</div>
                    <div className="text-white/50 text-sm mt-0.5">Cobrado todo mês</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-2xl" style={{ color: '#D4AF37' }}>
                      R$ {precoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-white/40 text-xs">/mês</div>
                  </div>
                </div>
                {planoSelecionado === 'mensal' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: '#D4AF37' }}>
                    <Check size={12} className="text-[#090B10]" />
                  </div>
                )}
              </button>

              {/* Plano Anual */}
              <button
                onClick={() => setPlanoSelecionado('anual')}
                className="w-full text-left rounded-2xl p-5 transition-all cursor-pointer relative"
                style={{
                  background: planoSelecionado === 'anual' ? 'rgba(212,175,55,0.08)' : 'rgba(21,36,62,0.7)',
                  border: `2px solid ${planoSelecionado === 'anual' ? '#D4AF37' : 'rgba(255,255,255,0.08)'}`,
                }}>
                <div className="absolute -top-3 left-5 px-3 py-0.5 rounded-full text-xs font-black"
                  style={{ background: '#D4AF37', color: '#090B10' }}>
                  Economize 30%
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white font-black text-lg">Anual</div>
                    <div className="text-white/50 text-sm mt-0.5">Cobrado uma vez por ano</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-2xl" style={{ color: '#D4AF37' }}>
                      R$ {(precoAnual / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-white/40 text-xs">/mês</div>
                  </div>
                </div>
                {planoSelecionado === 'anual' && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: '#D4AF37' }}>
                    <Check size={12} className="text-[#090B10]" />
                  </div>
                )}
              </button>
            </div>

            {/* Benefícios */}
            <div className="rounded-2xl p-5 mb-6"
              style={{ background: 'rgba(21,36,62,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">O que está incluído</p>
              {[
                [<Play size={14} />, 'Acesso a todo o conteúdo de Contos de Oração'],
                [<Heart size={14} />, 'Salve seus favoritos e continue de onde parou'],
                [<Download size={14} />, 'Assista em qualquer dispositivo'],
                [<Shield size={14} />, 'Cancele quando quiser, sem taxas'],
              ].map(([icon, text], i) => (
                <div key={i} className="flex items-center gap-3 py-2"
                  style={{ borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <span style={{ color: '#D4AF37' }}>{icon as React.ReactNode}</span>
                  <span className="text-white/70 text-sm">{text as string}</span>
                </div>
              ))}
            </div>

            <button onClick={irParaStep3}
              className="w-full py-4 font-extrabold rounded-xl text-base transition-all hover:brightness-110 hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
              style={{ background: '#D4AF37', color: '#090B10' }}>
              Continuar <ChevronRight size={18} />
            </button>

            <button onClick={() => setStep(1)}
              className="w-full py-3 mt-3 text-white/30 text-sm hover:text-white transition-colors cursor-pointer"
              style={{ background: 'transparent', border: 'none' }}>
              ← Voltar
            </button>
          </div>
        )}

        {/* ── STEP 3: Confirmar e Pagar ── */}
        {step === 3 && (
          <div>
            <h1 className="text-white text-2xl font-black mb-1 text-center">Confirmar assinatura</h1>
            <p className="text-white/40 text-sm mb-8 text-center">Revise seus dados antes de pagar</p>

            {/* Resumo */}
            <div className="rounded-2xl p-6 mb-5"
              style={{ background: 'rgba(21,36,62,0.85)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-3">Resumo do pedido</p>

              <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-white/60 text-sm">Nome</span>
                <span className="text-white font-semibold text-sm capitalize">{nome}</span>
              </div>
              <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-white/60 text-sm">E-mail</span>
                <span className="text-white font-semibold text-sm">{email}</span>
              </div>
              <div className="flex justify-between py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-white/60 text-sm">Plano</span>
                <span className="font-bold text-sm" style={{ color: '#D4AF37' }}>
                  {planoSelecionado === 'mensal' 
                    ? `Mensal — R$ ${precoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês` 
                    : `Anual — R$ ${(precoAnual / 12).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês`}
                </span>
              </div>
              <div className="flex justify-between pt-3 mt-1">
                <span className="text-white font-black text-sm">Total hoje</span>
                <span className="font-black text-lg" style={{ color: '#D4AF37' }}>
                  {planoSelecionado === 'mensal' 
                    ? `R$ ${precoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                    : `R$ ${precoAnual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                </span>
              </div>
            </div>

            {/* Info de pagamento seguro */}
            <div className="rounded-xl p-4 mb-5 flex items-start gap-3"
              style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <Shield size={16} className="shrink-0 mt-0.5 text-emerald-400" />
              <div>
                <p className="text-emerald-400 font-bold text-sm">Pagamento 100% seguro</p>
                <p className="text-white/40 text-xs mt-0.5">
                  Você será redirecionado para o checkout oficial do Stripe.
                  Sua conta será criada e ativada instantaneamente após o pagamento.
                </p>
              </div>
            </div>

            <button onClick={finalizarPagamento} disabled={loadingCheckout}
              className="w-full py-4 font-extrabold rounded-xl text-base transition-all hover:brightness-110 hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: '#D4AF37', color: '#090B10' }}>
              {loadingCheckout ? (
                <><Loader2 className="animate-spin" size={18} /> Redirecionando...</>
              ) : (
                <>Ir para o pagamento segura <ChevronRight size={18} /></>
              )}
            </button>

            <button onClick={() => setStep(2)}
              className="w-full py-3 mt-3 text-white/30 text-sm hover:text-white transition-colors cursor-pointer"
              style={{ background: 'transparent', border: 'none' }}>
              ← Voltar
            </button>

            <p className="text-center text-white/20 text-xs mt-4">
              Ao continuar você concorda com nossos{' '}
              <span style={{ color: '#D4AF37' }} className="cursor-pointer hover:underline">Termos de Uso</span>
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
