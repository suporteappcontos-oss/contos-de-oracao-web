import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { adicionarVideo, toggleVideoAtivo, deletarVideo } from './actions'

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

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Verificar se é admin
  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', user.id)
    .single()

  if (perfil?.role !== 'admin') redirect('/')

  // Buscar todos os vídeos (admin vê todos, inclusive inativos)
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('criado_em', { ascending: false })

  const total = videos?.length ?? 0
  const ativos = videos?.filter(v => v.ativo).length ?? 0

  return (
    <div className="min-h-screen bg-[#0C121D] font-sans text-white pb-20">

      {/* ── Navbar ── */}
      <header className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-[#FFD700]/15 flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center gap-3">
          <Link href="/watch" className="text-[#FFD700] text-xl md:text-2xl font-black drop-shadow-md">
            Contos de Oração
          </Link>
          <span className="bg-[#FFD700] text-black text-[0.6rem] font-extrabold px-2 py-0.5 rounded tracking-widest hidden sm:inline-block">
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-xs hidden sm:inline">{user.email}</span>
          <Link href="/watch" className="text-white/70 text-xs md:text-sm border border-white/20 px-3 md:px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
            ← Voltar ao Site
          </Link>
        </div>
      </header>

      <main className="pt-[100px] px-4 md:px-8 max-w-6xl mx-auto">

        {/* ── Título ── */}
        <div className="mb-8">
          <h1 className="text-white text-2xl md:text-3xl font-black mb-1">
            🎬 Painel Administrativo
          </h1>
          <p className="text-white/40 text-sm md:text-base">
            Gerencie o catálogo de vídeos da plataforma.
          </p>
        </div>

        {/* ── Cards de Estatísticas ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-10">
          {[
            { label: 'Total de Vídeos', value: total, icon: '🎬' },
            { label: 'Vídeos Ativos', value: ativos, icon: '✅' },
            { label: 'Vídeos Ocultos', value: total - ativos, icon: '👁️' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/5 border border-white/5 rounded-2xl p-4 md:p-6 text-center">
              <div className="text-2xl md:text-3xl mb-1">{stat.icon}</div>
              <div className="text-[#FFD700] text-2xl md:text-4xl font-black">{stat.value}</div>
              <div className="text-white/40 text-xs md:text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Formulário: Adicionar Vídeo ── */}
        <div className="bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-2xl p-5 md:p-8 mb-10">
          <h2 className="text-[#FFD700] text-lg md:text-xl font-extrabold mb-6 flex items-center gap-2">
            ➕ Adicionar Novo Vídeo
          </h2>

          <form action={adicionarVideo} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Título do Vídeo *</label>
                <input name="titulo" required placeholder="Ex: A Oração que Move Montanhas" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]/50 transition-colors" />
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Descrição</label>
                <textarea name="descricao" rows={3} placeholder="Descrição do vídeo..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]/50 transition-colors resize-y" />
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Categoria</label>
                {/* CSS Inline apenas para sumir com background branco do option no dropdown */}
                <select name="categoria" className="w-full bg-[#18212C] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]/50 transition-colors cursor-pointer appearance-none">
                  {CATEGORIAS.map(cat => (
                    <option key={cat} value={cat} className="bg-[#0C121D]">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Duração */}
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Duração (ex: 12:34)</label>
                <input name="duracao" placeholder="00:00" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]/50 transition-colors" />
              </div>

              {/* Bunny.net Video ID */}
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">Video ID do Bunny.net *</label>
                <input name="bunny_video_id" required placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]/50 transition-colors" />
                <p className="text-white/30 text-[0.65rem] md:text-xs mt-1.5">No Bunny.net: clique no vídeo → "Copy Video ID"</p>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label className="block text-white/50 text-xs uppercase tracking-widest mb-2">URL da Thumbnail (opcional)</label>
                <input name="thumbnail_url" placeholder="https://..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#FFD700]/50 transition-colors" />
              </div>

            </div>

            <button type="submit" className="w-full md:w-auto mt-4 bg-[#FFD700] hover:bg-[#ffe14d] text-black px-8 py-3.5 rounded-xl font-extrabold text-sm md:text-base transition-colors shadow-[0_4px_15px_rgba(255,215,0,0.2)]">
              ✅ Adicionar Vídeo
            </button>
          </form>
        </div>

        {/* ── Lista de Vídeos ── */}
        <div>
          <h2 className="text-white text-lg md:text-xl font-extrabold mb-4">
            📽️ Catálogo Gerenciado ({total})
          </h2>

          {!videos || videos.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-white/40">Nenhum vídeo cadastrado.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {videos.map(video => (
                <div key={video.id} className={`bg-white/5 border rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 transition-all ${video.ativo ? 'border-white/10' : 'border-red-500/20 opacity-60'}`}>
                  
                  {/* Informações Principais */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div 
                      className="w-20 h-14 md:w-24 md:h-16 rounded-lg shrink-0 flex items-center justify-center border border-white/10 bg-cover bg-center"
                      style={{ backgroundImage: video.thumbnail_url ? `url(${video.thumbnail_url})` : 'none', backgroundColor: 'rgba(255,215,0,0.05)' }}
                    >
                      {!video.thumbnail_url && <span className="text-2xl">🎬</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm md:text-base truncate">{video.titulo}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 line-clamp-1">
                        <span className="text-[#FFD700] text-[0.65rem] md:text-xs bg-[#FFD700]/10 px-2 py-0.5 rounded font-medium">{video.categoria}</span>
                        {video.duracao && <span className="text-white/40 text-[0.65rem] md:text-xs shrink-0">⏱ {video.duracao}</span>}
                        <span className="text-white/30 text-[0.65rem] md:text-xs shrink-0">{new Date(video.criado_em).toLocaleDateString('pt-BR')}</span>
                        {!video.ativo && <span className="text-red-400 text-[0.65rem] md:text-xs font-bold tracking-wider shrink-0">OCULTO</span>}
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0 mt-2 md:mt-0">
                    <Link href={`/watch/${video.id}`} target="_blank" className="flex-1 md:flex-none text-center bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors">
                      ▶ Ver
                    </Link>
                    
                    <form action={toggleVideoAtivo.bind(null, video.id, video.ativo)} className="flex-1 md:flex-none">
                      <button type="submit" className={`w-full md:w-auto px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors ${video.ativo ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}>
                        {video.ativo ? '👁 Ocultar' : '✅ Ativar'}
                      </button>
                    </form>

                    <form action={deletarVideo.bind(null, video.id)} className="flex-1 md:flex-none">
                      <button type="submit" className="w-full md:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors">
                        🗑 Deletar
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
