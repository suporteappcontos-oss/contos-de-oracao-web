import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import WatchCatalog, { VideoData, SerieDestaqueType, TemporadaGroup } from '@/components/WatchCatalog'
import { SerieType } from '@/components/SerieCard'

export default async function WatchPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: perfil } = await supabase
    .from('perfis').select('role').eq('id', user.id).single()

  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'

  // 🔒 PROTEÇÃO DE PLANO: verifica se o assinante tem acesso ativo
  const planoAtivo = user.user_metadata?.plano_ativo === true
  if (!isAdmin && !planoAtivo) {
    redirect('/?acesso=expirado')
  }

  // 1. Busca todos os vídeos ativos
  const { data: videos } = await supabase
    .from('videos').select('*').eq('ativo', true)
    .order('criado_em', { ascending: false })

  // 2. Busca todas as séries cadastradas na tabela 'series'
  const { data: seriesTable } = await supabase
    .from('series').select('*').order('criado_em', { ascending: false })

  const todosVideos = (videos ?? []) as VideoData[]
  const todasSeries = (seriesTable ?? []) as any[]

  const videoDestaque = todosVideos.find(v => !v.em_breve) || todosVideos[0] || null

  // Etiqueta do plano para exibição
  const etiquetaPlanoStr = (user.user_metadata?.etiqueta_plano || '').toLowerCase()
  const isBasico = !isAdmin && (etiquetaPlanoStr.includes('basico') || etiquetaPlanoStr.includes('básico'))

  // 3. HISTÓRICO DE VISUALIZAÇÕES (Continue Assistindo)
  const { data: historico } = await supabase
    .from('visualizacoes')
    .select('video_id, criado_em, videos!inner(*)')
    .eq('user_id', user.id)
    .order('criado_em', { ascending: false })

  const recentes: VideoData[] = []
  const idsVistos = new Set<string>()
  for (const item of (historico ?? [])) {
    const videoData = Array.isArray(item.videos) ? item.videos[0] : item.videos
    if (videoData && !idsVistos.has(item.video_id) && videoData.ativo) {
      idsVistos.add(item.video_id)
      recentes.push(videoData as VideoData)
    }
  }

  // 4. AGRUPAMENTO DINÂMICO DE SÉRIES, TEMPORADAS E EPISÓDIOS

  // Mapeamento: seriesAgrupadas[nomeSerie][nomeTemporada] = list<VideoData>
  const seriesAgrupadas: Record<string, Record<string, VideoData[]>> = {}
  
  // Garantir que séries da tabela 'series' iniciem no dicionário
  todasSeries.forEach(s => {
    if (s.titulo) {
      seriesAgrupadas[s.titulo] = {}
    }
  })

  // Agrupar vídeos da categoria 'Temporada'
  todosVideos.forEach(v => {
    if (v.categoria === 'Temporada' && v.temporada_nome) {
      let nomeSerie = v.temporada_nome
      let nomeTemporada = 'Temporada 1'

      if (v.temporada_nome.includes(' | ')) {
        const partes = v.temporada_nome.split(' | ')
        nomeSerie = partes[0]
        nomeTemporada = partes[1] || 'Temporada 1'
      } else if (v.temporada_nome.includes(' - ')) {
        const partes = v.temporada_nome.split(' - ')
        nomeSerie = partes[0]
        nomeTemporada = partes[1] || 'Temporada 1'
      }

      if (!seriesAgrupadas[nomeSerie]) {
        seriesAgrupadas[nomeSerie] = {}
      }
      if (!seriesAgrupadas[nomeSerie][nomeTemporada]) {
        seriesAgrupadas[nomeSerie][nomeTemporada] = []
      }
      seriesAgrupadas[nomeSerie][nomeTemporada].push(v)
    }
  })

  // Descobrir a Série Destaque (pertencente ao último episódio de série lançado)
  let nomeSerieDestaque: string | null = null
  const ultimoVideoSerie = todosVideos.find(v => v.categoria === 'Temporada' && v.temporada_nome)

  if (ultimoVideoSerie && ultimoVideoSerie.temporada_nome) {
    if (ultimoVideoSerie.temporada_nome.includes(' | ')) {
      nomeSerieDestaque = ultimoVideoSerie.temporada_nome.split(' | ')[0]
    } else if (ultimoVideoSerie.temporada_nome.includes(' - ')) {
      nomeSerieDestaque = ultimoVideoSerie.temporada_nome.split(' - ')[0]
    } else {
      nomeSerieDestaque = ultimoVideoSerie.temporada_nome
    }
  }

  // Se não encontrou nenhuma série destaque via temporada_nome, pega a primeira série agrupada
  const listaNomesSeries = Object.keys(seriesAgrupadas)
  if (!nomeSerieDestaque && listaNomesSeries.length > 0) {
    nomeSerieDestaque = listaNomesSeries[0]
  }

  // Helper para extrair número da temporada para ordenação crescente
  function extrairNumeroTemporada(nome: string): number {
    const match = nome.match(/(?:temporada|temp|t)\s*(\d+)/i)
    if (match && match[1]) return parseInt(match[1], 10)
    const anyNum = nome.match(/\d+/)
    if (anyNum) return parseInt(anyNum[0], 10)
    return 999
  }

  // Construir o objeto `serieDestaque` (com as temporadas expostas)
  let serieDestaque: SerieDestaqueType | null = null

  if (nomeSerieDestaque && seriesAgrupadas[nomeSerieDestaque]) {
    const temporadasMap = seriesAgrupadas[nomeSerieDestaque]
    const serieMeta = todasSeries.find(s => s.titulo === nomeSerieDestaque)

    const temporadas: TemporadaGroup[] = Object.entries(temporadasMap).map(([nomeTemp, listaEps]) => {
      // Filtra apenas episódios reais (remove placeholders de capas de temporada)
      const epsReais = listaEps.filter(v => 
        v.titulo && 
        !v.titulo.includes('(Card da Temporada)') && 
        !v.titulo.includes('Card da Temporada') &&
        !v.titulo.includes('(Capa da Temporada)')
      )

      epsReais.sort((a, b) => (a.episodio_numero ?? 0) - (b.episodio_numero ?? 0))
      const capaUrl = listaEps[0]?.thumbnail_url || serieMeta?.capa_url || null

      return {
        nome: nomeTemp,
        capaUrl: capaUrl,
        episodios: epsReais
      }
    })

    // Ordena temporadas de forma CRESCENTE (1, 2, 3...)
    temporadas.sort((a, b) => extrairNumeroTemporada(a.nome) - extrairNumeroTemporada(b.nome))

    if (temporadas.length > 0) {
      serieDestaque = {
        titulo: nomeSerieDestaque,
        temporadas
      }
    }
  }

  // Construir a lista `outrasSeries` (apenas para as séries que NÃO são a destaque atual)
  const outrasSeries: SerieType[] = []

  listaNomesSeries.forEach(nomeSerie => {
    if (nomeSerie !== nomeSerieDestaque) {
      const temporadasMap = seriesAgrupadas[nomeSerie] || {}
      const temporadasNomes = Object.keys(temporadasMap)
      
      let episodiosTotal = 0
      let capaUrl: string | null = null

      temporadasNomes.forEach(nomeTemp => {
        const eps = temporadasMap[nomeTemp] || []
        episodiosTotal += eps.length
        if (!capaUrl && eps[0]?.thumbnail_url) {
          capaUrl = eps[0].thumbnail_url
        }
      })

      const serieMeta = todasSeries.find(s => s.titulo === nomeSerie)
      if (serieMeta && serieMeta.capa_url) {
        capaUrl = serieMeta.capa_url
      }

      // Adiciona o Card de Série se houver temporadas ou se estiver cadastrada na tabela series
      if (temporadasNomes.length > 0 || serieMeta) {
        outrasSeries.push({
          id: serieMeta?.id || encodeURIComponent(nomeSerie),
          titulo: serieMeta?.titulo || nomeSerie,
          descricao: serieMeta?.descricao || null,
          capa_url: capaUrl,
          temporadasCount: temporadasNomes.length,
          episodiosCount: episodiosTotal
        })
      }
    }
  })

  // 5. Filtro para vídeos clipes
  const videosClipes = todosVideos.filter(v => 
    v.categoria && (
      v.categoria.toLowerCase().includes('clip') || 
      v.categoria.toLowerCase().includes('clipe')
    )
  )

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#090B10', fontFamily: 'Outfit, sans-serif' }}>
      <main className="pt-[72px]">

        {/* Estado vazio */}
        {(!todosVideos || todosVideos.length === 0) ? (
          <div className="flex flex-col items-center justify-center pt-32 px-4 text-center gap-4">
            <Image src="/logo.png" alt="Logo" width={80} height={80} className="opacity-40 object-contain" />
            <h2 className="text-xl text-white font-bold">Nenhum conteúdo disponível ainda.</h2>
            <p className="text-[#94A3B8]">Em breve o catálogo será atualizado.</p>
          </div>
        ) : (
          <WatchCatalog
            videoDestaque={videoDestaque}
            recentes={recentes}
            serieDestaque={serieDestaque}
            outrasSeries={outrasSeries}
            videosClipes={videosClipes}
            isBasico={isBasico}
          />
        )}

      </main>
    </div>
  )
}
