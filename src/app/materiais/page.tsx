import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Gamepad2, Pencil, ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Materiais Didáticos | Contos de Oração',
  description: 'Materiais didáticos exclusivos para download: HQs, Jogos e Desenhos para colorir.',
}

const CATEGORIAS = [
  {
    value: 'hq',
    label: 'Histórias em Quadrinhos',
    descricao: 'HQs religiosas exclusivas para todas as idades. Baixe e compartilhe com a família.',
    icon: BookOpen,
    color: '#D4AF37',
    gradient: 'from-[#D4AF37]/20 via-[#D4AF37]/5 to-transparent',
    border: 'border-[#D4AF37]/20 hover:border-[#D4AF37]/60',
  },
  {
    value: 'jogo',
    label: 'Jogos Educativos',
    descricao: 'Atividades lúdicas e pedagógicas para crianças aprenderem brincando.',
    icon: Gamepad2,
    color: '#10b981',
    gradient: 'from-[#10b981]/20 via-[#10b981]/5 to-transparent',
    border: 'border-[#10b981]/20 hover:border-[#10b981]/60',
  },
  {
    value: 'desenho',
    label: 'Desenhos para Colorir',
    descricao: 'Ilustrações religiosas para imprimir e colorir, perfeitas para catequese.',
    icon: Pencil,
    color: '#818cf8',
    gradient: 'from-[#818cf8]/20 via-[#818cf8]/5 to-transparent',
    border: 'border-[#818cf8]/20 hover:border-[#818cf8]/60',
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

  // Conta e busca capa de cada categoria
  const contagemPorCategoria: Record<string, { count: number; capas: string[] }> = {}

  for (const cat of CATEGORIAS) {
    const { data } = await supabase
      .from('materiais')
      .select('id, capa_url')
      .eq('ativo', true)
      .eq('categoria', cat.value)
      .order('criado_em', { ascending: false })
      .limit(4)

    contagemPorCategoria[cat.value] = {
      count: data?.length ?? 0,
      capas: (data ?? []).map(m => m.capa_url).filter(Boolean),
    }
  }

  return (
    <main className="min-h-screen bg-[#090B10] text-white">

      {/* ── Header ── */}
      <div className="pt-24 pb-12 px-6" style={{ background: 'linear-gradient(180deg, rgba(212,175,55,0.04) 0%, transparent 100%)' }}>
        <div className="max-w-[900px] mx-auto">
          <Link href="/watch" className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-sm mb-8 transition-colors">
            <ArrowLeft size={14} />
            Voltar ao Início
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-4">
            <BookOpen size={12} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-bold tracking-widest uppercase">Área Exclusiva</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight">Materiais Didáticos</h1>
          <p className="text-white/40 mt-3 text-sm max-w-lg">
            Selecione uma categoria para ver e baixar os materiais disponíveis.
          </p>
        </div>
      </div>

      {/* ── 3 Cards de Categoria ── */}
      <div className="max-w-[900px] mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CATEGORIAS.map(cat => {
            const info = contagemPorCategoria[cat.value]
            const capas = info?.capas ?? []
            const count = info?.count ?? 0

            return (
              <Link
                key={cat.value}
                href={`/materiais/${cat.value}`}
                className={`group relative flex flex-col rounded-3xl border bg-[#0f1520] overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${cat.border}`}
              >
                {/* Mini-preview das capas */}
                <div className={`relative h-44 bg-gradient-to-b ${cat.gradient} overflow-hidden`}>
                  {capas.length > 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 px-4 pt-4">
                      {capas.slice(0, 3).map((capa, i) => (
                        <div
                          key={i}
                          className="relative rounded-xl overflow-hidden shadow-2xl flex-shrink-0 transition-transform duration-300"
                          style={{
                            width: i === 0 ? '80px' : '56px',
                            height: i === 0 ? '110px' : '78px',
                            transform: `rotate(${(i - 1) * 5}deg) translateY(${i === 1 ? '-8px' : '4px'})`,
                            zIndex: i === 0 ? 3 : i === 1 ? 2 : 1,
                          }}
                        >
                          <Image src={capa} alt="" fill className="object-cover" sizes="80px" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <cat.icon size={48} style={{ color: cat.color, opacity: 0.15 }} />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cat.color}20` }}>
                      <cat.icon size={17} style={{ color: cat.color }} />
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: `${cat.color}20`, color: cat.color }}>
                      {count} {count === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-white font-black text-base leading-tight">{cat.label}</h2>
                    <p className="text-white/35 text-xs mt-1.5 leading-relaxed">{cat.descricao}</p>
                  </div>

                  <div className="mt-auto pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: cat.color }}>Ver todos</span>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:translate-x-1" style={{ background: `${cat.color}20` }}>
                      <ChevronRight size={14} style={{ color: cat.color }} />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Aviso se nenhuma categoria tem conteúdo */}
        {Object.values(contagemPorCategoria).every(c => c.count === 0) && (
          <div className="mt-16 text-center text-white/20 text-sm">
            <BookOpen size={48} className="mx-auto mb-4 opacity-10" />
            Nenhum material disponível ainda. Em breve novos conteúdos!
          </div>
        )}
      </div>
    </main>
  )
}
