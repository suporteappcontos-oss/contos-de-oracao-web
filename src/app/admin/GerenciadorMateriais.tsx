'use client'

import React, { useState, useTransition, useRef } from 'react'
import { BookOpen, Gamepad2, Pencil, Library, Trash2, Plus, FileText, ImageIcon, Loader2, CheckCircle2, Download, X } from 'lucide-react'
import { publicarMaterial, deletarMaterial } from './actions'

const PLANOS_DISPONIVEIS = ['Básico', 'Essencial', 'Pro']
const CATEGORIAS = [
  { value: 'hq',      label: 'HQ (História em Quadrinhos)', icon: BookOpen, color: '#D4AF37' },
  { value: 'jogo',    label: 'Jogo Educativo',              icon: Gamepad2, color: '#10b981' },
  { value: 'desenho', label: 'Desenho para Colorir',        icon: Pencil,   color: '#818cf8' },
  { value: 'livro',   label: 'Livro Digital',               icon: Library,  color: '#f97316' },
]

// AccessKey do Bunny — usada apenas no browser do admin para fazer upload direto
const BUNNY_STORAGE_KEY = '0109d994-0c03-4a29-a9e89c3a3287-5e82-4d9c'
const BUNNY_STORAGE_URL = 'https://br.storage.bunnycdn.com/contos-midia-app'
const BUNNY_CDN_URL = 'https://contos-midia-app.b-cdn.net'

type Material = {
  id: string
  slug: string
  titulo: string
  descricao: string | null
  categoria: string
  capa_url: string | null
  link_pdf: string | null
  planos_acesso: string[]
  ativo: boolean
  criado_em: string
}

// ── Upload direto browser → Bunny ──────────────────────────────────────────
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

const inputCls = 'w-full bg-[#0f171e] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all text-sm'
const labelCls = 'block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold'

