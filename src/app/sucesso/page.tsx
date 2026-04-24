import Link from 'next/link'
import Image from 'next/image'

export default function SucessoPage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#090B10', fontFamily: 'Outfit, sans-serif', position: 'relative'
    }}>
      {/* Fundo com blur suave */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: "url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1920&q=60')",
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.12
      }} />

      {/* Navbar com logo */}
      <header style={{ position: 'absolute', top: 0, width: '100%', padding: '1rem 4%', zIndex: 10, display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <Image src="/logo.png" alt="Contos de Oração" width={40} height={40} style={{ objectFit: 'contain' }} />
          <div>
            <div style={{ color: '#fff', fontWeight: 900, fontSize: '1rem', lineHeight: 1.2 }}>Contos de Oração</div>
            <div style={{ color: '#D4AF37', fontSize: '0.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Premium</div>
          </div>
        </Link>
      </header>

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
          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', marginBottom: '1.5rem'
        }}>
          ✅
        </div>

        <h1 style={{ color: '#fff', fontSize: '1.7rem', fontWeight: 900, margin: '0 0 0.5rem' }}>
          Pagamento Aprovado! 🎉
        </h1>

        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '1rem' }}>
            <strong style={{ color: '#fff' }}>Novo por aqui?</strong> Enviamos um link de acesso para o seu e-mail. Clique nele para criar a sua senha!
          </p>
          <p>
            <strong style={{ color: '#fff' }}>Já é assinante e estava renovando?</strong> Seu acesso já foi reativado instantaneamente.
          </p>
        </div>

        <Link href="/watch" style={{
          display: 'block', textAlign: 'center', textDecoration: 'none',
          background: '#D4AF37', color: '#090B10',
          padding: '14px', borderRadius: '12px', fontWeight: 800,
          fontSize: '1rem', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
          transition: 'all 0.2s'
        }}>
          Acessar a Plataforma →
        </Link>
      </div>
    </div>
  )
}
