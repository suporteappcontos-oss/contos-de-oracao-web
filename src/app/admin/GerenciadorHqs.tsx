'use client'

import React, { useState, useTransition, useRef } from 'react'
import { BookOpen, Upload, Loader2, CheckCircle2, Trash2, FileText, Image as ImageIcon, Plus, Link as LinkIcon } from 'lucide-react'
import { publicarHq, deletarHq, adicionarPdfHq } from './actions'

const PLANOS_DISPONIVEIS = ['Básico', 'Essencial', 'Pro']

type HqType = {
  id: string
  slug: string
  titulo: string
  descricao: string | null
  capa_url: string | null
  total_paginas: number
  planos_acesso: string[]
  planos_pdf: string[]
  tem_pdf: boolean
  link_pdf: string | null
  ativo: boolean
}

export function GerenciadorHqs({ hqsIniciais }: { hqsIniciais: HqType[] }) {
  const [isPending, startTransition] = useTransition()
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [hqs, setHqs] = useState(hqsIniciais)
  const [mostrarForm, setMostrarForm] = useState(false)

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [planosAcesso, setPlanosAcesso] = useState(['Essencial', 'Pro'])
  const [planosPdf, setPlanosPdf] = useState(['Essencial', 'Pro'])
  const [linkPdf, setLinkPdf] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [capaFile, setCapaFile] = useState<File | null>(null)
  const [pngFiles, setPngFiles] = useState<File[]>([])
  const [totalPaginas, setTotalPaginas] = useState('1')

  const pdfRef = useRef<HTMLInputElement>(null)
  const capaRef = useRef<HTMLInputElement>(null)
  const pngsRef = useRef<HTMLInputElement>(null)

  const togglePlano = (plano: string, lista: string[], setLista: (v: string[]) => void) => {
    if (lista.includes(plano)) {
      setLista(lista.filter(p => p !== plano))
    } else {
      setLista([...lista, plano])
    }
  }

  const handlePublicar = async () => {
    setMensagem('')
    setErro('')
    if (!titulo.trim()) { setErro('❌ Informe o título da HQ.'); return }
    if (!capaFile) { setErro('❌ Selecione a imagem de capa.'); return }

    setMostrarForm(false)
    startTransition(async () => {
      try {
        const slug = titulo.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        const accessKey = '5513bf80-0970-4a66-a4e06d748364-2d6f-4522'

        // 1. Upload da Capa (Client-side)
        if (capaFile) {
          const capaRes = await fetch(`https://br.storage.bunnycdn.com/contos-apks/hq/${slug}/HQ_01.png`, {
            method: 'PUT',
            headers: { 'AccessKey': accessKey, 'Content-Type': capaFile.type || 'image/png' },
            body: capaFile,
          })
          if (!capaRes.ok) throw new Error('Falha no upload da capa')
        }

        // 2. Upload das Páginas PNG (se selecionadas)
        if (pngFiles.length > 0) {
          // Ordena pelo nome para garantir a ordem das páginas
          const sortedPngs = [...pngFiles].sort((a, b) => a.name.localeCompare(b.name))
          for (let i = 0; i < sortedPngs.length; i++) {
            const num = String(i + 1).padStart(2, '0')
            const pngRes = await fetch(`https://br.storage.bunnycdn.com/contos-apks/hq/${slug}/HQ_${num}.png`, {
              method: 'PUT',
              headers: { 'AccessKey': accessKey, 'Content-Type': 'image/png' },
              body: sortedPngs[i],
            })
            if (!pngRes.ok) throw new Error(`Falha no upload da página HQ_${num}.png`)
          }
        }

        // 3. Upload do PDF (se selecionado o arquivo)
        if (pdfFile) {
          const pdfRes = await fetch(`https://br.storage.bunnycdn.com/contos-apks/hq/${slug}/pdf/${slug}.pdf`, {
            method: 'PUT',
            headers: { 'AccessKey': accessKey, 'Content-Type': 'application/pdf' },
            body: pdfFile,
          })
          if (!pdfRes.ok) throw new Error('Falha no upload do PDF')
        }

        // 4. Salvar no Supabase via Server Action
        const fd = new FormData()
        fd.append('titulo', titulo.trim())
        fd.append('descricao', descricao.trim())
        const paginas = pngFiles.length > 0 ? String(pngFiles.length) : totalPaginas
        fd.append('total_paginas', paginas)
        fd.append('planos_acesso', JSON.stringify(planosAcesso))
        fd.append('planos_pdf', JSON.stringify(planosPdf))
        fd.append('slug_gerado', slug)
        if (pdfFile || linkPdf.trim()) fd.append('tem_pdf', 'true')
        if (linkPdf.trim()) fd.append('link_pdf', linkPdf.trim())

        const res = await publicarHq(fd)
        if (res.success) {
          setMensagem('✅ HQ publicada com sucesso! Disponível para os assinantes.')
          setTitulo(''); setDescricao(''); setPdfFile(null); setCapaFile(null); setLinkPdf(''); setPngFiles([])
          setTotalPaginas('1')
          if (res.hq) setHqs(prev => [res.hq!, ...prev])
        } else {
          setErro(`❌ Erro: ${res.error}`)
        }
      } catch (e: any) {
        setErro(`❌ Erro de upload: ${e.message}`)
      }
    })
  }

  const handleDeletar = (id: string, titulo: string) => {
    if (!confirm(`Remover a HQ "${titulo}"?`)) return
    startTransition(async () => {
      const res = await deletarHq(id)
      if (res.success) setHqs(prev => prev.filter(h => h.id !== id))
      else setErro(`❌ Erro ao remover: ${res.error}`)
    })
  }

  // Estado de upload de PDF por HQ
  const [uploadPdfId, setUploadPdfId] = useState<string | null>(null)
  const [pdfUploadFile, setPdfUploadFile] = useState<File | null>(null)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const pdfUploadRef = useRef<HTMLInputElement>(null)

  const handleAdicionarPdf = async (hq: HqType) => {
    if (!pdfUploadFile) return
    setUploadingPdf(true)
    setErro('')
    setMensagem('')
    
    try {
      // 1. Upload direto pro Bunny via Client (Bypassa limite de 4.5MB da Vercel)
      const resBunny = await fetch(`https://br.storage.bunnycdn.com/contos-apks/hq/${hq.slug}/pdf/${hq.slug}.pdf`, {
        method: 'PUT',
        headers: {
          'AccessKey': '5513bf80-0970-4a66-a4e06d748364-2d6f-4522',
          'Content-Type': 'application/pdf',
        },
        body: pdfUploadFile
      })

      if (!resBunny.ok) throw new Error(`BunnyCDN: ${resBunny.statusText}`)

      // 2. Atualizar banco via Server Action
      const fd = new FormData()
      fd.append('id', hq.id)
      
      startTransition(async () => {
        const res = await adicionarPdfHq(fd)
        if (res.success) {
          setMensagem(`✅ PDF da "${hq.titulo}" adicionado com sucesso!`)
          setHqs(prev => prev.map(h => h.id === hq.id ? { ...h, tem_pdf: true } : h))
          setUploadPdfId(null)
          setPdfUploadFile(null)
        } else {
          setErro(`❌ Erro: ${res.error}`)
        }
        setUploadingPdf(false)
      })
    } catch (e: any) {
      setErro(`❌ Falha no upload: ${e.message}`)
      setUploadingPdf(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4AF37, #8b7322)' }}>
            <BookOpen size={20} className="text-black" />
          </div>
          <div>
            <h3 className="text-white font-black text-base">Histórias em Quadrinhos</h3>
            <p className="text-white/40 text-xs">{hqs.length} HQ(s) publicada(s)</p>
          </div>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
          style={{ background: mostrarForm ? 'rgba(255,255,255,0.05)' : 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}
        >
          <Plus size={14} />
          {mostrarForm ? 'Cancelar' : 'Nova HQ'}
        </button>
      </div>

      {/* Mensagens globais */}
      {mensagem && <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"><CheckCircle2 size={15} />{mensagem}</div>}
      {erro && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

      {/* Lista de HQs existentes */}
      <div className="space-y-3">
        {hqs.map(hq => (
          <div key={hq.id} className="rounded-xl border border-white/5 bg-white/2 overflow-hidden">
            {/* Linha principal */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {hq.capa_url && (
                  <img src={hq.capa_url} alt={hq.titulo} className="w-10 h-14 object-cover rounded-lg" />
                )}
                <div>
                  <div className="text-white font-bold text-sm">{hq.titulo}</div>
                  <div className="text-white/40 text-xs mt-0.5">
                    {hq.total_paginas} pág. •{' '}
                    {hq.tem_pdf
                      ? <span className="text-green-400 font-semibold">✓ PDF disponível</span>
                      : <span className="text-yellow-400/70">⚠ Sem PDF</span>
                    }
                    {' '}• Acesso: {hq.planos_acesso.join(', ')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hq.tem_pdf && (
                  <button
                    onClick={() => {
                      const link = `https://contos-apks.b-cdn.net/hq/${hq.slug}/pdf/${hq.slug}.pdf`
                      navigator.clipboard.writeText(link)
                      alert('Link do PDF copiado para a área de transferência!')
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                    title="Copiar Link Direto do PDF"
                  >
                    <LinkIcon size={12} />
                    Copiar Link
                  </button>
                )}
                {/* Botão adicionar/trocar PDF */}
                <button
                  onClick={() => {
                    setUploadPdfId(uploadPdfId === hq.id ? null : hq.id)
                    setPdfUploadFile(null)
                    setErro('')
                    setMensagem('')
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37' }}
                >
                  <FileText size={12} />
                  {hq.tem_pdf ? 'Trocar PDF' : 'Add PDF'}
                </button>
                <button onClick={() => handleDeletar(hq.id, hq.titulo)} className="text-red-400/50 hover:text-red-400 transition-colors p-2">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Painel de upload de PDF (expansível) */}
            {uploadPdfId === hq.id && (
              <div className="border-t border-white/5 bg-[#0f171e] px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div
                  onClick={() => pdfUploadRef.current?.click()}
                  className="flex-1 flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/20 hover:border-[#D4AF37]/50 cursor-pointer transition-colors"
                >
                  <FileText size={16} className="text-white/40 shrink-0" />
                  <span className="text-white/40 text-sm truncate">
                    {pdfUploadFile ? pdfUploadFile.name : 'Clique para selecionar o PDF'}
                  </span>
                </div>
                <input
                  ref={pdfUploadRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={e => setPdfUploadFile(e.target.files?.[0] || null)}
                />
                <button
                  onClick={() => handleAdicionarPdf(hq)}
                  disabled={!pdfUploadFile || uploadingPdf}
                  className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #8b7322)', color: '#000' }}
                >
                  {uploadingPdf ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {uploadingPdf ? 'Enviando...' : 'Enviar PDF'}
                </button>
              </div>
            )}
          </div>
        ))}
        {hqs.length === 0 && (
          <p className="text-white/25 text-sm text-center py-6">Nenhuma HQ cadastrada ainda.</p>
        )}
      </div>


      {/* Formulário de Nova HQ */}
      {mostrarForm && (
        <div className="bg-[#0f171e] border border-[#D4AF37]/20 rounded-2xl p-6 space-y-4">
          <h4 className="text-white font-bold text-sm uppercase tracking-widest text-[#D4AF37]">Publicar Nova HQ</h4>

          {/* Título */}
          <div>
            <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">Título</label>
            <input
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="ex: São Francisco de Assis"
              className="w-full bg-[#090B10] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none text-sm"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">Descrição</label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows={2}
              placeholder="Breve descrição da HQ..."
              className="w-full bg-[#090B10] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none text-sm resize-none"
            />
          </div>

          {/* Total de páginas */}
          <div>
            <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">Total de Páginas (imagens no Bunny)</label>
            <input
              type="number"
              min="1"
              value={totalPaginas}
              onChange={e => setTotalPaginas(e.target.value)}
              className="w-full bg-[#090B10] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white focus:outline-none text-sm"
            />
            <p className="text-white/25 text-[10px] mt-1">As imagens devem estar no Bunny: hq/{'{slug}'}/HQ_01.png, HQ_02.png...</p>
          </div>

          {/* Capa */}
          <div>
            <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">Imagem de Capa (Obrigatório)</label>
            <div
              onClick={() => capaRef.current?.click()}
              className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-white/20 hover:border-[#D4AF37]/50 cursor-pointer transition-colors"
            >
              <ImageIcon size={18} className="text-white/40" />
              <span className="text-white/40 text-sm">{capaFile ? capaFile.name : 'Clique para selecionar a capa (ex: capa.png)'}</span>
            </div>
            <input ref={capaRef} type="file" accept="image/*" className="hidden" onChange={e => setCapaFile(e.target.files?.[0] || null)} />
          </div>

          {/* Páginas PNG */}
          <div>
            <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">Páginas da HQ (.png)</label>
            <div
              onClick={() => pngsRef.current?.click()}
              className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-white/20 hover:border-[#D4AF37]/50 cursor-pointer transition-colors"
            >
              <ImageIcon size={18} className="text-white/40" />
              <span className="text-white/40 text-sm">
                {pngFiles.length > 0 ? `${pngFiles.length} página(s) selecionada(s)` : 'Selecione todas as imagens PNG (HQ_01, HQ_02...)'}
              </span>
            </div>
            <input ref={pngsRef} type="file" accept="image/png" multiple className="hidden" onChange={e => setPngFiles(Array.from(e.target.files || []))} />
            <p className="text-white/25 text-[10px] mt-1">Ao selecionar arquivos, o "Total de Páginas" será atualizado automaticamente.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Arquivo PDF */}
            <div>
              <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">Arquivo PDF (opcional)</label>
              <div
                onClick={() => pdfRef.current?.click()}
                className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-white/20 hover:border-[#D4AF37]/50 cursor-pointer transition-colors"
              >
                <FileText size={18} className="text-white/40 shrink-0" />
                <span className="text-white/40 text-sm truncate">{pdfFile ? pdfFile.name : 'Upload do arquivo .pdf'}</span>
              </div>
              <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={e => setPdfFile(e.target.files?.[0] || null)} />
            </div>

            {/* PDF Link */}
            <div>
              <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">Link Direto do PDF (opcional)</label>
              <input
                type="url"
                placeholder="Ex: https://br.storage.bunnycdn.com/.../?download"
                value={linkPdf}
                onChange={e => setLinkPdf(e.target.value)}
                className="w-full bg-[#090B10] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white focus:outline-none text-sm h-full"
              />
            </div>
          </div>

          {/* Planos com acesso à leitura */}
          <div>
            <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">Planos com acesso à leitura</label>
            <div className="flex gap-2">
              {PLANOS_DISPONIVEIS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlano(p, planosAcesso, setPlanosAcesso)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${planosAcesso.includes(p) ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]' : 'border-white/10 text-white/40'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Planos com acesso ao PDF */}
          <div>
            <label className="block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold">Planos com download do PDF</label>
            <div className="flex gap-2">
              {PLANOS_DISPONIVEIS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlano(p, planosPdf, setPlanosPdf)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${planosPdf.includes(p) ? 'border-green-400 bg-green-400/10 text-green-400' : 'border-white/10 text-white/40'}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-white/25 text-[10px] mt-1">Planos não selecionados verão a HQ mas não poderão baixar o PDF</p>
          </div>

          {/* Feedback */}
          {mensagem && <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2"><CheckCircle2 size={15} />{mensagem}</div>}
          {erro && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{erro}</div>}

          <button
            onClick={handlePublicar}
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #8b7322)', color: '#000' }}
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {isPending ? 'Publicando...' : 'Publicar HQ'}
          </button>
        </div>
      )}

      {/* Mensagem de sucesso fora do form */}
      {mensagem && !mostrarForm && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
          <CheckCircle2 size={15} />{mensagem}
        </div>
      )}
    </div>
  )
}
