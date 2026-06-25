import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import Footer from '@/components/Footer'
import VideosTematicosGaleria from './VideosTematicosGaleria'

export const metadata: Metadata = {
  title: 'Vídeos Instagram | Contos de Oração',
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

  const { data: videos } = isAdmin
    ? await createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { autoRefreshToken: false, persistSession: false } }
      )
        .from('videos_tematicos')
        .select('*')
        .order('criado_em', { ascending: false })
    : await supabase
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

      {/* Hero */}
      <div className="relative z-10 pt-24 pb-6 px-6">
        <div className="max-w-[1400px] mx-auto text-center flex flex-col items-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 shadow-lg"
            style={{ background: 'linear-gradient(135deg, rgba(131,58,180,0.2), rgba(225,48,108,0.2), rgba(247,119,55,0.15))', border: '1px solid rgba(225,48,108,0.35)' }}
          >
            <IgIcon size={14} />
            <span className="text-xs font-black tracking-widest uppercase" style={{ color: '#E1306C' }}>Área Exclusiva</span>
          </div>

          <h1
            className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-3"
            style={{ background: 'linear-gradient(135deg,#c084fc,#E1306C,#F77737)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Vídeos Instagram
          </h1>

        </div>
      </div>

      {/* Grade de Vídeos (Galeria Dinâmica) */}
      <div className="relative z-10 max-w-[1600px] mx-auto px-4 pb-20">
        <VideosTematicosGaleria videos={lista} />
      </div>

      <Footer />
    </main>
  )
}

