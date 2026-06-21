'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Image as ImageIcon, X } from 'lucide-react'
import { adicionarSerie, editarSerie } from './actions'
import { convertToWebP } from '@/utils/imageUtils'

export function ModalSerie({
  isOpen,
  onClose,
  serieEditando
}: {
  isOpen: boolean
  onClose: () => void
  serieEditando?: any
}) {
  const [isPending, startTransition] = useTransition()
  const [uploadingCapa, setUploadingCapa] = useState(false)
  const [progressCapa, setProgressCapa] = useState(0)
  
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const router = useRouter()

  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [capaExistente, setCapaExistente] = useState('')
  const capaRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      if (serieEditando) {
        setTitulo(serieEditando.titulo || '')
        setDescricao(serieEditando.descricao || '')
        setCapaExistente(serieEditando.capa_url || '')
      } else {
        setTitulo('')
        setDescricao('')
        setCapaExistente('')
        if (capaRef.current) capaRef.current.value = ''
      }
      setMensagem('')
      setErro('')
    }
  }, [isOpen, serieEditando])

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
        
        const optimizedFile = await convertToWebP(coverFile)
        
        const slug = titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        const fileExt = '.webp'
        const path = `series/${slug}-capa-${Date.now()}${fileExt}`
        
        urlCapaFinal = await uploadFileWithProgress(optimizedFile, path, setProgressCapa)
        setUploadingCapa(false)
      } else if (!serieEditando && !capaExistente) {
        throw new Error('Você precisa selecionar uma imagem de capa para criar uma série!')
      }

      startTransition(async () => {
        const formData = new FormData()
        formData.append('titulo', titulo)
        formData.append('descricao', descricao)
        formData.append('capa_url', urlCapaFinal)

        let result
        if (serieEditando?.id) {
          result = await editarSerie(serieEditando.id, formData)
        } else {
          result = await adicionarSerie(formData)
        }

        if (result.success) {
          setMensagem(serieEditando ? 'Série atualizada com sucesso!' : 'Série criada com sucesso!')
          router.refresh()
          setTimeout(() => {
            onClose()
          }, 1500)
        } else {
          setErro(result.error || 'Ocorreu um erro ao salvar a Série.')
        }
      })
    } catch (err: any) {
      setUploadingCapa(false)
      setErro(err.message)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#1a222c] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-5 border-b border-white/5">
          <h3 className="font-bold text-white text-lg">{serieEditando ? 'Editar Série' : 'Criar Nova Série'}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-5">
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
                <ImageIcon size={14} /> Capa da Série (1280x720 recomendado) {serieEditando ? '' : '*'}
              </label>
              {capaExistente && (
                <div className="mb-3 w-40 h-24 rounded-lg bg-white/5 bg-cover bg-center border border-white/10" style={{ backgroundImage: `url(${capaExistente})` }} />
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

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-white/5">
              <button type="button" onClick={onClose} className="px-4 py-2 text-white/50 hover:text-white font-medium text-sm">Cancelar</button>
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
      </div>
    </div>
  )
}
