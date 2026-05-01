'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function EsqueciSenhaPage() {
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const [email, setEmail] = useState('')

  // Lê query params na montagem (URL: ?enviado=1 ou ?erro=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('enviado')) setEnviado(true)
    const erroParam = params.get('erro')
    if (erroParam) setErro(decodeURIComponent(erroParam))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setErro('')
    try {
      const res = await fetch('/api/auth/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.ok) {
        setEnviado(true)
      } else {
        setErro(data.error || 'Ocorreu um erro. Tente novamente.')
        setLoading(false)
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: '#090B10', fontFamily: 'Outfit, sans-serif' }}>

      {/* Fundo sutil */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512070679279-8988d32161be?w=1920&q=60')", opacity: 0.1 }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-transparent to-[#090B10]/70" />

      {/* Logo no topo */}
      <header className="absolute top-0 w-full py-4 px-[4%] z-30">
        <Link href="/" className="flex items-center gap-3 no-underline w-fit">
          <Image src="/logo.png" alt="Contos de Oração" width={40} height={40} className="object-contain" />
          <div className="text-white font-black text-base leading-tight">Contos de Oração</div>
        </Link>
      </header>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px] mx-4 rounded-2xl p-8 md:p-10"
        style={{
          background: 'rgba(21,36,62,0.88)', border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 1px rgba(212,175,55,0.15)'
        }}>

        {/* Ícone */}
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-5"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
          🔑
        </div>

        <h1 className="text-white text-2xl md:text-3xl font-black mb-1.5">
          {enviado ? 'E-mail enviado!' : 'Esqueci minha senha'}
        </h1>
        <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.4)' }}>
          {enviado
            ? 'Se esse e-mail estiver cadastrado, você receberá o link em breve. Verifique também a caixa de spam.'
            : 'Digite seu e-mail e enviaremos um link para criar uma nova senha.'}
        </p>

        {/* Sucesso */}
        {enviado ? (
          <div>
            <div className="rounded-2xl p-5 text-center mb-6"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="text-4xl mb-3">📧</div>
              <p className="font-bold mb-1" style={{ color: '#10B981' }}>Link enviado com sucesso!</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                O link expira em 60 minutos.
              </p>
            </div>
            <Link href="/login" className="block text-center text-sm font-semibold no-underline transition-colors hover:opacity-80"
              style={{ color: '#D4AF37' }}>
              ← Voltar para o Login
            </Link>
          </div>
        ) : (
          /* Formulário */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            <div>
              <label className="block text-[0.65rem] uppercase tracking-widest font-bold mb-1.5"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="seu@email.com"
                disabled={loading}
                className="w-full outline-none transition-all text-sm rounded-xl"
                style={{
                  padding: '14px 16px', boxSizing: 'border-box' as const,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1.5px solid rgba(255,255,255,0.08)',
                  color: '#fff', fontFamily: 'Outfit, sans-serif',
                  opacity: loading ? 0.6 : 1
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              />
            </div>

            {/* Erro */}
            {erro && (
              <div className="rounded-xl px-4 py-3 text-sm text-center"
                style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff8080' }}>
                ❌ {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-xl font-extrabold text-base cursor-pointer transition-all hover:brightness-110 flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
              style={{ padding: '14px', background: '#D4AF37', color: '#090B10', border: 'none', fontFamily: 'Outfit, sans-serif' }}>
              {loading ? (
                <><Loader2 className="animate-spin" size={18} /> Enviando...</>
              ) : (
                'Enviar link de recuperação →'
              )}
            </button>

            <Link href="/login" className="text-center text-sm no-underline transition-colors hover:opacity-80"
              style={{ color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>
              ← Voltar para o Login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