export function GerenciadorMateriais({ materiaisIniciais }: { materiaisIniciais: Material[] }) {
  const [isPending, startTransition] = useTransition()
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [materiais, setMateriais] = useState(materiaisIniciais)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progressCapa, setProgressCapa] = useState(0)
  const [progressPdf, setProgressPdf] = useState(0)

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categoria, setCategoria] = useState('hq')
  const [planosAcesso, setPlanosAcesso] = useState(['Essencial', 'Pro'])
  const [linkPdf, setLinkPdf] = useState('')

  const capaRef = useRef<HTMLInputElement>(null)
  const pdfRef = useRef<HTMLInputElement>(null)

  const togglePlano = (plano: string) => {
    setPlanosAcesso(prev =>
      prev.includes(plano) ? prev.filter(p => p !== plano) : [...prev, plano]
    )
  }

  const resetForm = () => {
    setTitulo(''); setDescricao(''); setLinkPdf('')
    setPlanosAcesso(['Essencial', 'Pro'])
    setProgressCapa(0); setProgressPdf(0)
    if (capaRef.current) capaRef.current.value = ''
    if (pdfRef.current) pdfRef.current.value = ''
  }

  const handlePublicar = async () => {
    if (!titulo.trim()) { setErro('Informe o título.'); return }
    setErro('')
    setUploading(true)

    const slug = gerarSlug(titulo)
    let capaUrl: string | null = null
    let pdfUrl: string | null = linkPdf.trim() || null

    try {
      // 1️⃣ Upload da Capa direto para o Bunny
      const capaFile = capaRef.current?.files?.[0]
      if (capaFile) {
        const ext = capaFile.name.split('.').pop() || 'jpg'
        const path = `pdf/${categoria}/${slug}_capa.${ext}`
        capaUrl = await uploadParaBunny(capaFile, path, setProgressCapa)
      }

      // 2️⃣ Upload do PDF direto para o Bunny (somente se enviou arquivo)
      const pdfFile = pdfRef.current?.files?.[0]
      if (pdfFile) {
        const path = `pdf/${categoria}/${slug}.pdf`
        pdfUrl = await uploadParaBunny(pdfFile, path, setProgressPdf)
      }

      // 3️⃣ Salva apenas os metadados no Supabase via Server Action (sem arquivos)
      const fd = new FormData()
      fd.append('titulo', titulo.trim())
      fd.append('descricao', descricao.trim())
      fd.append('categoria', categoria)
      fd.append('planos_acesso', JSON.stringify(planosAcesso))
      if (capaUrl) fd.append('capa_url', capaUrl)
      if (pdfUrl) fd.append('link_pdf', pdfUrl)

      startTransition(async () => {
        const res = await publicarMaterial(fd)
        if (res?.success) {
          setMensagem('✅ Material publicado com sucesso!')
          resetForm()
          setMostrarForm(false)
          setTimeout(() => setMensagem(''), 5000)
        } else {
          setErro(`Erro ao salvar: ${res?.error}`)
        }
      })
    } catch (err: any) {
      setErro(`Erro no upload: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDeletar = (id: string, titulo: string) => {
    if (!confirm(`Deletar "${titulo}"? Essa ação não pode ser desfeita.`)) return
    startTransition(async () => {
      await deletarMaterial(id)
      setMateriais(prev => prev.filter(m => m.id !== id))
    })
  }

  const isProcessing = uploading || isPending
  const catInfo = CATEGORIAS.find(c => c.value === categoria)

  return (
    <div className="space-y-8">

      {/* Header + Botão Novo */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-2xl font-black">Materiais Didáticos</h2>
          <p className="text-white/40 text-sm mt-1">Gerencie HQs, Jogos e Desenhos para download.</p>
        </div>
        <button
          onClick={() => { setMostrarForm(v => !v); resetForm(); setErro('') }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-black transition-all hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #FFD700, #D4AF37)' }}
        >
          {mostrarForm ? <X size={16} /> : <Plus size={16} />}
          {mostrarForm ? 'Fechar' : 'Novo Material'}
        </button>
      </div>

      {/* Formulário */}
      {mostrarForm && (
        <div className="bg-[#111827] border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${catInfo?.color}20` }}>
              {catInfo && <catInfo.icon size={18} style={{ color: catInfo.color }} />}
            </div>
            <div>
              <div className="text-white font-black">Publicar Novo Material</div>
              <div className="text-white/40 text-xs">O upload vai direto do seu computador para o Bunny.</div>
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className={labelCls}>Categoria do Material</label>
            <div className="grid grid-cols-3 gap-3">
              {CATEGORIAS.map(cat => (
                <button key={cat.value} type="button" onClick={() => setCategoria(cat.value)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all"
                  style={{
                    borderColor: categoria === cat.value ? cat.color : 'rgba(255,255,255,0.1)',
                    background: categoria === cat.value ? `${cat.color}15` : 'rgba(255,255,255,0.03)',
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
              <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Nossa Senhora de Fátima" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Planos com Acesso</label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {PLANOS_DISPONIVEIS.map(p => (
                  <button key={p} type="button" onClick={() => togglePlano(p)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold border transition-all"
                    style={{
                      borderColor: planosAcesso.includes(p) ? '#D4AF37' : 'rgba(255,255,255,0.1)',
                      background: planosAcesso.includes(p) ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                      color: planosAcesso.includes(p) ? '#D4AF37' : 'rgba(255,255,255,0.4)',
                    }}
                  >{p}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className={labelCls}>Descrição (opcional)</label>
            <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={2}
              placeholder="Breve descrição do material..." className={inputCls} style={{ resize: 'vertical' }} />
          </div>

          {/* Upload Capa + PDF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Capa */}
            <div>
              <label className={labelCls}><ImageIcon size={12} className="inline mr-1" />Imagem de Capa</label>
              <input ref={capaRef} type="file" accept="image/*"
                className="w-full bg-[#0f171e] border border-white/10 rounded-xl px-4 py-3 text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37] file:text-black cursor-pointer text-sm" />
              {progressCapa > 0 && progressCapa < 100 && (
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37] transition-all" style={{ width: `${progressCapa}%` }} />
                </div>
              )}
            </div>

            {/* PDF */}
            <div>
              <label className={labelCls}><FileText size={12} className="inline mr-1" />Arquivo PDF</label>
              <input ref={pdfRef} type="file" accept="application/pdf"
                className="w-full bg-[#0f171e] border border-white/10 rounded-xl px-4 py-3 text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#10b981] file:text-white cursor-pointer text-sm" />
              {progressPdf > 0 && progressPdf < 100 && (
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#10b981] transition-all" style={{ width: `${progressPdf}%` }} />
                </div>
              )}
              <p className="text-white/20 text-xs mt-2">Ou cole o link público do Bunny:</p>
              <input value={linkPdf} onChange={e => setLinkPdf(e.target.value)}
                placeholder="https://contos-midia-app.b-cdn.net/PDF/hq/..."
                className={inputCls + ' mt-2 font-mono text-xs'} />
            </div>
          </div>

          {/* Erro */}
          {erro && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">{erro}</div>}

          {/* Status de upload */}
          {uploading && (
            <div className="flex items-center gap-3 text-[#D4AF37] text-sm bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl px-4 py-3">
              <Loader2 size={16} className="animate-spin shrink-0" />
              Enviando arquivos para o Bunny... aguarde.
            </div>
          )}

          {/* Botão publicar */}
          <div className="flex justify-end">
            <button onClick={handlePublicar} disabled={isProcessing}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-black text-sm text-black disabled:opacity-60 hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, #FFD700, #D4AF37)' }}
            >
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              {uploading ? 'Enviando...' : isPending ? 'Salvando...' : 'Publicar Material'}
            </button>
          </div>
        </div>
      )}

      {/* Sucesso */}
      {mensagem && (
        <div className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-3 flex items-center gap-2">
          <CheckCircle2 size={16} /> {mensagem}
        </div>
      )}

      {/* Lista por categoria */}
      {CATEGORIAS.map(cat => {
        const itens = materiais.filter(m => m.categoria === cat.value)
        return (
          <div key={cat.value}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${cat.color}20` }}>
                <cat.icon size={14} style={{ color: cat.color }} />
              </div>
              <h3 className="text-white font-bold">{cat.label}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${cat.color}20`, color: cat.color }}>
                {itens.length}
              </span>
            </div>

            {itens.length === 0 ? (
              <div className="text-white/20 text-sm text-center py-8 border border-white/5 rounded-2xl">
                Nenhum item publicado ainda.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {itens.map(m => (
                  <div key={m.id} className="group relative bg-[#111827] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all">
                    <div className="aspect-[3/4] bg-black/40 relative">
                      {m.capa_url ? (
                        <img src={m.capa_url} alt={m.titulo} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <cat.icon size={32} style={{ color: cat.color, opacity: 0.3 }} />
                        </div>
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase"
                        style={{ background: `${cat.color}30`, color: cat.color, border: `1px solid ${cat.color}40` }}>
                        {cat.value.toUpperCase()}
                      </div>
                      {m.link_pdf && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center bg-black/60">
                          <Download size={11} className="text-green-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-white text-xs font-bold leading-tight line-clamp-2 mb-1">{m.titulo}</p>
                      <p className="text-white/30 text-[10px]">{(m.planos_acesso || []).join(', ')}</p>
                    </div>
                    <button
                      onClick={() => handleDeletar(m.id, m.titulo)}
                      className="absolute bottom-2 right-2 w-7 h-7 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
