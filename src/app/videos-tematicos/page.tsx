import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Download } from 'lucide-react'
import { Metadata } from 'next'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Vídeos Temáticos | Contos de Oração',
  description: 'Conteúdo exclusivo em vídeo para assinantes.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

type VideoTematico = {
  id: string
  titulo: string
  descricao: string | null
  video_url: string
  capa_url: string | null
  criado_em: string
}

// SVG Instagram inline (lucide-react desta versão não tem o ícone)
function IgIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

export default async function VideosTematicosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planoAtivo = user.user_metadata?.plano_ativo === true
  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'
  if (!isAdmin && !planoAtivo) redirect('/?acesso=expirado')

  const nome = (user.user_metadata?.nome || user.email?.split('@')[0] || 'assinante').split(' ')[0]

  const { data: videos } = await supabase
    .from('videos_tematicos')
    .select('*')
    .eq('ativo', true)
    .order('criado_em', { ascending: false })

  const lista: VideoTematico[] = videos ?? []

  return (
    <main className="min-h-screen text-white overflow-x-hidden relative" style={{ backgroundColor: '#0A0D14' }}>

      {/* Fundo com gradiente Instagram sutil */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ background: 'radial-gradient(ellipse at top right, #833AB4 0%, #E1306C 40%, #F77737 80%, transparent 100%)' }}
        />
      </div>

      {/* Header */}
      <header
        className="fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-8 h-[60px] md:h-[68px] backdrop-blur-xl border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(10, 13, 20, 0.85)' }}
      >
        <Link href="/watch" className="flex items-center gap-3 transition-transform hover:scale-105">
          <Image src="/logo.png" alt="Contos de Oração" width={36} height={36} className="rounded-lg shadow-lg" />
          <span className="font-bold text-[16px] tracking-tight hidden sm:block">Contos de Oração</span>
        </Link>
        <Link
          href="/watch"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all hover:bg-white/10"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <ArrowLeft size={14} /> Voltar
        </Link>
      </header>

      {/* Hero */}
      <div className="relative z-10 pt-28 pb-10 px-6">
        <div className="max-w-[1200px] mx-auto text-center flex flex-col items-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 shadow-lg"
            style={{ background: 'linear-gradient(135deg, rgba(131,58,180,0.2), rgba(225,48,108,0.2), rgba(247,119,55,0.15))', border: '1px solid rgba(225,48,108,0.35)' }}
          >
            <IgIcon size={14} />
            <span className="text-xs font-black tracking-widest uppercase" style={{ color: '#E1306C' }}>Área Exclusiva</span>
          </div>

          <h1
            className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4"
            style={{ background: 'linear-gradient(135deg,#c084fc,#E1306C,#F77737)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Vídeos Temáticos
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-xl leading-relaxed">
            Olá, <strong className="text-white">{nome}</strong>! Conteúdo exclusivo disponível somente para assinantes.
          </p>
        </div>
      </div>

      {/* Grade de Vídeos */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pb-28">
        {lista.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <IgIcon size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold">Nenhum vídeo disponível ainda.</p>
            <p className="text-sm mt-1">Em breve novos conteúdos serão publicados aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {lista.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}

// ── Card individual com player embed e download ──
function VideoCard({ video }: { video: VideoTematico }) {
  return (
    <div
      className="group flex flex-col rounded-[20px] overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl"
      style={{ background: 'rgba(15,22,35,0.9)', border: '1px solid rgba(225,48,108,0.2)' }}
    >
      {/* Player iframe Bunny */}
      <div className="relative w-full aspect-video bg-black overflow-hidden">
        <iframe
          src={`${video.video_url}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
          loading="lazy"
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
          allowFullScreen
        />
        {/* Badge Instagram */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-wider z-10"
          style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)', color: '#fff' }}
        >
          <IgIcon size={10} /> Instagram
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <h3
          className="text-white font-extrabold text-base leading-tight"
          style={{ backgroundImage: 'linear-gradient(135deg,#c084fc,#E1306C)', WebkitBackgroundClip: 'text' }}
        >
          {video.titulo}
        </h3>

        {video.descricao && (
          <p className="text-white/55 text-xs leading-relaxed line-clamp-2">{video.descricao}</p>
        )}

        {/* Botão Download */}
        <a
          href={video.video_url}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="mt-auto flex items-center justify-center gap-2 w-full py-3 rounded-xl text-xs font-black transition-all hover:scale-[1.03] hover:brightness-110"
          style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)', color: '#fff', boxShadow: '0 4px 20px rgba(225,48,108,0.3)' }}
        >
          <Download size={14} />
          Baixar Vídeo
        </a>
      </div>
    </div>
  )
}
