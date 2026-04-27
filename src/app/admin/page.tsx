import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  adicionarVideo, editarVideo, toggleVideoAtivo,
  deletarVideo, togglePlanoUsuario,
} from './actions'

import {
  LayoutDashboard, Video, Eye, EyeOff, Trash2, ExternalLink,
  Plus, ChevronLeft, Users, Edit3, X, UserCheck, Film,
  Settings, Clock
} from 'lucide-react'
import { StripeAdmin } from './StripeAdmin'
import { CopyLeadsButton } from './CopyLeadsButton'

type VideoType = {
  id: string; titulo: string; descricao: string | null
  categoria: string; thumbnail_url: string | null
  bunny_video_id: string; bunny_library_id: string
  duracao: string | null; criado_em: string; ativo: boolean
}
type UsuarioType = {
  id: string; email: string; nome: string
  plano_ativo: boolean; criado_em: string
}

const CATEGORIAS = ['Geral', 'Infantil', 'Adulto', 'Documentário', 'Louvor', 'Sermão', 'Testemunho']
const FALLBACK = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=70',
  'https://images.unsplash.com/photo-1476725994324-6f6833cfb205?w=400&q=70',
  'https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?w=400&q=70',
  'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=400&q=70',
]
function getFallback(id: string) {
  const c = (id.charCodeAt(0) || 0) + (id.charCodeAt(id.length - 1) || 0)
  return FALLBACK[c % FALLBACK.length]
}

