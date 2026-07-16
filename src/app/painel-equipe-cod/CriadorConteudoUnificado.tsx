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
  CheckCircle2, Video, X, Tag, BookMarked
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
  { value: 'adesivo',  label: 'Adesivos',                    icon: Tag,      color: '#ec4899' },
]

// AccessKey do Bunny — usada apenas no browser do admin para fazer upload direto
const BUNNY_STORAGE_KEY = '0109d994-0c03-4a29-a9e89c3a3287-5e82-4d9c'
const BUNNY_STORAGE_URL = 'https://br.storage.bunnycdn.com/contos-midia-app'
const BUNNY_CDN_URL = 'https://contos-midia-app.b-cdn.net'

const inputCls = 'w-full bg-[#0f171e] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm'
const labelCls = 'block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold'

type Props = {
  temporadasExistentes?: string[]
  seriesExistentes?: { id: string; titulo: string; descricao?: string | null; capa_url?: string | null }[]
}

// Upload direto browser → Bunny
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

// Cores e estilos por tipo
const TIPO_CONFIG: any = {
  video:     { border: '#D4AF37',  glow: 'rgba(212,175,55,0.15)',  label: 'Série' },
  material:  { border: '#10b981',  glow: 'rgba(16,185,129,0.15)',  label: 'Material Didático' },
  instagram: { border: '#E1306C',  glow: 'rgba(225,48,108,0.15)',  label: 'Instagram' },
  revista:   { border: '#10b981',  glow: 'rgba(16,185,129,0.15)', label: 'Revista' },
  add_episodio: { border: '#10b981', glow: 'rgba(16,185,129,0.15)', label: 'Adicionar Episódio' },
}

