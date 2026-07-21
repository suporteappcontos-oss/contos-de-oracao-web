'use client'

import React, { useState, useRef, useEffect } from 'react'

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
  CheckCircle2, Video, X, Tag, BookMarked, Music, Tv
} from 'lucide-react'

function cleanUrlInput(val: string): string {
  return val.trim().replace(/[<>"'\s]/g, '')
}

function sanitizeUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim().replace(/[<>"'\s]/g, '')
  if (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/')
  ) {
    try {
      return encodeURI(trimmed)
    } catch {
      return trimmed
    }
  }
  return null
}

import SubmitButton from '@/components/SubmitButton'
import { adicionarVideo, publicarMaterial, adicionarVideoTematico, publicarRevista } from './actions'
import { convertToWebP } from '@/utils/imageUtils'
import { GtaRadialMenu } from './GtaRadialMenu'
import { ModalSerie } from './ModalSerie'

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
  video:          { border: '#D4AF37',  glow: 'rgba(212,175,55,0.15)',  label: 'Série / Episódio' },
  material:       { border: '#10b981',  glow: 'rgba(16,185,129,0.15)',  label: 'Material Didático' },
  instagram:      { border: '#E1306C',  glow: 'rgba(225,48,108,0.15)',  label: 'Instagram (Reels)' },
  revista:        { border: '#10b981',  glow: 'rgba(16,185,129,0.15)', label: 'Revista' },
  add_episodio:   { border: '#10b981',  glow: 'rgba(16,185,129,0.15)', label: 'Adicionar Episódio' },
  nova_temporada: { border: '#FFD700',  glow: 'rgba(255,215,0,0.15)',  label: 'Criar Nova Temporada' },
  clipe:           { border: '#3b82f6',  glow: 'rgba(59,130,246,0.15)',  label: 'Vídeo Clipe' },
}

export default function CriadorConteudoUnificado({ temporadasExistentes = [], seriesExistentes = [] }: Props) {
  const seriesMap = new Map<string, { titulo: string; capa_url?: string | null }>()

  seriesExistentes.forEach(s => {
    if (s.titulo) {
      seriesMap.set(s.titulo, { titulo: s.titulo, capa_url: s.capa_url })
    }
  })

  temporadasExistentes.forEach(t => {
    const nomeSerie = t ? (t.split(' | ')[0] || t) : ''
    if (nomeSerie && !seriesMap.has(nomeSerie)) {
      seriesMap.set(nomeSerie, { titulo: nomeSerie, capa_url: null })
    }
  })

  const listaSeries = Array.from(seriesMap.values())
  const seriesParaExibir = listaSeries.map(s => s.titulo)

  const [isExpanded, setIsExpanded] = useState(false)
  const [tipoCriacao, setTipoCriacao] = useState<'video' | 'material' | 'instagram' | 'revista' | 'add_episodio' | 'nova_temporada' | 'clipe' | null>(null)
  const [isModalSerieOpen, setIsModalSerieOpen] = useState(false)

  // Estado para fluxo de Nova Temporada
  const [serieTemporadaSelecionada, setSerieTemporadaSelecionada] = useState('')
  const [nomeNovaTemporadaForm, setNomeNovaTemporadaForm] = useState('')
  const [capaTemporadaUrl, setCapaTemporadaUrl] = useState('')
  const [capaTemporadaPreview, setCapaTemporadaPreview] = useState<string | null>(null)
  const [isUploadingTempCapa, setIsUploadingTempCapa] = useState(false)
  const [progressoTempCapa, setProgressoTempCapa] = useState<number | null>(null)
  const capaTempInputRef = useRef<HTMLInputElement>(null)

  const handleRadialMenuSelect = (tipo: 'video' | 'material' | 'revista' | 'instagram' | 'nova_serie' | 'nova_temporada' | 'add_episodio' | 'clipe') => {
    if (tipo === 'nova_serie') {
      setIsModalSerieOpen(true)
      setIsExpanded(false)
      setTipoCriacao(null)
    } else if (tipo === 'clipe') {
      setTipoCriacao('video')
      setVideoCategoria('Vídeo Clipe')
      setIsExpanded(false)
    } else if (tipo === 'nova_temporada') {
      setTipoCriacao('nova_temporada')
      setSerieTemporadaSelecionada('')
      setNomeNovaTemporadaForm('')
      setCapaTemporadaUrl('')
      setCapaTemporadaPreview(null)
      setIsExpanded(false)
    } else {
      setTipoCriacao(tipo as any)
      if (tipo === 'video') {
         setVideoCategoria('Geral')
      }
      setIsExpanded(false)
    }
  }

  const handleCapaTemporadaFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingTempCapa(true)
    setProgressoTempCapa(0)
    try {
      const webpFile = await convertToWebP(file, 0.85)
      setCapaTemporadaPreview(URL.createObjectURL(webpFile))
      const slug = gerarSlug(file.name.replace(/\.[^/.]+$/, ''))
      const path = `temporadas/capas/${slug}-${Date.now()}.webp`
      const url = await uploadParaBunny(webpFile, path, (pct) => setProgressoTempCapa(pct))
      setCapaTemporadaUrl(url)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsUploadingTempCapa(false)
      setProgressoTempCapa(null)
    }
  }

  // --- Estados do Formulário de Vídeo / Clipe / Episódio ---
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

  const handleVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingVideo(true)
    setUploadVideoProgresso(0)
    setErroUploadVideo('')

    try {
      const vid = document.createElement('video')
      vid.preload = 'metadata'
      const safeVidSrc = sanitizeUrl(URL.createObjectURL(file))
      if (safeVidSrc) {
        vid.setAttribute('src', safeVidSrc)
      }
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

  // --- Estados do Formulário de Material ---
  const [materialCategoria, setMaterialCategoria] = useState('hq')
  const [materialCapaUrl, setMaterialCapaUrl] = useState('')
  const [materialPdfUrl, setMaterialPdfUrl] = useState('')
  const [materialCapaPreview, setMaterialCapaPreview] = useState<string | null>(null)

  const [isUploadingMatCapa, setIsUploadingMatCapa] = useState(false)
  const [progressoMatCapa, setProgressoMatCapa] = useState<number | null>(null)
  const [isUploadingMatPdf, setIsUploadingMatPdf] = useState(false)
  const [progressoMatPdf, setProgressoMatPdf] = useState<number | null>(null)

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

  // --- Estados do Formulário de Instagram (Reels) ---
  const [igBunnyVideoId, setIgBunnyVideoId] = useState('')
  const [isUploadingIg, setIsUploadingIg] = useState(false)
  const [progressoIg, setProgressoIg] = useState<number | null>(null)
  const igVideoInputRef = useRef<HTMLInputElement>(null)

  const [igCapaUrl, setIgCapaUrl] = useState('')
  const [igCapaPreview, setIgCapaPreview] = useState<string | null>(null)
  const [isUploadingIgCapa, setIsUploadingIgCapa] = useState(false)
  const [progressoIgCapa, setProgressoIgCapa] = useState<number | null>(null)
  const igCapaInputRef = useRef<HTMLInputElement>(null)

  const handleIgVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingIg(true)
    setProgressoIg(0)
    try {
      const slug = gerarSlug(file.name.replace(/\.[^/.]+$/, ''))
      const ext = file.name.split('.').pop() || 'mp4'
      const path = `instagram/${slug}-${Date.now()}.${ext}`
      const cdnUrl = await uploadParaBunny(file, path, (pct) => setProgressoIg(pct))
      const vidIdExt = cdnUrl.split('/').pop() || ''
      setIgBunnyVideoId(vidIdExt)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsUploadingIg(false)
      setProgressoIg(null)
    }
  }

  const handleIgCapaFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingIgCapa(true)
    setProgressoIgCapa(0)
    try {
      const webpFile = await convertToWebP(file, 0.85)
      setIgCapaPreview(URL.createObjectURL(webpFile))
      const slug = gerarSlug(file.name.replace(/\.[^/.]+$/, ''))
      const path = `instagram/capas/${slug}-${Date.now()}.webp`
      const url = await uploadParaBunny(webpFile, path, (pct) => setProgressoIgCapa(pct))
      setIgCapaUrl(url)
    } catch (err: any) {
      console.error(err)
    } finally {
      setIsUploadingIgCapa(false)
      setProgressoIgCapa(null)
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

      {/* ================= FLUXO DE CRIAR NOVA TEMPORADA ================= */}
      {tipoCriacao === 'nova_temporada' && (
        <div key="form-nova-temporada" className="admin-form-anim">
          {!serieTemporadaSelecionada ? (
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Em qual série você quer criar a nova temporada?</h2>
              <p className="text-white/50 text-xs mb-6">Selecione uma das séries abaixo para adicionar a temporada com sua capa personalizada.</p>
              
              {listaSeries.length === 0 ? (
                <div className="bg-[#1a2234] border border-white/10 rounded-2xl p-8 text-center">
                  <p className="text-white/50 mb-4">Nenhuma série cadastrada ainda.</p>
                  <button 
                    onClick={() => handleRadialMenuSelect('nova_serie')}
                    className="bg-[#D4AF37] text-black px-6 py-2 rounded-full font-bold hover:brightness-110 transition-all cursor-pointer"
                  >
                    Criar Primeira Série
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {listaSeries.map(s => {
                    const fallbackImage = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80'
                    const capaUrl = s.capa_url || fallbackImage

                    return (
                      <button
                        key={s.titulo}
                        type="button"
                        onClick={() => setSerieTemporadaSelecionada(s.titulo)}
                        className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#0f171e] border border-white/10 hover:border-[#FFD700] transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 shadow-xl cursor-pointer text-left"
                      >
                        {/* Imagem de Capa do Card da Série */}
                        <div className="relative aspect-video w-full overflow-hidden bg-black">
                          <img
                            src={capaUrl}
                            alt={s.titulo}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-transparent to-black/30" />
                          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md border border-[#FFD700]/40 text-[#FFD700] text-[0.65rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                            <Tv size={11} />
                            Série
                          </div>
                        </div>

                        {/* Nome da Série */}
                        <div className="p-3.5 flex flex-col justify-between flex-grow bg-[#0f171e]">
                          <h3 className="text-white font-extrabold text-sm line-clamp-1 group-hover:text-[#FFD700] transition-colors">
                            {s.titulo}
                          </h3>
                          <span className="text-[#FFD700]/70 text-[0.7rem] font-bold mt-1 flex items-center gap-1">
                            Selecionar Série &rarr;
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ) : (
            <form action={async (formData) => { await adicionarVideo(formData) }} encType="multipart/form-data">
              <div className="bg-[#0f171e] border border-[#FFD700]/30 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <span className="text-[#FFD700] text-xs font-extrabold uppercase tracking-wider">Série Selecionada</span>
                    <h3 className="text-white font-black text-xl">{serieTemporadaSelecionada}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSerieTemporadaSelecionada('')}
                    className="text-xs text-white/50 hover:text-white underline cursor-pointer"
                  >
                    Trocar Série
                  </button>
                </div>

                {/* Campos Ocultos para Registrar no Supabase */}
                <input type="hidden" name="titulo" value={nomeNovaTemporadaForm || 'Nova Temporada'} />
                <input type="hidden" name="categoria" value="Temporada" />
                <input type="hidden" name="temporada_nome" value={`${serieTemporadaSelecionada} | ${nomeNovaTemporadaForm}`} />
                <input type="hidden" name="em_breve" value="true" />
                <input type="hidden" name="planos_permitidos" value={JSON.stringify(['Básico', 'Essencial', 'Pro'])} />

                <div>
                  <label className={labelCls}>Nome da Temporada *</label>
                  <input 
                    required
                    value={nomeNovaTemporadaForm}
                    onChange={(e) => setNomeNovaTemporadaForm(e.target.value)}
                    placeholder="Ex: Temporada 1, Temporada 2, Histórias de Moisés..." 
                    className={inputCls} 
                  />
                </div>

                {/* CAPA DA TEMPORADA */}
                <div>
                  <label className={labelCls}>Imagem do Card da Temporada (WebP Otimizada ou URL) *</label>
                  <input 
                    type="file" 
                    ref={capaTempInputRef} 
                    accept="image/*" 
                    onChange={handleCapaTemporadaFile}
                    disabled={isUploadingTempCapa} 
                    className="hidden" 
                  />
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-6 flex gap-4 items-center">
                      <button 
                        type="button" 
                        onClick={() => capaTempInputRef.current?.click()}
                        disabled={isUploadingTempCapa}
                        className="flex-1 bg-[#111827] hover:bg-[#1a2234] border border-white/10 hover:border-[#FFD700]/50 transition-all rounded-xl p-3.5 flex items-center justify-center gap-3 cursor-pointer"
                      >
                        {isUploadingTempCapa ? (
                          <Loader2 className="animate-spin text-[#FFD700]" size={20} />
                        ) : capaTemporadaUrl ? (
                          <CheckCircle2 className="text-emerald-400" size={20} />
                        ) : (
                          <ImageIcon size={20} className="text-[#FFD700]" />
                        )}
                        <span className="text-sm font-bold text-white">
                          {isUploadingTempCapa ? `Enviando... ${progressoTempCapa}%` : capaTemporadaUrl ? 'Capa Carregada!' : 'Selecionar Capa do Card'}
                        </span>
                      </button>

                      {(() => {
                        const safeCapa = sanitizeUrl(capaTemporadaPreview || capaTemporadaUrl)
                        return safeCapa ? (
                          <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black">
                            <img src={safeCapa} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        ) : null
                      })()}
                    </div>

                    <div className="md:col-span-6">
                      <input 
                        name="thumbnail_url" 
                        required
                        value={capaTemporadaUrl} 
                        onChange={(e) => {
                          const val = cleanUrlInput(e.target.value)
                          setCapaTemporadaUrl(val)
                          setCapaTemporadaPreview(val)
                        }}
                        placeholder="Ou cole a URL da capa aqui..." 
                        className={inputCls} 
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                  <SubmitButton textLoading="Criando Temporada...">Criar Temporada</SubmitButton>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ================= SELEÇÃO DE SÉRIE PARA NOVO EPISÓDIO ================= */}
      {tipoCriacao === 'add_episodio' && (
        <div key="form-add-episodio" className="admin-form-anim">
          <h2 className="text-xl font-bold text-white mb-6">Em qual série você quer adicionar este episódio?</h2>
          {listaSeries.length === 0 ? (
            <div className="bg-[#1a2234] border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-white/50 mb-4">Nenhuma série existente encontrada.</p>
              <button 
                onClick={() => handleRadialMenuSelect('nova_serie')}
                className="bg-[#D4AF37] text-black px-6 py-2 rounded-full font-bold hover:brightness-110 transition-all cursor-pointer"
              >
                Criar Nova Série
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
              {listaSeries.map(s => {
                const fallbackImage = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80'
                const capaUrl = s.capa_url || fallbackImage

                return (
                  <button
                    key={s.titulo}
                    type="button"
                    onClick={() => {
                      setVideoCategoria('Temporada')
                      setModoTemporada('existente')
                      setTemporadaSelecionada(s.titulo)
                      setTipoCriacao('video')
                    }}
                    className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#0f171e] border border-white/10 hover:border-[#D4AF37] transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 shadow-xl cursor-pointer text-left"
                  >
                    {/* Imagem de Capa do Card da Série */}
                    <div className="relative aspect-video w-full overflow-hidden bg-black">
                      <img
                        src={capaUrl}
                        alt={s.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-transparent to-black/30" />
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37] text-[0.65rem] font-black uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <Tv2 size={11} />
                        Série
                      </div>
                    </div>

                    {/* Nome da Série */}
                    <div className="p-3.5 flex flex-col justify-between flex-grow bg-[#0f171e]">
                      <h3 className="text-white font-extrabold text-sm line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                        {s.titulo}
                      </h3>
                      <span className="text-[#D4AF37]/70 text-[0.7rem] font-bold mt-1 flex items-center gap-1">
                        Adicionar Episódio &rarr;
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= FORMULÁRIO DE VÍDEO (SÉRIE / EPISÓDIO / CLIPE) ================= */}
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

          {videoCategoria === 'Temporada' && (
            <div className="mb-6 pb-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Tv2 size={20} />
              </div>
              <div>
                <h2 className="text-white font-extrabold text-lg">Adicionar Novo Episódio de Série</h2>
                <p className="text-white/50 text-xs">Cadastre um episódio vinculado a uma série e temporada existente.</p>
              </div>
            </div>
          )}

          <form action={async (formData) => { await adicionarVideo(formData) }} encType="multipart/form-data">
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
                <option value="Temporada">Episódio / Temporada (Faz parte de uma Série)</option>
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

            {/* SEÇÃO DE VÍDEO (UPLOAD OU DIGITAÇÃO DE ID BUNNY) */}
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
              <label className={labelCls}>Ou insira o ID do Vídeo no Bunny.net *</label>
              <input 
                name="bunny_video_id" 
                required
                value={bunnyVideoId} 
                onChange={(e) => setBunnyVideoId(e.target.value)}
                placeholder="Ex: 8a9b0c1d-..." 
                className={inputCls} 
              />
            </div>

            {/* SEÇÃO DE CAPA (UPLOAD OU COLAR URL) */}
            <div className="md:col-span-12">
              <label className={labelCls}>Imagem de Capa (WebP Otimizada ou URL Externa)</label>
              <input 
                type="file" 
                ref={capaInputRef} 
                accept="image/*" 
                onChange={handleCapaFile}
                disabled={isUploadingCapa} 
                className="hidden" 
              />
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-6 flex gap-4 items-center">
                  <button 
                    type="button" 
                    onClick={() => capaInputRef.current?.click()}
                    disabled={isUploadingCapa}
                    className="flex-1 bg-[#0f171e] hover:bg-[#1a2234] border border-white/10 hover:border-[#D4AF37]/50 transition-all rounded-xl p-3.5 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {isUploadingCapa ? (
                      <Loader2 className="animate-spin text-[#D4AF37]" size={20} />
                    ) : capaUrl ? (
                      <CheckCircle2 className="text-emerald-400" size={20} />
                    ) : (
                      <ImageIcon size={20} className="text-[#D4AF37]" />
                    )}
                    <span className="text-sm font-bold text-white">
                      {isUploadingCapa ? `Otimizando... ${uploadCapaProgresso}%` : capaUrl ? 'Capa Carregada!' : 'Selecionar Capa'}
                    </span>
                  </button>

                  {(() => {
                    const safeCapa = sanitizeUrl(capaPreview || capaUrl)
                    return safeCapa ? (
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black">
                        <img src={safeCapa} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : null
                  })()}
                </div>

                <div className="md:col-span-6">
                  <input 
                    name="thumbnail_url" 
                    value={capaUrl} 
                    onChange={(e) => {
                      const val = cleanUrlInput(e.target.value)
                      setCapaUrl(val)
                      setCapaPreview(val)
                    }}
                    placeholder="Ou cole a URL da capa aqui..." 
                    className={inputCls} 
                  />
                </div>
              </div>
              {erroUploadCapa && <p className="text-red-400 text-xs mt-1">{erroUploadCapa}</p>}
            </div>

            <input type="hidden" name="duracao" value={duracao} />
            <input type="hidden" name="planos_permitidos" value={JSON.stringify(['Básico', 'Essencial', 'Pro'])} />

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
        <form action={async (formData) => { await publicarMaterial(formData) }} encType="multipart/form-data">
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
              <label className={labelCls}>Capa do Material (WebP ou URL)</label>
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

                {(() => {
                  const safeCapa = sanitizeUrl(materialCapaPreview || materialCapaUrl)
                  return safeCapa ? (
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black">
                      <img src={safeCapa} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : null
                })()}
              </div>
              <input 
                name="capa_url" 
                value={materialCapaUrl} 
                onChange={(e) => {
                  const val = cleanUrlInput(e.target.value)
                  setMaterialCapaUrl(val)
                  setMaterialCapaPreview(val)
                }}
                placeholder="Ou cole a URL da capa..." 
                className={`${inputCls} mt-2`} 
              />
            </div>

            <div className="md:col-span-6">
              <label className={labelCls}>Arquivo PDF *</label>
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
                  {isUploadingMatPdf ? `Enviando PDF... ${progressoMatPdf}%` : materialPdfUrl ? 'PDF Carregado!' : 'Selecionar PDF'}
                </span>
              </label>
              <input 
                name="link_pdf" 
                required
                value={materialPdfUrl} 
                onChange={(e) => setMaterialPdfUrl(e.target.value)}
                placeholder="Ou cole a URL do PDF..." 
                className={`${inputCls} mt-2`} 
              />
            </div>

            <input type="hidden" name="planos_permitidos" value={JSON.stringify(['Básico', 'Essencial', 'Pro'])} />

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
        <form action={async (formData) => { await adicionarVideoTematico(formData) }} encType="multipart/form-data">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-12">
              <label className={labelCls}>Título do Vídeo Instagram *</label>
              <input name="titulo" required placeholder="Ex: Oração da Manhã #Reels" className={inputCls} />
            </div>

            <div className="md:col-span-12">
              <label className={labelCls}>Descrição / Legenda</label>
              <textarea name="descricao" rows={2} placeholder="Legenda do post..." className={inputCls} />
            </div>

            {/* SEÇÃO DE VÍDEO INSTAGRAM (UPLOAD OU ID BUNNY) */}
            <div className="md:col-span-6">
              <label className={labelCls}>Enviar Arquivo de Vídeo (Bunny.net)</label>
              <input 
                type="file" 
                ref={igVideoInputRef} 
                accept="video/*" 
                onChange={handleIgVideoFile}
                disabled={isUploadingIg} 
                className="hidden" 
              />
              <button 
                type="button" 
                onClick={() => igVideoInputRef.current?.click()}
                disabled={isUploadingIg}
                className="w-full bg-[#0f171e] hover:bg-[#1a2234] border border-white/10 hover:border-pink-500/50 transition-all rounded-xl p-4 flex items-center justify-center gap-3 cursor-pointer group"
              >
                {isUploadingIg ? (
                  <Loader2 className="animate-spin text-pink-500" size={20} />
                ) : igBunnyVideoId ? (
                  <CheckCircle2 className="text-emerald-400" size={20} />
                ) : (
                  <Video size={20} className="text-pink-500" />
                )}
                <span className="text-sm font-bold text-white">
                  {isUploadingIg ? `Enviando... ${progressoIg}%` : igBunnyVideoId ? 'Vídeo Enviado com Sucesso!' : 'Selecionar Arquivo de Vídeo'}
                </span>
              </button>
            </div>

            <div className="md:col-span-6">
              <label className={labelCls}>Ou insira o ID do Vídeo no Bunny.net *</label>
              <input 
                name="bunny_video_id" 
                required
                value={igBunnyVideoId} 
                onChange={(e) => setIgBunnyVideoId(e.target.value)}
                placeholder="Ex: 8a9b0c1d-..." 
                className={inputCls} 
              />
            </div>

            {/* SEÇÃO DE CAPA INSTAGRAM (UPLOAD OU COLAR URL) */}
            <div className="md:col-span-12">
              <label className={labelCls}>Imagem de Capa (WebP Otimizada ou URL Externa)</label>
              <input 
                type="file" 
                ref={igCapaInputRef} 
                accept="image/*" 
                onChange={handleIgCapaFile}
                disabled={isUploadingIgCapa} 
                className="hidden" 
              />
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-6 flex gap-4 items-center">
                  <button 
                    type="button" 
                    onClick={() => igCapaInputRef.current?.click()}
                    disabled={isUploadingIgCapa}
                    className="flex-1 bg-[#0f171e] hover:bg-[#1a2234] border border-white/10 hover:border-pink-500/50 transition-all rounded-xl p-3.5 flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {isUploadingIgCapa ? (
                      <Loader2 className="animate-spin text-pink-500" size={20} />
                    ) : igCapaUrl ? (
                      <CheckCircle2 className="text-emerald-400" size={20} />
                    ) : (
                      <ImageIcon size={20} className="text-pink-500" />
                    )}
                    <span className="text-sm font-bold text-white">
                      {isUploadingIgCapa ? `Otimizando... ${progressoIgCapa}%` : igCapaUrl ? 'Capa Carregada!' : 'Selecionar Capa'}
                    </span>
                  </button>

                  {(() => {
                    const safeCapa = sanitizeUrl(igCapaPreview || igCapaUrl)
                    return safeCapa ? (
                      <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black">
                        <img src={safeCapa} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : null
                  })()}
                </div>

                <div className="md:col-span-6">
                  <input 
                    name="capa_url" 
                    value={igCapaUrl} 
                    onChange={(e) => {
                      const val = cleanUrlInput(e.target.value)
                      setIgCapaUrl(val)
                      setIgCapaPreview(val)
                    }}
                    placeholder="Ou cole a URL da capa aqui..." 
                    className={inputCls} 
                  />
                </div>
              </div>
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
        <form action={async (formData) => { await publicarRevista(formData) }} encType="multipart/form-data">
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
              <label className={labelCls}>Capa da Revista (WebP ou URL)</label>
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

                {(() => {
                  const safeCapa = sanitizeUrl(revistaCapaPreview || revistaCapaUrl)
                  return safeCapa ? (
                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/20 shrink-0 bg-black">
                      <img src={safeCapa} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : null
                })()}
              </div>
              <input 
                name="capa_url" 
                value={revistaCapaUrl} 
                onChange={(e) => {
                  const val = cleanUrlInput(e.target.value)
                  setRevistaCapaUrl(val)
                  setRevistaCapaPreview(val)
                }}
                placeholder="Ou cole a URL da capa..." 
                className={`${inputCls} mt-2`} 
              />
            </div>

            <div className="md:col-span-6">
              <label className={labelCls}>Arquivo PDF da Revista *</label>
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
                  {isUploadingRevPdf ? `Enviando PDF... ${progressoRevPdf}%` : revistaPdfUrl ? 'PDF Carregado!' : 'Selecionar PDF'}
                </span>
              </label>
              <input 
                name="link_pdf" 
                required
                value={revistaPdfUrl} 
                onChange={(e) => setRevistaPdfUrl(e.target.value)}
                placeholder="Ou cole a URL do PDF..." 
                className={`${inputCls} mt-2`} 
              />
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
