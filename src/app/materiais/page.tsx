import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, Gamepad2, Pencil, Library, ArrowLeft, ChevronRight } from 'lucide-react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Material Pedagógico | Contos de Oração',
  description: 'Materiais pedagógicos exclusivos para download: HQs, Jogos, Desenhos e Livros.',
}

import { CATEGORIAS_CONFIG } from './constants'

export default async function MateriaisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const planoAtivo = user.user_metadata?.plano_ativo === true
  const { data: perfil } = await supabase.from('perfis').select('role, plano').eq('id', user.id).single()
  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'
  if (!isAdmin && !planoAtivo) redirect('/?acesso=expirado')

  const nome = (user.user_metadata?.nome || user.email?.split('@')[0] || 'assinante').split(' ')[0]

  const etiquetaPlano = (user.user_metadata?.etiqueta_plano || perfil?.plano || '').toLowerCase()
  const isBasico = !isAdmin && (etiquetaPlano.includes('basico') || etiquetaPlano.includes('básico'))

  if (isBasico) {
    return (
      <main className="min-h-screen text-white overflow-x-hidden relative flex items-center justify-center" style={{ backgroundColor: '#0A0D14' }}>
        {/* Fundo com Imagem e Blur */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <Image
            src="/background.jpg"
            alt="Background"
            fill
            className="object-cover opacity-20 filter blur-sm"
            priority
          />
          <div className="absolute inset-0 bg-[#0A0D14]/90" />
        </div>

        <div className="relative z-10 max-w-md w-full mx-6 p-8 md:p-10 rounded-[32px] border border-white/10 text-center shadow-2xl backdrop-blur-xl"
             style={{ backgroundColor: 'rgba(15, 20, 30, 0.75)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)' }}>
          
          {/* Ícone com gradiente dourado */}
          <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-8 relative animate-[pulse_3s_infinite]"
               style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.2) 0%, rgba(212,175,55,0.05) 100%)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <div className="absolute inset-0 rounded-full opacity-25" style={{ backgroundColor: '#D4AF37' }} />
            <BookOpen size={36} className="text-[#D4AF37]" />
          </div>

          <h2 className="text-2xl md:text-3xl font-black mb-4 tracking-tight leading-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Material Exclusivo
          </h2>
          
          <p className="text-white/70 text-sm md:text-base mb-8 leading-relaxed">
            Olá, <strong className="text-white">{nome}</strong>. O acesso a HQs, Livros Digitais e Jogos Educativos está disponível apenas para assinantes do plano <strong className="text-[#D4AF37]">Essencial</strong> ou <strong className="text-[#D4AF37]">Pro</strong>.
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/planos"
              className="w-full py-4 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #AA8A2A 100%)', color: '#090B10' }}
            >
              Fazer Upgrade de Plano
            </Link>
            
            <Link
              href="/watch"
              className="w-full py-4 rounded-2xl font-bold text-sm transition-all hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 text-white/80 hover:text-white"
            >
              Voltar aos Vídeos
            </Link>
          </div>
        </div>
      </main>
    )
  }

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

      {/* Navbar Oficial - Contos de Oração */}
      <header
        className="fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-8 h-[60px] md:h-[68px] backdrop-blur-xl border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(10, 13, 20, 0.7)' }}
      >
        <Link href="/watch" className="flex items-center gap-3 transition-transform hover:scale-105">
          <Image src="/logo.png" alt="Contos de Oração" width={38} height={38} className="rounded-lg shadow-lg" />
          <span className="font-bold text-[17px] tracking-tight hidden sm:block">
            Contos de <span className="text-[#D4AF37]">Oração</span>
          </span>
        </Link>
        <Link href="/watch"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all hover:bg-white/10"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <ArrowLeft size={14} /> Voltar ao Início
        </Link>
      </header>

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
      <div className="relative z-10 pt-36 pb-12 px-6">
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
                className={`group relative flex flex-col rounded-[24px] border overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${cat.border}`}
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
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" 
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
                    <p className="text-white/40 text-sm leading-relaxed">{cat.descricao}</p>
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
    </main>
  )
}
