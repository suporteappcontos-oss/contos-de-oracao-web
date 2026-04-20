import Link from 'next/link';
import { login, signup } from './actions';

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const erro = searchParams?.error

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[url('https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm z-10"></div>
      
      {/* Logo no topo */}
      <header className="absolute top-0 w-full py-5 px-[4%] z-30">
        <Link href="/" className="text-[2rem] font-extrabold text-[#FFD700] uppercase tracking-[1px] cursor-pointer drop-shadow-md no-underline">
          Contos de Oração
        </Link>
      </header>

      {/* Card de Login */}
      <div className="relative z-20 w-full max-w-[440px] mx-4 p-10 bg-black/85 rounded-2xl shadow-2xl border border-white/10">
        <h2 className="text-white text-[2rem] font-extrabold mb-2">Entrar</h2>
        <p className="text-white/40 text-sm mb-8">Acesse sua conta para assistir ao conteúdo.</p>
        
        <form className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-white/50 text-xs uppercase tracking-widest">E-mail</label>
            <input 
              type="email" 
              name="email"
              placeholder="seu@email.com" 
              required
              className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] focus:bg-white/10 outline-none transition-all"
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-white/50 text-xs uppercase tracking-widest">Senha</label>
            <input 
              type="password" 
              name="password"
              placeholder="••••••••" 
              required
              className="w-full p-4 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] focus:bg-white/10 outline-none transition-all"
            />
          </div>

          {erro && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm text-center">
              {erro === 'credenciais_invalidas' ? '❌ E-mail ou senha incorretos.' : '❌ Ocorreu um erro. Tente novamente.'}
            </div>
          )}

          <button 
            formAction={login}
            className="w-full mt-4 py-4 bg-[#FFD700] text-black font-extrabold rounded-lg text-[1.1rem] transition-all hover:brightness-110 hover:scale-[1.02] cursor-pointer"
          >
            Acessar Plataforma
          </button>
          
          <button 
            formAction={signup}
            className="w-full py-3 bg-transparent border border-white/15 text-white/60 font-medium rounded-lg text-sm transition-all hover:bg-white/5 hover:text-white cursor-pointer"
          >
            Criar conta
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-white/30 text-sm">
            Não tem uma conta?{' '}
            <Link href="/#planos" className="text-[#FFD700] hover:underline">
              Escolha um plano
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
