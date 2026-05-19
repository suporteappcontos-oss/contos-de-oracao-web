'use client'

import { useState } from 'react'
import { Plus, Trash2, Image as ImageIcon, Link as LinkIcon } from 'lucide-react'
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

  const handleAction = async (action: () => Promise<unknown>, id: string) => {
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
              const file = fd.get('imagem_file') as File;
              let finalUrl = fd.get('imagem_url') as string;
              
              if (file && file.size > 0) {
                const uploadFd = new FormData();
                uploadFd.append('file', file);
                const res = await fetch('/api/admin/upload-anuncio', { method: 'POST', body: uploadFd });
                const data = await res.json();
                if (data.success) {
                  finalUrl = data.url;
                } else {
                  alert("Erro no upload da imagem: " + data.error);
                  return;
                }
              }
              
              if (!finalUrl) {
                alert("Por favor, selecione uma imagem do seu PC ou insira uma URL.");
                return;
              }
              
              fd.set('imagem_url', finalUrl);
              await adicionarAnuncioPausa(fd);
              setModalAberto(false);
            }} className="p-6 space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/50 font-bold mb-2">Título (Interno)</label>
                <input required name="titulo" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none" placeholder="Ex: Doação Especial" />
              </div>
              
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#D4AF37] font-bold mb-2">Opção 1: Enviar do PC</label>
                  <input name="imagem_file" type="file" accept="image/*" className="w-full text-sm text-white/70 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#D4AF37] file:text-black hover:file:brightness-110" />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span className="text-xs text-white/30 font-bold uppercase tracking-wider">OU</span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-[#D4AF37] font-bold mb-2">Opção 2: URL Direta</label>
                  <input name="imagem_url" type="url" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none" placeholder="https://..." />
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                <p className="text-sm text-blue-400 font-medium mb-2">🎨 Quer criar modelos profissionais?</p>
                <p className="text-xs text-white/60 leading-relaxed mb-3">Você pode usar modelos pré-prontos do Canva para editar livremente e exportar em PNG para usar aqui.</p>
                <div className="flex gap-2">
                  <a href="https://www.canva.com/templates/?query=youtube-thumbnail" target="_blank" rel="noreferrer" className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-500/30 transition-colors">Ver Modelos Horizontais (TV/PC)</a>
                  <a href="https://www.canva.com/templates/?query=instagram-story" target="_blank" rel="noreferrer" className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-500/30 transition-colors">Ver Modelos Verticais (Celular)</a>
                </div>
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
                <SubmitButton textLoading="Criando..." className="flex-1 py-3 font-bold rounded-xl text-[#090B10] bg-[#D4AF37] hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                  Criar Anúncio
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
