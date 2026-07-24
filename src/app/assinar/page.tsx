
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, ChevronRight, Shield, Play, Heart, Download, Monitor, Lock, Eye, EyeOff, Infinity as InfinityIcon, Loader2 } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js'
import { createClient } from '@/utils/supabase/client'
import DynamicBackground from '@/components/DynamicBackground'
import { motion, AnimatePresence } from 'framer-motion'

// Carrega o Stripe public key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

type Step = 1 | 2 | 3

export default function AssinarPage() {
  const [step, setStep] = useState<Step>(1)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [planoSelecionado, setPlanoSelecionado] = useState<string>('')
  const [erros, setErros] = useState<{ nome?: string; email?: string; senha?: string; confirmarSenha?: string; whatsapp?: string }>({})
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false)
  
  // Estados para seleção do avatar de santo e pesquisa de dispositivos
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string | null>(null)
  const [pedidoSanto, setPedidoSanto] = useState('')
  const [dispositivoCelular, setDispositivoCelular] = useState<'android' | 'ios' | 'outro' | ''>('')
  const [testadorAndroidCelular, setTestadorAndroidCelular] = useState<boolean>(false)
  const [temTv, setTemTv] = useState<boolean | null>(null)
  const [modeloTv, setModeloTv] = useState('')
  const [testadorAndroidTv, setTestadorAndroidTv] = useState<boolean>(false)
  const [avatarsDisponiveis, setAvatarsDisponiveis] = useState<any[]>([])
  const [loadingAvatars, setLoadingAvatars] = useState(false)

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 11) value = value.slice(0, 11)
    
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`
    } else if (value.length > 0) {
      value = `(${value}`
    }
    
    setWhatsapp(value)
    setErros(p => ({ ...p, whatsapp: undefined }))
  }

  // Estados para carregamento dinâmico
  const [planos, setPlanos] = useState<any[]>([])
  const [loadingCheckout, setLoadingCheckout] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [erroCheckout, setErroCheckout] = useState<{ msg: string; tipo: 'email_duplicado' | 'generico' } | null>(null)
  const [isLogged, setIsLogged] = useState(false)

  // Carrega avatares e define 'Contos de Oração' como padrão
  useEffect(() => {
    setLoadingAvatars(true)
    fetch('/api/avatars-santos')
      .then(r => r.json())
      .then(data => {
        if (data.avatars && data.avatars.length > 0) {
          setAvatarsDisponiveis(data.avatars)
          // Pre-seleciona "Contos de Oração" por padrão se o usuário ainda não escolheu
          setSelectedAvatarUrl(prevUrl => {
            if (prevUrl) return prevUrl
            const contosAvatar = data.avatars.find((a: any) => 
              a.nome?.toLowerCase().includes('contos de oração') || 
              a.nome?.toLowerCase().includes('contos')
            ) || data.avatars[0]
            return contosAvatar ? contosAvatar.avatar_url : data.avatars[0].avatar_url
          })
        }
      })
      .catch(console.error)
      .finally(() => setLoadingAvatars(false))
  }, [])

  // Busca preços reais ativos na montagem
  useEffect(() => {
    // Pega o parametro 'plan' e 'email' da url se existir
    const params = new URLSearchParams(window.location.search)
    const planParam = params.get('plan')
    const emailParam = params.get('email')

    if (planParam) setPlanoSelecionado(planParam)
    if (emailParam) setEmail(emailParam)

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

    // Verifica sessão do usuário
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsLogged(true)
        setNome(session.user.user_metadata?.nome || '')
        setEmail(session.user.email || '')
        setStep(3) // Pula direto para o pagamento!
      }
    })
  }, [])

  function validarStep1() {
    const novosErros: { nome?: string; email?: string; senha?: string; confirmarSenha?: string; whatsapp?: string } = {}
    if (!nome.trim() || nome.trim().split(' ').length < 2) {
      novosErros.nome = 'Digite seu nome completo (nome e sobrenome)'
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      novosErros.email = 'Digite um e-mail válido'
    }
    const whatsappLimpo = whatsapp.replace(/\D/g, '')
    if (!whatsappLimpo || whatsappLimpo.length < 10) {
      novosErros.whatsapp = 'Digite um WhatsApp válido com DDD'
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

  async function irParaPagamento() {
    if (validarStep1()) {
      setLoadingCheckout(true)
      try {
        const res = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        })
        const data = await res.json()
        if (data.existe) {
          setErroCheckout({ msg: 'Este e-mail já possui uma conta cadastrada. Faça login para continuar.', tipo: 'email_duplicado' })
          setStep(3) // Vai para o step 3 que já tem a UI de login preparada para erros
        } else {
          setStep(2) // Vai para a escolha do avatar
        }
      } catch (e) {
        setStep(2)
      } finally {
        setLoadingCheckout(false)
      }
    }
  }

  const verificarSeEhAndroid = (modelo: string) => {
    if (!modelo) return false
    const m = modelo.toLowerCase()
    if (modelo === 'Android TV / Google TV' || modelo === 'Fire TV (Amazon)') return true
    if (['samsung', 'tizen', 'lg', 'webos', 'roku', 'não possuo', 'nao possuo'].some(excluir => m.includes(excluir))) return false
    return ['android', 'google', 'fire', 'xiaomi', 'mi ', 'mibox', 'tcl', 'philco', 'box', 'stick'].some(termo => m.includes(termo))
  }

  async function finalizarPagamento() {
    setLoadingCheckout(true)
    setErroCheckout(null)
    const modeloTvFiltrado = modeloTv
    try {
      const response = await fetch('/api/stripe/assinatura', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome,
          email,
          senha,
          plano: planoSelecionado,
          avatarUrl: selectedAvatarUrl,
          pedidoSanto: pedidoSanto,
          whatsapp: whatsapp.replace(/\D/g, ''),
          modeloTv: modeloTvFiltrado,
          dispositivoCelular,
          testadorAndroidCelular,
          testadorAndroidTv
        })
      })
      const data = await response.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
      } else {
        const msgErro = data.error || ''
        const emailDuplicado = msgErro.toLowerCase().includes('already been registered') || msgErro.toLowerCase().includes('already registered') || msgErro.toLowerCase().includes('email already') || msgErro.includes('Este e-mail já possui uma conta')
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

  async function irParaKiwify() {
    setLoadingCheckout(true)
    
    // Antes de ir para a Kiwify, vamos criar a conta do usuário no nosso banco com a SENHA QUE ELE DIGITOU!
    // Assim, quando o webhook da Kiwify confirmar o pagamento, a conta já existe e ele pode fazer login normalmente.
    const modeloTvFiltrado = modeloTv
    try {
      await fetch('/api/auth/criar-pre-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nome, 
          email, 
          senha,
          avatarUrl: selectedAvatarUrl,
          pedidoSanto: pedidoSanto,
          whatsapp: whatsapp.replace(/\D/g, ''),
          modeloTv: modeloTvFiltrado,
          dispositivoCelular,
          testadorAndroidCelular,
          testadorAndroidTv
        })
      })
      // Não precisamos nos preocupar com a resposta aqui. 
      // Se der sucesso, ótimo, a conta e a senha estão salvas.
      // Se ele já tiver conta, o webhook da Kiwify vai apenas renovar o acesso dele.
    } catch(e) {
      console.error("Erro ao salvar conta pre-checkout", e)
      // Se der erro de conexão, continua mesmo assim. O Webhook criará com a senha padrão (Contos2026).
    }

    // Links oficiais fornecidos (Kiwify apenas PIX/Boleto como configurado no painel)
    const linkMensal = process.env.NEXT_PUBLIC_KIWIFY_MENSAL_LINK || 'https://pay.kiwify.com.br/jamEpHh'
    const linkAnual = process.env.NEXT_PUBLIC_KIWIFY_ANUAL_LINK || 'https://pay.kiwify.com.br/rd4ueYB'
    
    const linkBase = planoDetalhe?.intervalo === 'year' ? linkAnual : linkMensal
    
    if (linkBase === '#') {
      alert("Aguardando os links da Kiwify configurados pelo patrão!")
      setLoadingCheckout(false)
      return
    }
    
    // Passa o email e nome na URL para já preencher o checkout da Kiwify
    try {
      const url = new URL(linkBase)
      url.searchParams.append('email', email)
      url.searchParams.append('name', nome)
      
      // Força a exibição apenas do PIX na Kiwify, o que faz ele vir pré-selecionado
      url.searchParams.append('hideCard', 'true')
      url.searchParams.append('hideBoleto', 'true')
      
      window.location.href = url.toString()
    } catch(e) {
      alert("Link da Kiwify inválido configurado nas variáveis.")
      setLoadingCheckout(false)
    }
  }

  const planoDetalhe = planos.find(p => p.id === planoSelecionado)

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'transparent', fontFamily: 'Outfit, sans-serif', color: '#fff' }}>

      {/* Fundo */}
      <DynamicBackground />
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
        .btn-animado-cartao, .btn-animado-pix {
          transition: all 0.3s ease 0s;
          box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.2);
        }
        .btn-animado-cartao:hover {
          box-shadow: 0px 15px 20px rgba(212, 175, 55, 0.4);
          transform: translateY(-7px);
        }
        .btn-animado-cartao:active {
          transform: translateY(-1px);
        }
        .btn-animado-pix:hover {
          box-shadow: 0px 15px 20px rgba(34, 197, 94, 0.4);
          transform: translateY(-7px);
        }
        .btn-animado-pix:active {
          transform: translateY(-1px);
        }
        .input-group {
          position: relative;
          width: 100%;
        }

        .input-custom {
          border: solid 1.5px rgba(255,255,255,0.08);
          border-radius: 12px;
          background: rgba(255,255,255,0.04);
          padding: 16px 16px;
          font-size: 0.875rem;
          color: #fff;
          transition: border 150ms cubic-bezier(0.4,0,0.2,1);
          width: 100%;
          outline: none;
          font-family: 'Outfit', sans-serif;
        }

        .user-label {
          position: absolute;
          left: 14px;
          color: rgba(255,255,255,0.4);
          pointer-events: none;
          transform: translateY(16px);
          font-size: 0.75rem;
          transition: 150ms cubic-bezier(0.4,0,0.2,1);
          background-color: transparent;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-custom:focus, .input-custom:not(:placeholder-shown) {
          border: 1.5px solid rgba(212,175,55,0.5);
        }

        .input-custom:focus ~ .user-label, .input-custom:not(:placeholder-shown) ~ .user-label {
          transform: translateY(-50%) scale(0.85);
          background-color: #0d121c;
          border: 1.5px solid rgba(212,175,55,0.3);
          border-radius: 6px;
          padding: 0.1em 0.6em;
          color: #D4AF37;
        }
        
        /* Corrigir o fundo branco do Autofill do Chrome/Navegador */
        .input-custom:-webkit-autofill,
        .input-custom:-webkit-autofill:hover, 
        .input-custom:-webkit-autofill:focus, 
        .input-custom:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #0d121c inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
            border: 1.5px solid rgba(212,175,55,0.5) !important;
        }

        .input-custom:-webkit-autofill ~ .user-label {
          transform: translateY(-50%) scale(0.85);
          background-color: #0d121c;
          border: 1.5px solid rgba(212,175,55,0.3);
          border-radius: 6px;
          padding: 0.1em 0.6em;
          color: #D4AF37;
        }
        
        .input-error {
           border-color: rgba(239,68,68,0.6) !important;
        }
        
        .input-error:focus ~ .user-label, .input-error:not(:placeholder-shown) ~ .user-label {
           color: #f87171 !important;
        }
      `}} />

      {/* Layout Unificado (Esquerda: Info e Benefícios, Direita: Checkout) */}
      <div className="relative z-10 flex flex-col lg:flex-row max-w-4xl mx-auto w-full flex-1 mb-16 mt-24 lg:mt-28 rounded-[1.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)] border border-white/10" style={{ background: 'rgba(21,36,62,0.92)', backdropFilter: 'blur(20px)' }}>
        
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

            {/* Destaque do Plano Dinâmico */}
            {planoDetalhe && (
              <div className="mb-4 p-4 rounded-xl transition-all duration-500" style={{ background: 'linear-gradient(145deg, rgba(212,175,55,0.12), rgba(212,175,55,0.04))', border: '1px solid rgba(212,175,55,0.25)' }}>
                 <p className="text-[#D4AF37] text-[0.65rem] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Check size={12} strokeWidth={3} /> Plano Selecionado
                 </p>
                 <p className="text-white font-black text-lg">{planoDetalhe.intervalo === 'month' ? 'Plano Mensal' : planoDetalhe.intervalo === 'year' ? 'Plano Anual' : planoDetalhe.produto.nome}</p>
                 <p className="text-white/60 text-xs font-semibold mt-0.5">R$ {(planoDetalhe.valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / {planoDetalhe.intervalo === 'month' ? 'mês' : planoDetalhe.intervalo === 'year' ? 'ano' : 'ciclo'}</p>
              </div>
            )}

            {/* Caixa de benefícios centralizada dinamicamente */}
            <div className="rounded-2xl p-6 w-full flex-1 relative overflow-hidden" style={{ background: 'rgba(21,36,62,0.4)', border: '1px solid rgba(212,175,55,0.15)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl rounded-full pointer-events-none -mt-10 -mr-10"></div>
              <p className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.2em] mb-5 flex items-center gap-2">
                <Check size={16} strokeWidth={3} className="text-[#D4AF37]" />
                {planoDetalhe ? `Benefícios: ${planoDetalhe.intervalo === 'month' ? 'Plano Mensal' : planoDetalhe.intervalo === 'year' ? 'Plano Anual' : planoDetalhe.produto.nome}` : 'O que está incluído'}
              </p>
              
              {planoDetalhe && planoDetalhe.produto.metadata?.beneficios ? (
                // Benefícios personalizados do plano selecionado
                planoDetalhe.produto.metadata.beneficios.split(/\|/)
                  .filter(Boolean)
                  .filter((b: string) => !b.toLowerCase().includes('perfis de usuário'))
                  .map((beneficio: string, i: number, arr: any[]) => (
                  <div key={i} className="flex items-start gap-3 py-3" style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                    <div className="bg-[#D4AF37]/10 p-1 rounded-full mt-0.5">
                      <Check size={12} strokeWidth={3} className="text-[#D4AF37]" />
                    </div>
                    <span className="text-white/85 text-sm font-medium leading-snug">{beneficio.trim()}</span>
                  </div>
                ))
              ) : (
                // Benefícios padrão quando não há plano selecionado
                [
                  'Acesso ilimitado a todos os vídeos',
                  'Salve favoritos e assista de onde parou',
                  'Disponível em qualquer dispositivo',
                  'Em breve: App exclusivo iOS/Android',
                  'Qualidade de cinema em Full HD',
                  'Cancele a qualquer momento'
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3 py-3" style={{ borderBottom: i < 5 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                    <div className="bg-[#D4AF37]/10 p-1 rounded-full mt-0.5">
                      <Check size={12} strokeWidth={3} className="text-[#D4AF37]" />
                    </div>
                    <span className="text-white/85 text-sm font-medium leading-snug">{text}</span>
                  </div>
                ))
              )}

              {planoDetalhe && (
                <div className="mt-5 pt-5 border-t border-white/5">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                    <Shield size={18} className="text-[#D4AF37] mt-0.5" />
                    <span className="text-white/70 text-xs leading-snug font-medium">
                      {planoDetalhe.intervalo === 'year' ? 'Economia: 12 meses pelo preço de 10!' : 'Sem fidelidade. Cancele quando quiser, sem multas.'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lado Direito - Fluxo de Checkout */}
        <div className="w-full lg:w-1/2">
          <div className="px-6 py-8 sm:px-10 h-full flex flex-col justify-center">
            
             {/* Indicador de Steps — Pills com destaque */}
             <div className="flex items-center justify-center mb-8 gap-0 w-full max-w-sm mx-auto">
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
                         {s === 1 ? 'Dados' : s === 2 ? 'Santo' : 'Pagamento'}
                       </span>
                     </div>
                   </div>
                   {s < 3 && (
                     <div className="flex-1 h-[1px] mx-4 mt-[-14px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                       <div className="h-full transition-all duration-700 ease-out" style={{ width: step > s ? '100%' : '0%', background: 'linear-gradient(to right, #D4AF37, #F9E596)' }} />
                     </div>
                   )}
                 </div>
              ))}
            </div>

            {/* ── CONTEÚDO DAS ETAPAS COM ANIMAÇÃO ── */}
            <AnimatePresence mode="wait">
              {/* ── STEP 1: Nome e Email ── */}
              {step === 1 && (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="pt-1"
                >
                  <h1 className="text-white text-xl font-black mb-1 tracking-tight">Criar sua conta</h1>
            <p className="text-white/40 text-xs mb-5">Informe seus dados para começar</p>

            <div className="flex flex-col gap-3">
              {/* Nome */}
              <div>
                <div className="input-group">
                  <input
                    type="text"
                    value={nome}
                    onChange={e => { setNome(e.target.value); setErros(p => ({ ...p, nome: undefined })) }}
                    placeholder=" "
                    className={`input-custom ${erros.nome ? 'input-error' : ''}`}
                    onKeyDown={e => e.key === 'Enter' && irParaPagamento()}
                  />
                  <label className="user-label">Seu nome completo</label>
                </div>
                {erros.nome && <p className="text-red-400 text-xs mt-1 px-1">{erros.nome}</p>}
              </div>

              {/* Email */}
              {/* E-mail */}
              <div>
                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    autoComplete="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setErros(p => ({ ...p, email: undefined })) }}
                    placeholder=" "
                    className={`input-custom ${erros.email ? 'input-error' : ''}`}
                    onKeyDown={e => e.key === 'Enter' && irParaPagamento()}
                  />
                  <label className="user-label">Seu e-mail</label>
                </div>
                {erros.email && <p className="text-red-400 text-xs mt-1 px-1">{erros.email}</p>}
              </div>

              {/* WhatsApp */}
              <div>
                <div className="input-group">
                  <input
                    type="tel"
                    name="user_whatsapp_number"
                    id="user_whatsapp_number"
                    autoComplete="off"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={whatsapp}
                    onChange={handleWhatsappChange}
                    placeholder=" "
                    className={`input-custom ${erros.whatsapp ? 'input-error' : ''}`}
                    onKeyDown={e => e.key === 'Enter' && irParaPagamento()}
                  />
                  <label className="user-label">WhatsApp (com DDD)</label>
                </div>
                {erros.whatsapp && <p className="text-red-400 text-xs mt-1 px-1">{erros.whatsapp}</p>}
              </div>

              {/* Senha */}
              <div>
                <div className="input-group">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={e => { setSenha(e.target.value); setErros(p => ({ ...p, senha: undefined, confirmarSenha: undefined })) }}
                    placeholder=" "
                    className={`input-custom pr-11 ${erros.senha ? 'input-error' : ''}`}
                    onKeyDown={e => e.key === 'Enter' && irParaPagamento()}
                  />
                  <label className="user-label">Crie uma senha de acesso</label>
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#fff', opacity: 0.5, padding: '4px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.color = '#D4AF37' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.5'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                  >
                    {mostrarSenha ? <EyeOff size={19} strokeWidth={2.5} /> : <Eye size={19} strokeWidth={2.5} />}
                  </button>
                </div>
                {erros.senha && <p className="text-red-400 text-xs mt-1 px-1">{erros.senha}</p>}
              </div>

              {/* Confirmar Senha */}
              <div>
                <div className="input-group">
                  <input
                    type={mostrarConfirmar ? 'text' : 'password'}
                    value={confirmarSenha}
                    onChange={e => { setConfirmarSenha(e.target.value); setErros(p => ({ ...p, confirmarSenha: undefined })) }}
                    placeholder=" "
                    className={`input-custom pr-11 ${erros.confirmarSenha ? 'input-error' : ''}`}
                    onKeyDown={e => e.key === 'Enter' && irParaPagamento()}
                  />
                  <label className="user-label">Confirme sua senha</label>
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                    style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#fff', opacity: 0.5, padding: '4px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; (e.currentTarget as HTMLElement).style.color = '#D4AF37' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.5'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
                  >
                    {mostrarConfirmar ? <EyeOff size={19} strokeWidth={2.5} /> : <Eye size={19} strokeWidth={2.5} />}
                  </button>
                </div>
                {erros.confirmarSenha && <p className="text-red-400 text-xs mt-1.5">{erros.confirmarSenha}</p>}
                <p className="text-white/25 text-xs mt-1.5">
                  🔒 Você usará esta senha para entrar na plataforma
                </p>
              </div>

              <button onClick={irParaPagamento} disabled={loadingCheckout}
                className="w-full py-3 font-extrabold rounded-xl text-sm transition-all hover:brightness-110 hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-2 mt-1 disabled:opacity-50"
                style={{ background: '#D4AF37', color: '#090B10' }}>
                {loadingCheckout ? 'Aguarde...' : 'Continuar para Pagamento'} <ChevronRight size={16} strokeWidth={3} />
              </button>
            </div>

            <p className="text-center text-white/20 text-xs mt-5">
              Já tem uma conta?{' '}
              <Link href="/login" style={{ color: '#D4AF37' }} className="no-underline hover:underline font-bold">Fazer login</Link>
            </p>
          </motion.div>
        )}

        {/* ── STEP 2: Seleção de Santo Avatar e Pesquisa de Dispositivos ── */}
              {step === 2 && (
                <motion.div 
                  key="step2-avatar"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="pt-1 space-y-5"
                >
                  <div>
                    <h1 className="text-white text-xl font-black mb-1 tracking-tight flex items-center justify-between">
                      <span>Escolha seu Santo Protetor</span>
                      <span className="text-[9px] bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                        Padrão Definido
                      </span>
                    </h1>
                    <p className="text-white/40 text-xs">
                      O avatar <strong className="text-[#D4AF37]">Contos de Oração</strong> já está selecionado para o seu perfil. Escolha outro se preferir!
                    </p>
                  </div>

                  {loadingAvatars ? (
                    <div className="flex flex-col items-center justify-center py-8 bg-black/20 rounded-2xl border border-white/5">
                      <Loader2 className="animate-spin text-[#D4AF37]" size={28} />
                      <span className="text-white/40 text-xs mt-2">Carregando avatares abençoados...</span>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Avatares Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 max-h-[190px] overflow-y-auto pr-1.5 py-1.5">
                        {avatarsDisponiveis.map((a) => {
                          const isSelected = selectedAvatarUrl === a.avatar_url;
                          return (
                            <div 
                              key={a.id} 
                              onClick={() => {
                                setSelectedAvatarUrl(a.avatar_url);
                                setPedidoSanto('');
                              }}
                              className="flex flex-col items-center gap-1.5 cursor-pointer group"
                            >
                              <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 transition-all duration-300 ${
                                isSelected 
                                  ? 'border-[#D4AF37] scale-105 shadow-[0_0_20px_rgba(212,175,55,0.7)] ring-2 ring-[#D4AF37]/30' 
                                  : 'border-white/10 group-hover:border-white/30 group-hover:scale-102'
                              }`}>
                                <div className="w-full h-full rounded-full overflow-hidden">
                                  <img src={a.avatar_url} alt={a.nome} className="w-full h-full object-cover" />
                                </div>
                                {isSelected && (
                                  <div className="absolute -top-1 -right-1 bg-[#D4AF37] text-[#090B10] rounded-full p-1 shadow-lg border border-[#090B10] z-10 flex items-center justify-center">
                                    <Check size={11} strokeWidth={4} />
                                  </div>
                                )}
                              </div>
                              <span className={`text-[10px] sm:text-xs font-bold text-center transition-colors line-clamp-2 px-0.5 w-full ${
                                isSelected ? 'text-[#D4AF37] font-black' : 'text-white/60 group-hover:text-white'
                              }`}>
                                {a.nome}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Pedir Santo Personalizado */}
                      <div className="pt-2.5 border-t border-white/10">
                        <label className="block text-white/50 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                          Não encontrou seu santo protetor? Peça aqui:
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: São Judas Tadeu, Santa Rita..."
                          value={pedidoSanto}
                          onChange={(e) => {
                            setPedidoSanto(e.target.value);
                            setSelectedAvatarUrl(null);
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white text-xs focus:border-[#D4AF37] focus:outline-none transition-colors"
                        />
                      </div>

                      {/* ── SEÇÃO DE DISPOSITIVOS (Android & TV) ── */}
                      <div className="pt-3 border-t border-white/10 space-y-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                          <h3 className="text-white text-xs font-black uppercase tracking-wider">
                            Pesquisa de Dispositivos (Testadores VIP)
                          </h3>
                        </div>

                        {/* 📱 1. Sistema do Celular / Smartphone */}
                        <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                          <label className="block text-white/70 text-[11px] font-extrabold flex items-center justify-between">
                            <span>📱 Qual o sistema do seu celular?</span>
                            <span className="text-[#D4AF37] text-[9px] font-black uppercase">Android / iOS</span>
                          </label>

                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { id: 'android', label: '🤖 Android', desc: 'Samsung, Xiaomi, Moto' },
                              { id: 'ios', label: '🍎 iPhone', desc: 'Apple iOS' },
                              { id: 'outro', label: '📱 Outro', desc: 'Outros modelos' },
                            ].map((item) => {
                              const isSelected = dispositivoCelular === item.id;
                              return (
                                <button
                                  key={item.id}
                                  type="button"
                                  onClick={() => {
                                    setDispositivoCelular(item.id as any);
                                    if (item.id === 'android') {
                                      setTestadorAndroidCelular(true);
                                    } else {
                                      setTestadorAndroidCelular(false);
                                    }
                                  }}
                                  className={`p-2.5 rounded-xl text-left transition-all border flex flex-col justify-between ${
                                    isSelected
                                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                                      : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
                                  }`}
                                >
                                  <span className="text-xs font-black leading-tight">{item.label}</span>
                                  <span className="text-[9px] text-white/40 mt-1">{item.desc}</span>
                                </button>
                              );
                            })}
                          </div>

                          {/* Convite para Testador VIP Celular Android */}
                          {dispositivoCelular === 'android' && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37]/15 to-amber-500/10 border border-[#D4AF37]/30 flex items-start gap-2 cursor-pointer"
                              onClick={() => setTestadorAndroidCelular(!testadorAndroidCelular)}
                            >
                              <input
                                type="checkbox"
                                id="chkTestadorCelular"
                                checked={testadorAndroidCelular}
                                onChange={(e) => setTestadorAndroidCelular(e.target.checked)}
                                className="mt-0.5 accent-[#D4AF37] w-4 h-4 rounded cursor-pointer"
                              />
                              <label htmlFor="chkTestadorCelular" className="text-xs text-white cursor-pointer leading-tight">
                                <span className="font-black text-[#D4AF37]">🚀 Quero ser Testador VIP no Android!</span>
                                <p className="text-[10px] text-white/70 mt-0.5">
                                  Entraremos em contato pelo seu WhatsApp para liberar o aplicativo de celular em primeira mão.
                                </p>
                              </label>
                            </motion.div>
                          )}
                        </div>

                        {/* 📺 2. Smart TV ou TV Box */}
                        <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                          <label className="block text-white/70 text-[11px] font-extrabold flex items-center justify-between">
                            <span>📺 Qual a marca/modelo da sua Smart TV?</span>
                            <span className="text-white/30 text-[9px] font-normal italic">(opcional)</span>
                          </label>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              'Android TV / Google TV',
                              'Fire TV (Amazon)',
                              'Samsung (Tizen)',
                              'LG (webOS)',
                              'Roku TV',
                              'Não possuo Smart TV',
                            ].map((marca) => {
                              const isSelected = modeloTv === marca;
                              return (
                                <button
                                  key={marca}
                                  type="button"
                                  onClick={() => {
                                    setModeloTv(marca);
                                    if (marca === 'Android TV / Google TV' || marca === 'Fire TV (Amazon)') {
                                      setTestadorAndroidTv(true);
                                    } else {
                                      setTestadorAndroidTv(false);
                                    }
                                    setTemTv(marca !== 'Não possuo Smart TV');
                                  }}
                                  className={`py-2 px-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all text-left border ${
                                    isSelected
                                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-white shadow-[0_0_12px_rgba(212,175,55,0.25)] font-black'
                                      : 'border-white/5 bg-black/30 text-white/60 hover:border-white/20 hover:text-white'
                                  }`}
                                >
                                  {marca}
                                </button>
                              );
                            })}
                          </div>

                          {/* Convite para Testador VIP TV */}
                          {(modeloTv === 'Android TV / Google TV' || modeloTv === 'Fire TV (Amazon)') && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-2 p-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37]/15 to-amber-500/10 border border-[#D4AF37]/30 flex items-start gap-2 cursor-pointer"
                              onClick={() => setTestadorAndroidTv(!testadorAndroidTv)}
                            >
                              <input
                                type="checkbox"
                                id="chkTestadorTv"
                                checked={testadorAndroidTv}
                                onChange={(e) => setTestadorAndroidTv(e.target.checked)}
                                className="mt-0.5 accent-[#D4AF37] w-4 h-4 rounded cursor-pointer"
                              />
                              <label htmlFor="chkTestadorTv" className="text-xs text-white cursor-pointer leading-tight">
                                <span className="font-black text-[#D4AF37]">📺 Quero testar o App de Smart TV em primeira mão!</span>
                                <p className="text-[10px] text-white/70 mt-0.5">
                                  Notificaremos você assim que a versão para Android TV e Google TV for disponibilizada.
                                </p>
                              </label>
                            </motion.div>
                          )}
                        </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex gap-3 pt-1">
                        <button 
                          onClick={() => setStep(1)}
                          className="flex-1 py-3 font-bold rounded-xl text-xs sm:text-sm transition-all border border-white/10 hover:bg-white/5 cursor-pointer text-white/70"
                        >
                          Voltar
                        </button>
                        <button 
                          onClick={async () => {
                            if (pedidoSanto && pedidoSanto.trim()) {
                              try {
                                const supabase = createClient();
                                await supabase.from('pedidos_santos').insert({
                                  santo_nome: pedidoSanto.trim(),
                                  user_email: email || null
                                });
                              } catch (err) {
                                console.error('Erro ao enviar pedido de santo:', err);
                              }
                            }
                            setStep(3);
                          }}
                          className="flex-1 py-3.5 font-extrabold rounded-xl text-xs sm:text-sm transition-all hover:brightness-110 hover:scale-[1.01] cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
                          style={{ background: '#D4AF37', color: '#090B10' }}
                        >
                          Avançar para Pagamento <ChevronRight size={16} strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── STEP 3: Confirmar e Pagar ── */}
              {step === 3 && (
                <motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 30 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="pt-1"
                >
                  <h1 className="text-white text-xl font-black mb-1 text-center tracking-tight">Confirmar assinatura</h1>
            <p className="text-white/40 text-xs mb-5 text-center">Revise seus dados antes de pagar</p>

            {/* Formulário Embutido da Stripe ou Resumo */}
            {!clientSecret ? (
              <>
                {/* Resumo do Pedido no Step 2 (Aparece mais em mobile ou complementa o desktop) */}
                {planoDetalhe && (
                  <div className="mb-6 p-4 rounded-xl border border-white/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/50 text-xs font-bold uppercase tracking-wider">Resumo do Pedido</span>
                      <span className="text-[#D4AF37] text-xs font-bold cursor-pointer hover:underline" onClick={() => {
                        // Rola suavemente para o topo e redireciona (ou algo similar, mas aqui é só visual)
                        const el = document.getElementById('planos');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}></span>
                    </div>
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="text-white font-bold text-base">{planoDetalhe.intervalo === 'month' ? 'Plano Mensal' : planoDetalhe.intervalo === 'year' ? 'Plano Anual' : planoDetalhe.produto.nome}</h3>
                        <p className="text-white/40 text-xs">Acesso {planoDetalhe.intervalo === 'year' ? 'por 12 meses' : 'por 1 mês'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-black text-lg">R$ {(planoDetalhe.valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    {/* Mensagem de Upsell se for plano Mensal e existir plano Anual */}
                    {planoDetalhe.intervalo === 'month' && planos.some(p => p.intervalo === 'year') && (
                      <div className="mt-4 pt-3 border-t border-[#D4AF37]/30 bg-gradient-to-r from-[#D4AF37]/10 to-transparent -mx-4 -mb-4 p-4 rounded-b-xl">
                        {(() => {
                          const pAnual = planos.find(p => p.intervalo === 'year');
                          if (!pAnual) return null;
                          const desconto = (planoDetalhe.valor * 12) - pAnual.valor;
                          return (
                            <div className="flex flex-col gap-2">
                              <p className="text-[#F9E596] text-[0.7rem] font-bold leading-tight">
                                ✨ Mude para o plano Anual e economize R$ {(desconto / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} por ano!
                              </p>
                              <button 
                                onClick={() => setPlanoSelecionado(pAnual.id)}
                                className="w-full py-2 rounded-lg text-xs font-bold text-[#090B10] transition-all hover:brightness-110 hover:scale-[1.01] shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                                style={{ background: 'linear-gradient(to right, #D4AF37, #F9E596)' }}
                              >
                                Aproveitar desconto
                              </button>
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* Banner de erro inline */}
                {erroCheckout && (
                  <div className="mb-4 p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                    <p className="text-red-400 text-sm font-semibold mb-3">⚠️ {erroCheckout.msg}</p>
                    {erroCheckout.tipo === 'email_duplicado' ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link href={`/login?redirect=${encodeURIComponent(`/assinar?plan=${planoSelecionado}`)}`} className="flex-1 text-center py-2 rounded-lg text-sm font-bold no-underline transition-all hover:brightness-110" style={{ background: '#D4AF37', color: '#090B10' }}>
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
                  <div className="flex flex-col gap-4 mt-4">
                    <style dangerouslySetInnerHTML={{__html: `
                      .btn-pagamento {
                        border: 1px solid rgba(255,255,255,0.15);
                        border-radius: 16px;
                        box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.25), inset 0px 2px 0px rgba(255,255,255,0.25);
                        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                        cursor: pointer;
                        outline: none;
                        position: relative;
                        overflow: hidden;
                      }

                      .btn-pagamento::after {
                        content: '';
                        position: absolute;
                        top: 0; left: -100%;
                        width: 50%; height: 100%;
                        background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 100%);
                        transform: skewX(-20deg);
                        transition: all 0.6s ease;
                      }
                      
                      .btn-pagamento:hover::after {
                        left: 200%;
                      }

                      .btn-pagamento:active {
                        transform: scale(0.97);
                        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.3);
                      }

                      /* Stripe / Cartão */
                      .btn-animado-cartao {
                         background: linear-gradient(135deg, #F9E596 0%, #D4AF37 100%);
                         color: #090B10;
                      }
                      .btn-animado-cartao:hover {
                        box-shadow: 0px 12px 25px rgba(212, 175, 55, 0.4), inset 0px 2px 0px rgba(255,255,255,0.4);
                        transform: translateY(-4px);
                      }

                      /* Kiwify / Pix */
                      .btn-animado-pix {
                         background: linear-gradient(135deg, #4ade80 0%, #16a34a 100%);
                         color: #ffffff;
                         border-color: rgba(255,255,255,0.2);
                      }
                      .btn-animado-pix:hover {
                        box-shadow: 0px 12px 25px rgba(34, 197, 94, 0.4), inset 0px 2px 0px rgba(255,255,255,0.4);
                        transform: translateY(-4px);
                      }
                    `}} />
                    <p className="text-white/60 text-xs text-center font-bold uppercase tracking-widest mb-1">Como deseja pagar?</p>
                    
                    {/* Botão Stripe (Cartão) */}
                    <button onClick={finalizarPagamento} disabled={loadingCheckout}
                      className="w-full py-4 font-extrabold text-[15px] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed btn-pagamento btn-animado-cartao">
                      {loadingCheckout ? (
                        <><InfinityIcon className="animate-spin" size={20} /> Aguardando...</>
                      ) : (
                        <><Lock size={18} strokeWidth={2.5} /> Pagar com Cartão <ChevronRight size={18} strokeWidth={2.5} className="ml-1" /></>
                      )}
                    </button>

                    {/* Botão Kiwify (PIX) */}
                    <button onClick={irParaKiwify} disabled={loadingCheckout}
                      className="w-full py-4 font-extrabold text-[15px] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed btn-pagamento btn-animado-pix mt-2">
                      {loadingCheckout ? (
                        <><InfinityIcon className="animate-spin" size={20} /> Aguardando...</>
                      ) : (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                          Pagar com PIX <ChevronRight size={18} strokeWidth={2.5} className="ml-1" />
                        </>
                      )}
                    </button>
                  </div>
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

            {!clientSecret && erroCheckout?.tipo !== 'email_duplicado' && !isLogged && (
              <button onClick={() => setStep(2)}
                className="w-full py-3 mt-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 group border border-white/5 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 text-white/40 hover:text-[#D4AF37]"
                style={{ background: 'transparent' }}>
                <span className="transition-transform group-hover:-translate-x-1">←</span> Voltar para alterar dados
              </button>
            )}

            <p className="text-center text-white/30 text-xs mt-6 px-4 leading-relaxed">
              Ao continuar você concorda com nossos{' '}
              <Link href="/termos" target="_blank" style={{ color: '#D4AF37' }} className="font-bold hover:underline">Termos de Uso</Link>{' '}
              e Privacidade.
            </p>
          </motion.div>
        )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
