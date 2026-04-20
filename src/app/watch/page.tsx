import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function WatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  async function logout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0C121D 0%, #1E2E3E 50%, #2D4653 100%)' }}>
      {/* Navbar */}
      <header className="fixed top-0 w-full flex justify-between items-center py-4 px-[4%] bg-black/80 backdrop-blur-md z-50 border-b border-white/5">
        <div className="text-[1.8rem] font-extrabold text-[#FFD700] uppercase tracking-[1px]">
          Contos de Oração
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-sm hidden md:block">{user.email}</span>
          <form action={logout}>
            <button type="submit" className="bg-transparent border border-white/20 text-white py-2 px-4 rounded text-sm hover:bg-white/10 transition-all cursor-pointer">
              Sair
            </button>
          </form>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="pt-[100px] px-[4%] pb-20">
        {/* Boas vindas */}
        <div className="mb-10">
          <h1 className="text-white text-3xl md:text-4xl font-extrabold mb-2">
            Bem-vindo à plataforma! 🎉
          </h1>
          <p className="text-white/50 text-lg">
            Sua assinatura está ativa. Aproveite o conteúdo!
          </p>
        </div>

        {/* Em Breve */}
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-[5rem] mb-6">🎬</div>
          <h2 className="text-white text-2xl font-bold mb-4">
            Catálogo em construção
          </h2>
          <p className="text-white/50 text-lg max-w-[500px] mb-8">
            Estamos carregando todos os episódios e filmes religiosos para você. 
            Em breve o catálogo completo estará disponível aqui!
          </p>
          <div className="w-full max-w-[400px] h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-[#FFD700] rounded-full animate-pulse"></div>
          </div>
          <p className="text-[#FFD700] mt-4 font-semibold">75% concluído...</p>
        </div>

        {/* Card de status */}
        <div className="mt-10 max-w-[500px] mx-auto bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-400 text-2xl">✓</span>
          </div>
          <h3 className="text-white font-bold text-xl mb-2">Assinatura Ativa</h3>
          <p className="text-white/50 text-sm">{user.email}</p>
          <div className="mt-4 pt-4 border-t border-white/10">
            <Link href="/" className="text-[#FFD700] text-sm hover:underline no-underline">
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
