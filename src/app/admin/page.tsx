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

  // Buscar todos os vídeos
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .order('criado_em', { ascending: false })

  const total = videos?.length ?? 0
  const ativos = videos?.filter(v => v.ativo).length ?? 0

  return (
    <div className="min-h-screen bg-[#0f171e] font-sans text-white pb-20">

      {/* ── Navbar ── */}
      <header className="fixed top-0 w-full z-50 bg-[#1a242f] shadow-md flex items-center justify-between px-4 md:px-8 py-3 h-[72px]">
        <div className="flex items-center gap-4">
          <Link href="/watch" className="flex items-center leading-none shrink-0 group gap-1">
             <span className="text-white text-xl font-black italic tracking-tighter shadow-sm">prime</span>
             <span className="text-[#0f79af] text-sm font-bold tracking-widest mt-0.5">video</span>
          </Link>
          <span className="bg-[#0f79af] text-white text-[0.6rem] font-extrabold px-2 py-0.5 rounded tracking-widest hidden sm:inline-block outline outline-2 outline-offset-2 outline-[#0f79af]/30">
            ADMIN
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#8197a4] text-sm font-bold hidden md:inline">{user.email}</span>
          <Link href="/watch" className="text-white/70 text-xs md:text-sm border border-white/20 hover:border-white/40 px-3 md:px-4 py-2 rounded font-bold hover:bg-white/5 transition-colors">
            ← Sair do Admin
          </Link>
        </div>
      </header>

      <main className="pt-[100px] px-4 md:px-8 max-w-6xl mx-auto">

        {/* ── Título ── */}
        <div className="mb-8">
          <h1 className="text-white text-2xl md:text-3xl font-black mb-1 drop-shadow-md">
            Gerenciamento do Catálogo
          </h1>
          <p className="text-[#8197a4] text-sm md:text-base font-medium">
            Adicione e modifique vídeos disponíveis no plano Prime.
          </p>
        </div>

        {/* ── Cards de Estatísticas ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-10">
          {[
            { label: 'Total Prime', value: total, icon: '🎬' },
            { label: 'Visíveis no Catálogo', value: ativos, icon: '✅' },
            { label: 'Ocultos', value: total - ativos, icon: '👁️' },
          ].map(stat => (
            <div key={stat.label} className="bg-[#1b2530] border border-white/5 rounded-xl p-4 md:p-6 text-center shadow-lg hover:bg-[#202c38] transition-colors">
              <div className="text-2xl md:text-3xl mb-1 opacity-80">{stat.icon}</div>
              <div className="text-[#0f79af] text-2xl md:text-4xl font-black">{stat.value}</div>
              <div className="text-[#8197a4] text-xs md:text-sm mt-1 font-bold tracking-wide uppercase">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Formulário: Adicionar Vídeo ── */}
        <div className="bg-[#1b2530] border border-white/5 rounded-xl p-5 md:p-8 mb-10 shadow-lg">
          <h2 className="text-[#0f79af] text-lg md:text-xl font-extrabold mb-6 flex items-center gap-2">
            Adicionar Novo Título ao Prime
          </h2>

          <form action={adicionarVideo} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

              <div className="md:col-span-2">
                <label className="block text-[#8197a4] text-[0.65rem] font-bold uppercase tracking-widest mb-2">Título Oficial *</label>
                <input name="titulo" required placeholder="A Oração..." className="w-full bg-[#0f171e] outline outline-1 outline-white/10 rounded-sm px-4 py-3 text-white focus:outline-2 focus:outline-[#0f79af] transition-all" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[#8197a4] text-[0.65rem] font-bold uppercase tracking-widest mb-2">Sinopse</label>
                <textarea name="descricao" rows={3} placeholder="Sinopse detalhada estilo Prime..." className="w-full bg-[#0f171e] outline outline-1 outline-white/10 rounded-sm px-4 py-3 text-white focus:outline-2 focus:outline-[#0f79af] transition-all resize-y" />
              </div>

              <div>
                <label className="block text-[#8197a4] text-[0.65rem] font-bold uppercase tracking-widest mb-2">Gênero Primário</label>
                <select name="categoria" className="w-full bg-[#0f171e] outline outline-1 outline-white/10 rounded-sm px-4 py-3 text-white focus:outline-2 focus:outline-[#0f79af] transition-all cursor-pointer appearance-none">
                  {CATEGORIAS.map(cat => (
                    <option key={cat} value={cat} className="bg-[#1a242f] py-2">{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#8197a4] text-[0.65rem] font-bold uppercase tracking-widest mb-2">Duração Oficial (ex: 1 h 24 min)</label>
                <input name="duracao" placeholder="Ex: 1 h 30 min" className="w-full bg-[#0f171e] outline outline-1 outline-white/10 rounded-sm px-4 py-3 text-white focus:outline-2 focus:outline-[#0f79af] transition-all" />
              </div>

              <div>
                <label className="block text-[#8197a4] text-[0.65rem] font-bold uppercase tracking-widest mb-2">Bunny.net Video ID *</label>
                <input name="bunny_video_id" required placeholder="xxxxxxxx-xxxx-..." className="w-full bg-[#0f171e] outline outline-1 outline-white/10 rounded-sm px-4 py-3 text-white focus:outline-2 focus:outline-[#0f79af] transition-all font-mono text-sm" />
              </div>

              <div>
                <label className="block text-[#8197a4] text-[0.65rem] font-bold uppercase tracking-widest mb-2">Pôster/Thumbnail URL</label>
                <input name="thumbnail_url" placeholder="(Opcional) URL da imagem HD" className="w-full bg-[#0f171e] outline outline-1 outline-white/10 rounded-sm px-4 py-3 text-white focus:outline-2 focus:outline-[#0f79af] transition-all" />
              </div>

            </div>

            <button type="submit" className="w-full md:w-auto mt-6 bg-[#0f79af] hover:bg-[#0b5e89] text-white px-8 py-3 rounded-md font-bold text-sm md:text-base transition-colors shadow-sm">
              Publicar no Catálogo Prime
            </button>
          </form>
        </div>

        {/* ── Lista de Vídeos ── */}
        <div>
          <h2 className="text-white text-lg md:text-xl font-bold mb-4">
            Títulos Adicionados
          </h2>

          {!videos || videos.length === 0 ? (
            <div className="bg-[#1b2530] border border-white/5 rounded-xl p-10 text-center">
              <p className="text-[#8197a4] font-semibold">Catálogo vazio. Adicione um título acima.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {videos.map(video => (
                <div key={video.id} className={`bg-[#1b2530] border rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 transition-all ${video.ativo ? 'border-white/5 shadow-md' : 'border-red-500/20 opacity-75'}`}>
                  
                  {/* Informações Principais */}
                  <div className="flex items-center gap-5 flex-1 min-w-0">
                    <div 
                      className="w-24 h-[54px] md:w-28 md:h-[63px] rounded bg-cover bg-center shrink-0 border border-white/10"
                      style={{ backgroundImage: video.thumbnail_url ? `url(${video.thumbnail_url})` : 'none', backgroundColor: '#0f171e' }}
                    >
                      {!video.thumbnail_url && <span className="flex items-center justify-center w-full h-full text-xs text-[#8197a4] font-bold">SEM CAPA</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-white font-bold text-sm md:text-base truncate">{video.titulo}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 line-clamp-1">
                        <span className="text-[#8197a4] text-[0.65rem] md:text-[0.7rem] font-bold bg-[#0f171e] px-2 py-0.5 rounded border border-white/10">{video.categoria}</span>
                        {video.duracao && <span className="text-white/50 text-[0.65rem] md:text-xs">⏱ {video.duracao}</span>}
                        <span className="text-white/30 text-[0.65rem] md:text-xs">{new Date(video.criado_em).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 w-full md:w-auto shrink-0 mt-3 md:mt-0">
                    <Link href={`/watch/${video.id}`} target="_blank" className="flex-1 md:flex-none text-center bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-md text-xs font-bold transition-colors">
                      Testar
                    </Link>
                    
                    <form action={toggleVideoAtivo.bind(null, video.id, video.ativo)} className="flex-1 md:flex-none">
                      <button type="submit" className={`w-full px-3 py-2 rounded-md text-xs font-bold transition-colors ${video.ativo ? 'text-white border border-[#0f79af] hover:bg-[#0f79af]/20' : 'bg-green-500 hover:bg-green-600 text-white'}`}>
                        {video.ativo ? 'Ocultar' : 'Habilitar'}
                      </button>
                    </form>

                    <form action={deletarVideo.bind(null, video.id)} className="flex-1 md:flex-none">
                      <button type="submit" className="w-full text-red-500 hover:text-white hover:bg-red-600 border border-red-500/20 px-3 py-2 rounded-md text-xs font-bold transition-colors">
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