export default function CriadorConteudoUnificado({ temporadasExistentes = [], seriesExistentes = [] }: Props) {
  // Combina as séries cadastradas na tabela 'series' com quaisquer temporadas existentes legadas
  const seriesParaExibir = Array.from(
    new Set([
      ...(seriesExistentes?.map(s => s.titulo) || []),
      ...temporadasExistentes
    ])
  ).filter(Boolean) as string[]
  const [isExpanded, setIsExpanded] = useState(false)
  const [tipoCriacao, setTipoCriacao] = useState<'video' | 'material' | 'instagram' | 'revista' | 'add_episodio' | null>(null)
  const [isModalSerieOpen, setIsModalSerieOpen] = useState(false)

  const handleRadialMenuSelect = (tipo: 'video' | 'material' | 'revista' | 'instagram' | 'nova_serie' | 'add_episodio') => {
    if (tipo === 'nova_serie') {
      setIsModalSerieOpen(true)
      setIsExpanded(false)
      setTipoCriacao(null)
    } else {
      setTipoCriacao(tipo as any)
      if (tipo === 'video') {
         setVideoCategoria('Geral')
      }
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

  // Estados para as sub-temporadas dentro da série
  const [modoSubTemporada, setModoSubTemporada] = useState<'existente' | 'nova'>('nova')
  const [subTemporadaSelecionada, setSubTemporadaSelecionada] = useState('')
  const [novaSubTemporada, setNovaSubTemporada] = useState('Temporada 1')

  // Filtra as temporadas já cadastradas para a série selecionada
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
      setSubTemporadaSelecionada('')
      setNovaSubTemporada('Temporada 1')
    }
  }, [temporadaSelecionada])

  const subTemp = modoSubTemporada === 'existente' ? subTemporadaSelecionada : novaSubTemporada
  const temporadaNome = subTemp ? `${temporadaSelecionada} | ${subTemp}` : temporadaSelecionada


  // --- Estados do Formulário de Material ---
  const [isPending, startTransition] = useTransition()
  const [mensagemMaterial, setMensagemMaterial] = useState('')
  const [erroMaterial, setErroMaterial] = useState('')
  const [uploadingMaterial, setUploadingMaterial] = useState(false)
  const [progressCapa, setProgressCapa] = useState(0)
  const [progressPdf, setProgressPdf] = useState(0)

  const [matTitulo, setMatTitulo] = useState('')
  const [matDescricao, setMatDescricao] = useState('')
  const [matCategoria, setMatCategoria] = useState('hq')
  const [matPlanosAcesso, setMatPlanosAcesso] = useState(['Essencial', 'Pro'])
  const [matLinkPdf, setMatLinkPdf] = useState('')

  const capaRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<HTMLInputElement>(null)

  // --- Estados do Formulário de Instagram ---
  const [instaTitulo, setInstaTitulo] = useState('')
  const [instaDescricao, setInstaDescricao] = useState('')
  const [instaBunnyId, setInstaBunnyId] = useState('')
  const [instaUploadingCapa, setInstaUploadingCapa] = useState(false)
  const [instaProgressCapa, setInstaProgressCapa] = useState(0)
  const [instaMensagem, setInstaMensagem] = useState('')
  const [instaErro, setInstaErro] = useState('')
  const [instaIsPending, instaStartTransition] = useTransition()
  const instaCapaRef = useRef<HTMLInputElement>(null)

  // --- Estados do Formulário de Revista ---
  const [revTitulo, setRevTitulo] = useState('')
  const [revDescricao, setRevDescricao] = useState('')
  const [revEdicao, setRevEdicao] = useState('')
  const [revLinkPdf, setRevLinkPdf] = useState('')
  const [uploadingRevista, setUploadingRevista] = useState(false)
  const [progressRevCapa, setProgressRevCapa] = useState(0)
  const [progressRevPdf, setProgressRevPdf] = useState(0)
  const [mensagemRevista, setMensagemRevista] = useState('')
  const [erroRevista, setErroRevista] = useState('')
  const [revIsPending, revStartTransition] = useTransition()
  const revCapaRef = useRef<HTMLInputElement>(null)
  const revPdfRef = useRef<HTMLInputElement>(null)

  const togglePlanoMat = (plano: string) => {
    setMatPlanosAcesso(prev =>
      prev.includes(plano) ? prev.filter(p => p !== plano) : [...prev, plano]
    )
  }

  const resetFormMaterial = () => {
    setMatTitulo(''); setMatDescricao(''); setMatLinkPdf('')
    setProgressCapa(0); setProgressPdf(0)
    if (capaRef.current) capaRef.current.value = ''
    if (pdfRef.current) pdfRef.current.value = ''
  }

  const handlePublicarMaterial = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!matTitulo.trim()) { setErroMaterial('Informe o título.'); return }
    setErroMaterial('')
    setUploadingMaterial(true)

    const slug = gerarSlug(matTitulo)
    let capaUrl: string | null = null
    let pdfUrl: string | null = matLinkPdf.trim() || null

    try {
      // 1. Upload da Capa direto para o Bunny
      let capaFile = capaRef.current?.files?.[0]
      if (capaFile) {
        if (capaFile.type.startsWith('image/')) {
          capaFile = await convertToWebP(capaFile)
        }
        const ext = capaFile.name.split('.').pop() || 'jpg'
        const path = `pdf/${matCategoria}/${slug}_capa.${ext}`
        capaUrl = await uploadParaBunny(capaFile, path, setProgressCapa)
      }

      // 2. Upload do PDF direto para o Bunny
      const pdfFile = pdfRef.current?.files?.[0]
      if (pdfFile) {
        const path = `pdf/${matCategoria}/${slug}.pdf`
        pdfUrl = await uploadParaBunny(pdfFile, path, setProgressPdf)
      }

      // 3. Salva os metadados no Supabase via Server Action
      const fd = new FormData()
      fd.append('titulo', matTitulo.trim())
      fd.append('descricao', matDescricao.trim())
      fd.append('categoria', matCategoria)
      fd.append('planos_acesso', JSON.stringify(matPlanosAcesso))
      if (capaUrl) fd.append('capa_url', capaUrl)
      if (pdfUrl) fd.append('link_pdf', pdfUrl)

      startTransition(async () => {
        const res = await publicarMaterial(fd)
        if (res?.success) {
          setMensagemMaterial('✅ Material publicado com sucesso!')
          resetFormMaterial()
          setTimeout(() => setMensagemMaterial(''), 5000)
        } else {
          setErroMaterial(`Erro ao salvar: ${res?.error}`)
        }
      })
    } catch (err: any) {
      setErroMaterial(`Erro no upload: ${err.message}`)
    } finally {
      setUploadingMaterial(false)
    }
  }

  const isProcessingMat = uploadingMaterial || isPending
  const matCatInfo = CATEGORIAS_MATERIAIS.find(c => c.value === matCategoria)

  // --- Handler Revista ---
  const handlePublicarRevista = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!revTitulo.trim()) { setErroRevista('Informe o título.'); return }
    setErroRevista('')
    setUploadingRevista(true)

    const slug = gerarSlug(revTitulo)
    let capaUrl: string | null = null
    let pdfUrl: string | null = revLinkPdf.trim() || null

    try {
      let capaFile = revCapaRef.current?.files?.[0]
      if (capaFile) {
        if (capaFile.type.startsWith('image/')) {
          capaFile = await convertToWebP(capaFile)
        }
        const ext = capaFile.name.split('.').pop() || 'jpg'
        capaUrl = await uploadParaBunny(capaFile, `revistas/${slug}_capa.${ext}`, setProgressRevCapa)
      }
      const pdfFile = revPdfRef.current?.files?.[0]
      if (pdfFile) {
        pdfUrl = await uploadParaBunny(pdfFile, `revistas/${slug}.pdf`, setProgressRevPdf)
      }

      const fd = new FormData()
      fd.append('titulo', revTitulo.trim())
      fd.append('descricao', revDescricao.trim())
      fd.append('edicao', revEdicao.trim())
      if (capaUrl) fd.append('capa_url', capaUrl)
      if (pdfUrl) fd.append('link_pdf', pdfUrl)

      revStartTransition(async () => {
        const res = await publicarRevista(fd)
        if (res?.success) {
          setMensagemRevista('✅ Revista publicada com sucesso!')
          setRevTitulo(''); setRevDescricao(''); setRevEdicao(''); setRevLinkPdf('')
          setProgressRevCapa(0); setProgressRevPdf(0)
          if (revCapaRef.current) revCapaRef.current.value = ''
          if (revPdfRef.current) revPdfRef.current.value = ''
          setTimeout(() => setMensagemRevista(''), 5000)
        } else {
          setErroRevista(`Erro ao salvar: ${res?.error}`)
        }
      })
    } catch (err: any) {
      setErroRevista(`Erro no upload: ${err.message}`)
    } finally {
      setUploadingRevista(false)
    }
  }

  // --- Handler Instagram ---
  const handlePublicarInsta = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!instaTitulo.trim()) { setInstaErro('Informe o título.'); return }
    if (!instaBunnyId.trim()) { setInstaErro('Informe o Video ID do Bunny.'); return }
    setInstaErro('')
    setInstaUploadingCapa(true)

    let capaUrl: string | null = null
    try {
      let capaFile = instaCapaRef.current?.files?.[0]
      if (capaFile) {
        if (capaFile.type.startsWith('image/')) {
          capaFile = await convertToWebP(capaFile)
        }
        const ext = capaFile.name.split('.').pop() || 'jpg'
        const slug = gerarSlug(instaTitulo)
        const path = `videos_tematicos/${slug}/capa.${ext}`
        capaUrl = await uploadParaBunny(capaFile, path, setInstaProgressCapa)
      }

      const fd = new FormData()
      fd.append('titulo', instaTitulo.trim())
      fd.append('descricao', instaDescricao.trim())
      fd.append('bunny_video_id', instaBunnyId.trim())
      if (capaUrl) fd.append('capa_url', capaUrl)

      instaStartTransition(async () => {
        const res = await adicionarVideoTematico(fd)
        if (res?.success) {
          setInstaMensagem('✅ Vídeo Temático publicado!')
          setInstaTitulo(''); setInstaDescricao(''); setInstaBunnyId('')
          setInstaProgressCapa(0)
          if (instaCapaRef.current) instaCapaRef.current.value = ''
          setTimeout(() => setInstaMensagem(''), 5000)
        } else {
          setInstaErro(`Erro: ${res?.error}`)
        }
      })
    } catch (err: any) {
      setInstaErro(`Erro no upload: ${err.message}`)
    } finally {
      setInstaUploadingCapa(false)
    }
  }


  if (!isExpanded) {
    return (
      <>
        <button
          onClick={() => { setIsExpanded(true); setTipoCriacao(null); }}
          className="w-full flex items-center justify-center gap-3 bg-[#111827]/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/5 hover:bg-[#1a2234] hover:border-[#D4AF37]/30 hover:shadow-[0_0_20px_rgba(212,175,55,0.1)] transition-all duration-300 group"
        >
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#D4AF37]/20 transition-all">
            <Plus size={24} className="text-[#D4AF37]" />
          </div>
          <span className="text-white font-bold text-xl group-hover:text-[#D4AF37] transition-colors tracking-tight">Adicionar Novo Conteúdo</span>
        </button>
        <ModalSerie isOpen={isModalSerieOpen} onClose={() => setIsModalSerieOpen(false)} />
      </>
    )
  }

  if (isExpanded && tipoCriacao === null) {
    return (
      <>
        {/* Placeholder enquanto a roda estiver ativa por cima (evita salto de layout) */}
        <button
          className="w-full flex items-center justify-center gap-3 bg-[#111827]/80 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/5 opacity-50 pointer-events-none"
        >
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
            <Plus size={24} className="text-[#D4AF37]" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Escolhendo Conteúdo...</span>
        </button>

        <GtaRadialMenu 
          onClose={() => setIsExpanded(false)} 
          onSelect={handleRadialMenuSelect} 
        />
        <ModalSerie isOpen={isModalSerieOpen} onClose={() => setIsModalSerieOpen(false)} />
      </>
    )
  }

  const tipoAtual = TIPO_CONFIG[tipoCriacao || 'video']

  return (
    <>
      <div
        className="bg-[#111827]/80 backdrop-blur-xl rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden transition-all duration-500"
        style={{ border: `1px solid ${tipoAtual.border}40` }}>
      <div
        className="absolute top-0 left-0 w-full h-1 transition-all duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${tipoAtual.border}, transparent)`, opacity: 0.6 }}
      />
      <button 
        type="button"
        onClick={() => setIsExpanded(false)}
        className="absolute top-4 right-4 md:top-6 md:right-6 text-white/40 hover:text-white hover:bg-white/10 rounded-full p-2 transition-colors z-10"
        title="Fechar painel"
      >
        <X size={20} />
      </button>
      
      {/* Header Unificado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
            <Plus size={20} className="text-[#D4AF37]" />
          </div>
          <div>
            <h2 className="text-white text-xl font-extrabold tracking-tight">Adicionar Novo Conteúdo</h2>
            <p className="text-white/40 text-xs">Selecione o tipo de conteúdo para publicar no catálogo.</p>
          </div>
        </div>

        {/* Seletor de Tipo */}
        <div className="flex bg-[#0f171e] border border-white/10 rounded-2xl p-1 w-fit shadow-inner gap-0.5">
          {/* Botão Vídeo — Dourado */}
          <button
            type="button"
            onClick={() => setTipoCriacao('video')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300"
            style={tipoCriacao === 'video'
              ? { background: '#D4AF37', color: '#000', boxShadow: '0 2px 12px rgba(212,175,55,0.4)' }
              : { color: 'rgba(255,255,255,0.4)' }}
          >
            <Video size={14} />
            Série
          </button>

          {/* Botão Material Didático — Verde */}
          <button
            type="button"
            onClick={() => setTipoCriacao('material')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300"
            style={tipoCriacao === 'material'
              ? { background: '#10b981', color: '#fff', boxShadow: '0 2px 12px rgba(16,185,129,0.4)' }
              : { color: 'rgba(255,255,255,0.4)' }}
          >
            <BookOpen size={14} />
            Material Didático
          </button>

          {/* Botão Revista — Roxo */}
          <button
            type="button"
            onClick={() => setTipoCriacao('revista')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300"
            style={tipoCriacao === 'revista'
              ? { background: '#10b981', color: '#fff', boxShadow: '0 2px 12px rgba(16,185,129,0.5)' }
              : { color: 'rgba(255,255,255,0.4)' }}
          >
            <BookMarked size={14} />
            Revista
          </button>

          {/* Botão Instagram — Gradiente oficial */}
          <button
            type="button"
            onClick={() => setTipoCriacao('instagram')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300"
            style={tipoCriacao === 'instagram'
              ? { background: 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)', color: '#fff', boxShadow: '0 2px 12px rgba(225,48,108,0.5)' }
              : { color: 'rgba(255,255,255,0.4)' }}
          >
            <IgIcon size={14} />
            Instagram
          </button>
        </div>
      </div>

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
                  value="true" 
                  checked={emBreve}
                  onChange={(e) => setEmBreve(e.target.checked)}
                  className="w-5 h-5 rounded-lg bg-[#0f171e] border border-white/10 text-[#D4AF37] focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer accent-[#D4AF37]"
                />
                <span className="text-white text-xs font-bold">Vídeo "Em Breve" (Lançamento Futuro)</span>
              </label>
            </div>

            <div className="md:col-span-12">
              <label className={labelCls}>Descrição</label>
              <textarea name="descricao" rows={2} placeholder="Descreva sobre o que é o vídeo..." className={inputCls} style={{ resize: 'vertical' }} />
            </div>
            
            <div className="md:col-span-3">
              <label className={labelCls}>Categoria</label>
              <select 
                name="categoria" 
                value={videoCategoria} 
                onChange={(e) => setVideoCategoria(e.target.value)} 
                className={inputCls}
              >
                {['Geral', 'Infantil', 'Adulto', 'Documentário', 'Louvor', 'Sermão', 'Testemunho', 'Temporada', 'Vídeo Clipe'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-4">
              <label className={labelCls}>
                {emBreve ? 'Video ID (Bunny)' : 'Video ID (Bunny) *'}
              </label>
              <input 
                id="bunny_video_id_input" 
                name="bunny_video_id" 
                required={!emBreve} 
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx" 
                className={inputCls + ' font-mono text-white/70'} 
              />
            </div>
            
            <div className="md:col-span-5">
              <label className={labelCls}>Thumbnail (Apenas Arquivo)</label>
              <div className="space-y-2">
                <input type="file" name="thumbnail_file" accept="image/*" className="w-full bg-[#0f171e] border border-white/10 rounded-xl px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37] file:text-black hover:file:brightness-110 cursor-pointer" />
              </div>
            </div>

            {/* Campos Condicionais de Temporada */}
            {videoCategoria === 'Temporada' && (
              <>
                <input type="hidden" name="temporada_nome" value={temporadaNome} />

                <div className="md:col-span-12">
                  <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 md:p-6 space-y-6">
                    <div className="flex items-center gap-2 text-[#D4AF37] border-b border-white/5 pb-3">
                      <Tv2 size={16} />
                      <span className="text-white font-bold text-sm">Vincular Episódio à Série e Temporada</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Seleção de Série */}
                      <div>
                        <label className={labelCls}>Série *</label>
                        {seriesParaExibir.length > 0 ? (
                          <select
                            value={temporadaSelecionada}
                            onChange={(e) => setTemporadaSelecionada(e.target.value)}
                            className={inputCls}
                            required
                          >
                            {seriesParaExibir.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-xs text-white/40 bg-[#0f171e] rounded-xl p-3 border border-white/10">
                            Nenhuma série cadastrada. Crie uma série primeiro!
                          </div>
                        )}
                        <p className="text-white/20 text-[0.65rem] mt-2">
                          Escolha a série onde o vídeo pertence.
                        </p>
                      </div>

                      {/* Seleção de Temporada */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className={labelCls}>Temporada *</label>
                          {subTemporadasDaSerie.length > 0 && (
                            <div className="flex bg-[#0f171e] border border-white/10 rounded-lg overflow-hidden text-[9px] font-bold">
                              <button
                                type="button"
                                onClick={() => setModoSubTemporada('existente')}
                                className={`px-2 py-1 transition-all ${modoSubTemporada === 'existente' ? 'bg-[#D4AF37] text-black' : 'text-white/50 hover:text-white'}`}
                              >
                                Existente
                              </button>
                              <button
                                type="button"
                                onClick={() => setModoSubTemporada('nova')}
                                className={`px-2 py-1 transition-all ${modoSubTemporada === 'nova' ? 'bg-[#D4AF37] text-black' : 'text-white/50 hover:text-white'}`}
                              >
                                + Nova
                              </button>
                            </div>
                          )}
                        </div>

                        {modoSubTemporada === 'existente' && subTemporadasDaSerie.length > 0 ? (
                          <select
                            value={subTemporadaSelecionada}
                            onChange={(e) => setSubTemporadaSelecionada(e.target.value)}
                            className={inputCls}
                            required
                          >
                            {subTemporadasDaSerie.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={novaSubTemporada}
                            onChange={(e) => setNovaSubTemporada(e.target.value)}
                            placeholder="Ex: Temporada 1, Especiais..."
                            className={inputCls}
                            required
                          />
                        )}
                        <p className="text-white/20 text-[0.65rem] mt-2">
                          Escolha ou crie a temporada desta série.
                        </p>
                      </div>

                      {/* Número do Episódio */}
                      <div>
                        <label className={labelCls}>Número do Episódio *</label>
                        <input 
                          type="number" 
                          name="episodio_numero" 
                          required 
                          min={1} 
                          placeholder="Ex: 1" 
                          className={inputCls} 
                        />
                        <p className="text-white/20 text-[0.65rem] mt-2">
                          Sequência do episódio dentro da temporada.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <SubmitButton 
              textLoading="Publicando..."
              className="flex items-center justify-center gap-2 text-black px-8 py-3.5 rounded-xl font-black text-sm transition-all hover:scale-105 hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' }}>
              <Plus size={18} strokeWidth={3} /> Publicar Vídeo
            </SubmitButton>
          </div>
        </form>
        </div>
      )}

      {/* ================= FORMULÁRIO DE MATERIAL DIDÁTICO ================= */}
      {tipoCriacao === 'material' && (
        <div key="form-material" className="admin-form-anim">
        <form onSubmit={handlePublicarMaterial} className="space-y-6">
          {/* Categoria */}
          <div>
            <label className={labelCls}>Categoria do Material</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CATEGORIAS_MATERIAIS.map(cat => (
                <button 
                  key={cat.value} 
                  type="button" 
                  onClick={() => setMatCategoria(cat.value)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all"
                  style={{
                    borderColor: matCategoria === cat.value ? cat.color : 'rgba(255,255,255,0.1)',
                    background: matCategoria === cat.value ? `${cat.color}15` : 'rgba(255,255,255,0.03)',
                  }}
                >
                  <cat.icon size={20} style={{ color: cat.color }} />
                  <span className="text-white text-xs font-bold text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className={labelCls}>Título *</label>
            <input 
              value={matTitulo} 
              onChange={e => setMatTitulo(e.target.value)} 
              placeholder="Ex: Nossa Senhora de Fátima" 
              className={inputCls} 
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className={labelCls}>Descrição (opcional)</label>
            <textarea 
              value={matDescricao} 
              onChange={e => setMatDescricao(e.target.value)} 
              rows={2}
              placeholder="Breve descrição do material..." 
              className={inputCls} 
              style={{ resize: 'vertical' }} 
            />
          </div>

          {/* Upload Capa + PDF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Capa */}
            <div>
              <label className={labelCls}>
                <ImageIcon size={12} className="inline mr-1" />
                Imagem de Capa
              </label>
              <input 
                ref={capaRef} 
                type="file" 
                accept="image/*"
                className="w-full bg-[#0f171e] border border-white/10 rounded-xl px-4 py-3 text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37] file:text-black cursor-pointer text-sm" 
              />
              {progressCapa > 0 && progressCapa < 100 && (
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37] transition-all" style={{ width: `${progressCapa}%` }} />
                </div>
              )}
            </div>

            {/* PDF */}
            <div>
              <label className={labelCls}>
                <FileText size={12} className="inline mr-1" />
                Arquivo PDF
              </label>
              <input 
                ref={pdfRef} 
                type="file" 
                accept="application/pdf"
                className="w-full bg-[#0f171e] border border-white/10 rounded-xl px-4 py-3 text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#10b981] file:text-white cursor-pointer text-sm" 
              />
              {progressPdf > 0 && progressPdf < 100 && (
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10b981] transition-all" style={{ width: `${progressPdf}%` }} />
                </div>
              )}
              <p className="text-white/20 text-xs mt-2">Ou cole o link público do Bunny:</p>
              <input 
                value={matLinkPdf} 
                onChange={e => setMatLinkPdf(e.target.value)}
                placeholder="https://contos-midia-app.b-cdn.net/PDF/hq/..."
                className={inputCls + ' mt-2 font-mono text-xs'} 
              />
            </div>
          </div>

          {/* Erros e Sucessos locais do Material */}
          {erroMaterial && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {erroMaterial}
            </div>
          )}

          {uploadingMaterial && (
            <div className="flex items-center gap-3 text-[#D4AF37] text-sm bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl px-4 py-3">
              <Loader2 size={16} className="animate-spin shrink-0" />
              Enviando arquivos para o Bunny... aguarde.
            </div>
          )}

          {mensagemMaterial && (
            <div className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle2 size={16} /> 
              {mensagemMaterial}
            </div>
          )}

          {/* Botão publicar */}
          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isProcessingMat}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm text-black disabled:opacity-60 hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              style={{ background: 'linear-gradient(135deg, #FFD700, #D4AF37)' }}
            >
              {isProcessingMat ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {uploadingMaterial ? 'Enviando...' : isPending ? 'Salvando...' : 'Publicar Material'}
            </button>
          </div>
        </form>
        </div>
      )}

      {/* ================= FORMULÁRIO REVISTA ================= */}
      {tipoCriacao === 'revista' && (
        <div key="form-revista" className="admin-form-anim">
        <form onSubmit={handlePublicarRevista} className="space-y-6">

          {/* Título + Edição */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelCls}>Título *</label>
              <input
                value={revTitulo}
                onChange={e => setRevTitulo(e.target.value)}
                placeholder="Ex: Revista Ação Católica"
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Edição (opcional)</label>
              <input
                value={revEdicao}
                onChange={e => setRevEdicao(e.target.value)}
                placeholder="Ex: Edição 01 — Janeiro 2025"
                className={inputCls}
              />
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className={labelCls}>Descrição (opcional)</label>
            <textarea
              value={revDescricao}
              onChange={e => setRevDescricao(e.target.value)}
              rows={2}
              placeholder="Breve descrição do conteúdo da revista..."
              className={inputCls}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Upload Capa + PDF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Capa */}
            <div>
              <label className={labelCls}>
                <ImageIcon size={12} className="inline mr-1" />
                Imagem de Capa
              </label>
              <input
                ref={revCapaRef}
                type="file"
                accept="image/*"
                className="w-full bg-[#0f171e] border border-white/10 rounded-xl px-4 py-3 text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#10b981] file:text-white cursor-pointer text-sm"
              />
              {progressRevCapa > 0 && progressRevCapa < 100 && (
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10b981] transition-all" style={{ width: `${progressRevCapa}%` }} />
                </div>
              )}
            </div>

            {/* PDF */}
            <div>
              <label className={labelCls}>
                <FileText size={12} className="inline mr-1" />
                Arquivo PDF
              </label>
              <input
                ref={revPdfRef}
                type="file"
                accept="application/pdf"
                className="w-full bg-[#0f171e] border border-white/10 rounded-xl px-4 py-3 text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#10b981] file:text-white cursor-pointer text-sm"
              />
              {progressRevPdf > 0 && progressRevPdf < 100 && (
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10b981] transition-all" style={{ width: `${progressRevPdf}%` }} />
                </div>
              )}
              <p className="text-white/20 text-xs mt-2">Ou cole o link público do Bunny:</p>
              <input
                value={revLinkPdf}
                onChange={e => setRevLinkPdf(e.target.value)}
                placeholder="https://contos-midia-app.b-cdn.net/revistas/..."
                className={inputCls + ' mt-2 font-mono text-xs'}
              />
            </div>
          </div>

          {/* Erros e Sucessos */}
          {erroRevista && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {erroRevista}
            </div>
          )}
          {uploadingRevista && (
            <div className="flex items-center gap-3 text-[#10b981] text-sm bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl px-4 py-3">
              <Loader2 size={16} className="animate-spin shrink-0" />
              Enviando arquivos para o Bunny... aguarde.
            </div>
          )}
          {mensagemRevista && (
            <div className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle2 size={16} />
              {mensagemRevista}
            </div>
          )}

          {/* Botão publicar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={uploadingRevista || revIsPending}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm text-white disabled:opacity-60 hover:scale-105 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
            >
              {(uploadingRevista || revIsPending) ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {uploadingRevista ? 'Enviando...' : revIsPending ? 'Salvando...' : 'Publicar Revista'}
            </button>
          </div>
        </form>
        </div>
      )}

      {/* ================= FORMULÁRIO INSTAGRAM / VÍDEOS TEMÁTICOS ================= */}
      {tipoCriacao === 'instagram' && (
        <div key="form-instagram" className="admin-form-anim">
        <form onSubmit={handlePublicarInsta} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div className="md:col-span-2">
              <label className={labelCls}>Título *</label>
              <input
                value={instaTitulo}
                onChange={e => setInstaTitulo(e.target.value)}
                placeholder="Ex: Terço da Família — Episódio 1"
                className={inputCls}
                required
              />
            </div>

            {/* Descrição */}
            <div className="md:col-span-2">
              <label className={labelCls}>Descrição (opcional)</label>
              <textarea
                value={instaDescricao}
                onChange={e => setInstaDescricao(e.target.value)}
                rows={2}
                placeholder="Breve descrição do vídeo..."
                className={inputCls}
                style={{ resize: 'vertical' }}
              />
            </div>

            {/* Video ID do Bunny Stream */}
            <div>
              <label className={labelCls}>Video ID (Bunny Stream) *</label>
              <input
                value={instaBunnyId}
                onChange={e => setInstaBunnyId(e.target.value)}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx"
                className={inputCls + ' font-mono text-white/70'}
                required
              />
              <p className="text-white/30 text-[0.65rem] mt-1.5">Copie o Video ID do painel do Bunny Stream</p>
            </div>

            {/* Capa */}
            <div>
              <label className={labelCls}>
                <ImageIcon size={12} className="inline mr-1" />
                Imagem de Capa *
              </label>
              <input
                ref={instaCapaRef}
                type="file"
                accept="image/*"
                className="w-full bg-[#0f171e] border border-white/10 rounded-xl px-4 py-3 text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold cursor-pointer text-sm"
                style={{ '--file-bg': '#E1306C' } as React.CSSProperties}
              />
              <p className="text-white/30 text-[0.65rem] mt-1.5">Será salva em <code className="text-white/40">videos_tematicos/slug/capa.jpg</code> no Bunny</p>
              {instaProgressCapa > 0 && instaProgressCapa < 100 && (
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${instaProgressCapa}%`, background: 'linear-gradient(90deg,#833AB4,#E1306C,#F77737)' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Erros e Mensagens */}
          {instaErro && (
            <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{instaErro}</div>
          )}
          {instaUploadingCapa && (
            <div className="flex items-center gap-3 text-sm px-4 py-3 rounded-xl"
              style={{ color: '#E1306C', background: 'rgba(225,48,108,0.08)', border: '1px solid rgba(225,48,108,0.2)' }}>
              <Loader2 size={16} className="animate-spin shrink-0" />
              Enviando capa para o Bunny...
            </div>
          )}
          {instaMensagem && (
            <div className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle2 size={16} />{instaMensagem}
            </div>
          )}

          {/* Botão Publicar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={instaUploadingCapa || instaIsPending}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-black text-sm text-white disabled:opacity-60 hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg,#833AB4,#E1306C,#F77737)', boxShadow: '0 0 20px rgba(225,48,108,0.3)' }}
            >
              {instaUploadingCapa || instaIsPending
                ? <Loader2 size={16} className="animate-spin" />
                : <IgIcon size={16} />}
              {instaUploadingCapa ? 'Enviando capa...' : instaIsPending ? 'Salvando...' : 'Publicar Vídeo Temático'}
            </button>
          </div>
        </form>
        </div>
      )}
    </div>
    <ModalSerie isOpen={isModalSerieOpen} onClose={() => setIsModalSerieOpen(false)} />
    </>
  )
}
