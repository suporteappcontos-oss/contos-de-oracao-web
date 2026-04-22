import Link from 'next/link'
import Image from 'next/image'
import { enviarResetSenha } from './actions'

type Props = {
  searchParams: Promise<{ enviado?: string; erro?: string }>
}

export default async function EsqueciSenhaPage({ searchParams }: Props) {
  const { enviado, erro } = await searchParams

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
          <div>
            <div className="text-white font-black text-base leading-tight">Contos de Oração</div>
            <div className="text-[0.5rem] font-extrabold uppercase tracking-widest -mt-0.5" style={{ color: '#D4AF37' }}>Espiritualidade</div>
          </div>
        </Link>
      </header>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px] mx-4 rounded-2xl p-8 md:p-10"
        style={{
          background: 'rgba(21,36,62,0.88)', border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 1px rgba(212,175,55,0.15)'
        }}>

        {/* Ícone */}
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mb-6"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
          🔑
        </div>

        <h1 className="text-white text-2xl md:text-3xl font-black mb-2">
          {enviado ? 'E-mail enviado!' : 'Esqueci minha senha'}
        </h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
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
          <form action={enviarResetSenha} className="flex flex-col gap-4">

            <div>
              <label className="block text-[0.7rem] uppercase tracking-widest font-semibold mb-2"
                style={{ color: 'rgba(255,255,255,0.5)' }}>
                E-mail
              </label>
              <input
                type="text"
                name="email"
                required
                placeholder="seu@email.com"
                className="w-full outline-none transition-all text-sm rounded-xl"
                style={{
                  padding: '14px', boxSizing: 'border-box' as const,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  color: '#fff', fontFamily: 'Outfit, sans-serif'
                }}
                onFocus={undefined}
              />
            </div>

            {/* Erro */}
            {erro && (
              <div className="rounded-xl px-4 py-3 text-sm text-center"
                style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff8080' }}>
                ❌ {decodeURIComponent(erro)}
              </div>
            )}

            <button type="submit" className="mt-2 w-full rounded-xl font-extrabold text-base cursor-pointer transition-all hover:brightness-110"
              style={{ padding: '14px', background: '#D4AF37', color: '#090B10', border: 'none', fontFamily: 'Outfit, sans-serif' }}>
              Enviar link de recuperação →
            </button>

            <Link href="/login" className="text-center text-sm no-underline transition-colors hover:opacity-80"
              style={{ color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>
              ← Voltar para o Login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
