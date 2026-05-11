import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Gamepad2, Pencil, Download, Lock, ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Materiais Didáticos | Contos de Oração',
  description: 'Materiais didáticos exclusivos para download: HQs, Jogos e Desenhos para colorir.',
}

const CATEGORIAS = [
  { value: 'hq', label: 'Histórias em Quadrinhos', icon: BookOpen, color: '#D4AF37', descricao: 'HQs religiosas para todas as idades' },
  { value: 'jogo', label: 'Jogos Educativos', icon: Gamepad2, color: '#10b981', descricao: 'Atividades lúdicas e pedagógicas' },
  { value: 'desenho', label: 'Desenhos para Colorir', icon: Pencil, color: '#818cf8', descricao: 'Ilustrações religiosas para pintar' },
]

export default async function MateriaisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planoAtivo = user.user_metadata?.plano_ativo === true
  const etiqueta = (user.user_metadata?.etiqueta_plano || '').toLowerCase()
  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'

  if (!isAdmin && !planoAtivo) redirect('/?acesso=expirado')

  // Busca todos os materiais ativos
  const { data: materiais } = await supabase
    .from('materiais')
    .select('*')
    .eq('ativo', true)
    .order('criado_em', { ascending: false })

  const materiaisPorCategoria = CATEGORIAS.reduce((acc, cat) => {
    acc[cat.value] = (materiais ?? []).filter(m => m.categoria === cat.value)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <main className="min-h-screen bg-[#090B10] text-white">

      {/* ── Header ── */}
      <div
        className="pt-24 pb-16 px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, rgba(212,175,55,0.05) 0%, transparent 100%)' }}
      >
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-4">
                <BookOpen size={13} className="text-[#D4AF37]" />
                <span className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">Exclusivo</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">Materiais Didáticos</h1>
              <p className="text-white/40 mt-3 text-sm max-w-md">
                Faça o download dos materiais exclusivos da plataforma diretamente para o seu dispositivo.
              </p>
            </div>
            <Link
              href="/watch"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/70 hover:text-white text-sm font-semibold transition-all self-start md:self-auto"
            >
              <ArrowLeft size={15} />
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div className="max-w-[1200px] mx-auto px-6 pb-24 space-y-16">

        {CATEGORIAS.map(cat => {
          const itens = materiaisPorCategoria[cat.value] ?? []

          return (
            <section key={cat.value}>
              {/* Título da seção */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}30` }}>
                  <cat.icon size={18} style={{ color: cat.color }} />
                </div>
                <div>
                  <h2 className="text-white text-xl font-black">{cat.label}</h2>
                  <p className="text-white/30 text-xs">{cat.descricao}</p>
                </div>
                <span className="ml-auto text-xs px-3 py-1 rounded-full font-bold" style={{ background: `${cat.color}15`, color: cat.color }}>
                  {itens.length} {itens.length === 1 ? 'item' : 'itens'}
                </span>
              </div>

              {itens.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border border-white/5 rounded-3xl text-center gap-3">
                  <cat.icon size={40} style={{ color: cat.color, opacity: 0.2 }} />
                  <p className="text-white/20 text-sm">Nenhum material disponível ainda.</p>
                  <p className="text-white/10 text-xs">Em breve novos conteúdos serão adicionados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {itens.map((item) => {
                    const temAcesso = isAdmin || (
                      item.planos_acesso?.some((p: string) =>
                        etiqueta.includes(p.toLowerCase()) || p.toLowerCase().includes(etiqueta)
                      )
                    )

                    return (
                      <MaterialCard
                        key={item.id}
                        item={item}
                        temAcesso={temAcesso}
                        catColor={cat.color}
                        catLabel={cat.value.toUpperCase()}
                      />
                    )
                  })}
                </div>
              )}
            </section>
          )
        })}

        {/* Estado vazio total */}
        {(!materiais || materiais.length === 0) && (
          <div className="flex flex-col items-center justify-center py-32 text-center gap-4">
            <BookOpen size={64} className="opacity-10" />
            <p className="text-white/20 font-medium">Nenhum material disponível no momento.</p>
          </div>
        )}
      </div>
    </main>
  )
}

// ── Card de Material ──
function MaterialCard({
  item,
  temAcesso,
  catColor,
  catLabel,
}: {
  item: any
  temAcesso: boolean
  catColor: string
  catLabel: string
}) {
  const proxyUrl = item.link_pdf
    ? `/api/download-pdf?url=${encodeURIComponent(item.link_pdf)}`
    : null

  return (
    <div className="group flex flex-col">
      {/* Capa */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/8 shadow-xl transition-transform duration-300 group-hover:scale-[1.03]">
        {item.capa_url ? (
          <Image
            src={item.capa_url}
            alt={item.titulo}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ background: `${catColor}10` }}>
            <BookOpen size={36} style={{ color: catColor, opacity: 0.3 }} />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Badge categoria */}
        <div
          className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider backdrop-blur-sm"
          style={{ background: `${catColor}25`, color: catColor, border: `1px solid ${catColor}40` }}
        >
          {catLabel}
        </div>

        {/* Lock se não tiver acesso */}
        {!temAcesso && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 rounded-2xl">
            <Lock size={24} style={{ color: catColor }} />
            <span className="text-white text-[10px] font-bold text-center px-3">Upgrade de plano necessário</span>
          </div>
        )}

        {/* Botão download sobreposto (aparece no hover) */}
        {temAcesso && proxyUrl && (
          <a
            href={proxyUrl}
            download
            className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black text-black transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
            style={{ background: `linear-gradient(135deg, ${catColor}, ${catColor}cc)` }}
            onClick={e => e.stopPropagation()}
          >
            <Download size={13} />
            Baixar PDF
          </a>
        )}
      </div>

      {/* Título */}
      <div className="mt-3 px-1">
        <h3 className="text-white text-sm font-bold leading-tight group-hover:text-[#D4AF37] transition-colors line-clamp-2">
          {item.titulo}
        </h3>
        {item.descricao && (
          <p className="text-white/30 text-xs mt-1 leading-relaxed line-clamp-2">{item.descricao}</p>
        )}
        {/* Botão de download fora do card também (acessibilidade mobile) */}
        {temAcesso && proxyUrl ? (
          <a
            href={proxyUrl}
            download
            className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-black transition-all hover:brightness-110"
            style={{ background: `linear-gradient(135deg, ${catColor}, ${catColor}cc)` }}
          >
            <Download size={12} />
            Baixar PDF
          </a>
        ) : temAcesso && !item.link_pdf ? (
          <div className="mt-3 py-2 rounded-xl text-xs font-bold text-center text-white/20 border border-white/5">
            PDF em breve
          </div>
        ) : !temAcesso ? (
          <Link
            href="/planos"
            className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-white/50 border border-white/10 hover:border-[#D4AF37]/30 hover:text-white/80 transition-all"
          >
            <Lock size={11} />
            Ver planos
          </Link>
        ) : null}
      </div>
    </div>
  )
}
