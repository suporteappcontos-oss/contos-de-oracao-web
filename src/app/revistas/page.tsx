import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, BookMarked, Download, ExternalLink } from 'lucide-react'
import { Metadata } from 'next'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Revistas | Contos de Oração',
  description: 'Biblioteca de revistas digitais católicas exclusivas para assinantes.',
}

type Revista = {
  id: string
  titulo: string
  descricao: string | null
  edicao: string | null
  capa_url: string | null
  link_pdf: string | null
  ativo: boolean
  criado_em: string
}

export default async function RevistasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase.from('perfis').select('nome').eq('id', user.id).single()
  const nome = perfil?.nome || user.user_metadata?.nome || 'Assinante'

  const { data: revistas } = await supabase
    .from('revistas')
    .select('*')
    .eq('ativo', true)
    .order('criado_em', { ascending: false })

  const lista: Revista[] = revistas ?? []

  return (
    <main className="min-h-screen text-white overflow-x-hidden relative" style={{ backgroundColor: '#0A0D14' }}>

      {/* Fundo gradiente sutil */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ background: 'radial-gradient(ellipse at top left, #7c3aed 0%, #4f46e5 50%, transparent 100%)' }}
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
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.35)' }}
          >
            <BookMarked size={14} className="text-[#a78bfa]" />
            <span className="text-xs font-black tracking-widest uppercase text-[#a78bfa]">Biblioteca Digital</span>
          </div>

          <h1
            className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4"
            style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed,#4f46e5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            Revistas
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-xl leading-relaxed">
            Olá, <strong className="text-white">{nome}</strong>! Acesse nossas edições digitais exclusivas.
          </p>
        </div>
      </div>

      {/* Grade de Revistas */}
      <div className="relative z-10 max-w-[1200px] mx-auto px-6 pb-28">
        {lista.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <BookMarked size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-bold">Nenhuma revista disponível ainda.</p>
            <p className="text-sm mt-1">Em breve novas edições serão publicadas aqui.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {lista.map((revista) => (
              <div
                key={revista.id}
                className="group flex flex-col rounded-[16px] overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 hover:shadow-2xl"
                style={{ background: 'rgba(15,22,35,0.9)', border: '1px solid rgba(124,58,237,0.2)' }}
              >
                {/* Capa */}
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '3/4' }}>
                  {revista.capa_url ? (
                    <img
                      src={revista.capa_url}
                      alt={revista.titulo}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#7c3aed]/10 flex items-center justify-center">
                      <BookMarked size={40} className="text-[#7c3aed] opacity-40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {revista.edicao && (
                    <div
                      className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase"
                      style={{ background: 'rgba(124,58,237,0.5)', color: '#e9d5ff', border: '1px solid rgba(124,58,237,0.4)' }}
                    >
                      {revista.edicao}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-2 p-4 flex-1">
                  <h3 className="text-white font-extrabold text-sm leading-tight">{revista.titulo}</h3>
                  {revista.descricao && (
                    <p className="text-white/50 text-xs leading-relaxed line-clamp-2">{revista.descricao}</p>
                  )}

                  {/* Botões */}
                  <div className="mt-auto flex flex-col gap-2">
                    {revista.link_pdf ? (
                      <a
                        href={revista.link_pdf}
                        download
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-black transition-all hover:scale-[1.03] hover:brightness-110"
                        style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', boxShadow: '0 4px 20px rgba(124,58,237,0.3)' }}
                      >
                        <Download size={13} />
                        Baixar PDF
                      </a>
                    ) : (
                      <div className="text-white/20 text-xs text-center py-2">Em breve</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
