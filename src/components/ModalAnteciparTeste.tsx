'use client'

import { useState } from 'react'
import { Lock, Zap, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ModalAnteciparTeste({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [mensagemStatus, setMensagemStatus] = useState<{ tipo: 'erro' | 'sucesso'; texto: string } | null>(null)

  if (!isOpen) return null

  const handleAntecipar = async () => {
    setLoading(true)
    setMensagemStatus(null)

    try {
      const res = await fetch('/api/stripe/antecipar-teste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setMensagemStatus({
          tipo: 'erro',
          texto: data.error || 'Não foi possível antecipar a cobrança. Verifique o cartão de crédito.',
        })
        setLoading(false)
        return
      }

      setMensagemStatus({
        tipo: 'sucesso',
        texto: data.mensagem || 'Cobrança efetuada com sucesso! Downloads liberados.',
      })

      setTimeout(() => {
        setLoading(false)
        if (onSuccess) onSuccess()
        window.location.reload()
      }, 1800)
    } catch (e: any) {
      setMensagemStatus({
        tipo: 'erro',
        texto: 'Erro de conexão com o servidor. Tente novamente.',
      })
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0F141E] border border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors rounded-full hover:bg-white/5"
        >
          <X size={18} />
        </button>

        {/* Ícone Cabeçalho */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-4 text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10">
            <Lock size={26} />
          </div>

          <h3 className="text-xl font-black text-white tracking-tight mb-2">
            Downloads no Teste Grátis
          </h3>

          <p className="text-white/70 text-xs sm:text-sm leading-relaxed mb-5">
            Durante o período de <strong>7 dias grátis</strong>, você tem acesso total para navegar e assistir aos conteúdos!
            Downloads de PDFs e Vídeos são liberados após a confirmação da 1ª mensalidade.
          </p>

          {/* Destaque de Antecipação */}
          <div className="w-full bg-[#161D2B] border border-amber-500/20 rounded-2xl p-4 mb-6 text-left">
            <div className="flex items-start gap-3">
              <Zap size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-[#D4AF37] mb-1">
                  Deseja baixar os arquivos agora?
                </h4>
                <p className="text-white/60 text-xs leading-normal">
                  Você pode antecipar o encerramento do teste, efetuar a cobrança no cartão cadastrado agora e liberar 100% dos downloads imediatamente!
                </p>
              </div>
            </div>
          </div>

          {/* Feedback de Status */}
          {mensagemStatus && (
            <div
              className={`w-full mb-4 p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-left ${
                mensagemStatus.tipo === 'sucesso'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
              }`}
            >
              {mensagemStatus.tipo === 'sucesso' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{mensagemStatus.texto}</span>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-col w-full gap-2.5">
            <button
              onClick={handleAntecipar}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm text-black flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-wait"
              style={{
                background: 'linear-gradient(135deg, #D4AF37 0%, #F3E5AB 50%, #B8860B 100%)',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-black" />
                  Processando Cobrança no Stripe...
                </>
              ) : (
                <>
                  <Zap size={16} className="fill-black" />
                  Liberar Downloads e Cobrar Agora
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={loading}
              className="w-full py-3 text-xs font-bold text-white/50 hover:text-white transition-colors"
            >
              Continuar no Teste de 7 Dias (Apenas Assistir)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
