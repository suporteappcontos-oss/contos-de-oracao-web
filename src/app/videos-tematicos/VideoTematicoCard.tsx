'use client'

import { useState } from 'react'
import { X, Download, Play } from 'lucide-react'

function IgIcon({ size = 10 }: { size?: number }) {
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
  criado_em: string
}

// Extrai o videoId do embed URL: .../embed/678138/VIDEO_ID
function extrairVideoId(embedUrl: string): string | null {
  const partes = embedUrl.split('/')
  return partes[partes.length - 1] || null
}

// Constrói URL de download/play direto (com direct play ativo no Bunny)
function construirDownloadUrl(embedUrl: string): string {
  return embedUrl.replace('/embed/', '/play/')
}

export default function VideoTematicoCard({ video }: { video: VideoTematico }) {
  const [modalAberto, setModalAberto] = useState(false)
  const downloadUrl = construirDownloadUrl(video.video_url)
  const capaUrl = video.capa_url || '/insta.png'

  return (
    <>
      {/* ── Card ── */}
      <div
        className="group flex flex-col rounded-[20px] overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl"
        style={{ background: 'rgba(15,22,35,0.9)', border: '1px solid rgba(225,48,108,0.2)' }}
      >
        {/* Capa — formato 9:16 portrait */}
        <div
          className="relative w-full overflow-hidden cursor-pointer"
          style={{ aspectRatio: '9/16' }}
          onClick={() => setModalAberto(true)}
        >
          <img
            src={capaUrl}
            alt={video.titulo}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Gradiente escuro no bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Badge Instagram */}
          <div
            className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-wider z-10"
            style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)', color: '#fff' }}
          >
            <IgIcon size={10} /> Instagram
          </div>

          {/* Ícone play no centro ao hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
              style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C)', boxShadow: '0 0 30px rgba(225,48,108,0.6)' }}
            >
              <Play size={22} fill="white" className="text-white ml-1" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3 p-5 flex-1">
          <h3 className="text-white font-extrabold text-base leading-tight">
            {video.titulo}
          </h3>

          {video.descricao && (
            <p className="text-white/55 text-xs leading-relaxed line-clamp-2">{video.descricao}</p>
          )}

          {/* Botões lado a lado */}
          <div className="mt-auto flex gap-2">
            {/* Assistir */}
            <button
              onClick={() => setModalAberto(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all hover:scale-[1.03] hover:brightness-110"
              style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)', color: '#fff', boxShadow: '0 4px 20px rgba(225,48,108,0.3)' }}
            >
              <Play size={13} fill="white" />
              Assistir
            </button>

            {/* Baixar — usa rota interna que força download direto */}
            <a
              href={`/api/download-video?videoId=${extrairVideoId(video.video_url)}`}
              download
              title="Baixar vídeo"
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-xs font-black transition-all hover:scale-[1.03]"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            >
              <Download size={14} />
              Baixar
            </a>
          </div>
        </div>
      </div>

      {/* ── Modal Player ── */}
      {modalAberto && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setModalAberto(false) }}
        >
          <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl"
            style={{ border: '1px solid rgba(225,48,108,0.3)' }}
          >
            {/* Botão fechar */}
            <button
              onClick={() => setModalAberto(false)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <X size={16} className="text-white" />
            </button>

            {/* Título no topo */}
            <div className="absolute top-3 left-4 z-10 flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-wider"
                style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)', color: '#fff' }}
              >
                <IgIcon size={9} /> Instagram
              </div>
              <span className="text-white/80 text-xs font-bold hidden sm:block">{video.titulo}</span>
            </div>

          {/* iframe em portrait 9:16 dentro do modal */}
          <div className="relative w-full max-h-[85vh]" style={{ aspectRatio: '9/16' }}>
            <iframe
              src={`${video.video_url}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen"
              allowFullScreen
            />
          </div>
          </div>
        </div>
      )}
    </>
  )
}
