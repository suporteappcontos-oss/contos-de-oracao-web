'use client'

import { useState } from 'react'
import TemporadaCard from '@/components/TemporadaCard'
import TemporadaModal from '@/components/TemporadaModal'

interface TemporadaItem {
  nome: string
  capaUrl?: string | null
  episodios: any[]
}

interface SerieViewClientProps {
  tituloSerie: string
  temporadas: TemporadaItem[]
}

export default function SerieViewClient({ tituloSerie, temporadas }: SerieViewClientProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [temporadaAtiva, setTemporadaAtiva] = useState<{ nome: string; episodios: any[] } | null>(null)

  function abrirModalTemporada(nome: string, episodios: any[]) {
    setTemporadaAtiva({ nome, episodios })
    setModalOpen(true)
  }

  function fecharModalTemporada() {
    setModalOpen(false)
    setTemporadaAtiva(null)
  }

  if (temporadas.length === 0) {
    return (
      <div className="py-12 text-center text-white/50 text-sm">
        Nenhuma temporada disponível para esta série no momento.
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {temporadas.map((temp) => (
          <TemporadaCard
            key={temp.nome}
            nomeTemporada={temp.nome}
            capaUrl={temp.capaUrl}
            episodiosCount={temp.episodios.length}
            onClick={() => abrirModalTemporada(`${tituloSerie} - ${temp.nome}`, temp.episodios)}
          />
        ))}
      </div>

      {temporadaAtiva && (
        <TemporadaModal
          isOpen={modalOpen}
          onClose={fecharModalTemporada}
          tituloTemporada={temporadaAtiva.nome}
          episodios={temporadaAtiva.episodios}
        />
      )}
    </>
  )
}