const inputCls = 'w-full bg-[#0f171e] border border-white/10 focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none transition-all shadow-inner text-sm'
const labelCls = 'block text-white/50 text-[0.7rem] uppercase tracking-widest mb-2 font-bold'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; edit?: string }>
}) {
  const params = await searchParams
  const activeTab = params.tab || 'videos'
  const editId = params.edit || null

  // Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  if (perfil?.role !== 'admin' && user.email !== 'suporte.appcontos@gmail.com') redirect('/')

  // Videos
  const { data: videos } = await supabase.from('videos').select('*').order('criado_em', { ascending: false })

  // Users via Admin API
  let usuarios: UsuarioType[] = []
  try {
    const adminClient = createSupabaseAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers({ perPage: 500 })
    const { data: perfis } = await supabase.from('perfis').select('id, role')
    const adminIds = new Set(perfis?.filter(p => p.role === 'admin').map(p => p.id) || [])
    usuarios = authUsers
      .filter(u => !adminIds.has(u.id) && u.email !== 'suporte.appcontos@gmail.com')
      .map(u => ({
        id: u.id,
        email: u.email || '',
        nome: u.user_metadata?.nome || u.user_metadata?.name || '—',
        plano_ativo: u.user_metadata?.plano_ativo === true,
        criado_em: u.created_at,
      }))
      .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
  } catch (e) { console.error('Erro ao buscar usuários:', e) }


  // Stats
  const totalVideos = videos?.length ?? 0
  const videosAtivos = videos?.filter(v => v.ativo).length ?? 0
  const totalMembros = usuarios.length
  const membrosAtivos = usuarios.filter(u => u.plano_ativo).length

  const editingVideo = editId ? (videos as VideoType[])?.find(v => v.id === editId) : null

  return (
    <div className="min-h-screen text-white pb-20 selection:bg-[#D4AF37] selection:text-black" style={{ background: 'radial-gradient(circle at top, #111827 0%, #090B10 100%)', fontFamily: 'Outfit, sans-serif' }}>

      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-8 h-16 bg-[#090B10]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link href="/watch" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8b7322] p-[1px]">
              <div className="w-full h-full bg-[#090B10] rounded-[11px] flex items-center justify-center">
                 <Image src="/logo.png" alt="Logo" width={20} height={20} className="object-contain" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="text-white font-black text-[0.95rem] tracking-tight leading-none">Contos de Oração</div>
              <div className="text-[#D4AF37] text-[0.6rem] font-black uppercase tracking-[0.2em] mt-0.5">Workspace</div>
            </div>
          </Link>
          <div className="h-6 w-px hidden sm:block bg-white/10" />
          <div className="flex items-center gap-2">
            <LayoutDashboard size={14} className="text-[#D4AF37]" />
            <span className="text-white/90 font-bold text-sm tracking-wide">Painel Administrativo</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-xs hidden md:inline truncate max-w-[200px] font-medium">{user.email}</span>
          <Link href="/watch"
            className="flex items-center gap-2 text-white/60 hover:text-white hover:bg-white/5 text-xs px-4 py-2 rounded-xl transition-all border border-white/5">
            <ChevronLeft size={14} /> Voltar ao App
          </Link>
        </div>
      </header>

      <main className="pt-[100px] px-4 md:px-8 max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-white text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Visão Geral</h1>
            <p className="text-white/50 text-sm">Gerencie o catálogo, assinantes e integrações da plataforma.</p>
          </div>

          {/* Tabs - Estilo Pill Moderno */}
          <div className="flex bg-[#111827] border border-white/5 rounded-2xl p-1.5 w-fit shadow-2xl">
            {[
              { id: 'videos', label: 'Catálogo', icon: Film, count: totalVideos },
              { id: 'usuarios', label: 'Assinantes', icon: Users, count: totalMembros },
              { id: 'stripe', label: 'Planos', icon: Settings, count: null },
            ].map(tab => (
              <Link key={tab.id} href={`/admin?tab=${tab.id}`}
                className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'text-black shadow-md' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                style={activeTab === tab.id ? { background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' } : {}}>
                <tab.icon size={15} />
                {tab.label}
                {tab.count !== null && (
                  <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-black ml-1 ${activeTab === tab.id ? 'bg-black/20 text-black' : 'bg-white/10 text-white/70'}`}>
                    {tab.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Stats — 4 cards premium */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {[
            { label: 'Total de Vídeos', value: totalVideos, icon: Film, color: 'from-[#00a8e1] to-[#007ba6]' },
            { label: 'Vídeos Ativos', value: videosAtivos, icon: Eye, color: 'from-[#10b981] to-[#047857]' },
            { label: 'Assinantes Ativos', value: membrosAtivos, icon: UserCheck, color: 'from-[#FFD700] to-[#D4AF37]', darkText: true },
            { label: 'Total de Cadastros', value: totalMembros, icon: Users, color: 'from-[#8b5cf6] to-[#6d28d9]' },
          ].map(s => (
            <div key={s.label} className="relative overflow-hidden bg-[#111827] border border-white/5 rounded-3xl p-6 group hover:border-white/10 transition-colors shadow-xl">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${s.color} opacity-5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
              
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="text-white/50 text-[0.7rem] uppercase tracking-widest font-bold mb-2">{s.label}</div>
                  <div className="text-white text-4xl font-black tracking-tighter">{s.value}</div>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-all`}>
                  <s.icon size={20} className={s.darkText ? 'text-black' : 'text-white'} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ══════════ ABA VÍDEOS ══════════ */}
        {activeTab === 'videos' && (
          <div className="space-y-10">
            {/* Formulário adicionar */}
            <div className="bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30" />
               
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
                   <Plus size={20} className="text-[#D4AF37]" />
                </div>
                <div>
                  <h2 className="text-white text-xl font-extrabold tracking-tight">Novo Vídeo</h2>
                  <p className="text-white/40 text-xs">Adicione conteúdo ao catálogo da plataforma.</p>
                </div>
              </div>

              <form action={adicionarVideo}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-8">
                    <label className={labelCls}>Título *</label>
                    <input name="titulo" required placeholder="Ex: A Oração que Move Montanhas" className={inputCls} />
                  </div>
                  <div className="md:col-span-4">
                    <label className={labelCls}>Categoria</label>
                    <select name="categoria" className={inputCls + ' cursor-pointer appearance-none'}>
                      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-12">
                    <label className={labelCls}>Descrição</label>
                    <textarea name="descricao" rows={2} placeholder="Descreva sobre o que é o vídeo..." className={inputCls} style={{ resize: 'vertical' }} />
                  </div>
                  <div className="md:col-span-4">
                    <label className={labelCls}>Video ID (Bunny.net) *</label>
                    <input name="bunny_video_id" required placeholder="xxxxxxxx-xxxx-xxxx-xxxx" className={inputCls + ' font-mono text-white/70'} />
                  </div>
                  <div className="md:col-span-5">
                    <label className={labelCls}>URL da Thumbnail (Opcional)</label>
                    <input name="thumbnail_url" placeholder="https://..." className={inputCls} />
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelCls}>Duração</label>
                    <input name="duracao" placeholder="Ex: 12:34" className={inputCls} />
                  </div>
                </div>
                <div className="mt-8 flex justify-end">
                  <button type="submit"
                    className="flex items-center gap-2 text-black px-8 py-3.5 rounded-xl font-black text-sm transition-all hover:scale-105 hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                    style={{ background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' }}>
                    <Plus size={18} strokeWidth={3} /> Publicar Vídeo
                  </button>
                </div>
              </form>
            </div>

            <hr className="border-white/5" />

            {/* Lista de vídeos (Grid Cards) */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-2xl font-black tracking-tight">Acervo de Vídeos</h2>
              </div>

              {!videos || videos.length === 0 ? (
                <div className="bg-[#111827] border border-white/5 rounded-3xl p-16 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Video size={32} className="text-white/30" />
                  </div>
                  <p className="text-white/60 font-medium">O catálogo está vazio.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(videos as VideoType[]).map(video => (
                    <div key={video.id} className="group relative flex flex-col">
                      
                      {/* Formulário de edição por cima do card caso esteja editando */}
                      {editId === video.id && editingVideo ? (
                        <div className="bg-[#111827] border-2 border-[#D4AF37] rounded-3xl p-6 shadow-[0_0_30px_rgba(212,175,55,0.15)] z-20">
                          <div className="flex items-center justify-between mb-5 border-b border-white/10 pb-4">
                             <div className="flex items-center gap-2">
                                <Edit3 size={18} className="text-[#D4AF37]" />
                                <span className="text-white font-black">Editar Vídeo</span>
                             </div>
                             <Link href="/admin?tab=videos" className="text-white/40 hover:text-white p-1 rounded-md hover:bg-white/10"><X size={16}/></Link>
                          </div>
                          
                          <form action={editarVideo.bind(null, video.id)} className="space-y-4">
                            <div>
                              <label className={labelCls}>Título</label>
                              <input name="titulo" required defaultValue={editingVideo.titulo} className={inputCls} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className={labelCls}>Categoria</label>
                                <select name="categoria" defaultValue={editingVideo.categoria} className={inputCls}>
                                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className={labelCls}>Duração</label>
                                <input name="duracao" defaultValue={editingVideo.duracao || ''} className={inputCls} />
                              </div>
                            </div>
                            <div>
                              <label className={labelCls}>Descrição</label>
                              <textarea name="descricao" rows={2} defaultValue={editingVideo.descricao || ''} className={inputCls} />
                            </div>
                            <div>
                              <label className={labelCls}>Thumbnail</label>
                              <input name="thumbnail_url" defaultValue={editingVideo.thumbnail_url || ''} className={inputCls} />
                            </div>
                            <button type="submit" className="w-full mt-2 bg-[#D4AF37] text-black font-black py-3 rounded-xl hover:brightness-110">
                              Salvar
                            </button>
                          </form>
                        </div>
                      ) : (
                        
                        /* CARD DE VÍDEO NORMAL */
                        <div className={`h-full flex flex-col bg-[#111827] border rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 shadow-lg group-hover:shadow-xl ${video.ativo ? 'border-white/5 hover:border-white/20' : 'border-red-500/20 opacity-75'}`}>
                          {/* Thumbnail Header */}
                          <div className="relative aspect-video w-full bg-[#090B10] border-b border-white/5 group-hover:border-white/10 transition-colors">
                            <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                               style={{ backgroundImage: `url(${video.thumbnail_url || getFallback(video.id)})` }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />
                            
                            {/* Badges Overlay */}
                            <div className="absolute top-3 left-3 flex gap-2">
                               <span className="bg-black/60 backdrop-blur-md text-white text-[0.65rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-white/10">
                                 {video.categoria}
                               </span>
                            </div>
                            {video.duracao && (
                               <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md text-white/90 text-[0.65rem] font-bold px-2 py-1 rounded-lg border border-white/10">
                                 <Clock size={10} /> {video.duracao}
                               </div>
                            )}
                            {!video.ativo && (
                               <div className="absolute top-3 right-3 bg-red-500 text-white text-[0.65rem] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-lg">
                                 Oculto
                               </div>
                            )}
                          </div>

                          {/* Card Body */}
                          <div className="p-5 flex flex-col flex-grow">
                            <h3 className="text-white font-extrabold text-lg leading-tight mb-2 line-clamp-2">{video.titulo}</h3>
                            <div className="text-white/40 text-xs font-medium mb-5">Adicionado em {new Date(video.criado_em).toLocaleDateString('pt-BR')}</div>
                            
                            {/* Botões Bottom */}
                            <div className="mt-auto grid grid-cols-4 gap-2 pt-4 border-t border-white/5">
                               <Link href={`/watch/${video.id}`} className="col-span-1 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl py-2.5 transition-colors" title="Ver no site">
                                 <ExternalLink size={16} />
                               </Link>
                               <Link href={`/admin?tab=videos&edit=${video.id}`} className="col-span-1 flex items-center justify-center bg-white/5 hover:bg-[#D4AF37]/20 text-[#D4AF37] rounded-xl py-2.5 transition-colors" title="Editar">
                                 <Edit3 size={16} />
                               </Link>
                               <form action={toggleVideoAtivo.bind(null, video.id, video.ativo)} className="col-span-1">
                                 <button type="submit" className={`w-full flex items-center justify-center rounded-xl py-2.5 transition-colors ${video.ativo ? 'bg-white/5 hover:bg-white/10 text-white/70' : 'bg-[#10b981]/10 hover:bg-[#10b981]/20 text-[#10b981]'}`} title={video.ativo ? 'Ocultar' : 'Publicar'}>
                                   {video.ativo ? <EyeOff size={16} /> : <Eye size={16} />}
                                 </button>
                               </form>
                               <form action={deletarVideo.bind(null, video.id)} className="col-span-1">
                                 <button type="submit" className="w-full flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl py-2.5 transition-colors" title="Deletar">
                                   <Trash2 size={16} />
                                 </button>
                               </form>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════ ABA USUÁRIOS ══════════ */}
        {activeTab === 'usuarios' && (
          <div className="space-y-6">
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-white text-2xl font-black tracking-tight">Gestão de Assinantes</h2>
                <p className="text-white/50 text-sm mt-1">{membrosAtivos} usuários com plano ativo no momento.</p>
              </div>
              <CopyLeadsButton emails={usuarios.filter(u => !u.plano_ativo).map(u => u.email)} />
            </div>

            {usuarios.length === 0 ? (
              <div className="bg-[#111827] border border-white/5 rounded-3xl p-16 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users size={32} className="text-white/30" />
                </div>
                <p className="text-white/60 font-medium">Nenhum assinante encontrado.</p>
              </div>
            ) : (
              <div className="bg-[#111827] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
                {/* Header da tabela */}
                <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-white/5 bg-[#090B10]/50">
                  <div className="col-span-6 md:col-span-5 text-white/40 text-xs uppercase tracking-widest font-bold">Assinante</div>
                  <div className="col-span-3 text-white/40 text-xs uppercase tracking-widest font-bold hidden md:block">Data de Ingresso</div>
                  <div className="col-span-3 md:col-span-2 text-white/40 text-xs uppercase tracking-widest font-bold">Status</div>
                  <div className="col-span-3 md:col-span-2 text-white/40 text-xs uppercase tracking-widest font-bold text-right">Controle</div>
                </div>

                {/* Linhas */}
                <div className="divide-y divide-white/5">
                  {usuarios.map((u) => (
                    <div key={u.id} className="grid grid-cols-12 gap-4 px-8 py-5 items-center transition-colors hover:bg-white/[0.02]">
                      
                      {/* Info do usuário */}
                      <div className="col-span-6 md:col-span-5 flex items-center gap-4 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center text-lg font-black shadow-inner border ${u.plano_ativo ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20' : 'bg-white/5 text-white/30 border-white/5'}`}>
                          {(u.nome !== '—' ? u.nome : u.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white text-[0.95rem] font-bold truncate">{u.nome !== '—' ? u.nome : '—'}</div>
                          <div className="text-white/40 text-xs truncate mt-0.5">{u.email}</div>
                        </div>
                      </div>

                      {/* Data */}
                      <div className="col-span-3 text-white/50 text-sm font-medium hidden md:block">
                        {new Date(u.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>

                      {/* Status badge */}
                      <div className="col-span-3 md:col-span-2">
                        <span className={`inline-flex items-center gap-1.5 text-[0.65rem] px-3 py-1.5 rounded-xl font-bold uppercase tracking-widest border ${u.plano_ativo ? 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/20' : 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${u.plano_ativo ? 'bg-[#10b981]' : 'bg-[#D4AF37]'}`} />
                          {u.plano_ativo ? 'Ativo' : 'Lead (Pendente)'}
                        </span>
                      </div>

                      {/* Botão ação */}
                      <div className="col-span-3 md:col-span-2 flex justify-end">
                        <form action={togglePlanoUsuario.bind(null, u.id, u.plano_ativo)}>
                          <button type="submit"
                            className={`text-xs px-5 py-2.5 rounded-xl font-bold transition-all border shadow-sm hover:-translate-y-0.5 ${u.plano_ativo ? 'text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10' : 'text-black border-transparent bg-[#D4AF37] hover:brightness-110'}`}>
                            {u.plano_ativo ? 'Suspender' : 'Liberar Acesso'}
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════ ABA STRIPE ════════ */}
        {activeTab === 'stripe' && (
          <StripeAdmin />
        )}

      </main>
    </div>
  )
}
