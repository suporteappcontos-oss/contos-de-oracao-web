'use client'

import { useState } from 'react'
import { Edit3, X } from 'lucide-react'
import Link from 'next/link'
import SubmitButton from '@/components/SubmitButton'
import { editarVideo } from './actions'

const inputCls = 'w-full bg-[#0f171e] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm'
const labelCls = 'block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold'

type VideoType = {
  id: string; titulo: string; descricao: string | null
  categoria: string; thumbnail_url: string | null
  bunny_video_id: string; bunny_library_id: string
  duracao: string | null; criado_em: string; ativo: boolean
  em_breve?: boolean
}

export function FormEditarVideo({ video }: { video: VideoType }) {
  const [emBreve, setEmBreve] = useState(video.em_breve === true)

  return (
    <div className="bg-[#111827] border-2 border-[#D4AF37] rounded-3xl p-6 shadow-[0_0_30px_rgba(212,175,55,0.15)] z-20">
      <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
         <div className="flex items-center gap-2">
            <Edit3 size={18} className="text-[#D4AF37]" />
            <span className="text-white font-black">Editar Vídeo</span>
         </div>
         <Link href="/admin?tab=catalogo" className="text-white/40 hover:text-white p-1 rounded-md hover:bg-white/10"><X size={16}/></Link>
      </div>
      
      <form action={editarVideo.bind(null, video.id)} encType="multipart/form-data" className="space-y-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <div>
            <label className={labelCls}>Duração</label>
            <input name="duracao" defaultValue={video.duracao || ''} placeholder="Ex: 12:34" className={inputCls} />
          </div>
        </div>
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
