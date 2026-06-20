'use client'

import { useState } from 'react'
import { Edit3, X, Tv2 } from 'lucide-react'
import Link from 'next/link'
import SubmitButton from '@/components/SubmitButton'
import { editarVideo } from './actions'
import { convertToWebP } from '@/utils/imageUtils'

const inputCls = 'w-full bg-[#0f171e] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm'
const labelCls = 'block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold'

type VideoType = {
  id: string; titulo: string; descricao: string | null
  categoria: string; thumbnail_url: string | null
  bunny_video_id: string; bunny_library_id: string
  duracao: string | null; criado_em: string; ativo: boolean
  em_breve?: boolean
  temporada_nome?: string | null
  episodio_numero?: number | null
}

type Props = {
  video: VideoType
  temporadasExistentes?: string[]
}

export function FormEditarVideo({ video, temporadasExistentes = [] }: Props) {
  const [emBreve, setEmBreve] = useState(video.em_breve === true)
  const [categoria, setCategoria] = useState(video.categoria || 'Geral')

  // Se o vídeo já tem uma temporada, começa no modo existente (se existir na lista) ou nova
  const temporadaAtual = video.temporada_nome || ''
  const jaExisteNaLista = temporadasExistentes.includes(temporadaAtual)

  const [modoTemporada, setModoTemporada] = useState<'existente' | 'nova'>(
    temporadasExistentes.length > 0 && jaExisteNaLista ? 'existente' : 'nova'
  )
  const [temporadaSelecionada, setTemporadaSelecionada] = useState(
    jaExisteNaLista ? temporadaAtual : (temporadasExistentes[0] || '')
  )
  const [novaTemporada, setNovaTemporada] = useState(
    !jaExisteNaLista ? temporadaAtual : ''
  )

  const temporadaNome = modoTemporada === 'existente' ? temporadaSelecionada : novaTemporada

  const handleSubmit = async (formData: FormData) => {
    const file = formData.get('thumbnail_file') as File | null
    if (file && file.size > 0 && file.type.startsWith('image/')) {
      const webpFile = await convertToWebP(file)
      formData.set('thumbnail_file', webpFile)
    }
    const editFn = editarVideo.bind(null, video.id)
    await editFn(formData)
  }

  return (
    <div className="bg-[#111827] border-2 border-[#D4AF37] rounded-3xl p-6 shadow-[0_0_30px_rgba(212,175,55,0.15)] z-20">
      <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
         <div className="flex items-center gap-2">
            <Edit3 size={18} className="text-[#D4AF37]" />
            <span className="text-white font-black">Editar Vídeo</span>
         </div>
         <Link href="/admin?tab=catalogo" className="text-white/40 hover:text-white p-1 rounded-md hover:bg-white/10"><X size={16}/></Link>
      </div>
      
      <form action={handleSubmit} encType="multipart/form-data" className="space-y-4">
        <div>
          <label className={labelCls}>Título</label>
          <input name="titulo" required defaultValue={video.titulo} className={inputCls} />
        </div>
        <div className="flex items-center gap-3 py-1">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input 
              type="checkbox" 
              id={`edit_chk_em_breve_${video.id}`}
              name="em_breve" 
              value="true" 
              checked={emBreve}
              onChange={(e) => setEmBreve(e.target.checked)}
              className="w-5 h-5 rounded-lg bg-[#0f171e] border border-white/10 text-[#D4AF37] focus:ring-0 focus:ring-offset-0 focus:outline-none cursor-pointer accent-[#D4AF37]"
            />
            <span className="text-white text-xs font-bold">Vídeo "Em Breve" (Lançamento Futuro)</span>
          </label>
        </div>
        <div>
          <label className={labelCls}>Categoria</label>
          <select 
            name="categoria" 
            value={categoria} 
            onChange={(e) => setCategoria(e.target.value)} 
            className={inputCls}
          >
            {['Geral', 'Infantil', 'Adulto', 'Documentário', 'Louvor', 'Sermão', 'Testemunho', 'Temporada', 'Vídeo Clipe'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>
            {emBreve ? 'Video ID (Bunny.net)' : 'Video ID (Bunny.net) *'}
          </label>
          <input 
            id={`edit_bunny_video_id_input_${video.id}`}
            name="bunny_video_id" 
            required={!emBreve}
            defaultValue={video.bunny_video_id || ''} 
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx" 
            className={inputCls + ' font-mono text-white/70'} 
          />
        </div>

        {/* Campos Condicionais de Temporada */}
        {categoria === 'Temporada' && (
          <div className="space-y-3">
            {/* Campo hidden com o nome final */}
            <input type="hidden" name="temporada_nome" value={temporadaNome} />

            {/* Cabeçalho com toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tv2 size={15} className="text-[#D4AF37]" />
                <span className="text-white/70 text-sm font-bold">Temporada</span>
              </div>
              <div className="flex bg-[#0f171e] border border-white/10 rounded-xl overflow-hidden text-xs font-bold">
                {temporadasExistentes.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setModoTemporada('existente')}
                    className={`px-3 py-1.5 transition-all ${modoTemporada === 'existente' ? 'bg-[#D4AF37] text-black' : 'text-white/50 hover:text-white'}`}
                  >
                    Selecionar Existente
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModoTemporada('nova')}
                  className={`px-3 py-1.5 transition-all ${modoTemporada === 'nova' ? 'bg-[#D4AF37] text-black' : 'text-white/50 hover:text-white'}`}
                >
                  + Nova Temporada
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                {modoTemporada === 'existente' && temporadasExistentes.length > 0 ? (
                  <>
                    <label className={labelCls}>Selecionar Temporada *</label>
                    <select
                      value={temporadaSelecionada}
                      onChange={(e) => setTemporadaSelecionada(e.target.value)}
                      className={inputCls}
                    >
                      {temporadasExistentes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <p className="text-white/30 text-[0.65rem] mt-1">✓ Episódio desta temporada</p>
                  </>
                ) : (
                  <>
                    <label className={labelCls}>Nome da Nova Temporada *</label>
                    <input 
                      value={novaTemporada}
                      onChange={(e) => setNovaTemporada(e.target.value)}
                      placeholder="Ex: Temporada 2, Especial de Natal..." 
                      className={inputCls}
                    />
                    <p className="text-white/30 text-[0.65rem] mt-1">Nova temporada será criada</p>
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
                  defaultValue={video.episodio_numero || ''} 
                  placeholder="Ex: 1" 
                  className={inputCls} 
                />
                <p className="text-white/30 text-[0.65rem] mt-1">Sequência dentro da temporada</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>Descrição</label>
          <textarea name="descricao" rows={2} defaultValue={video.descricao || ''} className={inputCls} style={{ resize: 'vertical' }} />
        </div>
        <div>
          <label className={labelCls}>Thumbnail (URL ou Arquivo)</label>
          <div className="space-y-2">
            <input name="thumbnail_url" defaultValue={video.thumbnail_url || ''} placeholder="Mantenha a URL ou envie um novo arquivo" className={inputCls} />
            <input type="file" name="thumbnail_file" accept="image/*" className="w-full bg-[#0f171e] border border-white/10 rounded-xl px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#D4AF37] file:text-black hover:file:brightness-110 cursor-pointer" />
          </div>
        </div>

        <SubmitButton 
          textLoading="Salvando..."
          className="w-full mt-2 bg-[#D4AF37] text-black font-black flex justify-center items-center gap-2 py-3 rounded-xl hover:brightness-110 disabled:opacity-70"
          style={{}}>
          Salvar
        </SubmitButton>
      </form>
    </div>
  )
}
