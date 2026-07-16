'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Shield, Check, Loader2, AlertCircle, KeyRound, LogOut } from 'lucide-react'

export default function MfaChallengePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [totpFactor, setTotpFactor] = useState<any>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // 1. Carregar os fatores de MFA da conta e ver se algum está ativo
  useEffect(() => {
    async function loadFactors() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Listar os fatores cadastrados
      const { data: factors, error: factorsErr } = await supabase.auth.mfa.listFactors()
      if (factorsErr || !factors) {
        console.error('Erro ao ler fatores MFA:', factorsErr?.message)
        router.push('/painel-equipe-cod')
        return
      }

      // Filtrar apenas o fator TOTP ativo e verificado
      const activeFactor = factors.totp.find(f => f.status === 'verified')
      if (!activeFactor) {
        // Se a conta não tem 2FA configurado, pode acessar direto o painel
        router.push('/painel-equipe-cod')
        return
      }

      setTotpFactor(activeFactor)
      
      // Se a sessão já estiver em nível AAL2 (MFA verificado nesta sessão), pula
      const { data: mfaData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
      if (mfaData?.currentLevel === 'aal2') {
        router.push('/painel-equipe-cod')
        return
      }

      setLoading(false)
    }
    loadFactors()
  }, [router, supabase])

  // 2. Tratar a verificação do código digitado
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code || !totpFactor) return

    setError(null)
    startTransition(async () => {
      try {
        // Criar o desafio do TOTP no Supabase
        const { data: challengeData, error: challengeErr } = await supabase.auth.mfa.challenge({
          factorId: totpFactor.id
        })
        if (challengeErr) throw challengeErr

        // Enviar o código para verificar
        const { error: verifyErr } = await supabase.auth.mfa.verify({
          factorId: totpFactor.id,
          challengeId: challengeData.id,
          code: code.trim()
        })

        if (verifyErr) throw verifyErr

        // Redireciona com sucesso para o painel secreto
        router.push('/painel-equipe-cod')
      } catch (err: any) {
        console.error('Erro ao verificar MFA no login:', err.message)
        setError('Código inválido ou expirado. Verifique no seu celular e tente novamente.')
      }
    })
  }

  // 3. Fazer logout (se desistir de entrar)
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090B10] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#090B10] text-white flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-sm bg-[#111827] border border-white/5 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mx-auto border border-[#D4AF37]/20">
            <Shield size={22} />
          </div>
          <h2 className="text-white text-lg font-black tracking-tight">Verificação de Segurança</h2>
          <p className="text-white/50 text-xs">
            Esta conta possui autenticação de dois fatores ativa. Digite o código gerado no seu celular.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-4 text-xs flex items-start gap-2.5">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[0.65rem] text-white/40 font-black uppercase tracking-wider block text-center">
              Código de 6 dígitos
            </label>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-center text-xl font-mono tracking-[0.3em] font-bold text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37] focus:ring-0 transition-colors"
              autoFocus
            />
          </div>

          <div className="space-y-3">
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
                  <KeyRound size={14} />
                  Verificar e Acessar
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-3.5 text-center text-xs font-bold text-white/40 hover:text-white/80 transition-colors"
            >
              Cancelar e Sair
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
