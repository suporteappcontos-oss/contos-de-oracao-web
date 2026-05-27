'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import SubmitButton from '@/components/SubmitButton'
import { adicionarVideo } from './actions'

const inputCls = 'w-full bg-[#0f171e] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm'
const labelCls = 'block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold'

export function FormAdicionarVideo() {
  const [emBreve, setEmBreve] = useState(false)
  const [categoria, setCategoria] = useState('Geral')

  return (
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
            value={categoria} 
            onChange={(e) => setCategoria(e.target.value)} 
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
        {categoria === 'Temporada' && (
          <>
            <div className="md:col-span-8">
              <label className={labelCls}>Nome da Temporada *</label>
              <input 
                name="temporada_nome" 
                required 
                placeholder="Ex: Temporada 1, Especial de Páscoa..." 
                className={inputCls} 
              />
            </div>
            <div className="md:col-span-4">
              <label className={labelCls}>Número do Episódio *</label>
              <input 
                type="number" 
                name="episodio_numero" 
                required 
                min={1} 
                placeholder="Ex: 1" 
                className={inputCls} 
              />
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
  )
}
