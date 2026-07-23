'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import PasswordField from '@/components/PasswordField'
import DynamicBackground from '@/components/DynamicBackground'
import { Infinity as InfinityIcon } from 'lucide-react'

export default function AtualizarSenhaPage() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    // Verifica se a URL contém erro na hash
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const hashError = hashParams.get('error_description') || hashParams.get('error_code')
      if (hashError) {
        router.replace(`/esqueci-senha?erro=${encodeURIComponent('O link de recuperação expirou ou é inválido. Solicite um novo abaixo.')}`)
      }
    }
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!senha || senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (senha !== confirmar) {
      setErro('As senhas não coincidem. Tente novamente.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/atualizar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha, confirmar }),
      })

      const data = await res.json()

      if (!res.ok || !data.ok) {
        setErro(data.error || 'Erro ao atualizar senha. O link pode ter expirado.')
        setLoading(false)
        return
      }

      setSucesso(true)
      setTimeout(() => {
        window.location.href = '/watch'
      }, 1500)
    } catch (err: any) {
      setErro(err?.message || 'Erro de conexão. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'transparent', fontFamily: 'Outfit, sans-serif', position: 'relative'
    }}>

      <DynamicBackground />

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '420px', margin: '0 1rem', position: 'relative', zIndex: 1,
        background: 'rgba(21,36,62,0.85)', borderRadius: '24px',
        padding: '2.5rem', border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 1px rgba(212,175,55,0.2)'
      }}>

        {/* Ícone */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', marginBottom: '1.5rem'
        }}>
          🔒
        </div>

        <h1 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 900, margin: '0 0 0.5rem' }}>
          Redefinir sua senha 🙏
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Crie uma nova senha para acessar sua conta na plataforma.
        </p>

        {sucesso ? (
          <div style={{
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '16px', padding: '1.5rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>✅</div>
            <p style={{ color: '#10B981', fontWeight: 800, margin: '0 0 0.25rem', fontSize: '1.1rem' }}>
              Senha atualizada com sucesso!
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0 }}>
              Redirecionando para a plataforma...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <PasswordField
              name="senha"
              label="Nova Senha"
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={e => setSenha(e.target.value)}
            />

            <PasswordField
              name="confirmar"
              label="Confirmar Senha"
              placeholder="Repita a senha"
              value={confirmar}
              onChange={e => setConfirmar(e.target.value)}
            />

            {/* Erro */}
            {erro && (
              <div style={{
                background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)',
                borderRadius: '12px', padding: '12px 16px', color: '#ff8080',
                fontSize: '0.875rem', textAlign: 'center'
              }}>
                ❌ {erro}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              marginTop: '0.5rem',
              background: '#D4AF37', color: '#090B10', border: 'none',
              padding: '14px', borderRadius: '12px', fontWeight: 800,
              fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif',
              transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
              {loading ? (
                <><InfinityIcon className="premium-trace" size={20} /> Salvando nova senha...</>
              ) : (
                'Salvar nova senha e entrar →'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
