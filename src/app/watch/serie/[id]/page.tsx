import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Footer from '@/components/Footer'
import SerieViewClient from './SerieViewClient'

interface SeriePageProps {
  params: Promise<{ id: string }>
}

export default async function SerieDetailPage({ params }: SeriePageProps) {
  const { id } = await params
  const decodedIdOrTitle = decodeURIComponent(id)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: perfil } = await supabase
    .from('perfis').select('role').eq('id', user.id).single()

  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'
  const planoAtivo = user.user_metadata?.plano_ativo === true

  if (!isAdmin && !planoAtivo) {
    redirect('/?acesso=expirado')
  }

  // 1. Busca dados da série na tabela 'series'
  let serieMeta: any = null
  
  // Tenta buscar por ID (se for UUID) ou por título
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(decodedIdOrTitle)
  if (isUuid) {
    const { data } = await supabase.from('series').select('*').eq('id', decodedIdOrTitle).single()
    serieMeta = data
  } else {
    const { data } = await supabase.from('series').select('*').eq('titulo', decodedIdOrTitle).single()
    serieMeta = data
  }

  const tituloSerie = serieMeta?.titulo || decodedIdOrTitle
  const descricaoSerie = serieMeta?.descricao || null
  const capaUrlSerie = serieMeta?.capa_url || null

  // 2. Busca todos os vídeos ativos de temporada
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('ativo', true)
    .eq('categoria', 'Temporada')
    .order('criado_em', { ascending: false })

  const todosVideos = (videos ?? []) as any[]

  // 3. Filtra episódios que pertencem a esta série específica
  const episdiosDaSerie = todosVideos.filter(v => {
    if (!v.temporada_nome) return false
    if (v.temporada_nome.includes(' | ')) {
      return v.temporada_nome.split(' | ')[0] === tituloSerie
    }
    if (v.temporada_nome.includes(' - ')) {
      return v.temporada_nome.split(' - ')[0] === tituloSerie
    }
    return v.temporada_nome === tituloSerie
  })

  // 4. Agrupa os episódios por temporada
  const temporadasMap: Record<string, any[]> = {}
  episdiosDaSerie.forEach(v => {
    let nomeTemp = 'Temporada 1'
    if (v.temporada_nome.includes(' | ')) {
      nomeTemp = v.temporada_nome.split(' | ')[1] || 'Temporada 1'
    } else if (v.temporada_nome.includes(' - ')) {
      nomeTemp = v.temporada_nome.split(' - ')[1] || 'Temporada 1'
    }

    if (!temporadasMap[nomeTemp]) {
      temporadasMap[nomeTemp] = []
    }
    temporadasMap[nomeTemp].push(v)
  })

  const temporadas = Object.entries(temporadasMap).map(([nomeTemp, listaEps]) => {
    listaEps.sort((a, b) => (a.episodio_numero ?? 0) - (b.episodio_numero ?? 0))
    return {
      nome: nomeTemp,
      capaUrl: listaEps[0]?.thumbnail_url || capaUrlSerie,
      episodios: listaEps
    }
  })

  return (
    <div className="min-h-screen text-white overflow-x-hidden flex flex-col justify-between" style={{ background: '#090B10', fontFamily: 'Outfit, sans-serif' }}>
      <main className="pt-[100px] pb-16 px-5 md:px-10 lg:px-16 flex-1 max-w-7xl mx-auto w-full">

        {/* Botão Voltar */}
        <Link
          href="/watch"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white text-xs font-bold transition-all mb-8"
        >
          <ArrowLeft size={16} /> Voltar ao Catálogo
        </Link>

        {/* Hero Header da Série */}
        <div 
          className="relative w-full rounded-3xl overflow-hidden border border-white/10 p-6 md:p-12 mb-12 shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(17, 23, 38, 0.9) 0%, rgba(9, 11, 16, 0.95) 100%)'
          }}
        >
          {capaUrlSerie && (
            <div 
              className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none"
              style={{ backgroundImage: `url(${capaUrlSerie})` }}
            />
          )}

          <div className="relative z-10 max-w-3xl">
            <span className="text-[#D4AF37] text-xs font-black uppercase tracking-[0.25em] block mb-2">
              Série Exclusiva
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 drop-shadow-md">
              {tituloSerie}
            </h1>
            {descricaoSerie && (
              <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6">
                {descricaoSerie}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs font-bold text-white/50">
              <span>{temporadas.length} {temporadas.length === 1 ? 'Temporada' : 'Temporadas'}</span>
              <span>•</span>
              <span>{episdiosDaSerie.length} {episdiosDaSerie.length === 1 ? 'Episódio' : 'Episódios'}</span>
            </div>
          </div>
        </div>

        {/* Exibição dos Cards de Temporada */}
        <div className="space-y-6">
          <h2 className="text-[#D4AF37] font-black text-lg md:text-xl tracking-tight uppercase border-b border-white/10 pb-3">
            Temporadas Disponíveis
          </h2>

          <SerieViewClient 
            tituloSerie={tituloSerie}
            temporadas={temporadas}
          />
        </div>

      </main>

      <Footer />
    </div>
  )
}
