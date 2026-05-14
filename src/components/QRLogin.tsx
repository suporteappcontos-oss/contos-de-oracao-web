'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

type Status = 'loading' | 'waiting' | 'expired' | 'confirmed' | 'error'

export default function QRLogin() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [token, setToken] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('loading')
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos
  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  async function gerarQR() {
    setStatus('loading')
    setTimeLeft(300)

    try {
      const res = await fetch('/api/qr/gerar', { method: 'POST' })
      const data = await res.json()
      if (!data.token) throw new Error('Falha ao gerar QR')

      setToken(data.token)
      setStatus('waiting')



      // Inicia polling a cada 2s
      if (pollingRef.current) clearInterval(pollingRef.current)
      pollingRef.current = setInterval(() => verificarStatus(data.token), 2000)

      // Timer de contagem regressiva
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current!)
            clearInterval(pollingRef.current!)
            setStatus('expired')
            return 0
          }
          return t - 1
        })
      }, 1000)
    } catch (e) {
      setStatus('error')
    }
  }

  async function verificarStatus(tok: string) {
    try {
      const res = await fetch(`/api/qr/verificar?token=${tok}`)
      const data = await res.json()

      if (data.status === 'confirmed' && data.loginUrl) {
        clearInterval(pollingRef.current!)
        clearInterval(timerRef.current!)
        setStatus('confirmed')
        // Redireciona via magic link — loga automaticamente!
        setTimeout(() => { window.location.href = data.loginUrl }, 1000)
      } else if (data.status === 'expired') {
        clearInterval(pollingRef.current!)
        clearInterval(timerRef.current!)
        setStatus('expired')
      }
    } catch {}
  }

  useEffect(() => {
    gerarQR()
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Efeito para desenhar o QR Code assim que o canvas for montado na tela
  useEffect(() => {
    if (status === 'waiting' && token && canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, `CONTOSQR:${token}`, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      }).catch(e => console.error('Erro ao gerar QR:', e))
    }
  }, [status, token])

  const minutos = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const segundos = (timeLeft % 60).toString().padStart(2, '0')

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <p className="text-black/80 text-xs uppercase tracking-widest font-bold">
        Entrar com o Celular
      </p>

      {status === 'loading' && (
        <div className="w-[200px] h-[200px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {(status === 'waiting' || status === 'confirmed') && (
        <div className="relative">
          <canvas ref={canvasRef} className="rounded-xl" />
          {status === 'confirmed' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl"
              style={{ background: 'rgba(16,185,129,0.95)' }}>
              <span className="text-4xl">✓</span>
              <p className="text-white font-bold mt-2 text-sm">Entrando...</p>
            </div>
          )}
        </div>
      )}

      {status === 'expired' && (
        <div className="w-[200px] h-[200px] flex flex-col items-center justify-center gap-3 rounded-xl border border-white/10"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <span className="text-3xl">⏱</span>
          <p className="text-white/60 text-sm text-center">QR expirado</p>
        </div>
      )}

      {status === 'waiting' && (
        <>
          <p className="text-black/80 text-xs text-center max-w-[180px] leading-relaxed">
            Abra o app Contos de Oração e escaneie este QR Code
          </p>
          <span className="text-[#D4AF37] text-xs font-bold font-mono">{minutos}:{segundos}</span>
        </>
      )}

      {(status === 'expired' || status === 'error') && (
        <button
          onClick={gerarQR}
          className="px-5 py-2 rounded-xl text-xs font-bold transition-all hover:brightness-110"
          style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}
        >
          Gerar novo QR
        </button>
      )}

      {status === 'waiting' && (
        <p className="text-black/70 text-sm text-center font-medium mt-2">
          Código: <span className="font-mono font-black text-black text-lg">{token}</span>
        </p>
      )}
    </div>
  )
}
