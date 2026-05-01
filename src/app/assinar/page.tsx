
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ChevronRight, Shield, Play, Heart, Download, Loader2, Monitor, Lock, Eye, EyeOff } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'

// Carrega o Stripe public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

type Step = 1 | 2 | 3

export default function AssinarPage() {
  const [step, setStep] = useState<Step>(1)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [planoSelecionado, setPlanoSelecionado] = useState<string>('')
  const [erros, setErros] = useState<{ nome?: string; email?: string; senha?: string; confirmarSenha?: string }>({})
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)

  // Estados para carregamento dinâmico
  const [planos, setPlanos] = useState<any[]>([])
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [erroCheckout, setErroCheckout] = useState<{ msg: string; tipo: 'email_duplicado' | 'generico' } | null>(null)

  // Busca preços reais ativos na montagem
  useEffect(() => {
    // Pega o parametro 'plan' da url se existir
    const params = new URLSearchParams(window.location.search)
    const planParam = params.get('plan')

    if (planParam) setPlanoSelecionado(planParam)

    fetch('/api/stripe/planos-publicos')
      .then(r => r.json())
      .then(data => {
        if (data.planos) {
          setPlanos(data.planos)
          if (!planParam && data.planos.length > 0) {
            setPlanoSelecionado(data.planos[0].id)
          }
        }
      })
      .catch(console.error)
  }, [])

  function validarStep1() {
    const novosErros: { nome?: string; email?: string; senha?: string; confirmarSenha?: string } = {}
    if (!nome.trim() || nome.trim().split(' ').length < 2) {
      novosErros.nome = 'Digite seu nome completo (nome e sobrenome)'
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      novosErros.email = 'Digite um e-mail válido'
    }
    if (!senha || senha.length < 6) {
      novosErros.senha = 'A senha deve ter no mínimo 6 caracteres'
    }
    if (!confirmarSenha || confirmarSenha !== senha) {
      novosErros.confirmarSenha = 'As senhas não coincidem'
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
    setErroCheckout(null)
    try {
      const response = await fetch('/api/stripe/assinatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          senha,
          plano: planoSelecionado
        })
      })
      const data = await response.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
      } else {
        const msgErro = data.error || ''
        const emailDuplicado = msgErro.toLowerCase().includes('already been registered') || msgErro.toLowerCase().includes('already registered') || msgErro.toLowerCase().includes('email already')
        setErroCheckout({
          msg: emailDuplicado ? 'Este e-mail já possui uma conta cadastrada.' : msgErro || 'Erro ao inicializar plataforma segura.',
          tipo: emailDuplicado ? 'email_duplicado' : 'generico'
        })
      }
    } catch (e) {
      setErroCheckout({ msg: 'Erro de conexão. Verifique sua internet e tente novamente.', tipo: 'generico' })
    } finally {
      setLoadingCheckout(false)
    }
  }

  const planoDetalhe = planos.find(p => p.id === planoSelecionado)

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: '#090B10', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>

      {/* Fundo */}
      <div className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1920&q=60')" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-[#090B10]/80 to-transparent" />

      {/* Estilos globais para animações exclusivas */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shine {
          0% { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(200%) rotate(45deg); }
        }
        @keyframes floatGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(212,175,55,0.2); }
          50% { box-shadow: 0 0 35px rgba(212,175,55,0.5); }
        }
        .plano-selecionado {
          animation: floatGlow 3s ease-in-out infinite;
          transform: scale(1.03);
          z-index: 10;
        }
        .plano-selecionado::after {
          content: "";
          position: absolute;
          top: -50%; left: -50%; width: 200%; height: 200%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 100%);
          transform: rotate(45deg);
          animation: shine 4s infinite;
          pointer-events: none;
        }
      `}} />

      {/* Header */}
      <header className="relative z-10 px-6 py-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/" className="flex items-center gap-3 no-underline">
          <Image src="/logo.png" alt="Contos de Oração" width={36} height={36} className="object-contain" />
          <div className="text-white font-black text-sm leading-tight">Contos de Oração</div>
        </Link>
        <Link 
          href="/login" 
          className="px-5 py-2 rounded-full font-bold text-xs md:text-sm transition-all hover:scale-105 hover:brightness-110 shadow-[0_0_15px_rgba(212,175,55,0.2)] no-underline"
          style={{ backgroundColor: '#D4AF37', color: '#090B10' }}
        >
          Entrar
        </Link>
      </header>

      {/* Layout Unificado (Esquerda: Info e Benefícios, Direita: Checkout) */}
      <div className="relative z-10 flex flex-col lg:flex-row max-w-4xl mx-auto w-full flex-1 mb-16 mt-8 rounded-[1.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10" style={{ background: 'rgba(21,36,62,0.92)', backdropFilter: 'blur(20px)' }}>
        
        {/* Lado Esquerdo - Info e Benefícios */}
        <div className="hidden lg:flex w-full lg:w-1/2 p-6 lg:p-10 flex-col relative border-b lg:border-b-0 lg:border-r border-white/5" style={{ background: 'rgba(0,0,0,0.2)' }}>
          {/* Glow Animado por Trás */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/10 to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 w-full h-full flex flex-col">
            <h2 className="text-xl lg:text-2xl font-black text-white mb-2 leading-snug">
              Sua jornada <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F9E596]">começa aqui</span>
            </h2>
            <p className="text-white/50 text-xs mb-6 leading-relaxed">
              Acesso ilimitado a conteúdos exclusivos e mensagens edificantes.
            </p>

            {/* Caixa de benefícios centralizada dinamicamente */}
            <div className="rounded-xl p-5 w-full flex-1" style={{ background: 'rgba(21,36,62,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                <Check size={14} />
                {planoDetalhe ? `Benefícios: ${planoDetalhe.produto.nome}` : 'O que está incluído'}
              </p>
              
              {planoDetalhe && planoDetalhe.produto.metadata?.beneficios ? (
                // Benefícios personalizados do plano selecionado
                planoDetalhe.produto.metadata.beneficios.split(',').map((beneficio: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 py-2.5" style={{ borderBottom: i < planoDetalhe.produto.metadata.beneficios.split(',').length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ color: '#D4AF37', marginTop: '2px' }}>✓</span>
                    <span className="text-white/80 text-sm leading-snug">{beneficio.trim()}</span>
                  </div>
                ))
              ) : (
                // Benefícios padrão quando não há plano selecionado
                [
                  '📺 Acesso ilimitado a todos os vídeos',
                  '❤️ Salve favoritos e assista de onde parou',
                  '📱 Disponível em qualquer dispositivo',
                  '🚀 Em breve: App exclusivo iOS/Android',
                  '🎥 Qualidade de cinema em Full HD',
                  '⭐ Cancele a qualquer momento'
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3 py-2.5" style={{ borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ color: '#D4AF37', marginTop: '2px' }}>{text.split(' ')[0]}</span>
                    <span className="text-white/80 text-sm leading-snug">{text.substring(text.indexOf(' ') + 1)}</span>
                  </div>
                ))
              )}

              {planoDetalhe && (
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="flex items-start gap-2">
                    <Shield size={16} style={{ color: '#D4AF37', marginTop: '1px' }} />
                    <span className="text-white/60 text-xs">
                      {planoDetalhe.intervalo === 'year' ? 'Economia: 12 meses pelo preço de 10!' : 'Sem fidelidade. Cancele quando quiser, sem multas.'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Destaque do Plano Dinâmico no Checkout final */}
            {step === 3 && planoDetalhe && (
              <div className="mt-6 p-4 rounded-xl transition-all duration-500" style={{ background: 'linear-gradient(145deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))', border: '1px solid rgba(212,175,55,0.25)' }}>
                 <p className="text-[#D4AF37] text-[0.65rem] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Check size={12} strokeWidth={3} /> Plano Selecionado
                 </p>
                 <p className="text-white font-black text-lg">{planoDetalhe.produto.nome}</p>
                 <p className="text-white/60 text-xs font-semibold mt-0.5">R$ {(planoDetalhe.valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / {planoDetalhe.intervalo === 'month' ? 'mês' : planoDetalhe.intervalo === 'year' ? 'ano' : 'ciclo'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Lado Direito - Fluxo de Checkout */}
        <div className="w-full lg:w-1/2">
          <div className="px-6 py-8 sm:px-10 h-full flex flex-col justify-center">
            
            {/* Indicador de Steps — Pills com destaque */}
            <div className="flex items-center justify-center mb-8 gap-0 w-full">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1 last:flex-none last:flex-grow-0">
                  <div className="flex flex-col items-center gap-1">
                    {/* Bolinha da etapa */}
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-black transition-all duration-500 ${
                      step === s
                        ? 'text-[#090B10] shadow-[0_0_18px_rgba(212,175,55,0.6)] scale-110'
                        : step > s
                          ? 'text-[#090B10]'
                          : 'text-white/30'
                      }`}
                      style={step >= s ? { background: '#D4AF37' } : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {step > s ? <Check size={14} strokeWidth={3} /> : s}
                    </div>
                    {/* Label com pill de destaque no step ativo */}
                    <div className={`px-2.5 py-0.5 rounded-full transition-all duration-500 mt-0.5 ${
                      step === s
                        ? 'bg-[#D4AF37]/15'
                        : 'bg-transparent'
                    }`}>
                      <span className={`text-[0.6rem] font-extrabold uppercase tracking-wider hidden sm:block transition-all duration-500 ${
                        step === s ? 'text-[#D4AF37]' : step > s ? 'text-[#D4AF37]/50' : 'text-white/20'
                      }`}>
                        {s === 1 ? 'Dados' : s === 2 ? 'Plano' : 'Pagamento'}
                      </span>
                    </div>
                  </div>
                  {s < 3 && (
                    <div className="flex-1 h-[1px] mx-2 mt-[-14px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full transition-all duration-700 ease-out" style={{ width: step > s ? '100%' : '0%', background: 'linear-gradient(to right, #D4AF37, #F9E596)' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── STEP 1: Nome e Email ── */}
        {step === 1 && (
          <div className="pt-1">
            <h1 className="text-white text-xl font-black mb-1 tracking-tight">Criar sua conta</h1>
            <p className="text-white/40 text-xs mb-5">Informe seus dados para começar</p>

            <div className="flex flex-col gap-3">
              {/* Nome */}
              <div>
                <label className="text-white/40 text-[0.6rem] uppercase tracking-widest font-bold block mb-1">Seu nome completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={e => { setNome(e.target.value); setErros(p => ({ ...p, nome: undefined })) }}
                  placeholder="João Silva"
                  className="w-full px-3.5 py-2.5 rounded-lg text-white text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${erros.nome ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)'}`,
                    fontFamily: 'Outfit, sans-serif'
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = erros.nome ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)' }}
                  onKeyDown={e => e.key === 'Enter' && irParaStep2()}
                />
                {erros.nome && <p className="text-red-400 text-xs mt-1.5">{erros.nome}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="text-white/40 text-[0.6rem] uppercase tracking-widest font-bold block mb-1">Seu e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErros(p => ({ ...p, email: undefined })) }}
                  placeholder="joao@email.com"
                  className="w-full px-3.5 py-2.5 rounded-lg text-white text-sm outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${erros.email ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)'}`,
                    fontFamily: 'Outfit, sans-serif'
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = erros.email ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)' }}
                  onKeyDown={e => e.key === 'Enter' && irParaStep2()}
                />
                {erros.email && <p className="text-red-400 text-xs mt-1.5">{erros.email}</p>}
              </div>

              {/* Senha */}
              <div>
                <label className="text-white/40 text-[0.6rem] uppercase tracking-widest font-bold block mb-1">Crie uma senha de acesso</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => { setSenha(e.target.value); setErros(p => ({ ...p, senha: undefined, confirmarSenha: undefined })) }}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-3.5 py-2.5 pr-11 rounded-lg text-white text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1.5px solid ${erros.senha ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)'}`,
                      fontFamily: 'Outfit, sans-serif'
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = erros.senha ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)' }}
                    onKeyDown={e => e.key === 'Enter' && irParaStep2()}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.35)', padding: '4px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#D4AF37' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)' }}
                  >
                    {mostrarSenha ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {erros.senha && <p className="text-red-400 text-xs mt-1.5">{erros.senha}</p>}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="text-white/40 text-[0.6rem] uppercase tracking-widest font-bold block mb-1">Confirme sua senha</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarConfirmar ? 'text' : 'password'}
                    value={confirmarSenha}
                    onChange={e => { setConfirmarSenha(e.target.value); setErros(p => ({ ...p, confirmarSenha: undefined })) }}
                    placeholder="Digite a senha novamente"
                    className="w-full px-3.5 py-2.5 pr-11 rounded-lg text-white text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: `1.5px solid ${erros.confirmarSenha ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)'}`,
                      fontFamily: 'Outfit, sans-serif'
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)' }}
                    onBlur={e => { e.currentTarget.style.borderColor = erros.confirmarSenha ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.08)' }}
                    onKeyDown={e => e.key === 'Enter' && irParaStep2()}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.35)', padding: '4px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#D4AF37' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)' }}
                  >
                    {mostrarConfirmar ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {erros.confirmarSenha && <p className="text-red-400 text-xs mt-1.5">{erros.confirmarSenha}</p>}
                <p className="text-white/25 text-xs mt-1.5">
                  🔒 Você usará esta senha para entrar na plataforma
                </p>
              </div>

              <button onClick={irParaStep2}
                className="w-full py-3 font-extrabold rounded-xl text-sm transition-all hover:brightness-110 hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 mt-1"
                style={{ background: '#D4AF37', color: '#090B10' }}>
                Continuar <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>

            <p className="text-center text-white/20 text-xs mt-5">
              Já tem uma conta?{' '}
              <Link href="/login" style={{ color: '#D4AF37' }} className="no-underline hover:underline font-bold">Fazer login</Link>
            </p>
          </div>
        )}

        {/* ── STEP 2: Selecionar Plano ── */}
        {step === 2 && (
          <div className="pt-1">
            <h1 className="text-white text-xl font-black mb-1 text-center tracking-tight">Escolha seu plano</h1>
            <p className="text-white/40 text-xs mb-5 text-center">Selecione o melhor plano para você</p>

            <div className="flex flex-col gap-3 mb-4">
              {planos.length === 0 && <p className="text-white/50 text-center">Carregando planos...</p>}

              {planos.map(plano => (
                <button
                  key={plano.id}
                  onClick={() => setPlanoSelecionado(plano.id)}
                  className={`w-full text-left rounded-xl p-4 transition-all duration-300 cursor-pointer overflow-hidden ${planoSelecionado === plano.id ? 'plano-selecionado border-2 border-[#D4AF37]' : 'border border-white/5 hover:border-white/20 hover:bg-white/5'}`}
                  style={{
                    background: planoSelecionado === plano.id ? 'rgba(212,175,55,0.1)' : 'rgba(21,36,62,0.7)',
                    position: 'relative'
                  }}>
                  {plano.intervalo === 'year' && (
                    <div className="absolute -top-3 left-5 px-3 py-0.5 rounded-full text-xs font-black"
                      style={{ background: '#D4AF37', color: '#090B10' }}>
                      Melhor Opção
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-black text-base">{plano.produto.nome}</div>
                      <div className="text-white/50 text-xs mt-0.5">
                        {plano.intervalo === 'month' ? 'Cobrado mensalmente' : plano.intervalo === 'year' ? 'Cobrado anualmente' : 'Cobrança personalizada'}
                      </div>
                      {/* Badge de telas simultâneas */}
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}
                        >
                          <Monitor size={13} style={{ color: '#D4AF37' }} />
                          <span className="text-[0.75rem] font-bold" style={{ color: '#D4AF37' }}>
                            {(plano.produto.metadata?.max_telas || 1)} tela{(plano.produto.metadata?.max_telas || 1) > 1 ? 's' : ''} simultânea{(plano.produto.metadata?.max_telas || 1) > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-xl" style={{ color: '#D4AF37' }}>
                         R$ {(plano.valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                       </div>
                       <div className="text-white/40 text-xs">/{plano.intervalo === 'month' ? 'mês' : plano.intervalo === 'year' ? 'ano' : 'ciclo'}</div>
                    </div>
                  </div>
                  {planoSelecionado === plano.id && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: '#D4AF37' }}>
                      <Check size={12} className="text-[#090B10]" />
                    </div>
                  )}
                </button>
              ))}
            </div>


            <button onClick={irParaStep3}
              className="w-full py-3 font-extrabold rounded-xl text-sm transition-all hover:brightness-110 hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2"
              style={{ background: '#D4AF37', color: '#090B10' }}>
              Continuar <ChevronRight size={16} strokeWidth={3} />
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
          <div className="pt-1">
            <h1 className="text-white text-xl font-black mb-1 text-center tracking-tight">Confirmar assinatura</h1>
            <p className="text-white/40 text-xs mb-5 text-center">Revise seus dados antes de pagar</p>

            {/* Formulário Embutido da Stripe ou Resumo */}
            {!clientSecret ? (
              <>
                {/* Banner de erro inline */}
                {erroCheckout && (
                  <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <p className="text-red-400 text-sm font-semibold mb-3">⚠️ {erroCheckout.msg}</p>
                    {erroCheckout.tipo === 'email_duplicado' ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link href="/login" className="flex-1 text-center py-2 rounded-lg text-sm font-bold no-underline transition-all hover:brightness-110" style={{ background: '#D4AF37', color: '#090B10' }}>
                          Fazer Login →
                        </Link>
                        <Link href="/esqueci-senha" className="flex-1 text-center py-2 rounded-lg text-sm font-bold no-underline transition-all border border-white/10 hover:border-white/30 text-white/70 hover:text-white">
                          Recuperar Senha
                        </Link>
                      </div>
                    ) : (
                      <button onClick={() => setErroCheckout(null)} className="text-xs text-white/40 hover:text-white/70 transition-colors underline cursor-pointer bg-transparent border-none">
                        Tentar novamente
                      </button>
                    )}
                  </div>
                )}

                {/* Botoes: esconde pagamento e voltar se email duplicado */}
                {erroCheckout?.tipo === 'email_duplicado' ? null : (
                  <button onClick={finalizarPagamento} disabled={loadingCheckout}
                    className="w-full py-3.5 font-extrabold rounded-xl text-sm transition-all hover:brightness-110 hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: '#D4AF37', color: '#090B10' }}>
                    {loadingCheckout ? (
                      <><Loader2 className="animate-spin" size={17} /> Preparando ambiente seguro...</>
                    ) : (
                      <><Lock size={16} /> Ir para o Pagamento Seguro <ChevronRight size={16} /></>
                    )}
                  </button>
                )}
              </>
            ) : (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-4 justify-center">
                  <Lock size={16} className="text-[#D4AF37]" />
                  <span className="text-[#D4AF37] font-bold text-sm">Ambiente Seguro Stripe</span>
                </div>
                <EmbeddedCheckoutProvider 
                  stripe={stripePromise} 
                  options={{ clientSecret }}
                >
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            )}

            {!clientSecret && erroCheckout?.tipo !== 'email_duplicado' && (
              <button onClick={() => setStep(2)}
                className="w-full py-3 mt-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 group border border-white/5 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 text-white/40 hover:text-[#D4AF37]"
                style={{ background: 'transparent' }}>
                <span className="transition-transform group-hover:-translate-x-1">←</span> Voltar para Escolha do Plano
              </button>
            )}

            <p className="text-center text-white/20 text-xs mt-5">
              Ao continuar você concorda com nossos{' '}
              <span style={{ color: '#D4AF37' }} className="cursor-pointer hover:underline">Termos de Uso</span>
            </p>
          </div>
        )}

          </div>
        </div>
      </div>
    </div>
  )
}
