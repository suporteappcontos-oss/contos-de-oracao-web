import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  adicionarVideo, editarVideo, toggleVideoAtivo,
  deletarVideo, togglePlanoUsuario,
} from './actions'
import { getKiwifyVendas, getKiwifyStats } from '@/lib/kiwify'
import {
  LayoutDashboard, Video, Eye, EyeOff, Trash2, ExternalLink,
  Plus, ChevronLeft, Users, Edit3, X, UserCheck, Film,
  ShoppingCart, TrendingUp, DollarSign, RefreshCw, Tag,
  Settings, BarChart2, CreditCard, Link2,
} from 'lucide-react'
import { StripeAdmin } from './StripeAdmin'

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

const inputCls = 'w-full bg-[#0f171e] border border-[#1e3040] focus:border-[#00a8e1] rounded-xl px-4 py-3 text-white placeholder-[#4a6373] focus:outline-none transition-colors text-sm'
const labelCls = 'block text-[#8197a4] text-[0.7rem] uppercase tracking-widest mb-2 font-semibold'

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

  // Kiwify — só carrega se estiver na aba kiwify
  const kiwifyVendas = activeTab === 'kiwify' ? await getKiwifyVendas(15) : []
  const kiwifyStats = activeTab === 'kiwify' ? await getKiwifyStats() : null

  // Stats
  const totalVideos = videos?.length ?? 0
  const videosAtivos = videos?.filter(v => v.ativo).length ?? 0
  const totalMembros = usuarios.length
  const membrosAtivos = usuarios.filter(u => u.plano_ativo).length

  const editingVideo = editId ? (videos as VideoType[])?.find(v => v.id === editId) : null

  return (
    <div className="min-h-screen text-white pb-20" style={{ background: '#090B10', fontFamily: 'Outfit, sans-serif' }}>

      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-8 h-14"
        style={{ background: '#090B10', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <Link href="/watch" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Contos de Oração" width={34} height={34} className="object-contain" />
            <div className="hidden sm:block">
              <div className="text-white font-black text-sm leading-tight">Contos de Oração</div>
              <div className="text-[0.5rem] font-extrabold uppercase tracking-widest -mt-0.5" style={{ color: '#D4AF37' }}>Premium</div>
            </div>
          </Link>
          <div className="h-5 w-px hidden sm:block" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="flex items-center gap-1.5">
            <LayoutDashboard size={13} style={{ color: '#D4AF37' }} />
            <span className="text-white font-bold text-sm">Painel Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[#94A3B8] text-xs hidden md:inline truncate max-w-[200px]">{user.email}</span>
          <Link href="/watch"
            className="flex items-center gap-1.5 text-[#94A3B8] hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <ChevronLeft size={12} /> Voltar
          </Link>
        </div>
      </header>

      <main className="pt-[72px] px-4 md:px-8 max-w-6xl mx-auto">

        {/* Título */}
        <div className="mb-6 pt-6">
          <h1 className="text-white text-2xl md:text-3xl font-black mb-1">Painel Administrativo</h1>
          <p className="text-[#8197a4] text-sm">Gerencie vídeos, assinantes e conteúdo da plataforma.</p>
        </div>

        {/* Stats — 4 cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total de Vídeos', value: totalVideos, icon: Film, color: '#00a8e1' },
            { label: 'Vídeos Ativos', value: videosAtivos, icon: Eye, color: '#4caf82' },
            { label: 'Assinantes Ativos', value: membrosAtivos, icon: UserCheck, color: '#D4AF37' },
            { label: 'Total de Membros', value: totalMembros, icon: Users, color: '#8b5cf6' },
          ].map(s => (
            <div key={s.label} className="bg-[#1a2733] border border-[#1e3040] rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color + '20' }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <div>
                <div className="text-white text-2xl font-black leading-none">{s.value}</div>
                <div className="text-[#8197a4] text-[0.62rem] mt-0.5 leading-tight">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-8 bg-[#1a2733] border border-[#1e3040] rounded-xl p-1.5 w-fit">
          {[
            { id: 'videos', label: 'Vídeos', icon: Video, count: totalVideos },
            { id: 'usuarios', label: 'Usuários', icon: Users, count: totalMembros },
            { id: 'stripe', label: 'Stripe', icon: CreditCard, count: null },
            { id: 'kiwify', label: 'Kiwify (Antigo)', icon: ShoppingCart, count: null },
          ].map(tab => (
            <Link key={tab.id} href={`/admin?tab=${tab.id}`}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'text-white' : 'text-[#8197a4] hover:text-white'}`}
              style={activeTab === tab.id ? { background: tab.id === 'kiwify' ? '#D4AF37' : '#00a8e1', color: tab.id === 'kiwify' && activeTab === tab.id ? '#090B10' : 'white' } : {}}>
              <tab.icon size={14} />
              {tab.label}
              {tab.count !== null && (
                <span className="text-[0.6rem] px-1.5 py-0.5 rounded-full font-black"
                  style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(0,168,225,0.15)', color: activeTab === tab.id ? 'white' : '#00a8e1' }}>
                  {tab.count}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* ══════════ ABA VÍDEOS ══════════ */}
        {activeTab === 'videos' && (
          <div>
            {/* Formulário adicionar */}
            <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl p-5 md:p-8 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <Plus size={18} className="text-[#00a8e1]" />
                <h2 className="text-white text-lg font-bold">Adicionar Novo Vídeo</h2>
              </div>
              <form action={adicionarVideo}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className={labelCls}>Título *</label>
                    <input name="titulo" required placeholder="Ex: A Oração que Move Montanhas" className={inputCls} />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelCls}>Descrição</label>
                    <textarea name="descricao" rows={2} placeholder="Descreva o vídeo..." className={inputCls} style={{ resize: 'vertical' }} />
                  </div>
                  <div>
                    <label className={labelCls}>Categoria</label>
                    <select name="categoria" className={inputCls + ' cursor-pointer appearance-none'}>
                      {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Duração (ex: 12:34)</label>
                    <input name="duracao" placeholder="00:00" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Video ID do Bunny.net *</label>
                    <input name="bunny_video_id" required placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className={inputCls + ' font-mono'} />
                    <p className="text-[#4a6373] text-[0.65rem] mt-1.5">Bunny.net → clique no vídeo → &quot;Copy Video ID&quot;</p>
                  </div>
                  <div>
                    <label className={labelCls}>URL da Thumbnail</label>
                    <input name="thumbnail_url" placeholder="https://..." className={inputCls} />
                    <p className="text-[#4a6373] text-[0.65rem] mt-1.5">Deixar vazio = imagem automática</p>
                  </div>
                </div>
                <div className="mt-6">
                  <button type="submit"
                    className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg"
                    style={{ background: '#00a8e1' }}>
                    <Plus size={16} /> Adicionar Vídeo
                  </button>
                </div>
              </form>
            </div>

            {/* Lista de vídeos */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-bold">Catálogo ({totalVideos})</h2>
            </div>

            {!videos || videos.length === 0 ? (
              <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl p-12 text-center">
                <Video size={48} className="text-[#4a6373] mx-auto mb-4" />
                <p className="text-[#8197a4]">Nenhum vídeo cadastrado ainda.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {(videos as VideoType[]).map(video => (
                  <div key={video.id}>
                    {/* Card do vídeo */}
                    <div className={`bg-[#1a2733] border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all ${video.ativo ? 'border-[#1e3040]' : 'border-red-500/20 opacity-60'} ${editId === video.id ? 'rounded-b-none border-b-0' : ''}`}>
                      {/* Thumbnail */}
                      <div className="w-full sm:w-28 aspect-video rounded-xl shrink-0 bg-[#0f171e] border border-[#1e3040] bg-cover bg-center"
                        style={{ backgroundImage: `url(${video.thumbnail_url || getFallback(video.id)})` }} />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-sm truncate mb-2">{video.titulo}</div>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[#00a8e1] text-[0.62rem] bg-[#00a8e1]/10 border border-[#00a8e1]/20 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">{video.categoria}</span>
                          {video.duracao && <span className="text-[#8197a4] text-[0.62rem]">⏱ {video.duracao}</span>}
                          <span className="text-[#4a6373] text-[0.62rem]">{new Date(video.criado_em).toLocaleDateString('pt-BR')}</span>
                          {!video.ativo && <span className="text-red-400 text-[0.62rem] font-bold uppercase">● Oculto</span>}
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <Link href={`/watch/${video.id}`} target="_blank"
                          className="flex items-center gap-1.5 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors border border-[#1e3040] bg-white/5 hover:bg-white/10">
                          <ExternalLink size={12} /> Ver
                        </Link>

                        <Link href={editId === video.id ? '/admin?tab=videos' : `/admin?tab=videos&edit=${video.id}`}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border"
                          style={editId === video.id
                            ? { color: '#D4AF37', borderColor: 'rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.08)' }
                            : { color: '#8197a4', borderColor: '#1e3040' }}>
                          {editId === video.id ? <><X size={12} /> Fechar</> : <><Edit3 size={12} /> Editar</>}
                        </Link>

                        <form action={toggleVideoAtivo.bind(null, video.id, video.ativo)}>
                          <button type="submit"
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border ${video.ativo ? 'text-[#8197a4] border-[#1e3040] hover:bg-white/5' : 'text-[#4caf82] border-[#4caf82]/20 hover:bg-[#4caf82]/10'}`}>
                            {video.ativo ? <><EyeOff size={12} /> Ocultar</> : <><Eye size={12} /> Publicar</>}
                          </button>
                        </form>

                        <form action={deletarVideo.bind(null, video.id)}>
                          <button type="submit"
                            className="flex items-center gap-1.5 bg-red-500/5 hover:bg-red-500/15 text-red-400 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border border-red-500/10">
                            <Trash2 size={12} /> Deletar
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Formulário de edição inline */}
                    {editId === video.id && editingVideo && (
                      <div className="bg-[#111d27] border border-[#1e3040] border-t-0 rounded-b-2xl p-5 md:p-8"
                        style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
                        <div className="flex items-center gap-2 mb-5">
                          <Edit3 size={16} style={{ color: '#D4AF37' }} />
                          <span className="text-white font-bold text-sm">Editando: {editingVideo.titulo}</span>
                        </div>
                        <form action={editarVideo.bind(null, video.id)}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className={labelCls}>Título *</label>
                              <input name="titulo" required defaultValue={editingVideo.titulo} className={inputCls} />
                            </div>
                            <div className="md:col-span-2">
                              <label className={labelCls}>Descrição</label>
                              <textarea name="descricao" rows={2} defaultValue={editingVideo.descricao || ''} className={inputCls} style={{ resize: 'vertical' }} />
                            </div>
                            <div>
                              <label className={labelCls}>Categoria</label>
                              <select name="categoria" defaultValue={editingVideo.categoria} className={inputCls + ' cursor-pointer appearance-none'}>
                                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>Duração</label>
                              <input name="duracao" defaultValue={editingVideo.duracao || ''} placeholder="00:00" className={inputCls} />
                            </div>
                            <div className="md:col-span-2">
                              <label className={labelCls}>URL da Thumbnail</label>
                              <input name="thumbnail_url" defaultValue={editingVideo.thumbnail_url || ''} placeholder="https://..." className={inputCls} />
                            </div>
                          </div>
                          <div className="flex gap-3 mt-5">
                            <button type="submit"
                              className="flex items-center gap-2 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg"
                              style={{ background: '#D4AF37', color: '#090B10' }}>
                              <Edit3 size={14} /> Salvar Alterações
                            </button>
                            <Link href="/admin?tab=videos"
                              className="flex items-center gap-2 text-[#8197a4] hover:text-white px-5 py-3 rounded-xl font-bold text-sm border border-[#1e3040] transition-colors">
                              <X size={14} /> Cancelar
                            </Link>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════ ABA USUÁRIOS ══════════ */}
        {activeTab === 'usuarios' && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-white text-lg font-bold">Assinantes ({totalMembros})</h2>
                <p className="text-[#8197a4] text-xs mt-0.5">{membrosAtivos} ativos · {totalMembros - membrosAtivos} bloqueados</p>
              </div>
            </div>

            {usuarios.length === 0 ? (
              <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl p-12 text-center">
                <Users size={48} className="text-[#4a6373] mx-auto mb-4" />
                <p className="text-[#8197a4]">Nenhum assinante encontrado.</p>
              </div>
            ) : (
              <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl overflow-hidden">
                {/* Header da tabela */}
                <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-[#1e3040]"
                  style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <div className="col-span-5 text-[#8197a4] text-[0.65rem] uppercase tracking-widest font-semibold">Membro</div>
                  <div className="col-span-3 text-[#8197a4] text-[0.65rem] uppercase tracking-widest font-semibold hidden md:block">Cadastro</div>
                  <div className="col-span-2 text-[#8197a4] text-[0.65rem] uppercase tracking-widest font-semibold">Status</div>
                  <div className="col-span-2 text-[#8197a4] text-[0.65rem] uppercase tracking-widest font-semibold text-right">Ação</div>
                </div>

                {/* Linhas */}
                {usuarios.map((u, i) => (
                  <div key={u.id}
                    className={`grid grid-cols-12 gap-4 px-5 py-4 items-center transition-colors hover:bg-white/[0.02] ${i !== usuarios.length - 1 ? 'border-b border-[#1e3040]' : ''}`}>
                    {/* Info do usuário */}
                    <div className="col-span-5 flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-sm font-black"
                        style={{ background: u.plano_ativo ? 'rgba(212,175,55,0.15)' : 'rgba(148,163,184,0.1)', color: u.plano_ativo ? '#D4AF37' : '#8197a4' }}>
                        {(u.nome !== '—' ? u.nome : u.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-white text-sm font-semibold truncate">{u.nome !== '—' ? u.nome : '—'}</div>
                        <div className="text-[#8197a4] text-[0.65rem] truncate">{u.email}</div>
                      </div>
                    </div>

                    {/* Data */}
                    <div className="col-span-3 text-[#8197a4] text-xs hidden md:block">
                      {new Date(u.criado_em).toLocaleDateString('pt-BR')}
                    </div>

                    {/* Status badge */}
                    <div className="col-span-2">
                      <span className={`text-[0.62rem] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${u.plano_ativo ? 'text-[#4caf82] bg-[#4caf82]/10 border border-[#4caf82]/20' : 'text-red-400 bg-red-500/10 border border-red-500/20'}`}>
                        {u.plano_ativo ? '● Ativo' : '● Bloqueado'}
                      </span>
                    </div>

                    {/* Botão ação */}
                    <div className="col-span-2 flex justify-end">
                      <form action={togglePlanoUsuario.bind(null, u.id, u.plano_ativo)}>
                        <button type="submit"
                          className={`text-[0.65rem] px-3 py-1.5 rounded-lg font-bold transition-colors border ${u.plano_ativo ? 'text-red-400 border-red-500/20 hover:bg-red-500/10' : 'text-[#4caf82] border-[#4caf82]/20 hover:bg-[#4caf82]/10'}`}>
                          {u.plano_ativo ? 'Bloquear' : 'Ativar'}
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ════════ ABA STRIPE ════════ */}
        {activeTab === 'stripe' && (
          <StripeAdmin />
        )}

        {/* ════════ ABA KIWIFY ════════ */}
        {activeTab === 'kiwify' && (
          <div>

            {/* Links Rápidos */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Link2 size={16} style={{ color: '#D4AF37' }} />
                <h2 className="text-white text-lg font-bold">Ações Rápidas</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    label: '📦 Ver meu Produto',
                    desc: 'Acessar página do produto Contos de Oração',
                    url: 'https://dashboard.kiwify.com.br/products',
                    color: '#00a8e1',
                  },
                  {
                    label: '💰 Alterar Preço',
                    desc: 'Mudar o valor mensal ou anual do plano',
                    url: 'https://dashboard.kiwify.com.br/products',
                    color: '#4caf82',
                  },
                  {
                    label: '🏷️ Criar Cupom',
                    desc: 'Criar cupons de desconto para clientes',
                    url: 'https://dashboard.kiwify.com.br/products',
                    color: '#D4AF37',
                  },
                  {
                    label: '📊 Ver Relatórios',
                    desc: 'Relatórios completos de vendas e receita',
                    url: 'https://dashboard.kiwify.com.br/reports',
                    color: '#8b5cf6',
                  },
                  {
                    label: '💳 Ver Assinaturas',
                    desc: 'Gerenciar assinaturas ativas e canceladas',
                    url: 'https://dashboard.kiwify.com.br/subscriptions',
                    color: '#f59e0b',
                  },
                  {
                    label: '💵 Financeiro / Saques',
                    desc: 'Ver saldo e solicitar saque',
                    url: 'https://dashboard.kiwify.com.br/financial',
                    color: '#ec4899',
                  },
                ].map(item => (
                  <a key={item.label} href={item.url} target="_blank" rel="noopener noreferrer"
                    className="bg-[#1a2733] border border-[#1e3040] rounded-2xl p-5 flex flex-col gap-2 hover:border-white/10 transition-all group">
                    <div className="text-white font-bold text-sm group-hover:text-white transition-colors">{item.label}</div>
                    <div className="text-[#8197a4] text-xs leading-relaxed">{item.desc}</div>
                    <div className="flex items-center gap-1 text-xs font-semibold mt-1" style={{ color: item.color }}>
                      Abrir no Kiwify <ExternalLink size={11} />
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Stats de Vendas Kiwify */}
            {kiwifyStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {[
                  { label: 'Receita Total', value: `R$ ${((kiwifyStats.total_revenue || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: '#4caf82' },
                  { label: 'Total de Vendas', value: kiwifyStats.total_sales || 0, icon: ShoppingCart, color: '#00a8e1' },
                  { label: 'Vendas Aprovadas', value: kiwifyStats.approved_sales || 0, icon: TrendingUp, color: '#D4AF37' },
                  { label: 'Reembolsos', value: kiwifyStats.refunded_sales || 0, icon: RefreshCw, color: '#ef4444' },
                ].map(s => (
                  <div key={s.label} className="bg-[#1a2733] border border-[#1e3040] rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.color + '20' }}>
                      <s.icon size={18} style={{ color: s.color }} />
                    </div>
                    <div>
                      <div className="text-white text-xl font-black leading-none">{s.value}</div>
                      <div className="text-[#8197a4] text-[0.62rem] mt-0.5 leading-tight">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Últimas Vendas */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={16} style={{ color: '#00a8e1' }} />
                <h2 className="text-white text-lg font-bold">Últimas Vendas</h2>
              </div>

              {kiwifyVendas.length === 0 ? (
                <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl p-10 text-center">
                  <ShoppingCart size={40} className="text-[#4a6373] mx-auto mb-3" />
                  <p className="text-[#8197a4] text-sm">Nenhuma venda encontrada ou API ainda configurando.</p>
                  <p className="text-[#4a6373] text-xs mt-1">Verifique se o webhook está ativo na Kiwify.</p>
                </div>
              ) : (
                <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl overflow-hidden">
                  <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[#1e3040]" style={{ background: 'rgba(0,0,0,0.2)' }}>
                    <div className="col-span-4 text-[#8197a4] text-[0.65rem] uppercase tracking-widest font-semibold">Cliente</div>
                    <div className="col-span-3 text-[#8197a4] text-[0.65rem] uppercase tracking-widest font-semibold hidden md:block">Data</div>
                    <div className="col-span-3 text-[#8197a4] text-[0.65rem] uppercase tracking-widest font-semibold">Valor</div>
                    <div className="col-span-2 text-[#8197a4] text-[0.65rem] uppercase tracking-widest font-semibold">Status</div>
                  </div>
                  {kiwifyVendas.map((venda, i) => (
                    <div key={venda.id}
                      className={`grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors ${i !== kiwifyVendas.length - 1 ? 'border-b border-[#1e3040]' : ''}`}>
                      <div className="col-span-4 min-w-0">
                        <div className="text-white text-sm font-semibold truncate">{venda.customer?.name || '—'}</div>
                        <div className="text-[#8197a4] text-[0.65rem] truncate">{venda.customer?.email || ''}</div>
                      </div>
                      <div className="col-span-3 text-[#8197a4] text-xs hidden md:block">
                        {new Date(venda.created_at).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="col-span-3">
                        <span className="text-[#4caf82] text-sm font-bold">
                          R$ {((venda.total || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className={`text-[0.62rem] px-2 py-0.5 rounded-full font-bold uppercase ${
                          venda.status === 'paid' || venda.status === 'approved'
                            ? 'text-[#4caf82] bg-[#4caf82]/10 border border-[#4caf82]/20'
                            : venda.status === 'refunded'
                            ? 'text-red-400 bg-red-500/10 border border-red-500/20'
                            : 'text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20'
                        }`}>
                          {venda.status === 'paid' || venda.status === 'approved' ? '✓ Pago'
                            : venda.status === 'refunded' ? '↩ Reemb.'
                            : venda.status || '—'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
