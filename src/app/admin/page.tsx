import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  adicionarVideo, editarVideo, toggleVideoAtivo,
  deletarVideo
} from './actions'

import {
  LayoutDashboard, Video, Eye, EyeOff, Trash2, ExternalLink,
  Plus, ChevronLeft, Users, Edit3, X, UserCheck, Film,
  Heart, BarChart3, Trophy, Megaphone
} from 'lucide-react'
import { StripeAdmin } from './StripeAdmin'
import { CopyLeadsButton } from './CopyLeadsButton'
import { GerenciadorMateriais } from './GerenciadorMateriais'
import { GerenciadorAnuncios } from './GerenciadorAnuncios'
import { FormAcessoVitalicio } from './FormAcessoVitalicio'
import CriadorConteudoUnificado from './CriadorConteudoUnificado'
import AcervoVideosAdmin from './AcervoVideosAdmin'
import { FormEditarVideo } from './FormEditarVideo'
import { BotoesControleUsuario } from './BotoesControleUsuario'
import { AssinantesComFiltros } from './AssinantesComFiltros'
import SubmitButton from '@/components/SubmitButton'

type VideoType = {
  id: string; titulo: string; descricao: string | null
  categoria: string; thumbnail_url: string | null
  bunny_video_id: string; bunny_library_id: string
  duracao: string | null; criado_em: string; ativo: boolean
  em_breve?: boolean
  temporada_nome?: string | null
  episodio_numero?: number | null
}
type UsuarioType = {
  id: string; email: string; nome: string
  plano_ativo: boolean; plano_nome: string; criado_em: string
  vitalicio?: boolean
  ultimo_login?: string | null
  total_views?: number
  acessos_site?: number
  acessos_app?: number
}

