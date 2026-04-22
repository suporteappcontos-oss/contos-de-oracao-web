import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { atualizarSenha } from './actions'

type Props = {
  searchParams: Promise<{ erro?: string }>
}

const MSGS_ERRO: Record<string, string> = {
  senha_curta: '❌ A senha deve ter pelo menos 6 caracteres.',
  senhas_diferentes: '❌ As senhas não coincidem. Tente novamente.',
  erro_generico: '❌ Ocorreu um erro. O link pode ter expirado — solicite um novo.',
  link_expirado: '❌ Link expirado ou inválido. Solicite a recuperação de senha novamente.',
}

export default async function AtualizarSenhaPage({ searchParams }: Props) {
  const { erro } = await searchParams

  // Verifica se o usuário está logado (sessão estabelecida pelo callback)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/esqueci-senha?erro=link_expirado')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(rgba(0,0,0,0.82), rgba(0,0,0,0.82)),
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
          🔒
        </div>

        <h1 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.5rem' }}>
          Criar nova senha
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Bem-vindo! Defina uma senha para acessar a plataforma.
        </p>

        <form action={atualizarSenha} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Nova Senha */}
          <div>
            <label style={{
              display: 'block', color: 'rgba(255,255,255,0.5)',
              fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px'
            }}>
              Nova Senha
            </label>
            <input
              type="password"
              name="senha"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              style={{
                width: '100%', padding: '14px', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '10px', color: '#fff', fontSize: '1rem', outline: 'none',
                fontFamily: 'Inter, sans-serif'
              }}
            />
          </div>

          {/* Confirmar Senha */}
          <div>
            <label style={{
              display: 'block', color: 'rgba(255,255,255,0.5)',
              fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px'
            }}>
              Confirmar Senha
            </label>
            <input
              type="password"
              name="confirmar"
              required
              minLength={6}
              placeholder="Repita a senha"
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
              {MSGS_ERRO[erro] ?? '❌ Ocorreu um erro. Tente novamente.'}
            </div>
          )}

          <button type="submit" style={{
            marginTop: '0.5rem',
            background: '#FFD700', color: '#000', border: 'none',
            padding: '14px', borderRadius: '10px', fontWeight: 800,
            fontSize: '1rem', cursor: 'pointer', fontFamily: 'Inter, sans-serif'
          }}>
            ✅ Salvar nova senha e entrar
          </button>
        </form>
      </div>
    </div>
  )
}
