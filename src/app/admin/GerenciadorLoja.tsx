'use client'

import { useState } from 'react'
import { Plus, Trash2, Image as ImageIcon, Link as LinkIcon, Edit3, X } from 'lucide-react'
import SubmitButton from '@/components/SubmitButton'
import { adicionarProdutoLoja, editarProdutoLoja, deletarProdutoLoja, toggleProdutoLojaAtivo } from './actions'
import Image from 'next/image'

type ProdutoType = {
  id: string
  titulo: string
  descricao: string
  link_afiliado: string
  imagem_url_1: string | null
  imagem_url_2: string | null
  imagem_url_3: string | null
  ativo: boolean
  criado_em: string
}

export function GerenciadorLoja({ produtos }: { produtos: ProdutoType[] }) {
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<ProdutoType | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleAction = async (action: () => Promise<any>, id: string) => {
    setLoadingId(id)
    try {
      const res = await action()
      if (res && !res.success) alert(res.error)
    } finally {
      setLoadingId(null)
    }
  }

  const abrirCriar = () => {
    setProdutoEditando(null)
    setModalAberto(true)
  }

  const abrirEditar = (prod: ProdutoType) => {
    setProdutoEditando(prod)
    setModalAberto(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight">Loja de Afiliados</h2>
          <p className="text-white/50 mt-1">Gerencie os produtos da sua loja física. Seus links de afiliado (Shopee, TikTok, etc.) substituem o Stripe.</p>
        </div>
        <button
          onClick={abrirCriar}
          className="flex items-center gap-2 bg-[#D4AF37] text-black font-bold px-5 py-2.5 rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        >
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos.map((produto) => (
          <div key={produto.id} className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden group flex flex-col justify-between">
            <div>
              {/* Imagem Principal ou Carrossel de Miniaturas */}
              <div className="aspect-square relative bg-black/50 border-b border-white/5 flex items-center justify-center overflow-hidden">
                {produto.imagem_url_1 ? (
                  <Image src={produto.imagem_url_1} alt={produto.titulo} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <ImageIcon className="text-white/20" size={48} />
                )}
                
                {/* Indicador de Status */}
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    onClick={() => handleAction(() => toggleProdutoLojaAtivo(produto.id, produto.ativo), produto.id)}
                    disabled={loadingId === produto.id}
                    className={`px-3 py-1 text-[10px] font-black rounded-full transition-colors ${
                      produto.ativo 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}
                  >
                    {loadingId === produto.id ? '...' : produto.ativo ? 'ATIVO' : 'INATIVO'}
                  </button>
                </div>

                {/* Badge de Miniaturas secundárias */}
                {(produto.imagem_url_2 || produto.imagem_url_3) && (
                  <div className="absolute bottom-3 left-3 bg-black/70 px-2 py-1 rounded-md text-[10px] font-bold text-white/80 border border-white/10">
                    {1 + (produto.imagem_url_2 ? 1 : 0) + (produto.imagem_url_3 ? 1 : 0)} Imagens
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3">
                <h3 className="font-bold text-white text-lg truncate" title={produto.titulo}>{produto.titulo}</h3>
                <p className="text-white/60 text-xs leading-relaxed line-clamp-3 h-12">{produto.descricao}</p>
                <div className="flex items-center gap-2 text-[11px] text-[#D4AF37] font-semibold bg-[#D4AF37]/5 px-3 py-1.5 rounded-lg border border-[#D4AF37]/10 w-fit truncate max-w-full">
                  <LinkIcon size={12} className="shrink-0" />
                  <span className="truncate">{produto.link_afiliado}</span>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
                  Cadastrado {new Date(produto.criado_em).toLocaleDateString()}
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => abrirEditar(produto)}
                    className="text-[#D4AF37] hover:bg-[#D4AF37]/10 p-2 rounded-lg transition-colors border border-transparent hover:border-[#D4AF37]/20"
                    title="Editar produto"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Deseja deletar este produto permanentemente?')) {
                        handleAction(() => deletarProdutoLoja(produto.id), produto.id)
                      }
                    }}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                    title="Excluir produto"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {produtos.length === 0 && (
          <div className="col-span-full py-24 text-center text-white/30 font-bold border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
            Nenhum produto cadastrado na Loja de Afiliados ainda.
          </div>
        )}
      </div>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#111827] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#090B10]/50">
              <h3 className="text-xl font-black text-white">
                {produtoEditando ? 'Editar Produto de Afiliado' : 'Criar Novo Produto'}
              </h3>
              <button 
                onClick={() => setModalAberto(false)} 
                className="text-white/50 hover:text-white p-1.5 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form 
              action={async (fd) => {
                const uploadImagem = async (fieldName: string, currentUrl: string | null) => {
                  const file = fd.get(fieldName) as File;
                  if (file && file.size > 0) {
                    const uploadFd = new FormData();
                    uploadFd.append('file', file);
                    const res = await fetch('/api/admin/upload-produto', { method: 'POST', body: uploadFd });
                    const data = await res.json();
                    if (data.success) {
                      return data.url;
                    } else {
                      alert(`Erro no upload da imagem ${fieldName.replace('imagem_file_', '')}: ${data.error}`);
                      throw new Error('Upload falhou');
                    }
                  }
                  return fd.get(fieldName.replace('file', 'url')) as string || currentUrl;
                };

                try {
                  const url1 = await uploadImagem('imagem_file_1', produtoEditando?.imagem_url_1 || null);
                  const url2 = await uploadImagem('imagem_file_2', produtoEditando?.imagem_url_2 || null);
                  const url3 = await uploadImagem('imagem_file_3', produtoEditando?.imagem_url_3 || null);

                  fd.set('imagem_url_1', url1 || '');
                  fd.set('imagem_url_2', url2 || '');
                  fd.set('imagem_url_3', url3 || '');

                  let res;
                  if (produtoEditando) {
                    res = await editarProdutoLoja(produtoEditando.id, fd);
                  } else {
                    res = await adicionarProdutoLoja(fd);
                  }

                  if (res && res.success) {
                    setModalAberto(false);
                  } else {
                    alert(res?.error || 'Erro ao salvar produto.');
                  }
                } catch (e) {
                  // Erro já alertado no uploadImagem
                }
              }} 
              className="p-6 space-y-5 max-h-[80vh] overflow-y-auto"
            >
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 font-black mb-2">Título do Produto</label>
                <input required defaultValue={produtoEditando?.titulo} name="titulo" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none text-sm transition-all" placeholder="Ex: Bíblia Ilustrada Infantil" />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 font-black mb-2">Descrição do Produto</label>
                <textarea required defaultValue={produtoEditando?.descricao} name="descricao" rows={3} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none text-sm transition-all resize-none" placeholder="Escreva uma breve descrição destacando o produto..." />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-white/50 font-black mb-2">Link de Afiliado (Shopee, TikTok, etc.)</label>
                <input required defaultValue={produtoEditando?.link_afiliado} name="link_afiliado" type="url" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none text-sm transition-all" placeholder="https://shopee.com.br/... ou link do TikTok" />
              </div>

              {/* Upload de Imagens (Até 3) */}
              <div className="space-y-4">
                <span className="block text-[10px] uppercase tracking-widest text-[#D4AF37] font-black">Fotos do Produto (Até 3 imagens)</span>
                
                {[1, 2, 3].map((num) => {
                  const curUrl = produtoEditando?.[`imagem_url_${num}` as keyof ProdutoType] as string | null;
                  return (
                    <div key={num} className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-extrabold text-white/40">Imagem {num}</span>
                        {curUrl && (
                          <span className="text-[9px] bg-green-500/10 text-green-400 font-bold border border-green-500/20 px-2 py-0.5 rounded">Já cadastrada</span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-white/40 font-bold mb-1.5">Enviar do computador</label>
                          <input name={`imagem_file_${num}`} type="file" accept="image/*" className="w-full text-xs text-white/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-[#D4AF37] file:text-black hover:file:brightness-110 cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-white/40 font-bold mb-1.5">Ou URL externa direta</label>
                          <input defaultValue={curUrl || ''} name={`imagem_url_${num}`} type="url" className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none transition-all" placeholder="https://site.com/foto.jpg" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!produtoEditando && (
                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" name="ativo" value="true" defaultChecked className="w-5 h-5 accent-[#D4AF37] rounded cursor-pointer" id="ativo" />
                  <label htmlFor="ativo" className="text-sm font-medium text-white/80 cursor-pointer select-none">Ativar Imediatamente</label>
                </div>
              )}

              <div className="pt-6 flex gap-3 border-t border-white/5">
                <button 
                  type="button" 
                  onClick={() => setModalAberto(false)} 
                  className="flex-1 py-3 font-bold rounded-xl text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition-all text-sm"
                >
                  Cancelar
                </button>
                <SubmitButton 
                  textLoading="Salvando..." 
                  className="flex-1 py-3 font-bold rounded-xl text-[#090B10] bg-[#D4AF37] hover:brightness-110 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-75"
                >
                  {produtoEditando ? 'Salvar Alterações' : 'Criar Produto'}
                </SubmitButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
