import Link from 'next/link';
import Image from 'next/image';
import { login } from './actions';
import PasswordField from '@/components/PasswordField';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error: erro } = await searchParams

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-20"
      style={{ background: '#090B10', fontFamily: 'Outfit, sans-serif' }}>

      {/* Fundo sutil */}
      <div className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1920&q=60')", opacity: 0.12 }} />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090B10] via-transparent to-[#090B10]/70" />

      {/* Logo no topo */}
      <header className="absolute top-0 w-full py-4 px-[4%] z-30">
        <Link href="/" className="flex items-center gap-3 no-underline w-fit">
          <Image src="/logo.png" alt="Contos de Oração" width={40} height={40} className="object-contain" />
          <div>
            <div className="text-white font-black text-base leading-tight">Contos de Oração</div>
            <div className="text-[0.5rem] font-extrabold uppercase tracking-widest -mt-0.5" style={{ color: '#D4AF37' }}>Premium</div>
          </div>
        </Link>
      </header>

      {/* ── Card de Login ── */}
      <div className="relative z-20 w-full max-w-[420px] p-8 md:p-10 rounded-2xl shadow-2xl mb-4"
        style={{ background: 'rgba(21,36,62,0.9)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>

        <h2 className="text-white text-2xl md:text-3xl font-black mb-1">Entrar</h2>
        <p className="text-white/40 text-sm mb-7">Acesse sua conta para assistir ao conteúdo.</p>

        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-white/50 text-[0.7rem] uppercase tracking-widest font-semibold">E-mail</label>
            <input
              type="email" name="email" placeholder="seu@email.com" required
              className="w-full px-4 py-3.5 rounded-xl text-white outline-none transition-all text-sm"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Outfit, sans-serif' }}
            />
          </div>

          <PasswordField name="password" label="Senha" placeholder="••••••••" />

          {erro && (
            <div className="bg-red-500/10 border border-red-500/25 text-red-300 px-4 py-3 rounded-xl text-sm text-center">
              {erro === 'credenciais_invalidas' ? '❌ E-mail ou senha incorretos.' :
               erro === 'link_invalido' ? '❌ Link expirado. Solicite um novo abaixo.' :
               '❌ Ocorreu um erro. Tente novamente.'}
            </div>
          )}

          <button formAction={login}
            className="w-full mt-3 py-4 font-extrabold rounded-xl text-base transition-all hover:brightness-110 hover:scale-[1.02] cursor-pointer"
            style={{ background: '#D4AF37', color: '#090B10', fontFamily: 'Outfit, sans-serif' }}>
            Acessar Plataforma →
          </button>

          <div className="text-center">
            <Link href="/esqueci-senha" className="text-white/35 text-sm hover:text-[#D4AF37] transition-colors no-underline">
              Esqueci minha senha
            </Link>
          </div>
        </form>
      </div>

      {/* ── Guia para novos assinantes (estilo Netflix) ── */}
      <div className="relative z-20 w-full max-w-[420px] p-6 rounded-2xl"
        style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>

        <p className="text-center text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#D4AF37' }}>
          Ainda não tem acesso?
        </p>

        {/* 3 passos */}
        <div className="flex flex-col gap-3 mb-5">
          {[
            { n: '1', texto: 'Clique em "Assinar Agora" e faça o pagamento' },
            { n: '2', texto: 'Você recebe um e-mail com o link de acesso' },
            { n: '3', texto: 'Crie sua senha e já começa a assistir!' },
          ].map(({ n, texto }) => (
            <div key={n} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-black"
                style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
                {n}
              </div>
              <p className="text-white/60 text-sm">{texto}</p>
            </div>
          ))}
        </div>

        <a href="https://pay.kiwify.com.br/YApXtLr" target="_blank" rel="noreferrer"
          className="block w-full text-center py-3.5 rounded-xl font-extrabold text-sm transition-all hover:brightness-110 hover:scale-[1.02]"
          style={{ background: '#D4AF37', color: '#090B10' }}>
          Assinar Agora →
        </a>
      </div>
    </div>
  );
}
