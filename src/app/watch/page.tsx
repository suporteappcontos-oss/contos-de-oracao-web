import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import HeroBanner from '@/components/HeroBanner'
import VideoCard from '@/components/VideoCard'
import CategoryCarousel from '@/components/CategoryCarousel'
import { LogOut, Settings } from 'lucide-react'

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
    .from('perfis').select('role, plano').eq('id', user.id).single()

  const isAdmin = perfil?.role === 'admin'

  // Label do plano baseado no plano real do usuário
  const PLANO_LABEL: Record<string, string> = {
    basico: 'Básico',
    familia: 'Família',
    premium: 'Premium',
  }
  const planoLabel = PLANO_LABEL[perfil?.plano ?? ''] ?? 'Plataforma'

  const { data: videos } = await supabase
    .from('videos').select('*').eq('ativo', true)
    .order('criado_em', { ascending: false })

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
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#090B10', fontFamily: 'Outfit, sans-serif' }}>

      {/* ── NAVBAR OFICIAL (identidade do App) ── */}
      <header
        className="fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-8 lg:px-12 h-[60px] md:h-[68px] glass-dark border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        {/* Logo + Nome */}
        <Link href="/watch" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Contos de Oração"
            width={42}
            height={42}
            className="object-contain drop-shadow-lg"
          />
          <div className="hidden sm:block">
            <div className="text-white font-black text-lg leading-tight tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Contos de Oração
            </div>
            <div className="text-[#D4AF37] text-[0.6rem] font-bold uppercase tracking-widest -mt-0.5">
              {planoLabel}
            </div>
          </div>
        </Link>

        {/* Direita */}
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-[#94A3B8] text-xs hidden lg:inline truncate max-w-[200px]">{user.email}</span>
          
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.2)' }}
            >
              <Settings size={13} />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <form action={logout} className="m-0 p-0 flex items-center">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all h-full"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </form>
        </div>
      </header>

      {/* ── CONTEÚDO ── */}
      <main className="pt-[60px] md:pt-[68px]">

        {/* Estado vazio */}
        {(!videos || videos.length === 0) && (
          <div className="flex flex-col items-center justify-center pt-32 px-4 text-center gap-4">
            <Image src="/logo.png" alt="Logo" width={80} height={80} className="opacity-40 object-contain" />
            <h2 className="text-xl text-white font-bold">Nenhum conteúdo disponível ainda.</h2>
            <p className="text-[#94A3B8]">Em breve o catálogo será atualizado.</p>
          </div>
        )}

        {videos && videos.length > 0 && (
          <>
            {/* HeroBanner */}
            <HeroBanner video={videos[0] as Video} />

            {/* Separador com estilo ouro */}
            <div className="flex items-center gap-4 px-5 md:px-10 lg:px-16 mt-10 mb-8">
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-[#D4AF37] text-[0.6rem] font-extrabold tracking-[0.2em] uppercase">Catálogo</span>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Carrosséis */}
            <div className="space-y-4">
              {categorias.map(cat => (
                <CategoryCarousel key={cat} title={cat} count={videosPorCategoria[cat].length}>
                  {videosPorCategoria[cat].map((video: Video) => (
                    <VideoCard key={video.id} video={video} />
                  ))}
                </CategoryCarousel>
              ))}
            </div>

            {/* Rodapé */}
            <footer className="mt-20 pb-10 pt-8 px-5 md:px-10 lg:px-16"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="Logo" width={28} height={28} className="opacity-50 object-contain" />
                <span style={{ color: '#94A3B8', fontSize: '0.75rem' }}>
                  Contos de Oração · Todos os direitos reservados
                </span>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  )
}
