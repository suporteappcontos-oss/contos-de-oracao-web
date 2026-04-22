import Link from 'next/link'
import { enviarResetSenha } from './actions'

type Props = {
  searchParams: Promise<{ enviado?: string; erro?: string }>
}

export default async function EsqueciSenhaPage({ searchParams }: Props) {
  const { enviado, erro } = await searchParams

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)),
        url('https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=1920&q=80')`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>

      {/* Logo */}
      <header style={{ position: 'absolute', top: 0, width: '100%', padding: '1.5rem 4%', zIndex: 10 }}>
        <Link href="/" style={{ color: '#FFD700', textDecoration: 'none', fontSize: '1.8rem', fontWeight: 900, letterSpacing: '1px' }}>
          Contos de Oração
        </Link>
      </header>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '420px', margin: '0 1rem',
        background: 'rgba(0,0,0,0.88)', borderRadius: '20px',
        padding: '2.5rem', border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
      }}>

        {/* Ícone */}
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', marginBottom: '1.5rem'
        }}>
          🔑
        </div>

        <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.5rem' }}>
          Esqueci minha senha
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          {enviado
            ? 'Se esse e-mail existir, você receberá as instruções em breve.'
            : 'Digite seu e-mail e enviaremos um link para criar uma nova senha.'}
        </p>

        {/* Tela de sucesso */}
        {enviado ? (
          <div>
            <div style={{
              background: 'rgba(100,220,100,0.1)', border: '1px solid rgba(100,220,100,0.3)',
              borderRadius: '12px', padding: '1.25rem', textAlign: 'center', marginBottom: '1.5rem'
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📧</div>
              <p style={{ color: '#6ddc6d', fontWeight: 700, margin: '0 0 0.4rem' }}>E-mail enviado!</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0 }}>
                Verifique sua caixa de entrada e spam.
              </p>
            </div>
            <Link href="/login" style={{
              display: 'block', textAlign: 'center', color: '#FFD700',
              textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600
            }}>
              ← Voltar para o Login
            </Link>
          </div>
        ) : (
          /* Formulário */
          <form action={enviarResetSenha} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <div>
              <label style={{
                display: 'block', color: 'rgba(255,255,255,0.5)',
                fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px'
              }}>
                E-mail
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="seu@email.com"
                style={{
                  width: '100%', padding: '14px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px', color: '#fff', fontSize: '1rem', outline: 'none',
                  fontFamily: 'Inter, sans-serif'
                }}
              />
            </div>

            {/* Erro */}
            {erro && (
              <div style={{
                background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.3)',
                borderRadius: '10px', padding: '12px 16px', color: '#ff8080', fontSize: '0.875rem', textAlign: 'center'
              }}>
                ❌ E-mail inválido. Tente novamente.
              </div>
            )}

            <button type="submit" style={{
              marginTop: '0.5rem',
              background: '#FFD700', color: '#000', border: 'none',
              padding: '14px', borderRadius: '10px', fontWeight: 800,
              fontSize: '1rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif'
            }}>
              Enviar link de recuperação
            </button>

            <Link href="/login" style={{
              textAlign: 'center', color: 'rgba(255,255,255,0.4)',
              textDecoration: 'none', fontSize: '0.875rem', marginTop: '0.25rem'
            }}>
              ← Voltar para o Login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
