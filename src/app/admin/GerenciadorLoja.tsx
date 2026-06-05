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
  imagens_urls?: string[] | null
  proporcao_imagem?: string
  ativo: boolean
  criado_em: string
}

export function GerenciadorLoja({ produtos }: { produtos: ProdutoType[] }) {
  const [modalAberto, setModalAberto] = useState(false)
  const [produtoEditando, setProdutoEditando] = useState<ProdutoType | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [qtdImagensVisiveis, setQtdImagensVisiveis] = useState(1)
  const [urlsEdicao, setUrlsEdicao] = useState<string[]>([])

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
    setUrlsEdicao([])
    setQtdImagensVisiveis(1)
    setModalAberto(true)
  }

  const abrirEditar = (prod: ProdutoType) => {
    setProdutoEditando(prod)
    const urls = prod.imagens_urls && prod.imagens_urls.length > 0
      ? [...prod.imagens_urls]
      : [prod.imagem_url_1, prod.imagem_url_2, prod.imagem_url_3].filter((u): u is string => !!u);
    setUrlsEdicao(urls)
    setQtdImagensVisiveis(Math.max(1, urls.length))
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
        {produtos.map((produto) => {
          const totalFotos = produto.imagens_urls && produto.imagens_urls.length > 0
            ? produto.imagens_urls.length
            : (1 + (produto.imagem_url_2 ? 1 : 0) + (produto.imagem_url_3 ? 1 : 0));
          const fotoPrincipal = (produto.imagens_urls && produto.imagens_urls[0]) || produto.imagem_url_1;

          return (
            <div key={produto.id} className="bg-[#111827] border border-white/5 rounded-2xl overflow-hidden group flex flex-col justify-between">
              <div>
                {/* Imagem Principal ou Carrossel de Miniaturas */}
                <div className="aspect-square relative bg-black/50 border-b border-white/5 flex items-center justify-center overflow-hidden">
                  {fotoPrincipal ? (
                    <Image src={fotoPrincipal} alt={produto.titulo} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
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

                  {/* Badge de Proporção e Miniaturas */}
                  <div className="absolute bottom-3 left-3 flex gap-1.5 z-10">
                    <span className="bg-black/75 px-2.5 py-1 rounded-lg text-[9px] font-black text-[#D4AF37] border border-[#D4AF37]/25 uppercase tracking-wider">
                      {produto.proporcao_imagem || '1:1'}
                    </span>
                    {totalFotos > 1 && (
                      <span className="bg-black/75 px-2.5 py-1 rounded-lg text-[9px] font-black text-white/80 border border-white/10">
                        {totalFotos} FOTOS
                      </span>
                    )}
                  </div>
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
          )
        })}
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
                  const numImagem = fieldName.replace('imagem_file_', '');
                  
                  if (file && file.size > 0) {
                    // Validar tamanho do arquivo no cliente (limite de 4.5MB da Vercel)
                    if (file.size > 4.5 * 1024 * 1024) {
                      throw new Error(`A Imagem ${numImagem} é muito grande (${(file.size / 1024 / 1024).toFixed(2)}MB). O limite máximo permitido é 4.5MB. Reduza a resolução ou envie um arquivo menor.`);
                    }

                    const uploadFd = new FormData();
                    uploadFd.append('file', file);
                    try {
                      const res = await fetch('/api/admin/upload-produto', { method: 'POST', body: uploadFd });
                      if (!res.ok) {
                        const errText = await res.text().catch(() => '');
                        let errMsg = `Erro de rede (${res.status})`;
                        try {
                          const errData = JSON.parse(errText);
                          if (errData.error) errMsg = errData.error;
                        } catch {
                          if (errText) {
                            const cleanText = errText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
                            errMsg = `${errMsg}: ${cleanText.substring(0, 120)}`;
                          }
                        }
                        throw new Error(errMsg);
                      }
                      const data = await res.json();
                      if (data.success) {
                        return data.url;
                      } else {
                        throw new Error(data.error || 'Erro no upload');
                      }
                    } catch (err: any) {
                      throw new Error(`Falha no upload da Imagem ${numImagem}: ${err.message}`);
                    }
                  }
                  const urlText = fd.get(fieldName.replace('file', 'url')) as string;
                  return urlText || currentUrl;
                };

                try {
                  const urls: string[] = [];

                  // Processa o upload de todas as imagens que estão dentro do limite visível
                  for (let i = 1; i <= qtdImagensVisiveis; i++) {
                    const fieldName = `imagem_file_${i}`;
                    const curUrl = urlsEdicao[i - 1] || null;
                    const url = await uploadImagem(fieldName, curUrl);
                    if (url) {
                      urls.push(url);
                    }
                  }

                  // Adiciona o array serializado no FormData
                  fd.set('imagens_urls', JSON.stringify(urls));

                  // Remove os arquivos binários do FormData antes de enviar para a Server Action
                  // Isso impede que a requisição estoure o limite de 4.5MB da Vercel
                  for (let i = 1; i <= 10; i++) {
                    fd.delete(`imagem_file_${i}`);
                  }

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
                } catch (e: any) {
                  alert(`Falha no upload ou salvamento: ${e.message || e}`);
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/50 font-black mb-2">Link de Afiliado</label>
                  <input required defaultValue={produtoEditando?.link_afiliado} name="link_afiliado" type="url" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none text-sm transition-all" placeholder="https://shopee.com.br/..." />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-white/50 font-black mb-2">Proporção da Imagem no Card</label>
                  <select 
                    name="proporcao_imagem" 
                    defaultValue={produtoEditando?.proporcao_imagem || '1:1'}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#D4AF37] focus:outline-none text-sm transition-all cursor-pointer"
                  >
                    <option value="1:1">Quadrado (1:1)</option>
                    <option value="16:9">Horizontal (16:9)</option>
                    <option value="9:16">Vertical (9:16)</option>
                  </select>
                </div>
              </div>

              {/* Upload de Imagens dinâmicas */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="block text-[10px] uppercase tracking-widest text-[#D4AF37] font-black">Fotos do Produto (Máx 10)</span>
                  <div className="flex gap-2">
                    {qtdImagensVisiveis > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setQtdImagensVisiveis(prev => prev - 1)
                          // Remove o último item das URLs em edição para manter a integridade visual
                          setUrlsEdicao(prev => prev.slice(0, prev.length - 1))
                        }}
                        className="text-red-400 hover:text-red-300 text-xs font-bold bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl transition-all"
                      >
                        - Remover Foto
                      </button>
                    )}
                    {qtdImagensVisiveis < 10 && (
                      <button
                        type="button"
                        onClick={() => setQtdImagensVisiveis(prev => prev + 1)}
                        className="text-[#D4AF37] hover:text-white text-xs font-bold bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1.5 rounded-xl transition-all"
                      >
                        + Adicionar Foto
                      </button>
                    )}
                  </div>
                </div>
                
                {Array.from({ length: qtdImagensVisiveis }).map((_, index) => {
                  const num = index + 1;
                  const curUrl = urlsEdicao[index] || null;
                  return (
                    <div key={num} className="bg-white/[0.02] p-4 rounded-2xl border border-white/5 space-y-3 relative">
                      <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg -mx-2 -mt-2">
                        <span className="text-[10px] uppercase font-extrabold text-white/40">Imagem {num}</span>
                        <div className="flex items-center gap-2">
                          {curUrl ? (
                            <>
                              <span className="text-[9px] bg-green-500/10 text-green-400 font-bold border border-green-500/20 px-2 py-0.5 rounded">Já cadastrada</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const novas = [...urlsEdicao];
                                  novas[index] = '';
                                  setUrlsEdicao(novas);
                                  // Limpa fisicamente os inputs correspondentes
                                  const fileInput = document.querySelector(`input[name="imagem_file_${num}"]`) as HTMLInputElement;
                                  if (fileInput) fileInput.value = '';
                                  const urlInput = document.querySelector(`input[name="imagem_url_${num}"]`) as HTMLInputElement;
                                  if (urlInput) urlInput.value = '';
                                }}
                                className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded transition-colors"
                                title="Limpar e remover imagem"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          ) : (
                            <span className="text-[9px] bg-white/5 text-white/30 border border-white/5 px-2 py-0.5 rounded">Vazio</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-white/40 font-bold mb-1.5">Enviar do computador</label>
                          <input name={`imagem_file_${num}`} type="file" accept="image/*" className="w-full text-xs text-white/60 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-black file:bg-[#D4AF37] file:text-black hover:file:brightness-110 cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase tracking-wider text-white/40 font-bold mb-1.5">Ou URL externa direta</label>
                          <input 
                            value={curUrl || ''} 
                            name={`imagem_url_${num}`} 
                            type="url" 
                            onChange={(e) => {
                              const novas = [...urlsEdicao];
                              novas[index] = e.target.value;
                              setUrlsEdicao(novas);
                            }}
                            className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:border-[#D4AF37] focus:outline-none transition-all" 
                            placeholder="https://site.com/foto.jpg" 
                          />
                        </div>
                      </div>
                    </div>
                  )
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

