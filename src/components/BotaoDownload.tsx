'use client'

import { useState } from 'react'
import { Download, CheckCircle2, Loader2, Lock } from 'lucide-react'
import { ModalAnteciparTeste } from './ModalAnteciparTeste'

interface Props {
  linkPdf: string
  titulo: string
  color: string
  isTrialing?: boolean
}

export function BotaoDownload({ linkPdf, titulo, color, isTrialing = false }: Props) {
  const [status, setStatus] = useState<'idle' | 'iniciando' | 'ok'>('idle')
  const [modalAberto, setModalAberto] = useState(false)

  const handleDownload = () => {
    if (isTrialing) {
      setModalAberto(true)
      return
    }

    if (status !== 'idle') return
    setStatus('iniciando')

    // Dispara o download via link invisível — sem navegar da página
    const url = `/api/download-pdf?url=${encodeURIComponent(linkPdf)}`
    const a = document.createElement('a')
    a.href = url
    a.download = titulo + '.pdf'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Após 1.5s mostra mensagem de confirmação
    setTimeout(() => setStatus('ok'), 1500)
    // Volta ao normal após 4s
    setTimeout(() => setStatus('idle'), 4000)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={handleDownload}
        disabled={status === 'iniciando'}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-black transition-all hover:brightness-110 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-wait"
        style={{
          background: isTrialing
            ? 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.05) 100%)'
            : `linear-gradient(135deg, ${color}, ${color}cc)`,
          color: isTrialing ? '#D4AF37' : '#000000',
          border: isTrialing ? '1px solid rgba(212,175,55,0.4)' : 'none',
        }}
      >
        {isTrialing ? (
          <>
            <Lock size={13} className="text-[#D4AF37]" /> Baixar PDF (7 Dias)
          </>
        ) : status === 'iniciando' ? (
          <>
            <Loader2 size={13} className="animate-spin" /> Iniciando...
          </>
        ) : status === 'ok' ? (
          <>
            <CheckCircle2 size={13} /> Download Iniciado!
          </>
        ) : (
          <>
            <Download size={13} /> Baixar PDF
          </>
        )}
      </button>

      {/* Mensagem orientativa */}
      {status !== 'idle' && !isTrialing && (
        <p
          className="text-[10px] text-center leading-tight animate-fade-in"
          style={{ color: status === 'ok' ? '#10b981' : 'rgba(255,255,255,0.35)' }}
        >
          {status === 'ok'
            ? '✓ Verifique a aba de downloads do seu navegador'
            : 'Aguarde, preparando o arquivo...'}
        </p>
      )}

      {/* Modal para antecipação de teste */}
      <ModalAnteciparTeste
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        onSuccess={() => setModalAberto(false)}
      />
    </div>
  )
}
