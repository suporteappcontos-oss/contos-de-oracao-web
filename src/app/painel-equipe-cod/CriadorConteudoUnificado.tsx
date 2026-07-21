'use client'

import React, { useState, useTransition, useRef, useEffect } from 'react'

// Keyframes para animação ao trocar de tipo
const ANIM_STYLE = `
  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .admin-form-anim { animation: fadeSlideIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
`
import { 
  Plus, Tv2, BookOpen, Gamepad2, Pencil, 
  Library, ImageIcon, FileText, Loader2, 
  CheckCircle2, Video, X, Tag, BookMarked, Music
} from 'lucide-react'
import SubmitButton from '@/components/SubmitButton'
import { adicionarVideo, publicarMaterial, adicionarVideoTematico, publicarRevista } from './actions'
import { convertToWebP } from '@/utils/imageUtils'
import { GtaRadialMenu } from './GtaRadialMenu'
import { ModalSerie } from './ModalSerie'

// SVG do Instagram (lucide-react desta versão não tem o ícone)
function IgIcon({ size = 14 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

const PLANOS_DISPONIVEIS = ['Básico', 'Essencial', 'Pro']
const CATEGORIAS_MATERIAIS = [
  { value: 'hq',      label: 'HQ (História em Quadrinhos)', icon: BookOpen, color: '#D4AF37' },
  { value: 'jogo',    label: 'Jogo Educativo',              icon: Gamepad2, color: '#10b981' },
  { value: 'desenho', label: 'Desenho para Colorir',        icon: Pencil,   color: '#818cf8' },
  { value: 'livro',   label: 'Livro Digital',               icon: Library,  color: '#f97316' },
  { value: 'adesivo', label: 'Adesivos',                    icon: Tag,      color: '#ec4899' },
]

const BUNNY_STORAGE_KEY = '0109d994-0c03-4a29-a9e89c3a3287-5e82-4d9c'
const BUNNY_STORAGE_URL = 'https://br.storage.bunnycdn.com/contos-midia-app'
const BUNNY_CDN_URL = 'https://contos-midia-app.b-cdn.net'

const inputCls = 'w-full bg-[#0f171e] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm'
const labelCls = 'block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold'

type Props = {
  temporadasExistentes?: string[]
  seriesExistentes?: { id: string; titulo: string; descricao?: string | null; capa_url?: string | null }[]
}

async function uploadParaBunny(
  file: File,
  path: string,
  onProgress: (pct: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', `${BUNNY_STORAGE_URL}/${path}`, true)
    xhr.setRequestHeader('AccessKey', BUNNY_STORAGE_KEY)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
    }

    xhr.onload = () => {
      if (xhr.status === 201 || xhr.status === 200) {
        resolve(`${BUNNY_CDN_URL}/${path}`)
      } else {
        reject(new Error(`Bunny respondeu ${xhr.status}: ${xhr.responseText}`))
      }
    }
    xhr.onerror = () => reject(new Error('Falha de rede ao enviar para o Bunny.'))
    xhr.send(file)
  })
}

function gerarSlug(titulo: string) {
  return titulo
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-')
}

const TIPO_CONFIG: any = {
  video:     { border: '#D4AF37',  glow: 'rgba(212,175,55,0.15)',  label: 'Série' },
  material:  { border: '#10b981',  glow: 'rgba(16,185,129,0.15)',  label: 'Material Didático' },
  instagram: { border: '#E1306C',  glow: 'rgba(225,48,108,0.15)',  label: 'Instagram' },
  revista:   { border: '#10b981',  glow: 'rgba(16,185,129,0.15)', label: 'Revista' },
  add_episodio: { border: '#10b981', glow: 'rgba(16,185,129,0.15)', label: 'Adicionar Episódio' },
  clipe:      { border: '#3b82f6',  glow: 'rgba(59,130,246,0.15)',  label: 'Vídeo Clipe' },
}

