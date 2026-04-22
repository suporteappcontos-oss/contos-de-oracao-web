import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HeroBanner from '@/components/HeroBanner'
import VideoCard from '@/components/VideoCard'
import CategoryCarousel from '@/components/CategoryCarousel'

type Video = {
  id: string
  titulo: string
  descricao: string | null
  categoria: string
  thumbnail_url: string | null
  bunny_video_id: string
  bunny_library_id: string
  duracao: string | null
  criado_em: string
  ativo: boolean
}

export default async function WatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // Verificar se é admin (para mostrar botão de admin)
  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = perfil?.role === 'admin'

  // Buscar vídeos ativos
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('ativo', true)
    .order('criado_em', { ascending: false })

  // Agrupar por categoria
  const categorias = [...new Set((videos ?? []).map((v: Video) => v.categoria))]
  const videosPorCategoria: Record<string, Video[]> = {}
  categorias.forEach(cat => {
    videosPorCategoria[cat] = (videos ?? []).filter(v => v.categoria === cat)
  })

  async function logout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#0f171e] text-white font-sans overflow-x-hidden">
      
      {/* ── Navbar (Estilo Prime Video) ── */}
      <header className="fixed top-0 w-full z-50 bg-[#1a242f] shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-2 md:py-0 md:h-[72px]">
        
        {/* Lado Esquerdo (Logo e Menu Inicial) */}
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
          <Link href="/watch" className="flex flex-col items-start leading-none shrink-0 group">
             <span className="text-white text-xl md:text-2xl font-black italic tracking-tighter">
               prime
             </span>
             <span className="text-[#0f79af] text-sm md:text-md font-bold tracking-widest mt-0.5 group-hover:text-white transition-colors">
               video
             </span>
          </Link>

          {/* Links de Navbar Secundários no PC */}
          <nav className="hidden md:flex items-center gap-6 text-[15px] font-bold text-white/70">
            <Link href="/watch" className="hover:text-white pb-[23px] pt-8 border-b-2 border-[#fff] text-white transition-all">Página Inicial</Link>
            <Link href="/watch" className="hover:text-white transition-all">Loja</Link>
            <Link href="/watch" className="hover:text-white transition-all">Séries</Link>
            <Link href="/watch" className="hover:text-white transition-all">Filmes</Link>
            <Link href="/watch" className="hover:text-white transition-all">Infantil</Link>
          </nav>
        </div>
        
        {/* Lado Direito (Perfil / Admin) */}
        <div className="flex items-center gap-4 mt-2 md:mt-0">
          
          <div className="hidden lg:flex items-center gap-2 bg-[#ffffff1a] px-3 py-1.5 rounded-md hover:bg-[#ffffff2a] transition-colors cursor-pointer border border-[#ffffff2a]">
             <span className="opacity-70 text-sm">🔍</span>
             <span className="text-white/70 text-sm font-semibold">Pesquisar</span>
          </div>

          <span className="hidden sm:inline text-white/50 text-sm font-semibold">
            {user.email?.split('@')[0]}
          </span>
          
          {isAdmin && (
            <Link 
              href="/admin" 
              className="bg-[#0f79af] text-white border border-transparent px-3 py-1.5 rounded text-xs md:text-sm font-bold hover:bg-[#0b5e89] transition-colors"
            >
              ⚙ Admin
            </Link>
          )}

          <form action={logout}>
            <button 
              type="submit" 
              className="text-white/60 hover:text-white text-sm font-bold p-2 transition-colors flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full h-9 w-9"
              title="Sair"
            >
              ✕
            </button>
          </form>
          
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#0f79af] to-[#041a26] border-2 border-transparent hover:border-white transition-colors cursor-pointer" />
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="pb-[100px] mt-[60px] md:mt-0">
        {(!videos || videos.length === 0) && (
          <div className="flex flex-col items-center justify-center pt-32 px-4 text-center h-[70vh]">
            <span className="text-6xl md:text-8xl mb-6">🎫</span>
            <h2 className="text-2xl md:text-3xl text-white font-bold mb-3">Seu catálogo está vazio.</h2>
            <p className="text-[#8197a4] max-w-md text-lg">Os vídeos serão adicionados em breve pelo administrador.</p>
          </div>
        )}

        {videos && videos.length > 0 && (
          <>
            {/* Hero Principal Exato Prime Video */}
            <HeroBanner video={videos[0] as Video} />

            {/* Trilhos de Catálogo (com margem negativa para sobrepor o Hero no estilo clássico) */}
            <div className="relative z-30 -mt-8 md:-mt-16 space-y-2 md:space-y-4">
              {categorias.map((cat, index) => (
                <div key={cat} className={index === 0 ? "relative" : ""}>
                   <CategoryCarousel 
                    title={cat === 'Geral' ? 'Recomendados para você' : cat} 
                    count={videosPorCategoria[cat].length}
                  >
                    {videosPorCategoria[cat].map(video => (
                      <VideoCard key={video.id} video={video as Video} />
                    ))}
                  </CategoryCarousel>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer Estilo Amazon */}
      <footer className="mt-12 border-t border-white/10 pt-8 pb-12 text-center text-sm font-semibold text-[#8197a4] flex flex-col gap-4">
         <div className="flex items-center justify-center gap-2">
             <span className="text-white text-lg font-black italic tracking-tighter shadow-sm">prime</span>
             <span className="text-[#0f79af] text-sm font-bold tracking-widest shadow-sm mt-0.5">video</span>
         </div>
         <div className="flex justify-center gap-6">
            <span className="hover:underline cursor-pointer">Termos de uso e Política de Privacidade</span>
            <span className="hover:underline cursor-pointer">Enviar feedback</span>
            <span className="hover:underline cursor-pointer">Ajuda</span>
         </div>
         <p>© 1996-2026, Amazon.com, Inc. ou suas afiliadas (Design Clone)</p>
      </footer>
    </div>
  )
}
