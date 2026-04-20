import Link from 'next/link';
import { login, signup } from './actions';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[url('https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center">
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10"></div>
      
      {/* Navegação Topo */}
      <header className="absolute top-0 w-full py-5 px-[4%] z-30">
        <Link href="/" className="text-[2.2rem] font-extrabold text-[#FFD700] uppercase tracking-[1px] cursor-pointer drop-shadow-md no-underline">
          Contos de Oração
        </Link>
      </header>

      {/* Caixa de Login */}
      <div className="relative z-20 w-full max-w-[450px] p-[60px] bg-black/80 rounded-md shadow-2xl border border-white/5">
        <h2 className="text-white text-3xl font-bold mb-8">Entrar</h2>
        
        <form className="flex flex-col gap-5">
          <input 
            type="email" 
            name="email"
            placeholder="Email da Kiwify" 
            required
            className="w-full p-4 bg-[#333] border border-transparent rounded text-white focus:border-[#FFD700] focus:bg-[#444] outline-none transition-colors"
          />
          
          <input 
            type="password" 
            name="password"
            placeholder="Sua Senha" 
            required
            className="w-full p-4 bg-[#333] border border-transparent rounded text-white focus:border-[#FFD700] focus:bg-[#444] outline-none transition-colors"
          />
          
          <button 
            formAction={login}
            className="w-full mt-6 py-4 bg-[#e50914] text-white font-bold rounded text-[1.1rem] transition-all hover:bg-[#f40612] hover:scale-[1.02] cursor-pointer"
          >
            Acessar Plataforma
          </button>
          
          {/* Apenas para facilitar seus testes. Crie sua conta usando esse botão */}
          <button 
            formAction={signup}
            className="w-full mt-2 py-4 bg-transparent border border-white/20 text-white font-bold rounded text-[1.1rem] transition-all hover:bg-white/10 cursor-pointer"
          >
            Apenas Testes: Criar Senha
          </button>
        </form>

        <div className="mt-10 text-white/50 text-[0.95rem]">
          <p>
            Novo por aqui? <Link href="/#planos" className="text-white hover:underline">Assine um plano na Kiwify.</Link>
          </p>
          <p className="mt-4 text-[0.8rem]">
            Esta página é protegida pelo sistema corporativo Supabase para garantir segurança de dados.
          </p>
        </div>
      </div>
    </div>
  );
}
