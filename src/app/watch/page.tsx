import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import HeroBanner from '@/components/HeroBanner'
import VideoCard from '@/components/VideoCard'
import CategoryCarousel from '@/components/CategoryCarousel'
import { Home, Film, Tv2, Baby, LogOut, Settings } from 'lucide-react'

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

  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = perfil?.role === 'admin'

  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('ativo', true)
    .order('criado_em', { ascending: false })

  // Agrupar por categoria
  const categorias = [...new Set((videos ?? []).map((v: Video) => v.categoria))]
  const videosPorCategoria: Record<string, Video[]> = {}
  categorias.forEach(cat => {
    videosPorCategoria[cat] = (videos ?? []).filter((v: Video) => v.categoria === cat)
  })

  async function logout() {
    'use server'
    const supab = await createClient()
    await supab.auth.signOut()
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-[#0f171e] text-white overflow-x-hidden">

      {/* ── NAVBAR PRIME VIDEO ── */}
      <header className="fixed top-0 w-full z-50">
        {/* Navbar Principal */}
        <div className="bg-[#1a242f] border-b border-[#1e3040] flex items-center justify-between px-4 md:px-6 lg:px-8 py-0 h-14 md:h-[60px]">
          
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/watch" className="flex items-center gap-2 text-white">
              <div className="bg-[#00a8e1] text-white text-[0.6rem] font-black px-2 py-1 rounded tracking-widest uppercase">
                Prime
              </div>
              <span className="text-white font-semibold text-sm hidden sm:inline opacity-80">
                Video
              </span>
            </Link>

            {/* Navegação Desktop */}
            <nav className="hidden md:flex items-center gap-0.5">
              {[
                { icon: Home, label: 'Início', active: true },
                { icon: Film, label: 'Filmes' },
                { icon: Tv2, label: 'Séries' },
                { icon: Baby, label: 'Infantil' },
              ].map(item => (
                <button key={item.label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${item.active ? 'text-white' : 'text-[#8197a4] hover:text-white'}`}>
                  <item.icon size={14} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Direita */}
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-[#8197a4] text-[0.7rem] hidden lg:inline truncate max-w-[180px]">
              {user.email}
            </span>

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 bg-[#00a8e1]/10 hover:bg-[#00a8e1]/20 text-[#00a8e1] border border-[#00a8e1]/20 px-2.5 py-1.5 rounded text-[0.7rem] font-bold transition-colors"
              >
                <Settings size={12} />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            <form action={logout} className="inline">
              <button type="submit" className="flex items-center gap-1.5 text-[#8197a4] hover:text-white text-[0.7rem] border border-[#1e3040] hover:border-[#2a4050] px-2.5 py-1.5 rounded transition-colors">
                <LogOut size={12} />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </div>

        {/* Sub-Navbar Mobile (categorias) */}
        <div className="md:hidden bg-[#0f171e]/95 border-b border-[#1e3040] flex overflow-x-auto no-scrollbar px-4 py-2 gap-2">
          {['Início', 'Filmes', 'Séries', 'Infantil'].map(item => (
            <button key={item} className="flex-shrink-0 text-[#8197a4] text-xs px-3 py-1 rounded-full border border-[#1e3040] whitespace-nowrap">
              {item}
            </button>
          ))}
        </div>
      </header>

      {/* ── CONTEÚDO ── */}
      <main className="pt-14 md:pt-[60px]">

        {/* Vazio */}
        {(!videos || videos.length === 0) && (
          <div className="flex flex-col items-center justify-center pt-32 px-4 text-center gap-4">
            <span className="text-6xl">🎬</span>
            <h2 className="text-xl text-white font-bold">Nenhum conteúdo disponível ainda.</h2>
            <p className="text-[#8197a4]">Em breve o catálogo será atualizado.</p>
          </div>
        )}

        {videos && videos.length > 0 && (
          <>
            {/* Banner Principal */}
            <HeroBanner video={videos[0] as Video} />

            {/* Separador estilo Prime (badge azul reto) */}
            <div className="flex items-center gap-4 px-6 md:px-12 lg:px-16 mt-10 mb-6">
              <div className="h-px bg-[#1e3040] flex-1" />
              <span className="text-[#8197a4] text-xs tracking-widest uppercase">Catálogo</span>
              <div className="h-px bg-[#1e3040] flex-1" />
            </div>

            {/* Carrosséis por categoria */}
            <div className="space-y-2">
              {categorias.map(cat => (
                <CategoryCarousel key={cat} title={cat} count={videosPorCategoria[cat].length}>
                  {videosPorCategoria[cat].map((video: Video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </CategoryCarousel>
              ))}
            </div>

            {/* Footer Prime */}
            <footer className="mt-20 pb-10 border-t border-[#1e3040] px-6 md:px-12 lg:px-16 pt-8">
              <div className="flex items-center gap-2 text-[#8197a4] text-xs">
                <div className="bg-[#00a8e1] text-white text-[0.5rem] font-black px-1.5 py-0.5 rounded tracking-widest">Prime</div>
                <span>Contos de Oração · Todos os direitos reservados</span>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  )
}
