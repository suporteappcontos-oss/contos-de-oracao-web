'use client'

import { useState, useRef, useTransition } from 'react'
import { Plus, Loader2, CheckCircle2, Tv, Image as ImageIcon, Trash2, Edit2, X } from 'lucide-react'
import { adicionarSerie, editarSerie, deletarSerie, toggleSerieAtiva } from './actions'
import { convertToWebP } from '@/utils/imageUtils'

export function GerenciadorSeries({ seriesExistentes }: { seriesExistentes: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [uploadingCapa, setUploadingCapa] = useState(false)
  const [progressCapa, setProgressCapa] = useState(0)
  
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  // Form states
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [capaExistente, setCapaExistente] = useState('')
  const capaRef = useRef<HTMLInputElement>(null)

  function resetForm() {
    setEditandoId(null)
    setTitulo('')
    setDescricao('')
    setCapaExistente('')
    setMensagem('')
    setErro('')
    if (capaRef.current) capaRef.current.value = ''
  }

  function abrirEdicao(serie: any) {
    setEditandoId(serie.id)
    setTitulo(serie.titulo)
    setDescricao(serie.descricao || '')
    setCapaExistente(serie.capa_url || '')
    setIsOpen(true)
  }

  // Faz o upload da imagem WebP para o Bunny (usando a mesma lógica)
  async function uploadFileWithProgress(file: File, path: string, onProgress: (p: number) => void): Promise<string> {
    const BUNNY_STORAGE_KEY = '0109d994-0c03-4a29-a9e89c3a3287-5e82-4d9c'
    const BUNNY_STORAGE_URL = 'https://br.storage.bunnycdn.com/contos-midia-app'
    const BUNNY_CDN_URL = 'https://contos-midia-app.b-cdn.net'
    const finalUrl = `${BUNNY_STORAGE_URL}/${path}`

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', finalUrl, true)
      xhr.setRequestHeader('AccessKey', BUNNY_STORAGE_KEY)
      xhr.setRequestHeader('Content-Type', 'application/octet-stream')

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const p = Math.round((e.loaded / e.total) * 100)
          onProgress(p)
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(`${BUNNY_CDN_URL}/${path}`)
        } else {
          reject(new Error(`Erro no Bunny: ${xhr.status} ${xhr.statusText}`))
        }
      }

      xhr.onerror = () => reject(new Error('Erro de rede ao conectar com BunnyCDN.'))
      xhr.send(file)
    })
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setMensagem('')
    
    let urlCapaFinal = capaExistente

    try {
      const coverFile = capaRef.current?.files?.[0]
      if (coverFile) {
        setUploadingCapa(true)
        setProgressCapa(0)
        
        // Converto para WebP (Magia do painel)
        const optimizedFile = await convertToWebP(coverFile)
        
        const slug = titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        const fileExt = '.webp'
        const path = `series/${slug}-capa-${Date.now()}${fileExt}`
        
        urlCapaFinal = await uploadFileWithProgress(optimizedFile, path, setProgressCapa)
        setUploadingCapa(false)
      } else if (!editandoId && !capaExistente) {
        throw new Error('Você precisa selecionar uma imagem de capa para criar uma série!')
      }

      startTransition(async () => {
        const formData = new FormData()
        formData.append('titulo', titulo)
        formData.append('descricao', descricao)
        formData.append('capa_url', urlCapaFinal)

        let result
        if (editandoId) {
          result = await editarSerie(editandoId, formData)
        } else {
          result = await adicionarSerie(formData)
        }

        if (result.success) {
          setMensagem(editandoId ? 'Série atualizada com sucesso!' : 'Série criada com sucesso!')
          setTimeout(() => {
            setIsOpen(false)
            resetForm()
          }, 2000)
        } else {
          setErro(result.error || 'Ocorreu um erro ao salvar a Série.')
        }
      })
    } catch (err: any) {
      setUploadingCapa(false)
      setErro(err.message)
    }
  }

  return (
    <div className="bg-[#1a222c] border border-white/5 rounded-2xl p-6 mb-8 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tv size={24} className="text-[#D4AF37]" />
            Séries
          </h2>
          <p className="text-white/50 text-sm mt-1">Crie e edite as séries e suas capas para o App</p>
        </div>
        
        {!isOpen && (
          <button
            onClick={() => { resetForm(); setIsOpen(true) }}
            className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black px-4 py-2 rounded-xl font-bold transition-all"
          >
            <Plus size={18} />
            Nova Série
          </button>
        )}
      </div>

      {isOpen && (
        <div className="bg-black/20 border border-white/10 rounded-xl p-5 mb-6 animate-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">{editandoId ? 'Editar Série' : 'Criar Nova Série'}</h3>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white"><X size={20}/></button>
          </div>
          
          <form onSubmit={handleSalvar} className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs font-bold mb-1.5 uppercase tracking-wider">Título da Série *</label>
              <input
                value={titulo}
                onChange={e => setTitulo(e.target.value)}
                placeholder="Ex: O Antigo Testamento"
                required
                className="w-full bg-[#0f171e] border border-white/10 rounded-xl px-4 py-2.5 text-white"
              />
            </div>
            
            <div>
              <label className="block text-white/50 text-xs font-bold mb-1.5 uppercase tracking-wider">Descrição</label>
              <textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="Ex: Uma série que conta a história dos profetas..."
                rows={2}
                className="w-full bg-[#0f171e] border border-white/10 rounded-xl px-4 py-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs font-bold mb-1.5 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon size={14} /> Capa da Série (1280x720 recomendado) {editandoId ? '' : '*'}
              </label>
              {capaExistente && (
                <div className="mb-2 w-32 h-20 rounded-md bg-white/5 bg-cover bg-center" style={{ backgroundImage: `url(${capaExistente})` }} />
              )}
              <input
                ref={capaRef}
                type="file"
                accept="image/*"
                className="w-full bg-[#0f171e] border border-white/10 rounded-xl px-4 py-2 text-white file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37] file:text-black cursor-pointer text-sm"
              />
              {uploadingCapa && progressCapa > 0 && progressCapa < 100 && (
                <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37] transition-all" style={{ width: `${progressCapa}%` }} />
                </div>
              )}
            </div>

            {erro && <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-2">{erro}</div>}
            {mensagem && <div className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-xl px-4 py-2">{mensagem}</div>}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-white/50 hover:text-white font-medium text-sm">Cancelar</button>
              <button
                type="submit"
                disabled={uploadingCapa || isPending}
                className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black px-6 py-2 rounded-xl font-bold text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {(uploadingCapa || isPending) && <Loader2 size={16} className="animate-spin" />}
                {uploadingCapa ? 'Enviando...' : isPending ? 'Salvando...' : 'Salvar Série'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Séries */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {seriesExistentes?.length === 0 && <p className="text-white/30 text-sm">Nenhuma série cadastrada.</p>}
        {seriesExistentes?.map((s) => (
          <div key={s.id} className="bg-black/30 border border-white/5 rounded-xl overflow-hidden group flex">
            <div className="w-1/3 min-w-[100px] bg-white/5 bg-cover bg-center" style={{ backgroundImage: `url(${s.capa_url})` }} />
            <div className="w-2/3 p-4 flex flex-col justify-center relative">
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => abrirEdicao(s)} className="p-1.5 text-white/50 hover:text-[#D4AF37] bg-black/50 rounded-lg backdrop-blur"><Edit2 size={14}/></button>
              </div>
              <h4 className="font-bold text-white text-sm line-clamp-1">{s.titulo}</h4>
              <p className="text-white/40 text-[10px] mt-1 line-clamp-2">{s.descricao || 'Sem descrição'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
