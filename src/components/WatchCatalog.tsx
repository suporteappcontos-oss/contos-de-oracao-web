'use client'

import { useState } from 'react'
import HeroBanner from '@/components/HeroBanner'
import VideoCard from '@/components/VideoCard'
import SerieCard, { SerieType } from '@/components/SerieCard'
import TemporadaCard from '@/components/TemporadaCard'
import TemporadaModal from '@/components/TemporadaModal'
import CategoryCarousel from '@/components/CategoryCarousel'
import Footer from '@/components/Footer'
import Link from 'next/link'

export type VideoData = {
  id: string
  titulo: string
  descricao: string | null
  categoria: string
  thumbnail_url: string | null
  bunny_video_id: string | null
  bunny_library_id: string
  duracao: string | null
  criado_em: string
  ativo: boolean
  em_breve?: boolean
  episodio_numero?: number | null
  temporada_nome?: string | null
}

export type TemporadaGroup = {
  nome: string
  capaUrl?: string | null
  episodios: VideoData[]
}

export type SerieDestaqueType = {
  titulo: string
  temporadas: TemporadaGroup[]
}

interface WatchCatalogProps {
  videoDestaque: VideoData | null
  recentes: VideoData[]
  serieDestaque: SerieDestaqueType | null
  outrasSeries: SerieType[]
  videosClipes: VideoData[]
  isBasico: boolean
}

