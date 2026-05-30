'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  ChevronDown, ChevronUp, Film, ExternalLink, 
  Edit3, EyeOff, Eye, Trash2, Tv2 
} from 'lucide-react'
import { toggleVideoAtivo, deletarVideo } from './actions'
import { FormEditarVideo } from './FormEditarVideo'

type VideoType = {
  id: string
  titulo: string
  descricao: string | null
  categoria: string
  thumbnail_url: string | null
  bunny_video_id: string
  bunny_library_id: string
  duracao: string | null
  criado_em: string
  ativo: boolean
  em_breve?: boolean
  temporada_nome?: string | null
  episodio_numero?: number | null
}

type Props = {
  videos: VideoType[]
  temporadasExistentes: string[]
  editId: string | null
  editingVideo: VideoType | null
}

const FALLBACK = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=70',
  'https://images.unsplash.com/photo-1476725994324-6f6833cfb205?w=400&q=70',
  'https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?w=400&q=70',
  'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=400&q=70',
]

function getFallback(id: string) {
  const c = (id.charCodeAt(0) || 0) + (id.charCodeAt(id.length - 1) || 0)
  return FALLBACK[c % FALLBACK.length]
}

export default function AcervoVideosAdmin({ 
  videos = [], 
  temporadasExistentes = [], 
  editId, 
  editingVideo 
}: Props) {
  // Controle de abas colapsadas por temporada
  const [temporadasAbertas, setTemporadasAbertas] = useState<Record<string, boolean>>({})

  const toggleTemporada = (nome: string) => {
    setTemporadasAbertas(prev => ({
      ...prev,
      [nome]: !prev[nome]
    }))
  }

  // Lógica de Agrupamento
  const temporadas: Record<string, VideoType[]> = {}
  const videosAvulsos: VideoType[] = []

  videos.forEach(v => {
    if (v.categoria === 'Temporada' && v.temporada_nome) {
      if (!temporadas[v.temporada_nome]) {
        temporadas[v.temporada_nome] = []
      }
      temporadas[v.temporada_nome].push(v)
    } else {
      videosAvulsos.push(v)
    }
  })

  // Ordena os episódios de cada temporada pelo número do episódio
  Object.keys(temporadas).forEach(nomeTemp => {
    temporadas[nomeTemp].sort((a, b) => {
      const numA = a.episodio_numero ?? 0
      const numB = b.episodio_numero ?? 0
      return numA - numB
    })
  })

  const renderCardVideo = (video: VideoType) => {
    if (editId === video.id && editingVideo) {
      return (
        <FormEditarVideo 
          key={video.id} 
          video={video as any} 
          temporadasExistentes={temporadasExistentes} 
        />
      )
    }

    return (
      <div 
        key={video.id} 
        className={`h-full flex flex-col bg-[#111827] border rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 shadow-lg group hover:shadow-xl ${video.ativo ? 'border-white/5 hover:border-white/20' : 'border-red-500/20 opacity-75'}`}
      >
        {/* Thumbnail Header */}
        <div className="relative aspect-video w-full bg-[#090B10] border-b border-white/5 group-hover:border-white/10 transition-colors">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700" 
            style={{ backgroundImage: `url(${video.thumbnail_url || getFallback(video.id)})` }} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
          
          {/* Episode Badge if exists */}
          {video.categoria === 'Temporada' && video.episodio_numero !== null && (
            <div className="absolute top-3 left-3 bg-[#D4AF37] text-black font-black text-[0.65rem] px-2 py-0.5 rounded-lg uppercase tracking-wider">
              Episódio {video.episodio_numero}
            </div>
          )}

          {!video.ativo && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 pointer-events-none overflow-hidden">
              <div className="absolute transform -rotate-45 bg-gradient-to-r from-red-600 via-red-500 to-yellow-500 text-white font-black text-[0.7rem] sm:text-sm uppercase tracking-[0.3em] py-2 w-[150%] text-center shadow-[0_0_20px_rgba(239,68,68,0.5)] border-y-2 border-yellow-400">
                VÍDEO OCULTO
              </div>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-white font-extrabold text-lg leading-tight mb-2 line-clamp-2">{video.titulo}</h3>
          <div className="text-white/40 text-xs font-medium mb-5">Adicionado em {new Date(video.criado_em).toLocaleDateString('pt-BR')}</div>
          
          {/* Botões Bottom */}
          <div className="mt-auto grid grid-cols-4 gap-2 pt-4 border-t border-white/5">
            <Link 
              href={`/watch/${video.id}`} 
              className="col-span-1 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl py-2.5 transition-colors" 
              title="Ver no site"
            >
              <ExternalLink size={16} />
            </Link>
            <Link 
              href={`/admin?tab=catalogo&edit=${video.id}`} 
              className="col-span-1 flex items-center justify-center bg-white/5 hover:bg-[#D4AF37]/20 text-[#D4AF37] rounded-xl py-2.5 transition-colors" 
              title="Editar"
            >
              <Edit3 size={16} />
            </Link>
            <form action={toggleVideoAtivo.bind(null, video.id, video.ativo)} className="col-span-1">
              <button 
                type="submit" 
                className={`w-full flex items-center justify-center rounded-xl py-2.5 transition-colors ${video.ativo ? 'bg-white/5 hover:bg-white/10 text-white/70' : 'bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981]'}`} 
                title={video.ativo ? 'Ocultar' : 'Publicar'}
              >
                {video.ativo ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </form>
            <form action={deletarVideo.bind(null, video.id)} className="col-span-1">
              <button 
                type="submit" 
                className="w-full flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl py-2.5 transition-colors" 
                title="Deletar"
              >
                <Trash2 size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  const nomesTemporadas = Object.keys(temporadas).sort()

  return (
    <div className="space-y-12">
      {/* SEÇÃO TEMPORADAS (SÉRIES) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
            <Tv2 size={16} className="text-[#D4AF37]" />
          </div>
          <div>
            <h3 className="text-white text-xl font-bold tracking-tight">Séries e Temporadas</h3>
            <p className="text-white/40 text-xs">Vídeos organizados em ordem de episódios por temporada.</p>
          </div>
        </div>

        {nomesTemporadas.length === 0 ? (
          <div className="text-white/20 text-sm text-center py-8 border border-white/5 rounded-2xl bg-white/[0.01]">
            Nenhuma temporada ou série cadastrada no momento.
          </div>
        ) : (
          <div className="space-y-4">
            {nomesTemporadas.map(nomeTemp => {
              const eps = temporadas[nomeTemp]
              const estaAberta = !!temporadasAbertas[nomeTemp]

              return (
                <div 
                  key={nomeTemp} 
                  className="bg-[#111827] border border-white/5 rounded-3xl overflow-hidden shadow-lg transition-all"
                >
                  {/* Cabeçalho do Accordion */}
                  <button
                    type="button"
                    onClick={() => toggleTemporada(nomeTemp)}
                    className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${estaAberta ? 'bg-[#D4AF37] text-black' : 'bg-white/5 text-white/70'}`}>
                        <Tv2 size={18} />
                      </div>
                      <div>
                        <h4 className="text-white font-extrabold text-base tracking-wide">{nomeTemp}</h4>
                        <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mt-0.5">
                          {eps.length} {eps.length === 1 ? 'episódio' : 'episódios'}
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50 group-hover:text-white hover:bg-white/10 transition-all">
                      {estaAberta ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {/* Lista de episódios colapsável */}
                  {estaAberta && (
                    <div className="border-t border-white/5 p-6 bg-black/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {eps.map(ep => renderCardVideo(ep))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SEÇÃO VÍDEOS AVULSOS */}
      <div className="space-y-6 pt-6 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Film size={16} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-white text-xl font-bold tracking-tight">Vídeos Avulsos</h3>
            <p className="text-white/40 text-xs">Vídeos gerais e avulsos que não pertencem a séries ou temporadas.</p>
          </div>
        </div>

        {videosAvulsos.length === 0 ? (
          <div className="text-white/20 text-sm text-center py-8 border border-white/5 rounded-2xl bg-white/[0.01]">
            Nenhum vídeo avulso no catálogo.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videosAvulsos.map(video => renderCardVideo(video))}
          </div>
        )}
      </div>
    </div>
  )
}
