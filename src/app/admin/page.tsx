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
    <div style={{ background: '#0C121D', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Navbar ── */}
      <header style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,215,0,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 4%'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/watch" style={{ color: '#FFD700', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 900 }}>
            Contos de Oração
          </Link>
          <span style={{
            background: '#FFD700', color: '#000', fontSize: '0.65rem',
            fontWeight: 800, padding: '2px 8px', borderRadius: '4px', letterSpacing: '1px'
          }}>ADMIN</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{user.email}</span>
          <Link href="/watch" style={{
            color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem',
            border: '1px solid rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '8px'
          }}>
            ← Voltar ao Site
          </Link>
        </div>
      </header>

      <main style={{ paddingTop: '100px', padding: '100px 4% 60px' }}>

        {/* ── Título ── */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 900, margin: 0 }}>
            🎬 Painel Administrativo
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
            Gerencie o catálogo de vídeos da plataforma
          </p>
        </div>

        {/* ── Cards de Estatísticas ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Total de Vídeos', value: total, icon: '🎬' },
            { label: 'Vídeos Ativos', value: ativos, icon: '✅' },
            { label: 'Vídeos Ocultos', value: total - ativos, icon: '👁️' },
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '1.25rem', textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
              <div style={{ color: '#FFD700', fontSize: '2rem', fontWeight: 900 }}>{stat.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Formulário: Adicionar Vídeo ── */}
        <div style={{
          background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.2)',
          borderRadius: '20px', padding: '2rem', marginBottom: '2.5rem'
        }}>
          <h2 style={{ color: '#FFD700', fontSize: '1.2rem', fontWeight: 800, marginTop: 0, marginBottom: '1.5rem' }}>
            ➕ Adicionar Novo Vídeo
          </h2>

          <form action={adicionarVideo}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

              {/* Título */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Título do Vídeo *</label>
                <input name="titulo" required placeholder="Ex: A Oração que Move Montanhas" style={inputStyle} />
              </div>

              {/* Descrição */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Descrição</label>
                <textarea name="descricao" rows={3} placeholder="Descrição do vídeo..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>

              {/* Categoria */}
              <div>
                <label style={labelStyle}>Categoria</label>
                <select name="categoria" style={{ ...inputStyle, cursor: 'pointer' }}>
                  {CATEGORIAS.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Duração */}
              <div>
                <label style={labelStyle}>Duração (ex: 12:34)</label>
                <input name="duracao" placeholder="00:00" style={inputStyle} />
              </div>

              {/* Bunny.net Video ID */}
              <div>
                <label style={labelStyle}>Video ID do Bunny.net *</label>
                <input
                  name="bunny_video_id"
                  required
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  style={inputStyle}
                />
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '4px' }}>
                  No Bunny.net: clique no vídeo → "Copy Video ID"
                </p>
              </div>

              {/* Thumbnail URL */}
              <div>
                <label style={labelStyle}>URL da Thumbnail (opcional)</label>
                <input name="thumbnail_url" placeholder="https://..." style={inputStyle} />
              </div>

            </div>

            <button type="submit" style={{
              marginTop: '1.5rem',
              background: '#FFD700', color: '#000', border: 'none',
              padding: '14px 32px', borderRadius: '10px', fontWeight: 800,
              fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s'
            }}>
              ✅ Adicionar Vídeo ao Catálogo
            </button>
          </form>
        </div>

        {/* ── Lista de Vídeos ── */}
        <div>
          <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>
            📽️ Vídeos no Catálogo ({total})
          </h2>

          {!videos || videos.length === 0 ? (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '3rem', textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
              <p style={{ color: 'rgba(255,255,255,0.4)' }}>Nenhum vídeo cadastrado ainda.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(videos as Video[]).map(video => (
                <div key={video.id} style={{
                  background: 'rgba(255,255,255,0.03)', border: `1px solid ${video.ativo ? 'rgba(255,255,255,0.08)' : 'rgba(255,0,0,0.15)'}`,
                  borderRadius: '14px', padding: '1.25rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  opacity: video.ativo ? 1 : 0.5
                }}>
                  {/* Thumbnail / Ícone */}
                  <div style={{
                    width: '80px', height: '50px', borderRadius: '8px', flexShrink: 0,
                    background: video.thumbnail_url ? `url(${video.thumbnail_url}) center/cover` : 'rgba(255,215,0,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {!video.thumbnail_url && <span style={{ fontSize: '1.5rem' }}>🎬</span>}
                  </div>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {video.titulo}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#FFD700', fontSize: '0.75rem', background: 'rgba(255,215,0,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                        {video.categoria}
                      </span>
                      {video.duracao && (
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>⏱ {video.duracao}</span>
                      )}
                      <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem' }}>
                        {new Date(video.criado_em).toLocaleDateString('pt-BR')}
                      </span>
                      {!video.ativo && <span style={{ color: '#ff6b6b', fontSize: '0.75rem' }}>OCULTO</span>}
                    </div>
                  </div>

                  {/* Ações */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                    <Link
                      href={`/watch/${video.id}`}
                      target="_blank"
                      style={{ ...btnStyle, background: 'rgba(255,255,255,0.08)', color: '#fff', textDecoration: 'none' }}
                    >
                      ▶ Ver
                    </Link>

                    <form action={toggleVideoAtivo.bind(null, video.id, video.ativo)} style={{ display: 'inline' }}>
                      <button type="submit" style={{
                        ...btnStyle,
                        background: video.ativo ? 'rgba(255,107,107,0.15)' : 'rgba(100,220,100,0.15)',
                        color: video.ativo ? '#ff6b6b' : '#6ddc6d',
                      }}>
                        {video.ativo ? '👁 Ocultar' : '✅ Ativar'}
                      </button>
                    </form>

                    <form action={deletarVideo.bind(null, video.id)} style={{ display: 'inline' }}>
                      <button type="submit"
                        onClick={() => {}}
                        style={{ ...btnStyle, background: 'rgba(255,0,0,0.1)', color: '#ff4444' }}
                      >
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

// ── Estilos reutilizáveis ──
const labelStyle: React.CSSProperties = {
  display: 'block', color: 'rgba(255,255,255,0.5)',
  fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em',
  marginBottom: '6px'
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 14px',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '10px', color: '#fff', fontSize: '0.95rem',
  outline: 'none', boxSizing: 'border-box',
  fontFamily: 'Inter, sans-serif'
}

const btnStyle: React.CSSProperties = {
  padding: '6px 14px', borderRadius: '8px',
  fontSize: '0.8rem', fontWeight: 600,
  border: 'none', cursor: 'pointer',
  fontFamily: 'Inter, sans-serif'
}
