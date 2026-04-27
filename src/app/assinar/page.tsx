
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ChevronRight, Shield, Play, Heart, Download, Loader2, Monitor, Lock } from 'lucide-react'
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
        alert(data.error || 'Erro ao inicializar plataforma segura.')
      }
    } catch (e) {
      alert('Erro de conexão ao criar assinatura. Tente novamente.')
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

      {/* Indicador de Steps Premium */}
      <div className="relative z-10 flex items-center justify-center pt-10 pb-8 gap-2 sm:gap-4 max-w-2xl mx-auto px-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 sm:gap-4 flex-1 last:flex-none">
            <div className={`flex items-center justify-center min-w-[36px] h-9 rounded-full text-sm font-black transition-all duration-500 ${step === s
              ? 'text-[#090B10] scale-110 shadow-[0_0_20px_rgba(212,175,55,0.4)] ring-4 ring-[#D4AF37]/20'
              : step > s
                ? 'text-[#090B10]'
                : 'text-white/30 border-2 border-white/10'
              }`}
              style={step >= s ? { background: '#D4AF37' } : {}}>
              {step > s ? <Check size={16} /> : s}
            </div>
            <span className={`text-xs sm:text-sm font-bold whitespace-nowrap hidden sm:inline transition-all duration-500 ${step === s ? 'text-white' : step > s ? 'text-[#D4AF37]' : 'text-white/30'}`}>
              {s === 1 ? 'Seus dados' : s === 2 ? 'Escolher plano' : 'Pagamento'}
            </span>
            {s < 3 && (
              <div className="flex-1 h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="h-full transition-all duration-700 ease-out" style={{ width: step > s ? '100%' : '0%', background: '#D4AF37' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Conteúdo */}
      <main className="relative z-10 max-w-lg mx-auto px-4 pb-16">

        {/* ── STEP 1: Nome e Email ── */}
        {step === 1 && (
          <div className="rounded-2xl p-8 md:p-10"
            style={{ background: 'rgba(21,36,62,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>

            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 text-3xl font-black mb-2 tracking-tight">Criar sua conta</h1>
            <p className="text-white/50 text-sm mb-8 font-medium">Informe seus dados para começar</p>

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
              </div>

              {/* Senha */}
              <div>
                <label className="text-white/50 text-[0.7rem] uppercase tracking-widest font-semibold block mb-1.5">
                  Crie uma senha de acesso
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => { setSenha(e.target.value); setErros(p => ({ ...p, senha: undefined, confirmarSenha: undefined })) }}
                    placeholder="Mínimo de 6 caracteres"
                    className="w-full px-4 py-3.5 pr-12 rounded-xl text-white text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${erros.senha ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      fontFamily: 'Outfit, sans-serif'
                    }}
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
                    {mostrarSenha ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {erros.senha && <p className="text-red-400 text-xs mt-1.5">{erros.senha}</p>}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="text-white/50 text-[0.7rem] uppercase tracking-widest font-semibold block mb-1.5">
                  Confirme sua senha
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={mostrarConfirmar ? 'text' : 'password'}
                    value={confirmarSenha}
                    onChange={e => { setConfirmarSenha(e.target.value); setErros(p => ({ ...p, confirmarSenha: undefined })) }}
                    placeholder="Digite a senha novamente"
                    className="w-full px-4 py-3.5 pr-12 rounded-xl text-white text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: `1px solid ${erros.confirmarSenha ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                      fontFamily: 'Outfit, sans-serif'
                    }}
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
                    {mostrarConfirmar ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {erros.confirmarSenha && <p className="text-red-400 text-xs mt-1.5">{erros.confirmarSenha}</p>}
                <p className="text-white/25 text-xs mt-1.5">
                  🔒 Você usará esta senha para entrar na plataforma
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
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 text-3xl font-black mb-2 text-center tracking-tight">Escolha seu plano</h1>
            <p className="text-white/50 text-sm mb-8 text-center font-medium">Selecione o melhor plano para você</p>

            <div className="flex flex-col gap-4 mb-6">
              {planos.length === 0 && <p className="text-white/50 text-center">Carregando planos...</p>}

              {planos.map(plano => (
                <button
                  key={plano.id}
                  onClick={() => setPlanoSelecionado(plano.id)}
                  className={`w-full text-left rounded-2xl p-5 transition-all duration-300 cursor-pointer overflow-hidden ${planoSelecionado === plano.id ? 'plano-selecionado border-2 border-[#D4AF37]' : 'border-2 border-white/5 hover:border-white/20 hover:bg-white/5'}`}
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
                      <div className="text-white font-black text-lg">{plano.produto.nome}</div>
                      <div className="text-white/50 text-sm mt-0.5">
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
                      <div className="font-black text-2xl" style={{ color: '#D4AF37' }}>
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

            {/* Benefícios Dinâmicos */}
            <div className="rounded-2xl p-5 mb-6"
              style={{ background: 'rgba(21,36,62,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-3">
                {planoDetalhe ? `Benefícios do plano ${planoDetalhe.produto.nome}` : 'O que está incluído'}
              </p>
              
              {planoDetalhe && planoDetalhe.produto.metadata?.beneficios ? (
                // Benefícios personalizados do plano selecionado
                planoDetalhe.produto.metadata.beneficios.split(',').map((beneficio: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 py-2"
                    style={{ borderBottom: i < planoDetalhe.produto.metadata.beneficios.split(',').length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ color: '#D4AF37' }}>✓</span>
                    <span className="text-white/70 text-sm">{beneficio.trim()}</span>
                  </div>
                ))
              ) : (
                // Benefícios padrão quando não há plano selecionado
                [
                  [<Play size={14} />, '📺 Acesso ilimitado a todos os vídeos e orações'],
                  [<Heart size={14} />, '❤️ Salve seus favoritos e continue de onde parou'],
                  [<Download size={14} />, '📱 Assista em qualquer dispositivo (computador, celular, tablet)'],
                  [<Shield size={14} />, '🚀 Em breve: App exclusivo para iOS e Android'],
                  [<Shield size={14} />, '🎥 Vídeos em Full HD (1080p)'],
                  [<Shield size={14} />, '⭐ Suporte prioritário 24/7'],
                ].map(([icon, text], i) => (
                  <div key={i} className="flex items-center gap-3 py-2"
                    style={{ borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ color: '#D4AF37' }}>{text.toString().split(' ')[0]}</span>
                    <span className="text-white/70 text-sm">{text.toString().substring(text.toString().indexOf(' ') + 1)}</span>
                  </div>
                ))
              )}
              
              {planoDetalhe && (
                <div className="mt-4 pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Shield size={16} style={{ color: '#D4AF37' }} />
                    <span className="text-white/50 text-xs">
                      {planoDetalhe.intervalo === 'year' 
                        ? '💰 Economia: 12 meses pelo preço de 10!' 
                        : '🔄 Cancele quando quiser, sem multa'
                      }
                    </span>
                  </div>
                </div>
              )}
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
            <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 text-3xl font-black mb-2 text-center tracking-tight">Confirmar assinatura</h1>
            <p className="text-white/50 text-sm mb-8 text-center font-medium">Revise seus dados antes de pagar</p>

            {/* Formulário Embutido da Stripe ou Resumo */}
            {!clientSecret ? (
              <>
                {/* Resumo - Animação de Bilhete Premium */}
                <div className="rounded-2xl p-6 mb-5 relative overflow-hidden"
                  style={{ 
                    background: 'linear-gradient(145deg, rgba(21,36,62,0.9), rgba(9,11,16,0.9))', 
                    border: '1px solid rgba(212,175,55,0.4)',
                    boxShadow: '0 10px 40px rgba(212,175,55,0.15)'
                  }}>
                  {/* Efeito de brilho cruzando o resumo */}
                  <div className="absolute inset-0 pointer-events-none opacity-50"
                    style={{
                      background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.1), transparent)',
                      transform: 'skewX(-20deg)',
                      animation: 'shine 3s infinite'
                    }} />

                  <div className="flex items-center gap-2 mb-4">
                    <Check size={18} className="text-[#D4AF37]" />
                    <p className="text-[#D4AF37] text-xs font-black uppercase tracking-widest m-0">Plano Selecionado</p>
                  </div>

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
                      {planoDetalhe ? `${planoDetalhe.produto.nome} — R$ ${(planoDetalhe.valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/${planoDetalhe.intervalo === 'month' ? 'mês' : planoDetalhe.intervalo === 'year' ? 'ano' : 'ciclo'}` : 'Carregando...'}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 mt-1">
                    <span className="text-white font-black text-sm">Total hoje</span>
                    <span className="font-black text-lg" style={{ color: '#D4AF37' }}>
                      {planoDetalhe ? `R$ ${(planoDetalhe.valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00'}
                    </span>
                  </div>
                </div>

                <button onClick={finalizarPagamento} disabled={loadingCheckout}
                  className="w-full py-4 font-extrabold rounded-xl text-base transition-all hover:brightness-110 hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ background: '#D4AF37', color: '#090B10' }}>
                  {loadingCheckout ? (
                    <><Loader2 className="animate-spin" size={18} /> Preparando ambiente seguro...</>
                  ) : (
                    <><Lock size={18} /> Ir para o Pagamento Seguro <ChevronRight size={18} /></>
                  )}
                </button>
              </>
            ) : (
              <div className="rounded-2xl p-6" style={{ background: 'rgba(21,36,62,0.85)', border: '1px solid rgba(212,175,55,0.2)' }}>
                <div className="flex items-center gap-2 mb-4">
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

            {!clientSecret && (
              <button onClick={() => setStep(2)}
                className="w-full py-4 mt-3 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 group border border-white/5 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 text-white/50 hover:text-[#D4AF37]"
                style={{ background: 'transparent' }}>
                <span className="transition-transform group-hover:-translate-x-1">←</span> Voltar para Escolha do Plano
              </button>
            )}

            <p className="text-center text-white/20 text-xs mt-6">
              Ao continuar você concorda com nossos{' '}
              <span style={{ color: '#D4AF37' }} className="cursor-pointer hover:underline">Termos de Uso</span>
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
