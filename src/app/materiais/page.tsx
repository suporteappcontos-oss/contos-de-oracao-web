import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Gamepad2, Pencil, ArrowLeft, ChevronRight } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Materiais Didáticos | Contos de Oração',
  description: 'Materiais didáticos exclusivos para download: HQs, Jogos e Desenhos para colorir.',
}

const CATEGORIAS = [
  {
    value: 'hq',
    label: 'Histórias em\nQuadrinhos',
    labelFlat: 'Histórias em Quadrinhos',
    descricao: 'HQs religiosas em PDF, prontas para baixar e compartilhar com a família.',
    icon: BookOpen,
    color: '#D4AF37',
    glow: 'rgba(212,175,55,0.18)',
    bg: 'rgba(212,175,55,0.06)',
  },
  {
    value: 'jogo',
    label: 'Jogos\nEducativos',
    labelFlat: 'Jogos Educativos',
    descricao: 'Atividades lúdicas e pedagógicas para crianças aprenderem brincando.',
    icon: Gamepad2,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.18)',
    bg: 'rgba(16,185,129,0.06)',
  },
  {
    value: 'desenho',
    label: 'Desenhos para\nColorir',
    labelFlat: 'Desenhos para Colorir',
    descricao: 'Ilustrações religiosas para imprimir e colorir, perfeitas para catequese.',
    icon: Pencil,
    color: '#818cf8',
    glow: 'rgba(129,140,248,0.18)',
    bg: 'rgba(129,140,248,0.06)',
  },
]

export default async function MateriaisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planoAtivo = user.user_metadata?.plano_ativo === true
  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'
  if (!isAdmin && !planoAtivo) redirect('/?acesso=expirado')

  // Busca preview de capas por categoria
  const contagemMap: Record<string, { count: number; capas: string[] }> = {}
  for (const cat of CATEGORIAS) {
    const { data } = await supabase
      .from('materiais')
      .select('id, capa_url')
      .eq('ativo', true)
      .eq('categoria', cat.value)
      .order('criado_em', { ascending: false })
      .limit(4)
    contagemMap[cat.value] = {
      count: data?.length ?? 0,
      capas: (data ?? []).map(m => m.capa_url).filter(Boolean),
    }
  }

  const nome = user.user_metadata?.nome || user.email?.split('@')[0] || 'assinante'

  return (
    <main className="min-h-screen bg-[#07090E] text-white overflow-x-hidden">

      {/* ── Fundo decorativo ── */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
      </div>

      {/* ── Header ── */}
      <div className="relative pt-20 pb-16 px-6">
        <div className="max-w-[860px] mx-auto">

          {/* Voltar */}
          <Link href="/watch"
            className="inline-flex items-center gap-2 text-white/25 hover:text-white/60 text-xs font-semibold mb-10 transition-colors tracking-widest uppercase"
          >
            <ArrowLeft size={13} /> Voltar
          </Link>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
            <BookOpen size={12} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-[10px] font-black tracking-[0.2em] uppercase">Área Exclusiva</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05]">
            Materiais<br />
            <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #D4AF37, #f0c040)' }}>
              Didáticos
            </span>
          </h1>
          <p className="text-white/35 mt-4 text-base max-w-md leading-relaxed">
            Olá, <span className="text-white/60 font-semibold">{nome.split(' ')[0]}</span>! Escolha uma categoria e baixe os materiais diretamente.
          </p>
        </div>
      </div>

      {/* ── 3 Cards ── */}
      <div className="max-w-[860px] mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CATEGORIAS.map(cat => {
            const info = contagemMap[cat.value]
            const capas = info?.capas ?? []
            const count = info?.count ?? 0
            const CatIcon = cat.icon

            return (
              <Link
                key={cat.value}
                href={`/materiais/${cat.value}`}
                className="group relative flex flex-col rounded-[28px] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                style={{
                  background: 'linear-gradient(160deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)',
                  border: `1px solid rgba(255,255,255,0.07)`,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
                }}
              >
                {/* Glow no hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[28px] pointer-events-none"
                  style={{ boxShadow: `0 0 60px ${cat.glow} inset, 0 0 0 1px ${cat.color}30` }} />

                {/* ── Área de capas ── */}
                <div
                  className="relative h-52 overflow-hidden flex items-end justify-center pb-4"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${cat.glow} 0%, transparent 70%)` }}
                >
                  {capas.length > 0 ? (
                    <div className="flex items-end justify-center gap-2 w-full px-6">
                      {/* Múltiplas capas empilhadas */}
                      {capas.slice(0, 3).map((capa, i) => {
                        const isCenter = i === 0
                        const rot = [-6, 0, 6][i] ?? 0
                        const scale = isCenter ? 1 : 0.85
                        const z = isCenter ? 10 : 5
                        return (
                          <div
                            key={i}
                            className="relative rounded-xl overflow-hidden shadow-2xl shrink-0 transition-transform duration-500 group-hover:scale-105"
                            style={{
                              width: isCenter ? '88px' : '60px',
                              height: isCenter ? '118px' : '82px',
                              transform: `rotate(${rot}deg) scale(${scale})`,
                              zIndex: z,
                              order: i === 0 ? 2 : i === 1 ? 1 : 3,
                            }}
                          >
                            <Image src={capa} alt="" fill className="object-cover" sizes="88px" />
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CatIcon size={52} style={{ color: cat.color, opacity: 0.12 }} />
                    </div>
                  )}

                  {/* Contador flutuante */}
                  <div
                    className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-black"
                    style={{ background: `${cat.color}25`, color: cat.color, border: `1px solid ${cat.color}40` }}
                  >
                    {count} {count === 1 ? 'item' : 'itens'}
                  </div>
                </div>

                {/* ── Info ── */}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  {/* Ícone */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1"
                    style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}25` }}>
                    <CatIcon size={16} style={{ color: cat.color }} />
                  </div>

                  <h2 className="text-white font-black text-lg leading-tight whitespace-pre-line">
                    {cat.label}
                  </h2>
                  <p className="text-white/30 text-xs leading-relaxed">{cat.descricao}</p>

                  {/* Rodapé */}
                  <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wide" style={{ color: cat.color }}>
                      {count === 0 ? 'Em breve' : 'Acessar'}
                    </span>
                    <div
                      className="w-7 h-7 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1"
                      style={{ background: `${cat.color}20` }}
                    >
                      <ChevronRight size={14} style={{ color: cat.color }} />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Dica */}
        <p className="text-center text-white/15 text-xs mt-10 tracking-wide">
          Todos os materiais estão disponíveis em formato PDF para download.
        </p>
      </div>
    </main>
  )
}
