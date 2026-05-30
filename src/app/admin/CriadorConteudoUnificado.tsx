'use client'

import React, { useState, useTransition, useRef } from 'react'
import { 
  Plus, Tv2, BookOpen, Gamepad2, Pencil, 
  Library, ImageIcon, FileText, Loader2, 
  CheckCircle2, Video, X, Tag
} from 'lucide-react'
import SubmitButton from '@/components/SubmitButton'
import { adicionarVideo, publicarMaterial } from './actions'

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

export default function CriadorConteudoUnificado({ temporadasExistentes = [] }: Props) {
  const [tipoCriacao, setTipoCriacao] = useState<'video' | 'material'>('video')

  // --- Estados do Formulário de Vídeo ---
  const [emBreve, setEmBreve] = useState(false)
  const [videoCategoria, setVideoCategoria] = useState('Geral')
  const [modoTemporada, setModoTemporada] = useState<'existente' | 'nova'>(
    temporadasExistentes.length > 0 ? 'existente' : 'nova'
  )
  const [temporadaSelecionada, setTemporadaSelecionada] = useState(
    temporadasExistentes[0] || ''
  )
  const [novaTemporada, setNovaTemporada] = useState('')
  const temporadaNome = modoTemporada === 'existente' ? temporadaSelecionada : novaTemporada

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

  const togglePlanoMat = (plano: string) => {
    setMatPlanosAcesso(prev =>
      prev.includes(plano) ? prev.filter(p => p !== plano) : [...prev, plano]
    )
  }

  const resetFormMaterial = () => {
    setMatTitulo(''); setMatDescricao(''); setMatLinkPdf('')
    setMatPlanosAcesso(['Essencial', 'Pro'])
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
      const capaFile = capaRef.current?.files?.[0]
      if (capaFile) {
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

  return (
    <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30" />
      
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
        <div className="flex bg-[#0f171e] border border-white/10 rounded-2xl p-1 w-fit shadow-inner">
          <button
            type="button"
            onClick={() => setTipoCriacao('video')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${tipoCriacao === 'video' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/50 hover:text-white'}`}
          >
            <Video size={14} />
            Vídeo
          </button>
          <button
            type="button"
            onClick={() => setTipoCriacao('material')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${tipoCriacao === 'material' ? 'bg-[#D4AF37] text-black shadow-md' : 'text-white/50 hover:text-white'}`}
          >
            <BookOpen size={14} />
            Material Didático
          </button>
        </div>
      </div>

      {/* ================= FORMULÁRIO DE VÍDEO ================= */}
      {tipoCriacao === 'video' && (
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
              <label className={labelCls}>Thumbnail (URL ou Arquivo)</label>
              <div className="space-y-2">
                <input name="thumbnail_url" placeholder="URL opcional (ex: https://...)" className={inputCls} />
                <input type="file" name="thumbnail_file" accept="image/*" className="w-full bg-[#0f171e] border border-white/10 rounded-xl px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37] file:text-black hover:file:brightness-110 cursor-pointer" />
              </div>
            </div>

            {/* Campos Condicionais de Temporada */}
            {videoCategoria === 'Temporada' && (
              <>
                <input type="hidden" name="temporada_nome" value={temporadaNome} />

                <div className="md:col-span-12">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Tv2 size={16} className="text-[#D4AF37]" />
                      <span className="text-white/70 text-sm font-bold">Temporada</span>
                    </div>
                    <div className="flex bg-[#0f171e] border border-white/10 rounded-xl overflow-hidden text-xs font-bold">
                      {temporadasExistentes.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setModoTemporada('existente')}
                          className={`px-4 py-2 transition-all ${modoTemporada === 'existente' ? 'bg-[#D4AF37] text-black' : 'text-white/50 hover:text-white'}`}
                        >
                          Selecionar Existente
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setModoTemporada('nova')}
                        className={`px-4 py-2 transition-all ${modoTemporada === 'nova' ? 'bg-[#D4AF37] text-black' : 'text-white/50 hover:text-white'}`}
                      >
                        + Nova Temporada
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      {modoTemporada === 'existente' && temporadasExistentes.length > 0 ? (
                        <>
                          <label className={labelCls}>Selecionar Temporada Existente *</label>
                          <select
                            value={temporadaSelecionada}
                            onChange={(e) => setTemporadaSelecionada(e.target.value)}
                            className={inputCls}
                            required
                          >
                            {temporadasExistentes.map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <p className="text-white/30 text-[0.65rem] mt-1.5">
                            ✓ O episódio será adicionado a esta temporada
                          </p>
                        </>
                      ) : (
                        <>
                          <label className={labelCls}>Nome da Nova Temporada *</label>
                          <input 
                            value={novaTemporada}
                            onChange={(e) => setNovaTemporada(e.target.value)}
                            placeholder="Ex: Temporada 1, Especial de Natal..." 
                            className={inputCls}
                            required={modoTemporada === 'nova'}
                          />
                          <p className="text-white/30 text-[0.65rem] mt-1.5">
                            Uma nova temporada será criada com este nome
                          </p>
                        </>
                      )}
                    </div>

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
                      <p className="text-white/30 text-[0.65rem] mt-1.5">
                        Sequência do episódio dentro da temporada
                      </p>
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
      )}

      {/* ================= FORMULÁRIO DE MATERIAL DIDÁTICO ================= */}
      {tipoCriacao === 'material' && (
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

          {/* Título + Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <label className={labelCls}>Planos com Acesso</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {PLANOS_DISPONIVEIS.map(p => (
                  <button 
                    key={p} 
                    type="button" 
                    onClick={() => togglePlanoMat(p)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold border transition-all"
                    style={{
                      borderColor: matPlanosAcesso.includes(p) ? '#D4AF37' : 'rgba(255,255,255,0.1)',
                      background: matPlanosAcesso.includes(p) ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                      color: matPlanosAcesso.includes(p) ? '#D4AF37' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
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
      )}
    </div>
  )
}
