import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Gamepad2, Pencil, Library, ChevronRight } from 'lucide-react'
import { Metadata } from 'next'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Material Pedagógico | Contos de Oração Club',
  description: 'Materiais pedagógicos exclusivos para download: HQs, Jogos, Desenhos e Livros.',
}

import { CATEGORIAS_CONFIG } from './constants'

export default async function MateriaisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planoAtivo = user.user_metadata?.plano_ativo === true
  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).maybeSingle()
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

  return (
    <main className="min-h-screen text-white overflow-x-hidden relative" style={{ backgroundColor: '#0A0D14' }}>

      {/* Fundo com Imagem */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <Image
          src="/background.jpg"
          alt="Background"
          fill
          className="object-cover opacity-30"
          priority
        />
        <div className="absolute inset-0 bg-[#0A0D14]/80" />
      </div>

      {/* ── HERO ── */}
      <div className="relative z-10 pt-28 pb-12 px-6">
        <div className="max-w-[1200px] mx-auto text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 shadow-lg"
            style={{ background: 'linear-gradient(90deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.05) 100%)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <BookOpen size={14} className="text-[#D4AF37]" />
            <span className="text-[#D4AF37] text-xs font-black tracking-widest uppercase">Área Exclusiva</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-4">
            Material Pedagógico
          </h1>
          <p className="text-white/60 text-base md:text-lg max-w-2xl leading-relaxed">
            Olá, <strong className="text-white">{nome}</strong>! Explore nossa biblioteca de materiais formativos. Escolha uma categoria abaixo para visualizar e baixar.
          </p>
        </div>
      </div>

      {/* ── GRID DE CARDS VERTICAIS (Como Antes) ── */}
      <div className="relative max-w-[1200px] mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIAS_CONFIG.map(cat => {
            const info = contagemMap[cat.value]
            const capas = info?.capas ?? []
            const count = info?.count ?? 0
            const CatIcon = cat.icon

            return (
              <Link
                key={cat.value}
                href={`/materiais/${cat.value}`}
                className={`group relative flex flex-col rounded-[24px] border overflow-hidden transition-all duration-300 hover:scale-[1.04] hover:-translate-y-2 hover:shadow-2xl ${cat.border}`}
                style={{ backgroundColor: 'rgba(15, 20, 30, 0.6)', backdropFilter: 'blur(10px)' }}
              >
                {/* Glow interno no hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-40"
                  style={{ boxShadow: `0 0 40px ${cat.glow} inset` }} />

                {/* ── Imagem Fixa da Categoria (Parte superior do card) ── */}
                <div className={`relative h-[200px] overflow-hidden flex items-end justify-center`}>
                  <Image 
                    src={cat.image} 
                    alt={cat.labelFlat} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  
                  {/* Overlay gradiente escuro na parte de baixo da imagem para suavizar a transição */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,20,30,0.9)] via-transparent to-transparent z-10" />
                  <div className="absolute bottom-0 w-full h-[80px] bg-gradient-to-t from-[#0A0D14] to-transparent z-20" />
                </div>

                {/* ── Informações (Parte inferior do card) ── */}
                <div className="p-6 flex flex-col gap-3 flex-1 relative z-30 -mt-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}40` }}>
                      <CatIcon size={20} style={{ color: cat.color }} />
                    </div>
                    <span className="text-xs font-black px-3 py-1.5 rounded-full shadow-lg"
                      style={{ background: `${cat.color}20`, color: cat.color, border: `1px solid ${cat.color}30` }}>
                      {count} {count === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  <div className="mt-2">
                    <h2 className="text-transparent bg-clip-text font-black text-xl leading-tight mb-2 whitespace-pre-line"
                      style={{ backgroundImage: `linear-gradient(135deg, #fff, ${cat.color})` }}>
                      {cat.label}
                    </h2>
                    <p className="text-white/70 text-sm leading-relaxed">{cat.descricao}</p>
                  </div>

                  <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-bold transition-colors" style={{ color: count === 0 ? 'rgba(255,255,255,0.2)' : cat.color }}>
                      {count === 0 ? 'Em breve' : 'Acessar Categoria'}
                    </span>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:translate-x-2"
                      style={{ background: `${cat.color}20` }}>
                      <ChevronRight size={16} style={{ color: cat.color }} />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      <Footer />
    </main>
  )
}
