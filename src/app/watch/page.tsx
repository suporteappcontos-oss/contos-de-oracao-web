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
    <div className="min-h-screen bg-[#0C121D] text-white font-sans overflow-x-hidden">
      {/* ── Navbar ── */}
      <header className="fixed top-0 w-full z-50 bg-[#0C121D]/90 backdrop-blur-md border-b border-[#FFD700]/10 flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="text-[#FFD700] text-xl md:text-2xl font-black tracking-tight drop-shadow-md">
            Contos de Oração
          </span>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6">
          <span className="hidden md:inline text-white/40 text-sm">{user.email}</span>
          
          {isAdmin && (
            <Link 
              href="/admin" 
              className="flex items-center gap-2 bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-bold hover:bg-[#FFD700]/20 transition-colors"
            >
              ⚙ Admin
            </Link>
          )}

          <form action={logout}>
            <button 
              type="submit" 
              className="bg-white/5 hover:bg-red-500/10 text-white/70 hover:text-red-400 border border-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm transition-colors"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="pt-[72px] pb-[100px]">
        {/* Estado Vazio */}
        {(!videos || videos.length === 0) && (
          <div className="flex flex-col items-center justify-center pt-32 px-4 text-center">
            <span className="text-6xl md:text-8xl mb-6">🍿</span>
            <h2 className="text-xl md:text-2xl text-white font-bold mb-2">Nenhum vídeo disponível no momento.</h2>
            <p className="text-white/40 max-w-md">Os vídeos serão adicionados em breve pelo administrador da plataforma.</p>
          </div>
        )}

        {videos && videos.length > 0 && (
          <>
            {/* Hero Banner Animado */}
            <HeroBanner video={videos[0] as Video} />

            {/* Carrosséis por Categoria */}
            <div className="mt-8 md:mt-12 space-y-4 md:space-y-8">
              {categorias.map(cat => (
                <CategoryCarousel 
                  key={cat} 
                  title={cat} 
                  count={videosPorCategoria[cat].length}
                >
                  {videosPorCategoria[cat].map(video => (
                    <VideoCard key={video.id} video={video as Video} />
                  ))}
                </CategoryCarousel>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
