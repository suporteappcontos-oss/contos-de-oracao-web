'use client'

import { X, Film } from 'lucide-react'
import VideoCard from './VideoCard'

type VideoData = {
  id: string
  titulo: string
  descricao: string | null
  categoria: string
  duracao: string | null
  bunny_library_id: string
  bunny_video_id: string | null
  thumbnail_url: string | null
  em_breve?: boolean
  episodio_numero?: number | null
}

interface TemporadaModalProps {
  isOpen: boolean
  onClose: () => void
  tituloTemporada: string
  episodios: VideoData[]
}

export default function TemporadaModal({
  isOpen,
  onClose,
  tituloTemporada,
  episodios
}: TemporadaModalProps) {
  if (!isOpen) return null

  // Ordena os episódios pelo número do episódio se existir
  const episodiosOrdenados = [...episodios].sort((a, b) => {
    const epA = a.episodio_numero ?? 0
    const epB = b.episodio_numero ?? 0
    return epA - epB
  })

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fadeIn">
      {/* Backdrop de fundo escuro com blur */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Card Principal do Modal */}
      <div 
        className="relative w-full max-w-5xl max-h-[85vh] flex flex-col rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-10"
        style={{
          background: 'linear-gradient(180deg, #111726 0%, #090B10 100%)'
        }}
      >
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest block">
                Temporada
              </span>
              <h2 className="text-white text-lg md:text-xl font-extrabold tracking-tight">
                {tituloTemporada}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-white/50 text-xs font-semibold hidden sm:inline-block">
              {episodiosOrdenados.length} {episodiosOrdenados.length === 1 ? 'Episódio' : 'Episódios'}
            </span>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lista de Episódios em Grid Responsivo */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {episodiosOrdenados.length === 0 ? (
            <div className="text-center py-12 text-white/50 text-sm">
              Nenhum episódio cadastrado nesta temporada ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {episodiosOrdenados.map((video) => (
                <div key={video.id} className="flex flex-col gap-2">
                  {video.episodio_numero && (
                    <span className="text-white/40 text-[11px] font-bold tracking-wider uppercase pl-1">
                      Episódio {video.episodio_numero}
                    </span>
                  )}
                  <VideoCard video={video} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