export default function CriadorConteudoUnificado({ temporadasExistentes = [], seriesExistentes = [] }: Props) {
  const seriesParaExibir = Array.from(
    new Set([
      ...(seriesExistentes?.map(s => s.titulo) || []),
      ...temporadasExistentes
    ])
  ).filter(Boolean) as string[]

  const [isExpanded, setIsExpanded] = useState(false)
  const [tipoCriacao, setTipoCriacao] = useState<'video' | 'material' | 'instagram' | 'revista' | 'add_episodio' | 'clipe' | null>(null)
  const [isModalSerieOpen, setIsModalSerieOpen] = useState(false)

  const handleRadialMenuSelect = (tipo: 'video' | 'material' | 'revista' | 'instagram' | 'nova_serie' | 'add_episodio' | 'clipe') => {
    if (tipo === 'nova_serie') {
      setIsModalSerieOpen(true)
      setIsExpanded(false)
      setTipoCriacao(null)
    } else if (tipo === 'clipe') {
      setTipoCriacao('video')
      setVideoCategoria('Vídeo Clipe')
      setIsExpanded(false)
    } else {
      setTipoCriacao(tipo as any)
      if (tipo === 'video') {
         setVideoCategoria('Geral')
      }
      setIsExpanded(false)
    }
  }

  // --- Estados do Formulário de Vídeo ---
  const [emBreve, setEmBreve] = useState(false)
  const [videoCategoria, setVideoCategoria] = useState('Geral')
  const [modoTemporada, setModoTemporada] = useState<'existente' | 'nova'>(
    seriesParaExibir.length > 0 ? 'existente' : 'nova'
  )
  const [temporadaSelecionada, setTemporadaSelecionada] = useState(
    seriesParaExibir[0] || ''
  )
  const [novaTemporada, setNovaTemporada] = useState('')

  const [modoSubTemporada, setModoSubTemporada] = useState<'existente' | 'nova'>('nova')
  const [subTemporadaSelecionada, setSubTemporadaSelecionada] = useState('')
  const [novaSubTemporada, setNovaSubTemporada] = useState('Temporada 1')

  const subTemporadasDaSerie = Array.from(
    new Set(
      temporadasExistentes
        .filter(t => t && t.split(' | ')[0] === temporadaSelecionada)
        .map(t => t.split(' | ')[1])
        .filter(Boolean)
    )
  ) as string[]

  useEffect(() => {
    if (subTemporadasDaSerie.length > 0) {
      setModoSubTemporada('existente')
      setSubTemporadaSelecionada(subTemporadasDaSerie[0])
    } else {
      setModoSubTemporada('nova')
      setNovaSubTemporada('Temporada 1')
    }
  }, [temporadaSelecionada])

  const [duracao, setDuracao] = useState('')
  const [uploadVideoProgresso, setUploadVideoProgresso] = useState<number | null>(null)
  const [bunnyVideoId, setBunnyVideoId] = useState('')
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [erroUploadVideo, setErroUploadVideo] = useState('')
  const videoInputRef = useRef<HTMLInputElement>(null)

  const [capaPreview, setCapaPreview] = useState<string | null>(null)
  const [capaUrl, setCapaUrl] = useState('')
  const [uploadCapaProgresso, setUploadCapaProgresso] = useState<number | null>(null)
  const [isUploadingCapa, setIsUploadingCapa] = useState(false)
  const [erroUploadCapa, setErroUploadCapa] = useState('')
  const capaInputRef = useRef<HTMLInputElement>(null)

  const [planosPermitidosVideo, setPlanosPermitidosVideo] = useState<string[]>(['Básico', 'Essencial', 'Pro'])

  const handleVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingVideo(true)
    setUploadVideoProgresso(0)
    setErroUploadVideo('')

    try {
      const vid = document.createElement('video')
      vid.preload = 'metadata'
      vid.src = URL.createObjectURL(file)
      vid.onloadedmetadata = () => {
        URL.revokeObjectURL(vid.src)
        const sec = Math.round(vid.duration)
        const m = Math.floor(sec / 60)
        const s = sec % 60
        setDuracao(`${m}:${s.toString().padStart(2, '0')}`)
      }

      const slug = gerarSlug(file.name.replace(/\.[^/.]+$/, ''))
      const ext = file.name.split('.').pop() || 'mp4'
      const path = `videos/${slug}-${Date.now()}.${ext}`

      const cdnUrl = await uploadParaBunny(file, path, (pct) => setUploadVideoProgresso(pct))
      const vidIdExt = cdnUrl.split('/').pop() || ''
      setBunnyVideoId(vidIdExt)
    } catch (err: any) {
      console.error(err)
      setErroUploadVideo(err.message || 'Erro ao enviar vídeo para o Bunny')
    } finally {
      setIsUploadingVideo(false)
      setUploadVideoProgresso(null)
    }
  }

  const handleCapaFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingCapa(true)
    setUploadCapaProgresso(0)
    setErroUploadCapa('')

    try {
      const webpFile = await convertToWebP(file, 0.85)
      setCapaPreview(URL.createObjectURL(webpFile))
      const slug = gerarSlug(file.name.replace(/\.[^/.]+$/, ''))
      const path = `capas/${slug}-${Date.now()}.webp`
      const url = await uploadParaBunny(webpFile, path, (pct) => setUploadCapaProgresso(pct))
      setCapaUrl(url)
    } catch (err: any) {
      console.error(err)
      setErroUploadCapa(err.message || 'Erro ao enviar imagem de capa')
    } finally {
      setIsUploadingCapa(false)
      setUploadCapaProgresso(null)
    }
  }

  const togglePlanoVideo = (p: string) => {
    setPlanosPermitidosVideo(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    )
  }

  // --- Estados do Formulário de Material ---
  const [materialCategoria, setMaterialCategoria] = useState('hq')
  const [materialCapaUrl, setMaterialCapaUrl] = useState('')
  const [materialPdfUrl, setMaterialPdfUrl] = useState('')
  const [materialCapaPreview, setMaterialCapaPreview] = useState<string | null>(null)

  const [isUploadingMatCapa, setIsUploadingMatCapa] = useState(false)
  const [progressoMatCapa, setProgressoMatCapa] = useState<number | null>(null)
  const [isUploadingMatPdf, setIsUploadingMatPdf] = useState(false)
  const [progressoMatPdf, setProgressoMatPdf] = useState<number | null>(null)

  const [planosPermitidosMat, setPlanosPermitidosMat] = useState<string[]>(['Básico', 'Essencial', 'Pro'])

  const handleMaterialCapa = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingMatCapa(true)
    setProgressoMatCapa(0)
    try {
      const webpFile = await convertToWebP(file, 0.85)
      setMaterialCapaPreview(URL.createObjectURL(webpFile))
      const slug = gerarSlug(file.name.replace(/\.[^/.]+$/, ''))
      const path = `materiais/capas/${slug}-${Date.now()}.webp`
      const url = await uploadParaBunny(webpFile, path, (pct) => setProgressoMatCapa(pct))
      setMaterialCapaUrl(url)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsUploadingMatCapa(false)
      setProgressoMatCapa(null)
    }
  }

  const handleMaterialPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingMatPdf(true)
    setProgressoMatPdf(0)
    try {
      const slug = gerarSlug(file.name.replace(/\.[^/.]+$/, ''))
      const ext = file.name.split('.').pop() || 'pdf'
      const path = `materiais/pdfs/${slug}-${Date.now()}.${ext}`
      const url = await uploadParaBunny(file, path, (pct) => setProgressoMatPdf(pct))
      setMaterialPdfUrl(url)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsUploadingMatPdf(false)
      setProgressoMatPdf(null)
    }
  }

  // --- Estados do Formulário de Instagram ---
  const [igVideoUrl, setIgVideoUrl] = useState('')
  const [isUploadingIg, setIsUploadingIg] = useState(false)
  const [progressoIg, setProgressoIg] = useState<number | null>(null)

  const handleIgVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingIg(true)
    setProgressoIg(0)
    try {
      const slug = gerarSlug(file.name.replace(/\.[^/.]+$/, ''))
      const ext = file.name.split('.').pop() || 'mp4'
      const path = `instagram/${slug}-${Date.now()}.${ext}`
      const url = await uploadParaBunny(file, path, (pct) => setProgressoIg(pct))
      setIgVideoUrl(url)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsUploadingIg(false)
      setProgressoIg(null)
    }
  }

  // --- Estados do Formulário de Revista ---
  const [revistaCapaUrl, setRevistaCapaUrl] = useState('')
  const [revistaPdfUrl, setRevistaPdfUrl] = useState('')
  const [revistaCapaPreview, setRevistaCapaPreview] = useState<string | null>(null)
  const [isUploadingRevCapa, setIsUploadingRevCapa] = useState(false)
  const [progressoRevCapa, setProgressoRevCapa] = useState<number | null>(null)
  const [isUploadingRevPdf, setIsUploadingRevPdf] = useState(false)
  const [progressoRevPdf, setProgressoRevPdf] = useState<number | null>(null)

  const handleRevistaCapa = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingRevCapa(true)
    setProgressoRevCapa(0)
    try {
      const webpFile = await convertToWebP(file, 0.85)
      setRevistaCapaPreview(URL.createObjectURL(webpFile))
      const slug = gerarSlug(file.name.replace(/\.[^/.]+$/, ''))
      const path = `revistas/capas/${slug}-${Date.now()}.webp`
      const url = await uploadParaBunny(webpFile, path, (pct) => setProgressoRevCapa(pct))
      setRevistaCapaUrl(url)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsUploadingRevCapa(false)
      setProgressoRevCapa(null)
    }
  }

  const handleRevistaPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingRevPdf(true)
    setProgressoRevPdf(0)
    try {
      const slug = gerarSlug(file.name.replace(/\.[^/.]+$/, ''))
      const ext = file.name.split('.').pop() || 'pdf'
      const path = `revistas/pdfs/${slug}-${Date.now()}.${ext}`
      const url = await uploadParaBunny(file, path, (pct) => setProgressoRevPdf(pct))
      setRevistaPdfUrl(url)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsUploadingRevPdf(false)
      setProgressoRevPdf(null)
    }
  }

  const curCfg = tipoCriacao ? TIPO_CONFIG[tipoCriacao] : null

  return (
    <div className="w-full">

      {/* ================= BOTÃO DISPARADOR DA RODA GTA ================= */}
      {!tipoCriacao && (
        <div className="flex justify-center my-6">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 rounded-full font-black text-base uppercase tracking-widest text-black transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl overflow-hidden cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #AA7C11 100%)',
              boxShadow: '0 0 40px rgba(212,175,55,0.4)',
            }}
          >
            <div className="w-9 h-9 rounded-full bg-black/15 flex items-center justify-center transition-transform group-hover:rotate-90 duration-300">
              <Plus size={22} className="text-black stroke-[3]" />
            </div>
            <span>Adicionar Novo Conteúdo</span>
          </button>
        </div>
      )}

      {/* ================= BARRA DE TIPO SELECIONADO ================= */}
      {tipoCriacao && curCfg && (
        <div className="flex items-center justify-between gap-4 mb-6 bg-[#0f171e] p-4 rounded-2xl border border-white/10 shadow-lg">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: curCfg.border, boxShadow: `0 0 10px ${curCfg.border}` }}
            />
            <span className="text-white font-extrabold text-sm uppercase tracking-wider">
              {curCfg.label}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setTipoCriacao(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white/50 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <X size={14} /> Fechar / Alterar
          </button>
        </div>
      )}

      {/* Injeção dos keyframes (só no cliente) */}
      <style dangerouslySetInnerHTML={{ __html: ANIM_STYLE }} />

      {/* ================= SELEÇÃO DE SÉRIE PARA NOVO EPISÓDIO ================= */}
      {tipoCriacao === 'add_episodio' && (
        <div key="form-add-episodio" className="admin-form-anim">
          <h2 className="text-xl font-bold text-white mb-6">Em qual série você quer adicionar este episódio?</h2>
          {seriesParaExibir.length === 0 ? (
            <div className="bg-[#1a2234] border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-white/50 mb-4">Nenhuma série existente encontrada.</p>
              <button 
                onClick={() => handleRadialMenuSelect('nova_serie')}
                className="bg-[#D4AF37] text-black px-6 py-2 rounded-full font-bold hover:brightness-110 transition-all"
              >
                Criar Nova Série
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {seriesParaExibir.map(temp => (
                <button
                  key={temp}
                  onClick={() => {
                    setVideoCategoria('Temporada')
                    setModoTemporada('existente')
                    setTemporadaSelecionada(temp)
                    setTipoCriacao('video')
                  }}
                  className="bg-[#0f171e] hover:bg-[#1a2234] border border-white/5 hover:border-[#D4AF37]/50 transition-all rounded-xl p-6 flex flex-col items-center gap-4 group"
                >
                  <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Tv2 size={28} className="text-[#D4AF37]" />
                  </div>
                  <span className="text-white font-bold text-center text-sm">{temp}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= FORMULÁRIO DE VÍDEO ================= */}
      {tipoCriacao === 'video' && (
        <div key="form-video" className="admin-form-anim">
          {videoCategoria === 'Vídeo Clipe' && (
            <div className="mb-6 pb-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Music size={20} />
              </div>
              <div>
                <h2 className="text-white font-extrabold text-lg">Adicionar Novo Vídeo Clipe</h2>
                <p className="text-white/50 text-xs">Cadastre um clipe musical ou pedagógico para a biblioteca de clipes.</p>
              </div>
            </div>
          )}

          <form action={adicionarVideo} encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8">
              <label className={labelCls}>Título *</label>
              <input name="titulo" required placeholder="Ex: A Oração que Move Montanhas" className={inputCls} />
            </div>

            <div className="md:col-span-4 flex items-end pb-3">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  id="chk_em_breve" 
                  name="em_breve" 
                  checked={emBreve} 
                  onChange={(e) => setEmBreve(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 text-[#D4AF37] focus:ring-0 bg-[#0f171e] cursor-pointer"
                />
                <span className="text-white/80 font-bold text-sm">Marcar como "Em Breve"</span>
              </label>
            </div>

            <div className="md:col-span-12">
              <label className={labelCls}>Descrição</label>
              <textarea name="descricao" rows={2} placeholder="Resumo do vídeo..." className={inputCls} />
            </div>

            <div className="md:col-span-6">
              <label className={labelCls}>Categoria *</label>
              <select 
                name="categoria" 
                value={videoCategoria} 
                onChange={(e) => setVideoCategoria(e.target.value)}
                className={inputCls}
              >
                <option value="Geral">Geral (Vídeo Avulso)</option>
                <option value="Temporada">Temporada (Faz parte de uma Série)</option>
                <option value="Vídeo Clipe">Vídeo Clipe (Musical / Pedagógico)</option>
                <option value="Infantil">Infantil</option>
                <option value="Adulto">Adulto</option>
                <option value="Documentário">Documentário</option>
                <option value="Louvor">Louvor</option>
                <option value="Sermão">Sermão</option>
                <option value="Testemunho">Testemunho</option>
              </select>
            </div>

            {/* Campos Condicionais de Temporada */}
            {videoCategoria === 'Temporada' && (
              <div className="md:col-span-12 bg-[#0f171e] border border-white/10 rounded-xl p-5 space-y-4">
                <input type="hidden" name="temporada_nome" value={
                  (modoTemporada === 'existente' ? temporadaSelecionada : novaTemporada) +
                  ' | ' +
                  (modoSubTemporada === 'existente' ? subTemporadaSelecionada : novaSubTemporada)
                } />
                
                {/* 1. SELEÇÃO DA SÉRIE PAREDE */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm font-bold">1. Selecionar Série / Coleção</span>
                    {seriesParaExibir.length > 0 && (
                      <div className="flex items-center gap-2 bg-[#1a2234] p-1 rounded-lg border border-white/10 text-xs">
                        <button
                          type="button"
                          onClick={() => setModoTemporada('existente')}
                          className={`px-3 py-1.5 transition-all ${modoTemporada === 'existente' ? 'bg-[#D4AF37] text-black font-bold rounded-md' : 'text-white/50 hover:text-white'}`}
                        >
                          Existente
                        </button>
                        <button
                          type="button"
                          onClick={() => setModoTemporada('nova')}
                          className={`px-3 py-1.5 transition-all ${modoTemporada === 'nova' ? 'bg-[#D4AF37] text-black font-bold rounded-md' : 'text-white/50 hover:text-white'}`}
                        >
                          + Nova Série
                        </button>
                      </div>
                    )}
                  </div>

                  {modoTemporada === 'existente' && seriesParaExibir.length > 0 ? (
                    <div>
                      <select 
                        value={temporadaSelecionada} 
                        onChange={(e) => setTemporadaSelecionada(e.target.value)}
                        className={inputCls}
                      >
                        {seriesParaExibir.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <input 
                        value={novaTemporada} 
                        onChange={(e) => setNovaTemporada(e.target.value)}
                        placeholder="Ex: A Turma do Francisquinho, Histórias Bíblicas..." 
                        className={inputCls} 
                      />
                    </div>
                  )}
                </div>

                {/* 2. SELEÇÃO DA SUB-TEMPORADA */}
                <div className="pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/70 text-sm font-bold">2. Selecionar Temporada</span>
                    {subTemporadasDaSerie.length > 0 && (
                      <div className="flex items-center gap-2 bg-[#1a2234] p-1 rounded-lg border border-white/10 text-xs">
                        <button
                          type="button"
                          onClick={() => setModoSubTemporada('existente')}
                          className={`px-3 py-1.5 transition-all ${modoSubTemporada === 'existente' ? 'bg-[#D4AF37] text-black font-bold rounded-md' : 'text-white/50 hover:text-white'}`}
                        >
                          Existente
                        </button>
                        <button
                          type="button"
                          onClick={() => setModoSubTemporada('nova')}
                          className={`px-3 py-1.5 transition-all ${modoSubTemporada === 'nova' ? 'bg-[#D4AF37] text-black font-bold rounded-md' : 'text-white/50 hover:text-white'}`}
                        >
                          + Nova Temporada
                        </button>
                      </div>
                    )}
                  </div>

                  {modoSubTemporada === 'existente' && subTemporadasDaSerie.length > 0 ? (
                    <div>
                      <select 
                        value={subTemporadaSelecionada} 
                        onChange={(e) => setSubTemporadaSelecionada(e.target.value)}
                        className={inputCls}
                      >
                        {subTemporadasDaSerie.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <input 
                        value={novaSubTemporada} 
                        onChange={(e) => setNovaSubTemporada(e.target.value)}
                        placeholder="Ex: Temporada 1, Temporada 2..." 
                        className={inputCls} 
                      />
                    </div>
                  )}
                </div>

                {/* 3. NÚMERO DO EPISÓDIO */}
                <div className="pt-3 border-t border-white/5">
                  <label className={labelCls}>Número do Episódio (Opcional)</label>
                  <input 
                    type="number" 
                    name="episodio_numero" 
                    placeholder="Ex: 1, 2, 3..." 
                    min="1" 
                    className={inputCls} 
                  />
                </div>
              </div>
            )}

            <div className="md:col-span-6">
              <label className={labelCls}>Enviar Arquivo de Vídeo (Bunny.net)</label>
              <input 
                type="file" 
                ref={videoInputRef} 
                accept="video/*" 
                onChange={handleVideoFile}
                disabled={isUploadingVideo} 
                className="hidden" 
              />
              <button 
                type="button" 
                onClick={() => videoInputRef.current?.click()}
                disabled={isUploadingVideo}
                className="w-full bg-[#0f171e] hover:bg-[#1a2234] border border-white/10 hover:border-[#D4AF37]/50 transition-all rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer group"
              >
                {isUploadingVideo ? (
                  <Loader2 className="animate-spin text-[#D4AF37]" size={20} />
                ) : bunnyVideoId ? (
                  <CheckCircle2 className="text-emerald-400" size={20} />
                ) : (
                  <Video size={20} className="text-[#D4AF37]" />
                )}
                <span className="text-sm font-bold text-white">
                  {isUploadingVideo ? `Enviando... ${uploadVideoProgresso}%` : bunnyVideoId ? 'Vídeo Enviado com Sucesso!' : 'Selecionar Arquivo de Vídeo'}
                </span>
              </button>
              {erroUploadVideo && <p className="text-red-400 text-xs mt-1">{erroUploadVideo}</p>}
            </div>

            <div className="md:col-span-6">
              <label className={labelCls}>Ou insira o ID do Vídeo no Bunny.net</label>
              <input 
                name="bunny_video_id" 
                value={bunnyVideoId} 
                onChange={(e) => setBunnyVideoId(e.target.value)}
                placeholder="Ex: 8a9b0c1d-..." 
                className={inputCls} 
              />
            </div>

            <div className="md:col-span-12">
              <label className={labelCls}>Imagem de Capa (WebP Otimizada)</label>
              <input type="hidden" name="thumbnail_url" value={capaUrl} />
              <input 
                type="file" 
                ref={capaInputRef} 
                accept="image/*" 
                onChange={handleCapaFile}
                disabled={isUploadingCapa} 
                className="hidden" 
              />
              <div className="flex gap-4 items-center">
                <button 
                  type="button" 
                  onClick={() => capaInputRef.current?.click()}
                  disabled={isUploadingCapa}
                  className="flex-1 bg-[#0f171e] hover:bg-[#1a2234] border border-white/10 hover:border-[#D4AF37]/50 transition-all rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer"
                >
                  {isUploadingCapa ? (
                    <Loader2 className="animate-spin text-[#D4AF37]" size={20} />
                  ) : capaUrl ? (
                    <CheckCircle2 className="text-emerald-400" size={20} />
                  ) : (
                    <ImageIcon size={20} className="text-[#D4AF37]" />
                  )}
                  <span className="text-sm font-bold text-white">
                    {isUploadingCapa ? `Otimizando... ${uploadCapaProgresso}%` : capaUrl ? 'Capa Carregada!' : 'Selecionar Imagem de Capa'}
                  </span>
                </button>

                {capaPreview && (
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0">
                    <img src={capaPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              {erroUploadCapa && <p className="text-red-400 text-xs mt-1">{erroUploadCapa}</p>}
            </div>

            <input type="hidden" name="duracao" value={duracao} />

            <div className="md:col-span-12">
              <label className={labelCls}>Planos de Acesso Permitidos</label>
              <div className="flex flex-wrap gap-3">
                {PLANOS_DISPONIVEIS.map(p => {
                  const active = planosPermitidosVideo.includes(p)
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlanoVideo(p)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        active 
                          ? 'bg-[#D4AF37] text-black border-[#D4AF37]' 
                          : 'bg-[#0f171e] text-white/50 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
              <input type="hidden" name="planos_permitidos" value={JSON.stringify(planosPermitidosVideo)} />
            </div>

            <div className="md:col-span-12 flex justify-end gap-4 pt-4 border-t border-white/5">
              <SubmitButton textLoading="Salvando...">Salvar Vídeo</SubmitButton>
            </div>
          </div>
        </form>
        </div>
      )}

      {/* ================= FORMULÁRIO DE MATERIAL DIDÁTICO ================= */}
      {tipoCriacao === 'material' && (
        <div key="form-material" className="admin-form-anim">
        <form action={publicarMaterial} encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8">
              <label className={labelCls}>Título do Material *</label>
              <input name="titulo" required placeholder="Ex: Livrinho de Orações de Santo Antônio" className={inputCls} />
            </div>

            <div className="md:col-span-4">
              <label className={labelCls}>Categoria *</label>
              <select 
                name="categoria" 
                value={materialCategoria} 
                onChange={(e) => setMaterialCategoria(e.target.value)}
                className={inputCls}
              >
                {CATEGORIAS_MATERIAIS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-12">
              <label className={labelCls}>Descrição</label>
              <textarea name="descricao" rows={2} placeholder="Conteúdo do material..." className={inputCls} />
            </div>

            <div className="md:col-span-6">
              <label className={labelCls}>Capa do Material (WebP)</label>
              <input type="hidden" name="capa_url" value={materialCapaUrl} />
              <div className="flex gap-4 items-center">
                <input 
                  type="file" 
                  id="mat_capa_file" 
                  accept="image/*" 
                  onChange={handleMaterialCapa}
                  disabled={isUploadingMatCapa}
                  className="hidden" 
                />
                <label 
                  htmlFor="mat_capa_file"
                  className="flex-1 bg-[#0f171e] hover:bg-[#1a2234] border border-white/10 hover:border-emerald-500/50 transition-all rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer"
                >
                  {isUploadingMatCapa ? (
                    <Loader2 className="animate-spin text-emerald-400" size={20} />
                  ) : materialCapaUrl ? (
                    <CheckCircle2 className="text-emerald-400" size={20} />
                  ) : (
                    <ImageIcon size={20} className="text-emerald-400" />
                  )}
                  <span className="text-sm font-bold text-white">
                    {isUploadingMatCapa ? `Enviando... ${progressoMatCapa}%` : materialCapaUrl ? 'Capa Carregada!' : 'Selecionar Capa'}
                  </span>
                </label>

                {materialCapaPreview && (
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0">
                    <img src={materialCapaPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-6">
              <label className={labelCls}>Arquivo PDF *</label>
              <input type="hidden" name="link_pdf" value={materialPdfUrl} />
              <input 
                type="file" 
                id="mat_pdf_file" 
                accept="application/pdf" 
                onChange={handleMaterialPdf}
                disabled={isUploadingMatPdf}
                className="hidden" 
              />
              <label 
                htmlFor="mat_pdf_file"
                className="w-full bg-[#0f171e] hover:bg-[#1a2234] border border-white/10 hover:border-emerald-500/50 transition-all rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer"
              >
                {isUploadingMatPdf ? (
                  <Loader2 className="animate-spin text-emerald-400" size={20} />
                ) : materialPdfUrl ? (
                  <CheckCircle2 className="text-emerald-400" size={20} />
                ) : (
                  <FileText size={20} className="text-emerald-400" />
                )}
                <span className="text-sm font-bold text-white">
                  {isUploadingMatPdf ? `Enviando PDF... ${progressoMatPdf}%` : materialPdfUrl ? 'PDF Carregado com Sucesso!' : 'Selecionar PDF'}
                </span>
              </label>
            </div>

            <div className="md:col-span-12">
              <label className={labelCls}>Planos de Acesso Permitidos</label>
              <div className="flex flex-wrap gap-3">
                {PLANOS_DISPONIVEIS.map(p => {
                  const active = planosPermitidosMat.includes(p)
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPlanosPermitidosMat(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        active 
                          ? 'bg-emerald-500 text-black border-emerald-500' 
                          : 'bg-[#0f171e] text-white/50 border-white/10 hover:border-white/30'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
              </div>
              <input type="hidden" name="planos_permitidos" value={JSON.stringify(planosPermitidosMat)} />
            </div>

            <div className="md:col-span-12 flex justify-end gap-4 pt-4 border-t border-white/5">
              <SubmitButton textLoading="Publicando...">Publicar Material</SubmitButton>
            </div>
          </div>
        </form>
        </div>
      )}

      {/* ================= FORMULÁRIO DE INSTAGRAM (REELS) ================= */}
      {tipoCriacao === 'instagram' && (
        <div key="form-instagram" className="admin-form-anim">
        <form action={adicionarVideoTematico} encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-12">
              <label className={labelCls}>Título do Vídeo Instagram *</label>
              <input name="titulo" required placeholder="Ex: Oração da Manhã #Reels" className={inputCls} />
            </div>

            <div className="md:col-span-12">
              <label className={labelCls}>Descrição / Legenda</label>
              <textarea name="descricao" rows={2} placeholder="Legenda do post..." className={inputCls} />
            </div>

            <div className="md:col-span-12">
              <label className={labelCls}>Arquivo de Vídeo Vertical (Bunny.net)</label>
              <input type="hidden" name="video_url" value={igVideoUrl} />
              <input 
                type="file" 
                id="ig_video_file" 
                accept="video/*" 
                onChange={handleIgVideoFile}
                disabled={isUploadingIg}
                className="hidden" 
              />
              <label 
                htmlFor="ig_video_file"
                className="w-full bg-[#0f171e] hover:bg-[#1a2234] border border-white/10 hover:border-pink-500/50 transition-all rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer"
              >
                {isUploadingIg ? (
                  <Loader2 className="animate-spin text-pink-500" size={20} />
                ) : igVideoUrl ? (
                  <CheckCircle2 className="text-emerald-400" size={20} />
                ) : (
                  <Video size={20} className="text-pink-500" />
                )}
                <span className="text-sm font-bold text-white">
                  {isUploadingIg ? `Enviando Vídeo... ${progressoIg}%` : igVideoUrl ? 'Vídeo Enviado com Sucesso!' : 'Selecionar Arquivo MP4 / MOV'}
                </span>
              </label>
            </div>

            <div className="md:col-span-12 flex justify-end gap-4 pt-4 border-t border-white/5">
              <SubmitButton textLoading="Publicando...">Publicar Vídeo Instagram</SubmitButton>
            </div>
          </div>
        </form>
        </div>
      )}

      {/* ================= FORMULÁRIO DE REVISTA ================= */}
      {tipoCriacao === 'revista' && (
        <div key="form-revista" className="admin-form-anim">
        <form action={publicarRevista} encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-12">
              <label className={labelCls}>Título da Revista *</label>
              <input name="titulo" required placeholder="Ex: Revista Contos de Oração - Edição 01" className={inputCls} />
            </div>

            <div className="md:col-span-12">
              <label className={labelCls}>Descrição</label>
              <textarea name="descricao" rows={2} placeholder="Resumo da edição..." className={inputCls} />
            </div>

            <div className="md:col-span-6">
              <label className={labelCls}>Capa da Revista (WebP)</label>
              <input type="hidden" name="capa_url" value={revistaCapaUrl} />
              <div className="flex gap-4 items-center">
                <input 
                  type="file" 
                  id="rev_capa_file" 
                  accept="image/*" 
                  onChange={handleRevistaCapa}
                  disabled={isUploadingRevCapa}
                  className="hidden" 
                />
                <label 
                  htmlFor="rev_capa_file"
                  className="flex-1 bg-[#0f171e] hover:bg-[#1a2234] border border-white/10 hover:border-emerald-500/50 transition-all rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer"
                >
                  {isUploadingRevCapa ? (
                    <Loader2 className="animate-spin text-emerald-400" size={20} />
                  ) : revistaCapaUrl ? (
                    <CheckCircle2 className="text-emerald-400" size={20} />
                  ) : (
                    <ImageIcon size={20} className="text-emerald-400" />
                  )}
                  <span className="text-sm font-bold text-white">
                    {isUploadingRevCapa ? `Enviando... ${progressoRevCapa}%` : revistaCapaUrl ? 'Capa Carregada!' : 'Selecionar Capa'}
                  </span>
                </label>

                {revistaCapaPreview && (
                  <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0">
                    <img src={revistaCapaPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-6">
              <label className={labelCls}>Arquivo PDF da Revista *</label>
              <input type="hidden" name="link_pdf" value={revistaPdfUrl} />
              <input 
                type="file" 
                id="rev_pdf_file" 
                accept="application/pdf" 
                onChange={handleRevistaPdf}
                disabled={isUploadingRevPdf}
                className="hidden" 
              />
              <label 
                htmlFor="rev_pdf_file"
                className="w-full bg-[#0f171e] hover:bg-[#1a2234] border border-white/10 hover:border-emerald-500/50 transition-all rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer"
              >
                {isUploadingRevPdf ? (
                  <Loader2 className="animate-spin text-emerald-400" size={20} />
                ) : revistaPdfUrl ? (
                  <CheckCircle2 className="text-emerald-400" size={20} />
                ) : (
                  <FileText size={20} className="text-emerald-400" />
                )}
                <span className="text-sm font-bold text-white">
                  {isUploadingRevPdf ? `Enviando PDF... ${progressoRevPdf}%` : revistaPdfUrl ? 'PDF Carregado com Sucesso!' : 'Selecionar PDF'}
                </span>
              </label>
            </div>

            <div className="md:col-span-12 flex justify-end gap-4 pt-4 border-t border-white/5">
              <SubmitButton textLoading="Publicando...">Publicar Revista</SubmitButton>
            </div>
          </div>
        </form>
        </div>
      )}

      {/* RODA DE OPÇÕES RADIAL GTA (MODAL) */}
      {isExpanded && (
        <GtaRadialMenu 
          onClose={() => setIsExpanded(false)} 
          onSelect={handleRadialMenuSelect} 
        />
      )}

      {/* MODAL DE CRIAÇÃO DE NOVA SÉRIE */}
      <ModalSerie isOpen={isModalSerieOpen} onClose={() => setIsModalSerieOpen(false)} />
    </div>
  )
}
