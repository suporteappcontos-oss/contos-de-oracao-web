import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Gamepad2, Pencil, Library, ArrowLeft, Lock, GraduationCap, Tag } from 'lucide-react'
import { Metadata } from 'next'
import { BotaoDownload } from '@/components/BotaoDownload'
import Footer from '@/components/Footer'

const CATEGORIAS: Record<string, { label: string; icon: any; color: string; descricao: string }> = {
  hq:      { label: 'Histórias em Quadrinhos', icon: BookOpen, color: '#D4AF37', descricao: 'HQs religiosas exclusivas para download' },
  jogo:    { label: 'Jogos Educativos',         icon: Gamepad2, color: '#10b981', descricao: 'Atividades lúdicas e pedagógicas' },
  desenho: { label: 'Desenhos para Colorir',    icon: Pencil,   color: '#818cf8', descricao: 'Ilustrações para imprimir e colorir' },
  livro:   { label: 'Livros Digitais',          icon: Library,  color: '#f97316', descricao: 'Leituras formativas e espirituais' },
  adesivo: { label: 'Adesivos',                 icon: Tag,      color: '#ec4899', descricao: 'Adesivos e artes prontas para imprimir' },
}

type Props = { params: Promise<{ categoria: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params
  const cat = CATEGORIAS[categoria]
  if (!cat) return { title: 'Material Pedagógico | Contos de Oração' }
  return {
    title: `${cat.label} | Material Pedagógico | Contos de Oração`,
    description: cat.descricao,
  }
}

export default async function CategoriaPage({ params }: Props) {
  const { categoria } = await params
  if (!CATEGORIAS[categoria]) notFound()
  const cat = CATEGORIAS[categoria]
  const CatIcon = cat.icon

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planoAtivo = user.user_metadata?.plano_ativo === true
  const { data: perfil } = await supabase.from('perfis').select('role, plano').eq('id', user.id).maybeSingle()
  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'
  if (!isAdmin && !planoAtivo) redirect('/?acesso=expirado')

  const { data: itens } = await supabase
    .from('materiais').select('*')
    .eq('ativo', true).eq('categoria', categoria)
    .order('criado_em', { ascending: false })

  return (
    <main className="min-h-screen bg-[#07090E] text-white">

      {/* Fundo com Imagem */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Image
          src="/background.jpg"
          alt="Background"
          fill
          className="object-cover opacity-25"
          priority
        />
        <div className="absolute inset-0 bg-[#07090E]/85" />
      </div>

      {/* ── Header ── */}
      <div className="relative z-10 pt-20 pb-10 px-6">
        <div className="max-w-[1080px] mx-auto">

          <Link href="/materiais"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all hover:bg-white/10 mb-8"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
            <ArrowLeft size={14} /> Voltar ao Material Pedagógico
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}30` }}>
              <CatIcon size={22} style={{ color: cat.color }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-black">{cat.label}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black"
                  style={{ background: `${cat.color}18`, color: cat.color }}>
                  {itens?.length ?? 0} {(itens?.length ?? 0) === 1 ? 'item' : 'itens'}
                </span>
              </div>
              <p className="text-white/70 text-xs">{cat.descricao}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="relative z-10 max-w-[1080px] mx-auto px-6 pb-24">
        {(!itens || itens.length === 0) ? (

          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-2"
              style={{ background: `${cat.color}10`, border: `1px solid ${cat.color}20` }}>
              <CatIcon size={36} style={{ color: cat.color, opacity: 0.3 }} />
            </div>
            <p className="text-white/50 font-bold">Nenhum material publicado ainda</p>
            <p className="text-white/50 text-sm">Em breve novos conteúdos serão adicionados.</p>
            <Link href="/materiais"
              className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all">
              <ArrowLeft size={12} /> Ver categorias
            </Link>
          </div>

        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {itens.map(item => {
              const temAcesso = true

              return (
                <div key={item.id} className="flex flex-col gap-2.5">

                  {/* Capa */}
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/7 shadow-lg transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1">
                    {item.capa_url ? (
                      <Image
                        src={item.capa_url} alt={item.titulo} fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"
                        style={{ background: `${cat.color}0A` }}>
                        <CatIcon size={36} style={{ color: cat.color, opacity: 0.2 }} />
                      </div>
                    )}

                    {/* Gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />



                    {/* Lock */}
                    {!temAcesso && (
                      <div className="absolute inset-0 bg-black/78 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px]">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: `${cat.color}18` }}>
                          <Lock size={18} style={{ color: cat.color }} />
                        </div>
                        <span className="text-white/70 text-[10px] font-bold text-center px-3 leading-tight">
                          Upgrade necessário
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="text-white text-sm font-bold leading-snug line-clamp-2 px-0.5">
                    {item.titulo}
                  </h3>
                  {item.descricao && (
                    <p className="text-white/70 text-xs leading-relaxed line-clamp-2 -mt-1.5 px-0.5">
                      {item.descricao}
                    </p>
                  )}

                  {/* Botão download */}
                  {temAcesso ? (
                    item.link_pdf ? (
                      <BotaoDownload
                        linkPdf={item.link_pdf}
                        titulo={item.titulo}
                        color={cat.color}
                      />
                    ) : (
                      <div className="flex items-center justify-center py-2.5 rounded-xl text-xs font-bold text-white/18 border border-white/5">
                        PDF em breve
                      </div>
                    )
                  ) : (
                    <Link href="/planos"
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10 hover:border-white/20 text-white/60 hover:text-white">
                      <Lock size={11} /> Ver planos
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </main>
  )
}