export default function WatchCatalog({
  videoDestaque,
  recentes,
  serieDestaque,
  outrasSeries,
  videosClipes,
  isBasico
}: WatchCatalogProps) {
  // Estado para controlar o modal da temporada ativa
  const [modalOpen, setModalOpen] = useState(false)
  const [temporadaAtiva, setTemporadaAtiva] = useState<{ nome: string; episodios: VideoData[] } | null>(null)

  function abrirModalTemporada(nome: string, episodios: VideoData[]) {
    setTemporadaAtiva({ nome, episodios })
    setModalOpen(true)
  }

  function fecharModalTemporada() {
    setModalOpen(false)
    setTemporadaAtiva(null)
  }

  return (
    <>
      {/* 1. HeroBanner com o Último Episódio Lançado */}
      {videoDestaque && <HeroBanner video={videoDestaque as any} />}

      {/* Separador com estilo Ouro */}
      <div className="flex items-center gap-6 px-5 md:px-10 lg:px-16 mt-12 mb-8">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
        <span className="text-[#D4AF37] text-xs md:text-sm font-black tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]">
          Catálogo Exclusivo
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent" />
      </div>

      <div className="space-y-10">

        {/* 2. CONTINUE ASSISTINDO (Se houver histórico) */}
        {recentes.length > 0 && (
          <div>
            <CategoryCarousel title="Continue Assistindo" count={recentes.length}>
              {recentes.slice(0, 4).map((video: VideoData) => (
                <VideoCard key={`hist-${video.id}`} video={video} />
              ))}
            </CategoryCarousel>
          </div>
        )}

        {/* 3. SÉRIE EM DESTAQUE (Título + Cards das Temporadas) */}
        {serieDestaque && serieDestaque.temporadas.length > 0 && (
          <div>
            <CategoryCarousel 
              title={`Série: ${serieDestaque.titulo}`} 
              count={serieDestaque.temporadas.length}
            >
              {serieDestaque.temporadas.map((temp) => (
                <TemporadaCard
                  key={temp.nome}
                  nomeTemporada={temp.nome}
                  capaUrl={temp.capaUrl}
                  episodiosCount={temp.episodios.length}
                  onClick={() => abrirModalTemporada(`${serieDestaque.titulo} - ${temp.nome}`, temp.episodios)}
                />
              ))}
            </CategoryCarousel>
          </div>
        )}

        {/* 4. SEÇÃO OUTRAS SÉRIES (Cards de Séries) */}
        {outrasSeries.length > 0 && (
          <div>
            <CategoryCarousel title="Outras Séries" count={outrasSeries.length}>
              {outrasSeries.map((serie) => (
                <SerieCard key={serie.id} serie={serie} />
              ))}
            </CategoryCarousel>
          </div>
        )}

        {/* 5. VÍDEOS CLIPES */}
        {videosClipes.length > 0 && (
          <div>
            <CategoryCarousel title="Vídeos Clipes" count={videosClipes.length}>
              {videosClipes.map((video: VideoData) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </CategoryCarousel>
          </div>
        )}

        {/* 6. CONTEÚDO EXCLUSIVO (Pedagógico / Instagram) */}
        {!isBasico && (
          <div className="pt-6 pb-4">
            <div className="px-5 md:px-10 lg:px-16 mb-4">
              <h2 className="text-[#D4AF37] font-black text-lg md:text-xl tracking-tight uppercase">
                Conteúdo Pedagógico & Exclusivos
              </h2>
            </div>
            <div className="px-5 md:px-10 lg:px-16">
              <div className="flex flex-row gap-6 overflow-x-auto pb-2">

                {/* Card — Material Didático */}
                <div
                  className="flex flex-col gap-3 shrink-0 group"
                  style={{ width: 'clamp(240px, 28vw, 340px)' }}
                >
                  <Link
                    href="/materiais"
                    className="relative block outline-none cursor-pointer rounded-xl shadow-2xl"
                    style={{ background: '#111827', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                      <img
                        src="/catequese.png"
                        alt="Material Didático"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(9,11,16,0.3) 0%, transparent 100%)' }}
                      />
                    </div>
                  </Link>
                  <Link href="/materiais" className="block hover:no-underline">
                    <span className="text-[#D4AF37] text-[0.6rem] font-extrabold uppercase tracking-widest block mb-1">CONTEÚDO PEDAGÓGICO</span>
                    <h3 className="text-white text-base font-extrabold leading-tight group-hover:text-[#D4AF37] transition-colors">
                      Livros, HQs e Desenhos
                    </h3>
                    <p className="text-white/70 text-xs mt-1.5 leading-snug">
                      Acesse e faça download de livros pedagógicos, desenhos e histórias de santos.
                    </p>
                  </Link>
                </div>

                {/* Card — Vídeos Temáticos */}
                <div className="flex flex-col gap-3 shrink-0 group" style={{ width: 'clamp(240px, 28vw, 340px)' }}>
                  <Link
                    href="/videos-tematicos"
                    className="relative block outline-none cursor-pointer rounded-xl shadow-2xl"
                    style={{ background: '#111827', border: '1px solid rgba(225,48,108,0.25)' }}
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                      <img
                        src="/insta.png"
                        alt="Vídeos Instagram"
                        className="w-full h-full object-cover"
                      />
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to top, rgba(9,11,16,0.4) 0%, transparent 70%)' }}
                      />
                    </div>
                  </Link>
                  <Link href="/videos-tematicos" className="block hover:no-underline">
                    <span className="text-[0.6rem] font-extrabold uppercase tracking-widest block mb-1" style={{ color: '#E1306C' }}>VÍDEOS EXCLUSIVOS</span>
                    <h3 className="text-white text-base font-extrabold leading-tight transition-all"
                      style={{ backgroundImage: 'linear-gradient(135deg,#c084fc,#E1306C)', WebkitBackgroundClip: 'text' }}>
                      Vídeos Instagram
                    </h3>
                    <p className="text-white/70 text-xs mt-1.5 leading-snug">
                      Conteúdo exclusivo em vídeo. Assista e faça download direto pelo site.
                    </p>
                  </Link>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>

      {/* MODAL DA TEMPORADA ATIVA */}
      {temporadaAtiva && (
        <TemporadaModal
          isOpen={modalOpen}
          onClose={fecharModalTemporada}
          tituloTemporada={temporadaAtiva.nome}
          episodios={temporadaAtiva.episodios}
        />
      )}

      {/* Rodapé */}
      <Footer />
    </>
  )
}
