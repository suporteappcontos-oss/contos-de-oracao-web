'use client'

import React, { useState } from 'react'
import { 
  Music, ExternalLink, Edit3, EyeOff, Eye, Trash2 
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
  editId: string | null
  editingVideo: VideoType | null
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=70'

export default function AcervoClipesAdmin({ 
  videos = [], 
  editId, 
  editingVideo 
}: Props) {
  const [editingIdState, setEditingIdState] = useState<string | null>(editId)

  // Filtra apenas vídeos que são Clipes (Vídeo Clipe, Video Clip, etc.)
  const clipes = videos.filter(v => 
    v.categoria && (
      v.categoria.toLowerCase().includes('clip') || 
      v.categoria.toLowerCase().includes('clipe')
    )
  )

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Seção de Clipes */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Music size={20} />
          </div>
          <div>
            <h2 className="text-white font-extrabold text-lg">Vídeos Clipes ({clipes.length})</h2>
            <p className="text-white/50 text-xs">Clipes musicais e pedagógicos cadastrados na plataforma.</p>
          </div>
        </div>
      </div>

      {clipes.length === 0 ? (
        <div className="bg-[#0f171e] rounded-xl border border-white/5 p-12 text-center">
          <Music size={32} className="mx-auto text-white/20 mb-3" />
          <p className="text-white/50 font-bold text-sm">Nenhum vídeo clipe cadastrado ainda.</p>
          <p className="text-white/30 text-xs mt-1">Clique em "Adicionar Novo Conteúdo" e escolha "Vídeo Clipe".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clipes.map(video => {
            const isEditingThis = editingIdState === video.id || (editingVideo && editingVideo.id === video.id)

            if (isEditingThis) {
              return (
                <div key={video.id} className="col-span-full bg-[#0f171e] p-6 rounded-2xl border border-blue-500/40">
                  <FormEditarVideo
                    video={editingVideo || video}
                    onCancel={() => setEditingIdState(null)}
                  />
                </div>
              )
            }

            return (
              <div 
                key={video.id}
                className="bg-[#0f171e] border border-white/5 hover:border-blue-500/30 rounded-xl p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="relative aspect-video rounded-lg overflow-hidden mb-3 bg-black">
                    <img 
                      src={video.thumbnail_url || FALLBACK_IMAGE} 
                      alt={video.titulo}
                      className="w-full h-full object-cover"
                    />
                    {!video.ativo && (
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-red-400 font-bold text-xs uppercase tracking-wider">Inativo</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-white font-bold text-sm line-clamp-1 mb-1">{video.titulo}</h3>
                  {video.descricao && (
                    <p className="text-white/50 text-xs line-clamp-2 mb-3">{video.descricao}</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-blue-400 text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    Vídeo Clipe
                  </span>

                  <div className="flex items-center gap-1">
                    <form action={toggleVideoAtivo.bind(null, video.id, video.ativo)}>
                      <button 
                        type="submit" 
                        title={video.ativo ? 'Ocultar clipe' : 'Exibir clipe'} 
                        className={`p-1.5 rounded-lg transition-all ${video.ativo ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-amber-400 hover:bg-amber-400/10'}`}
                      >
                        {video.ativo ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </form>

                    <button 
                      onClick={() => setEditingIdState(video.id)}
                      title="Editar clipe" 
                      className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    >
                      <Edit3 size={16} />
                    </button>

                    <form action={deletarVideo.bind(null, video.id)}>
                      <button 
                        type="submit" 
                        title="Deletar clipe" 
                        className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        onClick={(e) => {
                          if (!confirm(`Excluir o clipe "${video.titulo}"?`)) e.preventDefault()
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
