'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Shield, Check, Loader2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react'
import Link from 'next/link'

export default function MfaSetupPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isMfaActive, setIsMfaActive] = useState(false)

  // 1. Carregar usuário e verificar status do MFA
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
      
      // Verifica se o usuário já tem MFA verificado
      const { data: factors, error: factorsErr } = await supabase.auth.mfa.listFactors()
      if (!factorsErr && factors) {
        const activeFactors = factors.totp.filter(f => f.status === 'verified')
        if (activeFactors.length > 0) {
          setIsMfaActive(true)
        }
      }
      
      setLoading(false)
    }
    loadUser()
  }, [router, supabase])

  // 2. Iniciar inscrição do MFA (gerar QR Code)
  const handleEnroll = async () => {
    setError(null)
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'Contos de Oração Club',
        friendlyName: user?.email || 'Admin Contos'
      })

      if (error) throw error

      setFactorId(data.id)
      setSecret(data.totp.secret)
      setQrCodeSvg(data.totp.qr_code)
    } catch (err: any) {
      console.error('Erro ao iniciar MFA:', err.message)
      setError(err.message || 'Erro ao gerar o QR Code de autenticação.')
    } finally {
      setLoading(false)
    }
  }

  // 3. Confirmar e verificar o código digitado
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !factorId) return

    setError(null)
    startTransition(async () => {
      try {
        // Criar desafio no Supabase
        const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({ factorId })
        if (challengeErr) throw challengeErr

        // Validar código do desafio
        const { error: verifyErr } = await supabase.auth.mfa.verify({
          factorId,
          challengeId: challengeData.id,
          code: code.trim()
        })

        if (verifyErr) throw verifyErr

        setSuccess(true)
        setIsMfaActive(true)
      } catch (err: any) {
        console.error('Erro ao verificar MFA:', err.message)
        setError('Código inválido ou expirado. Verifique no seu aplicativo e tente novamente.')
      }
    })
  }

  // 4. Desativar MFA
  const handleUnenroll = async () => {
    if (!confirm('Deseja realmente desativar a autenticação de dois fatores da sua conta? Isso reduzirá a segurança.')) return
    
    setError(null)
    setLoading(true)
    try {
      const { data: factors, error: factorsErr } = await supabase.auth.mfa.listFactors()
      if (factorsErr) throw factorsErr

      const totpFactors = factors?.totp || []
      for (const factor of totpFactors) {
        const { error: unenrollErr } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
        if (unenrollErr) throw unenrollErr
      }

      setIsMfaActive(false)
      setFactorId(null)
      setQrCodeSvg(null)
      setSecret(null)
      setCode('')
      setSuccess(false)
    } catch (err: any) {
      console.error('Erro ao desativar MFA:', err.message)
      setError(err.message || 'Erro ao desativar a autenticação de dois fatores.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090B10] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#090B10] text-white flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-[#111827] border border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <Link 
            href="/painel-equipe-cod" 
            className="text-white/50 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-colors no-underline"
          >
            <ArrowLeft size={14} /> Voltar ao Painel
          </Link>
          <div className="flex items-center gap-2 text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-wider border border-[#D4AF37]/20">
            <Shield size={10} /> Segurança Admin
          </div>
        </div>

        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mx-auto border border-[#D4AF37]/20">
            <KeyRound size={22} />
          </div>
          <h2 className="text-white text-lg font-black tracking-tight">Segurança de Dois Fatores (2FA)</h2>
          <p className="text-white/50 text-xs max-w-sm mx-auto">
            Proteja seu painel administrativo exigindo um código gerado no celular além da senha.
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 text-xs flex items-start gap-2.5">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* State 1: MFA is already active and verified */}
        {isMfaActive && !success && (
          <div className="space-y-6">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
                <Check size={20} />
              </div>
              <h4 className="text-white font-bold text-sm">O 2FA está ativo na sua conta!</h4>
              <p className="text-white/40 text-[0.65rem] leading-relaxed">
                Seu painel secreto está protegido. Em logins futuros, você precisará do código de 6 dígitos gerado no Google Authenticator.
              </p>
            </div>
            <button
              onClick={handleUnenroll}
              className="w-full py-3 rounded-xl text-xs font-black bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 transition-colors"
            >
              Desativar Autenticação de Dois Fatores
            </button>
          </div>
        )}

        {/* State 2: Success in verification */}
        {success && (
          <div className="space-y-6 text-center">
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
                <Check size={20} />
              </div>
              <h4 className="text-white font-bold text-sm">Celular Configurado com Sucesso!</h4>
              <p className="text-white/40 text-[0.65rem] leading-relaxed">
                Segurança configurada com sucesso. Seu celular está pareado e sua conta de administrador agora está 100% protegida.
              </p>
            </div>
            <Link
              href="/painel-equipe-cod"
              className="block w-full py-3 text-center rounded-xl text-xs font-black text-black no-underline"
              style={{ background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' }}
            >
              Ir para o Painel Administrativo
            </Link>
          </div>
        )}

        {/* State 3: Setup - displaying QR code */}
        {!isMfaActive && qrCodeSvg && (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-4">
              <div className="bg-black/30 border border-white/5 rounded-2xl p-5 flex flex-col items-center gap-4">
                <div className="bg-white p-3 rounded-xl">
                  {/* Renderiza o QR Code gerado pelo Supabase */}
                  <img src={qrCodeSvg} alt="QR Code 2FA" className="w-40 h-40" />
                </div>
                <div className="text-center space-y-1.5">
                  <div className="text-[0.65rem] text-white/50 font-bold uppercase tracking-wider">Passo 1: Escanear</div>
                  <p className="text-white/40 text-[0.65rem] max-w-[280px]">
                    Abra o **Google Authenticator** no seu celular, clique no sinal de **"+"** e escolha **"Ler código QR"**.
                  </p>
                </div>
              </div>

              {secret && (
                <div className="bg-black/20 border border-white/5 rounded-xl p-3.5 space-y-1 text-center">
                  <div className="text-[0.55rem] text-white/30 font-bold uppercase tracking-wider">Chave Manual (Alternativa)</div>
                  <code className="text-xs font-mono text-[#D4AF37] break-all selection:bg-[#D4AF37]/20 select-all block py-1 font-bold">
                    {secret}
                  </code>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[0.65rem] text-white/50 font-bold uppercase tracking-wider block">
                  Passo 2: Digite o código de 6 dígitos gerado
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center text-lg font-mono tracking-[0.3em] font-bold text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37] focus:ring-0 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || code.length !== 6}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-black text-black disabled:opacity-60 transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' }}
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Check size={14} />
                  Ativar e Concluir
                </>
              )}
            </button>
          </form>
        )}

        {/* State 4: Setup start button */}
        {!isMfaActive && !qrCodeSvg && (
          <div className="space-y-4">
            <div className="bg-black/30 border border-white/5 rounded-2xl p-5 text-center space-y-2">
              <p className="text-white/40 text-xs leading-relaxed">
                Você precisará do aplicativo **Google Authenticator** instalado no seu smartphone. 
                Ao clicar no botão abaixo, geraremos o código de emparelhamento para o seu e-mail:
              </p>
              <div className="text-[#D4AF37] font-mono text-[0.7rem] font-bold py-1 select-all">
                {user?.email}
              </div>
            </div>
            <button
              onClick={handleEnroll}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-black text-black transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' }}
            >
              Configurar Aplicativo Autenticador
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
