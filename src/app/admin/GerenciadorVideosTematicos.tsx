'use client'

import React, { useState } from 'react'
import { Trash2, Eye, EyeOff, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { deletarVideoTematico, toggleVideoTematicoAtivo } from './actions'

function IgIcon({ size = 14 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

type VideoTematico = {
  id: string
  titulo: string
  descricao: string | null
  video_url: string
  capa_url: string | null
  ativo: boolean
  criado_em: string
}

type Props = {
  videos: VideoTematico[]
}

export default function GerenciadorVideosTematicos({ videos = [] }: Props) {
  const [aberto, setAberto] = useState(false)

  return (
    <div className="bg-[#0f171e] border border-white/5 rounded-3xl overflow-hidden shadow-lg">
      {/* Cabeçalho colapsável */}
      <button
        type="button"
        onClick={() => setAberto(p => !p)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)' }}
          >
            <IgIcon size={18} />
          </div>
          <div>
            <h3 className="text-white text-base font-extrabold tracking-tight">
              Vídeos Temáticos — Instagram
            </h3>
            <p className="text-white/40 text-xs mt-0.5">
              {videos.length} {videos.length === 1 ? 'vídeo cadastrado' : 'vídeos cadastrados'}
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/50">
          {aberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Conteúdo expandido */}
      {aberto && (
        <div className="border-t border-white/5 p-6 bg-black/10">
          {videos.length === 0 ? (
            <div className="text-white/20 text-sm text-center py-8 border border-white/5 rounded-2xl">
              Nenhum vídeo temático cadastrado ainda.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {videos.map(video => (
                <div
                  key={video.id}
                  className={`flex flex-col bg-[#111827] rounded-2xl overflow-hidden border transition-all hover:scale-[1.02] hover:-translate-y-1 shadow-lg ${video.ativo ? 'border-white/5 hover:border-[#E1306C]/30' : 'border-red-500/20 opacity-60'}`}
                >
                  {/* Capa */}
                  <div className="relative aspect-video w-full bg-[#090B10] overflow-hidden">
                    <img
                      src={video.capa_url || '/insta.png'}
                      alt={video.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(9,11,16,0.85) 0%, transparent 60%)' }}
                    />
                    {/* Badge */}
                    <div
                      className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.55rem] font-black uppercase tracking-wider"
                      style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)', color: '#fff' }}
                    >
                      <IgIcon size={8} /> Instagram
                    </div>
                    {!video.ativo && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                        <span className="text-red-400 text-xs font-black uppercase tracking-widest">OCULTO</span>
                      </div>
                    )}
                  </div>

                  {/* Info + Botões */}
                  <div className="p-4 flex flex-col flex-1 gap-3">
                    <div>
                      <h4 className="text-white font-bold text-sm leading-tight line-clamp-2">{video.titulo}</h4>
                      <p className="text-white/40 text-xs mt-1">
                        {new Date(video.criado_em).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="mt-auto grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                      {/* Ver no site */}
                      <a
                        href="/videos-tematicos"
                        target="_blank"
                        className="flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl py-2.5 transition-colors"
                        title="Ver na página"
                      >
                        <ExternalLink size={15} />
                      </a>

                      {/* Ocultar / Publicar */}
                      <form action={async () => { await toggleVideoTematicoAtivo(video.id, !video.ativo) }}>
                        <button
                          type="submit"
                          className={`w-full flex items-center justify-center rounded-xl py-2.5 transition-colors ${video.ativo ? 'bg-white/5 hover:bg-white/10 text-white/60' : 'bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981]'}`}
                          title={video.ativo ? 'Ocultar' : 'Publicar'}
                        >
                          {video.ativo ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </form>

                      {/* Deletar */}
                      <form action={async () => { await deletarVideoTematico(video.id) }}>
                        <button
                          type="submit"
                          className="w-full flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl py-2.5 transition-colors"
                          title="Deletar"
                          onClick={e => { if (!confirm('Deletar este vídeo?')) e.preventDefault() }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
