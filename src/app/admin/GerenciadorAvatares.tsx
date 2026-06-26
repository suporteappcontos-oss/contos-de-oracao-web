'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Upload, Trash2, Loader2, Smile, AlertCircle, Heart } from 'lucide-react'

type AvatarType = {
  id: string
  nome: string
  avatar_url: string
  created_at: string
}

type PedidoType = {
  id: string
  santo_nome: string
  user_email: string | null
  created_at: string
}

export default function GerenciadorAvatares() {
  const [avatars, setAvatars] = useState<AvatarType[]>([])
  const [pedidos, setPedidos] = useState<PedidoType[]>([])
  const [loading, setLoading] = useState(true)
  
  // Form estados
  const [nomeSanto, setNomeSanto] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      const [resAvatars, resPedidos] = await Promise.all([
        fetch('/api/avatars-santos'),
        fetch('/api/admin/pedidos-santos')
      ])
      
      const dataAvatars = await resAvatars.json()
      const dataPedidos = await resPedidos.json()

      if (dataAvatars.avatars) setAvatars(dataAvatars.avatars)
      if (dataPedidos.pedidos) setPedidos(dataPedidos.pedidos)
    } catch (e) {
      console.error('Erro ao carregar dados dos avatares/pedidos:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !nomeSanto.trim()) return
    setUploading(true)

    try {
      // 1. Redimensionar para 1024x1024 e converter para WebP via Canvas
      const img = document.createElement('img')
      img.src = URL.createObjectURL(file)
      await new Promise((resolve) => (img.onload = resolve))

      const canvas = document.createElement('canvas')
      canvas.width = 1024
      canvas.height = 1024
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Não foi possível obter contexto do canvas')

      // Desenha a imagem no canvas com zoom/ajuste cobrindo o quadrado (cover)
      const size = Math.min(img.width, img.height)
      const x = (img.width - size) / 2
      const y = (img.height - size) / 2
      ctx.drawImage(img, x, y, size, size, 0, 0, 1024, 1024)

      // Converte para blob WebP
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), 'image/webp', 0.85)
      )

      if (!blob) throw new Error('Falha ao gerar imagem WebP')

      // 2. Faz o upload
      const formData = new FormData()
      formData.append('file', blob, `${nomeSanto.trim()}.webp`)
      formData.append('nomeSanto', nomeSanto.trim())

      const res = await fetch('/api/admin/upload-avatar', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar avatar')

      // Sucesso!
      setAvatars((prev) => [data.avatar, ...prev].sort((a, b) => a.nome.localeCompare(b.nome)))
      setNomeSanto('')
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      alert('Avatar adicionado com sucesso!')
    } catch (err: any) {
      alert(err.message || 'Erro no upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteAvatar = async (id: string) => {
    if (!confirm('Deseja realmente excluir este avatar? Isso removerá o arquivo no Bunny CDN e do banco.')) return

    try {
      const res = await fetch(`/api/admin/upload-avatar?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao deletar')
      }
      setAvatars((prev) => prev.filter((a) => a.id !== id))
    } catch (err: any) {
      alert(err.message || 'Erro ao deletar')
    }
  }

  const handleDeletePedido = async (id: string) => {
    if (!confirm('Deseja remover esta solicitação de santo?')) return

    try {
      const res = await fetch(`/api/admin/pedidos-santos?id=${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao deletar')
      }
      setPedidos((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      alert(err.message || 'Erro ao remover solicitação')
    }
  }

  // Agrupa os pedidos por nome para ver a popularidade
  const pedidosAgrupados = pedidos.reduce((acc: { [key: string]: { count: number; emails: string[] } }, p) => {
    const nome = p.santo_nome.trim().toUpperCase()
    if (!acc[nome]) {
      acc[nome] = { count: 0, emails: [] }
    }
    acc[nome].count += 1
    if (p.user_email && !acc[nome].emails.includes(p.user_email)) {
      acc[nome].emails.push(p.user_email)
    }
    return acc
  }, {})

  const listaPedidosAgrupados = Object.entries(pedidosAgrupados)
    .map(([nome, dados]) => ({ nome, ...dados }))
    .sort((a, b) => b.count - a.count)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[#D4AF37]" size={40} />
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulário Novo Avatar */}
        <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 shadow-xl h-fit">
          <h2 className="text-white text-xl font-bold flex items-center gap-2 mb-6">
            <Upload size={18} className="text-[#D4AF37]" />
            Novo Avatar de Santo
          </h2>
          <form onSubmit={handleUpload} className="space-y-5">
            <div>
              <label className="block text-white/70 text-xs font-bold uppercase tracking-wider mb-2">Nome do Santo *</label>
              <input
                type="text"
                required
                placeholder="Ex: São Francisco de Assis"
                value={nomeSanto}
                onChange={(e) => setNomeSanto(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-white/70 text-xs font-bold uppercase tracking-wider mb-2">Arte do Avatar (1024x1024px) *</label>
              <input
                type="file"
                required
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                id="file-avatar-upload"
              />
              <label
                htmlFor="file-avatar-upload"
                className="flex flex-col items-center justify-center w-full aspect-square bg-black/40 border-2 border-dashed border-white/10 rounded-2xl cursor-pointer hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all overflow-hidden relative group"
              >
                {file ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-bold">
                      <Upload size={24} className="mb-2" />
                      Alterar Imagem
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center p-6 text-white/40">
                    <Upload size={32} className="mb-3 text-[#D4AF37]" />
                    <span className="text-xs font-bold text-white/70">Selecionar Imagem</span>
                    <span className="text-[10px] text-white/40 mt-1">WebP, PNG ou JPG (Será convertida para WebP 1024x1024)</span>
                  </div>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)', color: '#000' }}
            >
              {uploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Convertendo & Enviando...
                </>
              ) : (
                <>
                  <Smile size={16} />
                  Adicionar Avatar
                </>
              )}
            </button>
          </form>
        </div>

        {/* Lista de Avatares Cadastrados */}
        <div className="lg:col-span-2 bg-[#111827] border border-white/5 rounded-3xl p-6 shadow-xl">
          <h2 className="text-white text-xl font-bold flex items-center gap-2 mb-6">
            <Smile size={18} className="text-[#D4AF37]" />
            Avatares Disponíveis ({avatars.length})
          </h2>

          {avatars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-white/40">
              <Smile size={48} className="mb-4 text-[#D4AF37]/20" />
              <p className="text-sm font-bold">Nenhum avatar cadastrado.</p>
              <p className="text-xs text-white/30">Envie o primeiro usando o formulário ao lado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 max-h-[500px] overflow-y-auto pr-2 py-2">
              {avatars.map((a) => (
                <div key={a.id} className="group relative flex flex-col items-center gap-2">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border border-white/10 shrink-0 transition-all duration-300 group-hover:border-[#D4AF37]/45 group-hover:scale-105 shadow-lg">
                    <img src={a.avatar_url} alt={a.nome} className="w-full h-full object-cover" />
                    
                    {/* Overlay de Excluir */}
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => handleDeleteAvatar(a.id)}
                        className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                        title="Excluir avatar"
                      >
                        <Trash2 size={14} className="text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="text-white/70 text-xs font-bold transition-colors group-hover:text-white line-clamp-2 px-1 text-center w-full" title={a.nome}>{a.nome}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Solicitações de Novos Santos */}
      <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 shadow-xl">
        <h2 className="text-white text-xl font-bold flex items-center gap-2 mb-6">
          <AlertCircle size={18} className="text-[#D4AF37]" />
          Solicitações de Novos Santos ({pedidos.length})
        </h2>

        {listaPedidosAgrupados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-white/40">
            <Heart size={40} className="mb-3 text-[#D4AF37]/20" />
            <p className="text-sm font-bold">Nenhuma solicitação pendente.</p>
            <p className="text-xs text-white/30">Os pedidos feitos no cadastro e perfil aparecerão aqui.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="text-xs uppercase tracking-wider text-white/40 border-b border-white/5 bg-black/20">
                <tr>
                  <th className="px-6 py-4">Santo Solicitado</th>
                  <th className="px-6 py-4 text-center">Nº de Pedidos</th>
                  <th className="px-6 py-4">Usuários Solicitantes</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {listaPedidosAgrupados.map((p) => {
                  // Acha as solicitações individuais correspondentes a esse nome de santo
                  const idsPedidos = pedidos.filter(x => x.santo_nome.trim().toUpperCase() === p.nome).map(x => x.id)

                  return (
                    <tr key={p.nome} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-bold text-white text-base">{p.nome}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-[#D4AF37]/15 text-[#D4AF37] px-3 py-1 rounded-full font-black text-xs">
                          {p.count}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-xs text-white/50">
                        {p.emails.join(', ')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={async () => {
                            if (confirm(`Remover todos os pedidos de "${p.nome}"?`)) {
                              setLoading(true)
                              try {
                                await Promise.all(idsPedidos.map(id => fetch(`/api/admin/pedidos-santos?id=${id}`, { method: 'DELETE' })))
                                setPedidos(prev => prev.filter(x => !idsPedidos.includes(x.id)))
                              } catch(err: any) {
                                alert('Erro ao limpar pedidos: ' + err.message)
                              } finally {
                                setLoading(false)
                              }
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-red-600/20 hover:text-red-400 transition-colors text-xs font-bold"
                        >
                          Limpar Pedidos
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
