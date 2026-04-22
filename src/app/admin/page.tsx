import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { adicionarVideo, toggleVideoAtivo, deletarVideo } from './actions'
import { LayoutDashboard, Video, Eye, EyeOff, Trash2, ExternalLink, Plus, ChevronLeft } from 'lucide-react'

type Video = {
  id: string
  titulo: string
  descricao: string | null
  categoria: string
  thumbnail_url: string | null
  bunny_video_id: string
  bunny_library_id: string
  duracao: string | null
  criado_em: string
  ativo: boolean
}

const CATEGORIAS = ['Geral', 'Infantil', 'Adulto', 'Documentário', 'Louvor', 'Sermão', 'Testemunho']

// Imagens de fallback
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=70',
  'https://images.unsplash.com/photo-1476725994324-6f6833cfb205?w=400&q=70',
  'https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?w=400&q=70',
  'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=400&q=70',
]
function getFallback(id: string) {
  const code = (id.charCodeAt(0) || 0) + (id.charCodeAt(id.length - 1) || 0)
  return FALLBACK_IMAGES[code % FALLBACK_IMAGES.length]
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).single()
  if (perfil?.role !== 'admin' && user.email !== 'suporte.appcontos@gmail.com') redirect('/')

  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('criado_em', { ascending: false })

  const total = videos?.length ?? 0
  const ativos = videos?.filter(v => v.ativo).length ?? 0

  return (
    <div className="min-h-screen text-white pb-20" style={{ background: '#090B10', fontFamily: 'Outfit, sans-serif' }}>

      {/* ── NAVBAR ADMIN ── */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-8 h-14 md:h-[60px]" style={{ background: '#090B10', borderBottom: '1px solid rgba(255,255,255,0.05)', fontFamily: 'Outfit, sans-serif' }}>
        <div className="flex items-center gap-3 md:gap-4">
          {/* Logo real do App */}
          <Link href="/watch" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="Contos de Oração" width={36} height={36} className="object-contain" />
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

        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-[#94A3B8] text-xs hidden md:inline truncate max-w-[200px]">{user.email}</span>
          <Link
            href="/watch"
            className="flex items-center gap-1.5 text-[#94A3B8] hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ChevronLeft size={12} />
            Voltar
          </Link>
        </div>
      </header>

      <main className="pt-[80px] md:pt-[80px] px-4 md:px-8 max-w-6xl mx-auto">

        {/* ── Título ── */}
        <div className="mb-8">
          <h1 className="text-white text-2xl md:text-3xl font-bold mb-1">Gerenciamento de Conteúdo</h1>
          <p className="text-[#8197a4] text-sm">Adicione, edite e gerencie os vídeos da plataforma.</p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-10">
          {[
            { label: 'Total', value: total, icon: Video, color: '#00a8e1' },
            { label: 'Publicados', value: ativos, icon: Eye, color: '#4caf82' },
            { label: 'Ocultos', value: total - ativos, icon: EyeOff, color: '#8197a4' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1a2733] border border-[#1e3040] rounded-xl p-4 md:p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: stat.color + '20' }}>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <div>
                <div className="text-white text-2xl md:text-3xl font-black leading-none">{stat.value}</div>
                <div className="text-[#8197a4] text-xs mt-1">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Formulário de Adição ── */}
        <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl p-5 md:p-8 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Plus size={18} className="text-[#00a8e1]" />
            <h2 className="text-white text-lg font-bold">Adicionar Novo Vídeo</h2>
          </div>

          <form action={adicionarVideo}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">

              <div className="md:col-span-2">
                <label className="block text-[#8197a4] text-[0.7rem] uppercase tracking-widest mb-2 font-semibold">Título *</label>
                <input 
                  name="titulo" required 
                  placeholder="Ex: A Oração que Move Montanhas" 
                  className="w-full bg-[#0f171e] border border-[#1e3040] focus:border-[#00a8e1] rounded-xl px-4 py-3 text-white placeholder-[#4a6373] focus:outline-none transition-colors text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[#8197a4] text-[0.7rem] uppercase tracking-widest mb-2 font-semibold">Descrição</label>
                <textarea 
                  name="descricao" rows={3}
                  placeholder="Descreva o vídeo aqui..." 
                  className="w-full bg-[#0f171e] border border-[#1e3040] focus:border-[#00a8e1] rounded-xl px-4 py-3 text-white placeholder-[#4a6373] focus:outline-none transition-colors resize-y text-sm"
                />
              </div>

              <div>
                <label className="block text-[#8197a4] text-[0.7rem] uppercase tracking-widest mb-2 font-semibold">Categoria</label>
                <select 
                  name="categoria" 
                  className="w-full bg-[#0f171e] border border-[#1e3040] focus:border-[#00a8e1] rounded-xl px-4 py-3 text-white focus:outline-none transition-colors cursor-pointer text-sm appearance-none"
                >
                  {CATEGORIAS.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[#8197a4] text-[0.7rem] uppercase tracking-widest mb-2 font-semibold">Duração (ex: 12:34)</label>
                <input 
                  name="duracao" placeholder="00:00"
                  className="w-full bg-[#0f171e] border border-[#1e3040] focus:border-[#00a8e1] rounded-xl px-4 py-3 text-white placeholder-[#4a6373] focus:outline-none transition-colors text-sm"
                />
              </div>

              <div>
                <label className="block text-[#8197a4] text-[0.7rem] uppercase tracking-widest mb-2 font-semibold">Video ID do Bunny.net *</label>
                <input 
                  name="bunny_video_id" required
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  className="w-full bg-[#0f171e] border border-[#1e3040] focus:border-[#00a8e1] rounded-xl px-4 py-3 text-white placeholder-[#4a6373] focus:outline-none transition-colors text-sm font-mono"
                />
                <p className="text-[#4a6373] text-[0.65rem] mt-1.5">No Bunny.net → clique no vídeo → "Copy Video ID"</p>
              </div>

              <div>
                <label className="block text-[#8197a4] text-[0.7rem] uppercase tracking-widest mb-2 font-semibold">URL da Thumbnail</label>
                <input 
                  name="thumbnail_url" placeholder="https://..."
                  className="w-full bg-[#0f171e] border border-[#1e3040] focus:border-[#00a8e1] rounded-xl px-4 py-3 text-white placeholder-[#4a6373] focus:outline-none transition-colors text-sm"
                />
                <p className="text-[#4a6373] text-[0.65rem] mt-1.5">Deixar vazio = imagem automática é usada</p>
              </div>

            </div>

            <div className="mt-6 flex gap-3">
              <button 
                type="submit" 
                className="flex items-center gap-2 bg-[#00a8e1] hover:bg-[#0083b0] text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors shadow-lg"
              >
                <Plus size={16} />
                Adicionar Vídeo
              </button>
            </div>
          </form>
        </div>

        {/* ── Lista de Vídeos ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white text-lg font-bold">Catálogo ({total})</h2>
          </div>

          {!videos || videos.length === 0 ? (
            <div className="bg-[#1a2733] border border-[#1e3040] rounded-2xl p-12 text-center">
              <Video size={48} className="text-[#4a6373] mx-auto mb-4" />
              <p className="text-[#8197a4]">Nenhum vídeo cadastrado ainda.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {(videos as Video[]).map(video => (
                <div 
                  key={video.id}
                  className={`bg-[#1a2733] border rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center gap-4 transition-all ${video.ativo ? 'border-[#1e3040]' : 'border-red-500/20 opacity-60'}`}
                >
                  {/* Thumbnail */}
                  <div 
                    className="w-full sm:w-28 md:w-32 aspect-video rounded-xl shrink-0 bg-[#0f171e] border border-[#1e3040] bg-cover bg-center overflow-hidden flex items-center justify-center"
                    style={{ backgroundImage: (video.thumbnail_url || getFallback(video.id)) ? `url(${video.thumbnail_url || getFallback(video.id)})` : 'none' }}
                  >
                    {!video.thumbnail_url && !getFallback(video.id) && <Video size={24} className="text-[#4a6373]" />}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-bold text-sm md:text-base truncate mb-2">{video.titulo}</div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[#00a8e1] text-[0.65rem] bg-[#00a8e1]/10 border border-[#00a8e1]/20 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                        {video.categoria}
                      </span>
                      {video.duracao && (
                        <span className="text-[#8197a4] text-[0.65rem] flex items-center gap-1">⏱ {video.duracao}</span>
                      )}
                      <span className="text-[#4a6373] text-[0.65rem]">
                        {new Date(video.criado_em).toLocaleDateString('pt-BR')}
                      </span>
                      {!video.ativo && (
                        <span className="text-red-400 text-[0.65rem] font-bold uppercase tracking-wider">● Oculto</span>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                    <Link 
                      href={`/watch/${video.id}`} target="_blank"
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-colors border border-[#1e3040]"
                    >
                      <ExternalLink size={12} />
                      Ver
                    </Link>

                    <form action={toggleVideoAtivo.bind(null, video.id, video.ativo)}>
                      <button 
                        type="submit"
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                          video.ativo 
                            ? 'text-[#8197a4] border-[#1e3040] hover:bg-white/5' 
                            : 'text-[#4caf82] border-[#4caf82]/20 hover:bg-[#4caf82]/10'
                        }`}
                      >
                        {video.ativo ? <EyeOff size={12} /> : <Eye size={12} />}
                        {video.ativo ? 'Ocultar' : 'Publicar'}
                      </button>
                    </form>

                    <form action={deletarVideo.bind(null, video.id)}>
                      <button 
                        type="submit"
                        className="flex items-center gap-1.5 bg-red-500/5 hover:bg-red-500/15 text-red-400 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border border-red-500/10"
                      >
                        <Trash2 size={12} />
                        Deletar
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
