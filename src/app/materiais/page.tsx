import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Gamepad2, Pencil, Library, ArrowLeft, ChevronRight, GraduationCap } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Material Pedagógico | Contos de Oração',
  description: 'Materiais pedagógicos exclusivos para download: HQs, Jogos, Desenhos e Livros.',
}

export const CATEGORIAS_CONFIG = [
  {
    value: 'hq',
    label: 'Histórias em\nQuadrinhos',
    labelFlat: 'Histórias em Quadrinhos',
    descricao: 'HQs religiosas em PDF para baixar e compartilhar com a família.',
    icon: BookOpen,
    color: '#D4AF37',
    glow: 'rgba(212,175,55,0.2)',
  },
  {
    value: 'jogo',
    label: 'Jogos\nEducativos',
    labelFlat: 'Jogos Educativos',
    descricao: 'Atividades lúdicas e pedagógicas para crianças aprenderem brincando.',
    icon: Gamepad2,
    color: '#10b981',
    glow: 'rgba(16,185,129,0.2)',
  },
  {
    value: 'desenho',
    label: 'Desenhos para\nColorir',
    labelFlat: 'Desenhos para Colorir',
    descricao: 'Ilustrações religiosas para imprimir e colorir, perfeitas para catequese.',
    icon: Pencil,
    color: '#818cf8',
    glow: 'rgba(129,140,248,0.2)',
  },
  {
    value: 'livro',
    label: 'Livros\nDigitais',
    labelFlat: 'Livros Digitais',
    descricao: 'Leituras formativas e espirituais exclusivas em formato PDF.',
    icon: Library,
    color: '#f97316',
    glow: 'rgba(249,115,22,0.2)',
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

  const nome = (user.user_metadata?.nome || user.email?.split('@')[0] || 'assinante').split(' ')[0]

  // Preview de capas por categoria
  const contagemMap: Record<string, { count: number; capas: string[] }> = {}
  for (const cat of CATEGORIAS_CONFIG) {
    const { data } = await supabase
      .from('materiais').select('id, capa_url')
      .eq('ativo', true).eq('categoria', cat.value)
      .order('criado_em', { ascending: false }).limit(3)
    contagemMap[cat.value] = {
      count: data?.length ?? 0,
      capas: (data ?? []).map(m => m.capa_url).filter(Boolean),
    }
  }

  const totalItens = Object.values(contagemMap).reduce((s, v) => s + v.count, 0)

  return (
    <main className="min-h-screen bg-[#07090E] text-white overflow-x-hidden">

      {/* Fundo decorativo */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-25"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.12) 0%, transparent 65%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-10"
          style={{ background: 'radial-gradient(ellipse, rgba(129,140,248,0.3) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* ── HERO ── */}
      <div className="relative pt-20 pb-14 px-6">
        <div className="max-w-[920px] mx-auto">

          <Link href="/watch"
            className="inline-flex items-center gap-2 text-white/25 hover:text-white/55 text-[11px] font-bold mb-10 transition-colors tracking-[0.15em] uppercase">
            <ArrowLeft size={12} /> Voltar ao Início
          </Link>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.22)' }}>
                <GraduationCap size={12} className="text-[#D4AF37]" />
                <span className="text-[#D4AF37] text-[10px] font-black tracking-[0.2em] uppercase">Área Exclusiva</span>
              </div>

              <h1 className="text-5xl md:text-[3.6rem] font-black tracking-tight leading-[1.03]">
                Material<br />
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(130deg, #FFD700 0%, #D4AF37 50%, #B8941E 100%)' }}>
                  Pedagógico
                </span>
              </h1>
              <p className="text-white/35 mt-4 text-sm max-w-sm leading-relaxed">
                Olá, <span className="text-white/65 font-semibold">{nome}</span>! Escolha uma categoria para ver e baixar os materiais disponíveis.
              </p>
            </div>

            {/* Stat total */}
            {totalItens > 0 && (
              <div className="flex flex-col items-center px-6 py-4 rounded-2xl shrink-0"
                style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
                <span className="text-4xl font-black text-[#D4AF37]">{totalItens}</span>
                <span className="text-white/30 text-xs mt-1 text-center">materiais<br />disponíveis</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── GRID 2x2 ── */}
      <div className="max-w-[920px] mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CATEGORIAS_CONFIG.map(cat => {
            const info = contagemMap[cat.value]
            const capas = info?.capas ?? []
            const count = info?.count ?? 0
            const CatIcon = cat.icon

            return (
              <Link
                key={cat.value}
                href={`/materiais/${cat.value}`}
                className="group relative flex overflow-hidden rounded-[26px] transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  minHeight: '180px',
                }}
              >
                {/* Glow hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none rounded-[26px]"
                  style={{ boxShadow: `0 0 50px ${cat.glow} inset, 0 0 0 1px ${cat.color}25` }} />

                {/* Linha colorida no topo */}
                <div className="absolute top-0 left-8 right-8 h-[2px] rounded-b-full opacity-60 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)` }} />

                {/* ── Layout horizontal ── */}
                <div className="flex flex-1 gap-0">

                  {/* Área de capas */}
                  <div className="relative w-[140px] shrink-0 overflow-hidden flex items-center justify-center"
                    style={{ background: `radial-gradient(ellipse at 50% 50%, ${cat.glow} 0%, transparent 80%)` }}>
                    {capas.length > 0 ? (
                      <div className="flex items-center justify-center gap-1.5 px-2 py-4">
                        {capas.slice(0, 2).map((capa, i) => (
                          <div key={i}
                            className="relative rounded-lg overflow-hidden shadow-xl shrink-0 transition-transform duration-400 group-hover:scale-105"
                            style={{
                              width: i === 0 ? '68px' : '52px',
                              height: i === 0 ? '92px' : '70px',
                              transform: `rotate(${i === 0 ? -4 : 4}deg)`,
                              zIndex: i === 0 ? 2 : 1,
                            }}
                          >
                            <Image src={capa} alt="" fill className="object-cover" sizes="70px" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <CatIcon size={44} style={{ color: cat.color, opacity: 0.1 }} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-between flex-1 p-5 pl-4">
                    <div>
                      {/* Ícone + Badge */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                          style={{ background: `${cat.color}18`, border: `1px solid ${cat.color}25` }}>
                          <CatIcon size={15} style={{ color: cat.color }} />
                        </div>
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                          style={{ background: `${cat.color}18`, color: cat.color }}>
                          {count} {count === 1 ? 'item' : 'itens'}
                        </span>
                      </div>

                      <h2 className="text-white font-black text-[1.05rem] leading-tight whitespace-pre-line mb-1.5">
                        {cat.label}
                      </h2>
                      <p className="text-white/28 text-xs leading-relaxed line-clamp-2">{cat.descricao}</p>
                    </div>

                    {/* Rodapé */}
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                      <span className="text-xs font-bold" style={{ color: count === 0 ? 'rgba(255,255,255,0.2)' : cat.color }}>
                        {count === 0 ? 'Em breve' : 'Ver todos →'}
                      </span>
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1"
                        style={{ background: `${cat.color}18` }}>
                        <ChevronRight size={13} style={{ color: cat.color }} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <p className="text-center text-white/12 text-[11px] mt-10 tracking-wide">
          Todos os materiais estão disponíveis em formato PDF • Área exclusiva para assinantes
        </p>
      </div>
    </main>
  )
}
