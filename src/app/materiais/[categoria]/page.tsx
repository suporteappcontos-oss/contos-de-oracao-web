import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Gamepad2, Pencil, ArrowLeft, Download, Lock } from 'lucide-react'
import { Metadata } from 'next'

const CATEGORIAS: Record<string, { label: string; icon: any; color: string; descricao: string }> = {
  hq:      { label: 'Histórias em Quadrinhos', icon: BookOpen, color: '#D4AF37', descricao: 'HQs religiosas exclusivas para download' },
  jogo:    { label: 'Jogos Educativos',         icon: Gamepad2, color: '#10b981', descricao: 'Atividades lúdicas e pedagógicas' },
  desenho: { label: 'Desenhos para Colorir',    icon: Pencil,   color: '#818cf8', descricao: 'Ilustrações para imprimir e colorir' },
}

type Props = { params: Promise<{ categoria: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params
  const cat = CATEGORIAS[categoria]
  if (!cat) return { title: 'Materiais Didáticos' }
  return {
    title: `${cat.label} | Contos de Oração`,
    description: cat.descricao,
  }
}

export default async function CategoriaPage({ params }: Props) {
  const { categoria } = await params

  if (!CATEGORIAS[categoria]) notFound()
  const cat = CATEGORIAS[categoria]

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planoAtivo = user.user_metadata?.plano_ativo === true
  const etiqueta   = (user.user_metadata?.etiqueta_plano || '').toLowerCase()
  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'

  if (!isAdmin && !planoAtivo) redirect('/?acesso=expirado')

  const { data: itens } = await supabase
    .from('materiais')
    .select('*')
    .eq('ativo', true)
    .eq('categoria', categoria)
    .order('criado_em', { ascending: false })

  const CatIcon = cat.icon

  return (
    <main className="min-h-screen bg-[#090B10] text-white">

      {/* ── Header ── */}
      <div
        className="pt-24 pb-12 px-6 relative"
        style={{ background: `linear-gradient(180deg, ${cat.color}08 0%, transparent 100%)` }}
      >
        <div className="max-w-[1100px] mx-auto">
          <Link
            href="/materiais"
            className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-sm mb-8 transition-colors"
          >
            <ArrowLeft size={14} />
            Todos os Materiais
          </Link>

          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}30` }}
            >
              <CatIcon size={24} style={{ color: cat.color }} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">{cat.label}</h1>
              <p className="text-white/40 text-sm mt-1">{cat.descricao}</p>
            </div>
            <div
              className="ml-auto px-4 py-1.5 rounded-full text-sm font-black"
              style={{ background: `${cat.color}15`, color: cat.color }}
            >
              {itens?.length ?? 0} {(itens?.length ?? 0) === 1 ? 'item' : 'itens'}
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid de Itens ── */}
      <div className="max-w-[1100px] mx-auto px-6 pb-24">

        {(!itens || itens.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <CatIcon size={56} style={{ color: cat.color, opacity: 0.1 }} />
            <p className="text-white/20 font-medium">Nenhum material publicado ainda.</p>
            <p className="text-white/10 text-sm">Em breve novos conteúdos serão adicionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {itens.map(item => {
              const temAcesso = isAdmin || (
                item.planos_acesso?.some((p: string) =>
                  etiqueta.includes(p.toLowerCase()) || p.toLowerCase().includes(etiqueta)
                )
              )
              const downloadUrl = item.link_pdf
                ? `/api/download-pdf?url=${encodeURIComponent(item.link_pdf)}`
                : null

              return (
                <div key={item.id} className="flex flex-col gap-3">

                  {/* Capa */}
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/8 shadow-lg">
                    {item.capa_url ? (
                      <Image
                        src={item.capa_url}
                        alt={item.titulo}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ background: `${cat.color}10` }}>
                        <CatIcon size={36} style={{ color: cat.color, opacity: 0.25 }} />
                      </div>
                    )}

                    {/* Gradiente sobre a imagem */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Badge */}
                    <div
                      className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider"
                      style={{ background: `${cat.color}30`, color: cat.color, border: `1px solid ${cat.color}50` }}
                    >
                      {categoria.toUpperCase()}
                    </div>

                    {/* Lock overlay */}
                    {!temAcesso && (
                      <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2">
                        <Lock size={22} style={{ color: cat.color }} />
                        <span className="text-white text-[10px] font-bold text-center px-3 leading-tight">
                          Upgrade necessário
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Título */}
                  <h3 className="text-white text-sm font-bold leading-snug line-clamp-2 px-0.5">
                    {item.titulo}
                  </h3>
                  {item.descricao && (
                    <p className="text-white/30 text-xs leading-relaxed line-clamp-2 -mt-2 px-0.5">
                      {item.descricao}
                    </p>
                  )}

                  {/* Botão único de download */}
                  {temAcesso ? (
                    downloadUrl ? (
                      <a
                        href={downloadUrl}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black text-black transition-all hover:brightness-110 hover:scale-[1.02] active:scale-95"
                        style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}cc)` }}
                      >
                        <Download size={13} />
                        Baixar PDF
                      </a>
                    ) : (
                      <div className="flex items-center justify-center py-2.5 rounded-xl text-xs font-bold text-white/20 border border-white/5">
                        PDF em breve
                      </div>
                    )
                  ) : (
                    <Link
                      href="/planos"
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all border border-white/10 hover:border-white/25 text-white/40 hover:text-white/70"
                    >
                      <Lock size={11} />
                      Ver planos
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