const CATEGORIAS = ['Geral', 'Infantil', 'Adulto', 'Documentário', 'Louvor', 'Sermão', 'Testemunho', 'Temporada', 'Vídeo Clipe']
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
  const editId = params.edit || null

  // Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')
  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  if (perfil?.role !== 'admin' && user.email !== 'suporte.appcontos@gmail.com') redirect('/')

  // Videos
  const { data: videos } = await supabase.from('videos').select('*').order('criado_em', { ascending: false })
  const { data: materiaisData } = await supabase.from('materiais').select('*').order('criado_em', { ascending: false })
  const { data: anunciosPausa } = await supabase.from('anuncios_pausa').select('*').order('criado_em', { ascending: false })

  // Busca visualizações para computar estatísticas gerais e individuais
  let views: any[] = []
  let viewsPorUsuario: Record<string, number> = {}
  try {
    const { data } = await supabase.from('visualizacoes').select('video_id, user_id, criado_em')
    views = data ?? []
    viewsPorUsuario = views.reduce((acc, v) => {
      if (v.user_id) acc[v.user_id] = (acc[v.user_id] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  } catch (e) { console.error('Erro ao buscar visualizações para usuários:', e) }

  // Busca nomes de temporadas distintos (para o seletor no FormAdicionarVideo)
  const temporadasExistentes: string[] = [...new Set(
    (videos ?? [])
      .filter(v => v.categoria === 'Temporada' && v.temporada_nome)
      .map(v => v.temporada_nome as string)
  )]

  // Users via Admin API
  let usuarios: UsuarioType[] = []
  try {
    const adminClient = createSupabaseAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )
    const { data: { users: authUsers } } = await adminClient.auth.admin.listUsers({ perPage: 500 })
    const { data: perfis } = await supabase.from('perfis').select('id, role, acessos_site, acessos_app')
    const adminIds = new Set(perfis?.filter(p => p.role === 'admin').map(p => p.id) || [])
    const perfisMap = new Map((perfis || []).map(p => [p.id, p]))
    usuarios = authUsers
      .filter(u => !adminIds.has(u.id) && u.email !== 'suporte.appcontos@gmail.com')
      .map(u => {
        const perf = perfisMap.get(u.id)
        return {
          id: u.id,
          email: u.email || '',
          nome: u.user_metadata?.nome || u.user_metadata?.name || '—',
          plano_ativo: u.user_metadata?.plano_ativo === true,
          plano_nome: u.user_metadata?.etiqueta_plano || 'Básico',
          vitalicio: u.user_metadata?.vitalicio === true,
          criado_em: u.created_at,
          ultimo_login: u.last_sign_in_at || null,
          total_views: viewsPorUsuario[u.id] || 0,
          acessos_site: perf?.acessos_site || 0,
          acessos_app: perf?.acessos_app || 0,
        }
      })
      .sort((a, b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime())
  } catch (e) { console.error('Erro ao buscar usuários:', e) }


  // Stats
  const totalVideos = videos?.length ?? 0
  const videosAtivos = videos?.filter(v => v.ativo).length ?? 0
  const totalMembros = usuarios.length
  const membrosAtivos = usuarios.filter(u => u.plano_ativo).length

  // Planos mais comprados
  const vendasPorPlano: Record<string, number> = {}
  usuarios.filter(u => u.plano_ativo).forEach(u => {
    const p = u.plano_nome || 'Básico'
    vendasPorPlano[p] = (vendasPorPlano[p] || 0) + 1
  })
  
  const planoMaisComprado = Object.entries(vendasPorPlano)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhum'

  const editingVideo = editId ? (videos as VideoType[])?.find(v => v.id === editId) : null

  // Rankings
  let topFavoritos: any[] = []
  let topVisualizados: any[] = []
  const viewsByDay: Record<string, number> = {}
  try {
    const { data: favs } = await supabase.from('favoritos').select('video_id')
    const favCounts = favs?.reduce((acc, f) => { acc[f.video_id] = (acc[f.video_id] || 0) + 1; return acc }, {} as Record<string, number>) || {}
    topFavoritos = Object.entries(favCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, count]) => {
      const v = videos?.find(v => v.id === id)
      return { id, titulo: v?.titulo || 'Desconhecido', thumbnail_url: v?.thumbnail_url, count }
    })

    const viewCounts: Record<string, number> = views.reduce((acc, v) => { acc[v.video_id] = (acc[v.video_id] || 0) + 1; return acc }, {} as Record<string, number>)
    topVisualizados = Object.entries(viewCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([id, count]) => {
      const v = videos?.find(v => v.id === id)
      return { id, titulo: v?.titulo || 'Desconhecido', thumbnail_url: v?.thumbnail_url, count }
    })

    // Calcula visualizações dos últimos 7 dias
    const views7Days = views.filter(v => new Date(v.criado_em) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    
    // Group by Day
    // Inicializa os últimos 7 dias
    for(let i=6; i>=0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
      viewsByDay[dateStr] = 0
    }

    views7Days.forEach(v => {
       const d = new Date(v.criado_em).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
       if (viewsByDay[d] !== undefined) {
          viewsByDay[d]++
       }
    })
  } catch(e) { console.error('Erro ao buscar estatísticas:', e) }
  const tabParam = params.tab || 'catalogo'
  
  // Mapeia links antigos para as novas abas agrupadas
  const activeTab = ['videos', 'materiais'].includes(tabParam) ? 'catalogo' :
                    ['usuarios', 'stripe'].includes(tabParam) ? 'assinaturas' :
                    ['relatorios', 'anuncios'].includes(tabParam) ? 'marketing' : tabParam;

  const chartData = Object.entries(viewsByDay).map(([dia, count]) => ({ dia, count }))
  const maxViews = Math.max(...chartData.map(d => d.count), 1) // Prevent division by 0


  return (
    <div className="min-h-screen text-white pb-20 selection:bg-[#D4AF37] selection:text-black" style={{ background: 'radial-gradient(circle at top, #111827 0%, #090B10 100%)', fontFamily: 'Outfit, sans-serif' }}>

      {/* NAVBAR */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-8 h-16 bg-[#090B10]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link href="/watch" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#8b7322] p-[1px]">
              <div className="w-full h-full bg-[#090B10] rounded-[11px] flex items-center justify-center p-1.5">
                 <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-full h-full object-contain" />
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
          <div className="flex bg-[#111827] border border-white/5 rounded-2xl p-1.5 w-fit shadow-2xl flex-wrap">
            {[
              { id: 'catalogo', label: 'Catálogo', icon: Film, count: totalVideos },
              { id: 'assinaturas', label: 'Assinaturas', icon: Users, count: totalMembros },
              { id: 'marketing', label: 'Marketing', icon: Megaphone, count: anunciosPausa?.length ?? 0 },
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6 mb-12">
          {[
            { label: 'Total de Vídeos', value: totalVideos, icon: Film, color: 'from-[#00a8e1] to-[#007ba6]' },
            { label: 'Vídeos Ativos', value: videosAtivos, icon: Eye, color: 'from-[#10b981] to-[#047857]' },
            { label: 'Plano Mais Vendido', value: planoMaisComprado, icon: Trophy, color: 'from-[#ef4444] to-[#b91c1c]', textSm: true },
            { label: 'Assinantes Ativos', value: membrosAtivos, icon: UserCheck, color: 'from-[#FFD700] to-[#D4AF37]', darkText: true },
            { label: 'Total de Cadastros', value: totalMembros, icon: Users, color: 'from-[#8b5cf6] to-[#6d28d9]' },
          ].map(s => (
            <div key={s.label} className="relative overflow-hidden bg-[#111827] border border-white/5 rounded-3xl p-6 group hover:border-white/10 transition-colors shadow-xl">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${s.color} opacity-5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`} />
              
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <div className="text-white/50 text-[0.7rem] uppercase tracking-widest font-bold mb-2">{s.label}</div>
                  <div className={`text-white font-black tracking-tighter ${s.textSm ? 'text-2xl mt-1' : 'text-4xl'}`}>{s.value}</div>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-all`}>
                  <s.icon size={20} className={s.darkText ? 'text-black' : 'text-white'} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ══════════ ABA MARKETING ══════════ */}
        {activeTab === 'marketing' && (
          <div className="space-y-20">
            
            {/* --- RELATÓRIOS --- */}
            <div className="space-y-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <BarChart3 size={20} className="text-purple-400" />
                </div>
                <div>
                  <h2 className="text-white text-2xl font-black tracking-tight">Ranking de Desempenho</h2>
                  <p className="text-white/40 text-sm">Acompanhe quais conteúdos estão performando melhor.</p>
                </div>
              </div>

              {/* GRÁFICO DE 7 DIAS */}
              <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 shadow-xl">
                 <div className="flex items-center gap-2 mb-6 text-[#D4AF37]">
                    <BarChart3 size={20} />
                    <h3 className="text-white font-bold text-lg">Visualizações (Últimos 7 Dias)</h3>
                 </div>
                 <div className="flex items-end justify-between h-48 gap-2 pt-4 border-b border-white/10 pb-2">
                    {chartData.map((d, i) => {
                       const height = Math.max((d.count / maxViews) * 100, 2) // min 2% para mostrar uma barra pequena
                       return (
                         <div key={i} className="flex flex-col items-center flex-1 gap-2 group h-full">
                           <div className="w-full relative flex flex-col justify-end h-full">
                              {/* Tooltip */}
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                                {d.count}
                              </div>
                              <div 
                                className="w-full bg-gradient-to-t from-[#D4AF37]/20 to-[#D4AF37] rounded-t-lg transition-all duration-500 group-hover:brightness-125" 
                                style={{ height: `${height}%` }}
                              />
                           </div>
                           <span className="text-white/50 text-[0.65rem] font-black uppercase tracking-widest">{d.dia}</span>
                         </div>
                       )
                    })}
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* TOP VISUALIZADOS */}
                <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-2 mb-6 text-[#00a8e1]">
                    <Eye size={20} />
                    <h3 className="text-white font-bold text-lg">Vídeos Mais Assistidos</h3>
                  </div>
                  {topVisualizados.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-10">Nenhuma visualização registrada ainda.</p>
                  ) : (
                    <div className="space-y-4">
                      {topVisualizados.map((item, i) => (
                        <div key={item.id} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5">
                          <div className="w-8 text-center text-[#00a8e1] font-black text-xl opacity-80">{i + 1}º</div>
                          <div className="w-16 aspect-video bg-[#15243E] rounded-lg overflow-hidden shrink-0"
                               style={{ backgroundImage: `url(${item.thumbnail_url || getFallback(item.id)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm truncate">{item.titulo}</p>
                          </div>
                          <div className="bg-[#00a8e1]/10 text-[#00a8e1] px-3 py-1 rounded-lg text-xs font-black">
                            {item.count} views
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* TOP FAVORITOS */}
                <div className="bg-[#111827] border border-white/5 rounded-3xl p-8 shadow-xl">
                  <div className="flex items-center gap-2 mb-6 text-pink-500">
                    <Heart size={20} />
                    <h3 className="text-white font-bold text-lg">Vídeos Mais Favoritados</h3>
                  </div>
                  {topFavoritos.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-10">Nenhum favorito registrado ainda.</p>
                  ) : (
                    <div className="space-y-4">
                      {topFavoritos.map((item, i) => (
                        <div key={item.id} className="flex items-center gap-4 bg-white/5 rounded-2xl p-3 border border-white/5">
                          <div className="w-8 text-center text-pink-500 font-black text-xl opacity-80">{i + 1}º</div>
                          <div className="w-16 aspect-video bg-[#15243E] rounded-lg overflow-hidden shrink-0"
                               style={{ backgroundImage: `url(${item.thumbnail_url || getFallback(item.id)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm truncate">{item.titulo}</p>
                          </div>
                          <div className="bg-pink-500/10 text-pink-500 px-3 py-1 rounded-lg text-xs font-black">
                            {item.count} ♥
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* --- ANÚNCIOS PAUSA --- */}
            <div className="pt-10 border-t border-white/5 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30" />
              <GerenciadorAnuncios anuncios={(anunciosPausa ?? []) as any} />
            </div>

          </div>
        )}

        {/* ══════════ ABA CATÁLOGO ══════════ */}
        {activeTab === 'catalogo' && (
          <div className="space-y-20">
            <div className="space-y-10">
              {/* Criador Unificado de Conteúdo */}
              <CriadorConteudoUnificado temporadasExistentes={temporadasExistentes} />

              <hr className="border-white/5" />

              {/* Acervo de Vídeos (Agrupado por Temporadas e Colapsável) */}
              <AcervoVideosAdmin 
                videos={(videos || []) as any} 
                temporadasExistentes={temporadasExistentes} 
                editId={editId} 
                editingVideo={editingVideo as any} 
              />
            </div>
            
            {/* --- MATERIAIS --- */}
            <div className="pt-10 border-t border-white/5 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30" />
              <GerenciadorMateriais materiaisIniciais={(materiaisData ?? []) as any} />
            </div>

          </div>
        )}

        {/* ══════════ ABA ASSINATURAS ══════════ */}
        {activeTab === 'assinaturas' && (
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-white text-2xl font-black tracking-tight">Gestão de Assinantes</h2>
                  <p className="text-white/50 text-sm mt-1">{membrosAtivos} usuários com plano ativo no momento.</p>
                </div>
                <CopyLeadsButton emails={usuarios.filter(u => !u.plano_ativo).map(u => u.email)} />
              </div>

              {/* Formulário Cliente Vitalício */}
              <FormAcessoVitalicio />

              <AssinantesComFiltros usuarios={usuarios} membrosAtivos={membrosAtivos} />
            </div>

            {/* --- PLANOS E STRIPE --- */}
            <div className="pt-10 border-t border-white/5 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30" />
              <StripeAdmin />
            </div>

          </div>
        )}

      </main>
    </div>
  )
}
