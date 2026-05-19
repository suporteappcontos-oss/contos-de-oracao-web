'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit3, Image as ImageIcon, Link as LinkIcon, Power, CheckCircle2 } from 'lucide-react'
import SubmitButton from '@/components/SubmitButton'
import { adicionarAnuncioPausa, deletarAnuncioPausa, toggleAnuncioAtivo } from './actions'
import Image from 'next/image'

type AnuncioType = {
  id: string
  titulo: string
  imagem_url: string | null
  link_destino: string | null
  ativo: boolean
  criado_em: string
}

export function GerenciadorAnuncios({ anuncios }: { anuncios: AnuncioType[] }) {
  const [modalAberto, setModalAberto] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleAction = async (action: () => Promise<any>, id: string) => {
    setLoadingId(id)
    try {
      await action()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Anúncios na Pausa</h2>
          <p className="text-white/50 mt-1">Gerencie os banners exibidos quando o vídeo é pausado (Web e Apps).</p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          <Plus size={18} /> Novo Anúncio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {anuncios.map((anuncio) => (
          <div key={anuncio.id} className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden group">
            <div className="aspect-video relative bg-black/50 border-b border-white/5 flex items-center justify-center">
              {anuncio.imagem_url ? (
                <Image src={anuncio.imagem_url} alt={anuncio.titulo} fill className="object-contain" />
              ) : (
                <ImageIcon className="text-white/20" size={40} />
              )}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => handleAction(() => toggleAnuncioAtivo(anuncio.id, anuncio.ativo), anuncio.id)}
                  disabled={loadingId === anuncio.id}
                  className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                    anuncio.ativo 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-white/5 text-white/40 border border-white/10'
                  }`}
                >
                  {loadingId === anuncio.id ? '...' : anuncio.ativo ? 'ATIVO' : 'INATIVO'}
                </button>
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-white text-lg mb-1 truncate">{anuncio.titulo}</h3>
              <div className="flex items-center gap-2 text-xs text-white/50 mb-4">
                <LinkIcon size={12} />
                <span className="truncate">{anuncio.link_destino || 'Sem link'}</span>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[10px] text-white/30 uppercase tracking-wider">
                  Criado em {new Date(anuncio.criado_em).toLocaleDateString()}
                </span>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja excluir?')) {
                      handleAction(() => deletarAnuncioPausa(anuncio.id), anuncio.id)
                    }
                  }}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {anuncios.length === 0 && (
          <div className="col-span-full py-20 text-center text-white/30">
            Nenhum anúncio cadastrado ainda.
          </div>
        )}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Criar Novo Anúncio</h3>
              <button onClick={() => setModalAberto(false)} className="text-white/50 hover:text-white">
                <Trash2 size={20} className="hidden" /> {/* Spacer */}
                X
              </button>
            </div>
            <form action={async (fd) => {
              await adicionarAnuncioPausa(fd)
              setModalAberto(false)
            }} className="p-6 space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Título (Interno)</label>
                <input required name="titulo" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none" placeholder="Ex: Doação Especial" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">URL da Imagem (Recomendado 16:9)</label>
                <input name="imagem_url" type="url" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none" placeholder="https://..." />
                <p className="text-[10px] text-white/30 mt-2">Dica: Faça upload da imagem no Bunny e cole o link aqui.</p>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Link de Destino (Opcional)</label>
                <input name="link_destino" type="url" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none" placeholder="https://wa.me/..." />
                <p className="text-[10px] text-white/30 mt-2">Para onde o usuário vai ao clicar no anúncio no celular/computador.</p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" name="ativo" value="true" defaultChecked className="w-5 h-5 accent-[#D4AF37] rounded" id="ativo" />
                <label htmlFor="ativo" className="text-sm font-medium text-white/80">Ativar Imediatamente</label>
              </div>
              <div className="pt-6 flex gap-3">
                <button type="button" onClick={() => setModalAberto(false)} className="flex-1 py-3 font-bold rounded-xl text-white/60 hover:text-white bg-white/5 transition-colors">Cancelar</button>
                <SubmitButton label="Criar Anúncio" loadingLabel="Criando..." className="flex-1" />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
