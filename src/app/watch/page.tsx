import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import HeroBanner from '@/components/HeroBanner'
import VideoCard from '@/components/VideoCard'
import CategoryCarousel from '@/components/CategoryCarousel'
import NotificationBell from '@/components/NotificationBell'
import { LogOut, Settings, BookOpen } from 'lucide-react'

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

  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'

  // 🔒 PROTEÇÃO DE PLANO: verifica se o assinante tem acesso ativo
  // plano_ativo vem do user_metadata (definido pelo webhook da Stripe)
  // Admin sempre tem acesso. Demais usuários precisam de plano_ativo = true
  const planoAtivo = user.user_metadata?.plano_ativo === true
  if (!isAdmin && !planoAtivo) {
    redirect('/?acesso=expirado')
  }

  // Etiqueta dinâmica vinda do metadata da Stripe (salva pelo webhook)
  const planoLabel = isAdmin ? 'Administrador' : (user.user_metadata?.etiqueta_plano || perfil?.plano || 'Assinante')

  const { data: videos } = await supabase
    .from('videos').select('*').eq('ativo', true)
    .order('criado_em', { ascending: false })

  // Busca IDs dos favoritos do usuário para destacar nos cards
  const { data: favoritosData } = await supabase
    .from('favoritos').select('video_id').eq('user_id', user!.id)
  const favoritosSet = new Set((favoritosData ?? []).map(f => f.video_id))

  // Etiqueta do plano para exibição
  const etiquetaPlano = user.user_metadata?.etiqueta_plano || ''

  // 🕒 HISTÓRICO DE VISUALIZAÇÕES (Continue Assistindo)
  const { data: historico } = await supabase
    .from('visualizacoes')
    .select('video_id, criado_em, videos!inner(*)')
    .eq('user_id', user.id)
    .order('criado_em', { ascending: false })

  const recentes: Video[] = []
  const idsVistos = new Set<string>()
  for (const item of (historico ?? [])) {
    const videoData = Array.isArray(item.videos) ? item.videos[0] : item.videos;
    if (videoData && !idsVistos.has(item.video_id) && videoData.ativo) {
      idsVistos.add(item.video_id)
      recentes.push(videoData as Video)
    }
  }

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

          {/* Botões Redes Sociais (bolinas) */}
          <a
            href="https://www.instagram.com/contosdeoracao"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-110"
            style={{ background: 'linear-gradient(135deg,#833AB4,#FD1D1D,#FCB045)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a
            href="https://www.facebook.com/share/18cmN9eVCw/"
            target="_blank"
            rel="noopener noreferrer"
            title="Facebook"
            className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-110"
            style={{ background: '#1877F2' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>

          {/* Sino de Notificações */}
          <NotificationBell />

          {/* Botão Material Pedagógico */}
          <Link
            href="/materiais"
            title="Material de Catequese"
            className="group relative flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all hover:scale-105 shadow-[0_0_10px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #AA8A2A 100%)', color: '#090B10' }}
          >
            {/* Brilho interno animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite]" />
            <BookOpen size={14} className="group-hover:-translate-y-0.5 transition-transform relative z-10" />
            <span className="hidden md:inline tracking-widest uppercase text-[10px] relative z-10">Mat. Catequese</span>
          </Link>

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

          <Link
            href="/perfil"
            className="group flex items-center gap-2 px-2 py-1 rounded-xl transition-all hover:bg-white/5"
            title="Meu perfil"
          >
            <div className="relative w-8 h-8 rounded-xl overflow-hidden border-2 transition-all group-hover:border-[#D4AF37] shrink-0"
              style={{ borderColor: 'rgba(212,175,55,0.3)' }}>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.nome || user.email?.split('@')[0] || '')}&background=111827&color=D4AF37&bold=true&size=128`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </Link>

          <form action={logout} className="m-0 p-0 flex items-center">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-all h-full bg-white/5 text-slate-400 border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
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
            <div className="flex items-center gap-4 px-5 md:px-10 lg:px-16 mt-10 mb-6">
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <span className="text-[#D4AF37] text-[0.6rem] font-extrabold tracking-[0.2em] uppercase">Catálogo</span>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>




            {/* Carrosséis */}
            <div className="space-y-4">
              {recentes.length > 0 && (
                <div className="mb-6">
                  <CategoryCarousel title="Continue Assistindo" count={recentes.length}>
                    {recentes.slice(0, 10).map((video: Video) => (
                      <VideoCard key={`hist-${video.id}`} video={video} isFavoritado={favoritosSet.has(video.id)} />
                    ))}
                  </CategoryCarousel>
                </div>
              )}

              {categorias.map(cat => (
                <CategoryCarousel key={cat} title={cat} count={videosPorCategoria[cat].length}>
                  {videosPorCategoria[cat].map((video: Video) => (
                    <VideoCard key={video.id} video={video} isFavoritado={favoritosSet.has(video.id)} />
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
