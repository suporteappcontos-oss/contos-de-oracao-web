import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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

export default async function WatchPage() {
  try {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/')

  // Verificar se é admin (para mostrar botão de admin)
  const { data: perfil } = await supabase
    .from('perfis')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = perfil?.role === 'admin'

  // Buscar vídeos ativos
  const { data: videos } = await supabase
    .from('videos')
    .select('*')
    .eq('ativo', true)
    .order('criado_em', { ascending: false })

  // Agrupar por categoria
  const categorias = [...new Set((videos ?? []).map((v: Video) => v.categoria))]
  const videosPorCategoria: Record<string, Video[]> = {}
  for (const cat of categorias) {
    videosPorCategoria[cat] = (videos ?? []).filter((v: Video) => v.categoria === cat)
  }

  async function logout() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div style={{ background: '#0C121D', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Navbar ── */}
      <header style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1rem 4%'
      }}>
        <div style={{ color: '#FFD700', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '1px' }}>
          Contos de Oração
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>{user.email}</span>
          {isAdmin && (
            <Link href="/admin" style={{
              color: '#FFD700', textDecoration: 'none', fontSize: '0.8rem',
              border: '1px solid rgba(255,215,0,0.3)', padding: '6px 14px', borderRadius: '8px',
              fontWeight: 700
            }}>
              ⚙️ Admin
            </Link>
          )}
          <form action={logout}>
            <button type="submit" style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.6)', padding: '6px 14px',
              borderRadius: '8px', fontSize: '0.85rem', cursor: 'pointer'
            }}>
              Sair
            </button>
          </form>
        </div>
      </header>

      <main style={{ paddingTop: '80px' }}>

        {/* ── Sem vídeos ainda ── */}
        {(!videos || videos.length === 0) && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', minHeight: '70vh', textAlign: 'center', padding: '2rem'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>🎬</div>
            <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>
              Catálogo em construção
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1.1rem', maxWidth: '500px', marginBottom: '2rem' }}>
              Estamos preparando um catálogo incrível com conteúdos religiosos exclusivos. Em breve tudo estará disponível!
            </p>
            <div style={{ width: '300px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: '75%', height: '100%', background: '#FFD700', borderRadius: '999px' }} />
            </div>
            <p style={{ color: '#FFD700', marginTop: '0.75rem', fontWeight: 700 }}>75% concluído...</p>
          </div>
        )}

        {/* ── Catálogo com vídeos ── */}
        {videos && videos.length > 0 && (
          <>
            {/* Hero: primeiro vídeo em destaque */}
            <HeroBanner video={videos[0] as Video} />

            {/* Carrosséis por categoria */}
            <div style={{ padding: '2rem 4%', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
              {categorias.map(cat => (
                <section key={cat}>
                  <h2 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                    {cat}
                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', fontWeight: 400, marginLeft: '0.75rem' }}>
                      {videosPorCategoria[cat].length} vídeos
                    </span>
                  </h2>
                  <div style={{
                    display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem',
                    scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,215,0,0.3) transparent'
                  }}>
                    {videosPorCategoria[cat].map((video: Video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
  } catch (err: any) {
    if (err?.message === 'NEXT_REDIRECT' || err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    return (
      <div style={{ background: '#0C121D', color: '#ff6b6b', padding: '2rem', minHeight: '100vh', fontFamily: 'monospace' }}>
        <h1>Erro no Servidor:</h1>
        <p>{err?.message || 'Erro Desconhecido'}</p>
        <pre style={{ background: 'rgba(255,0,0,0.1)', padding: '1rem', overflowX: 'auto', borderRadius: '8px' }}>
          {err?.stack}
        </pre>
      </div>
    )
  }
}

// ── Card de Vídeo ──
function VideoCard({ video }: { video: Video }) {
  const thumbnailUrl = video.thumbnail_url ||
    `https://iframe.mediadelivery.net/embed/${video.bunny_library_id}/${video.bunny_video_id}/thumbnail.jpg`

  return (
    <Link href={`/watch/${video.id}`} style={{ textDecoration: 'none', flexShrink: 0, width: '220px' }}>
      <div style={{
        borderRadius: '12px', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        transition: 'all 0.25s', cursor: 'pointer',
        background: 'rgba(255,255,255,0.03)',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,215,0,0.4)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
      >
        {/* Thumbnail */}
        <div style={{
          width: '220px', height: '130px',
          background: `url(${thumbnailUrl}) center/cover, rgba(255,215,0,0.08)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgba(255,215,0,0.6)'
          }}>
            <span style={{ fontSize: '1.1rem', marginLeft: '3px' }}>▶</span>
          </div>
          {video.duracao && (
            <span style={{
              position: 'absolute', bottom: '6px', right: '8px',
              background: 'rgba(0,0,0,0.8)', color: '#fff',
              fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px'
            }}>
              {video.duracao}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '0.75rem' }}>
          <div style={{
            color: '#fff', fontWeight: 700, fontSize: '0.9rem',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {video.titulo}
          </div>
          <div style={{ color: '#FFD700', fontSize: '0.75rem', marginTop: '4px' }}>
            {video.categoria}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── Banner Hero (primeiro vídeo em destaque) ──
function HeroBanner({ video }: { video: Video }) {
  return (
    <div style={{
      position: 'relative', height: '420px', overflow: 'hidden',
      background: 'linear-gradient(135deg, #1a2a3a 0%, #0C121D 100%)',
      display: 'flex', alignItems: 'flex-end',
    }}>
      {/* Gradiente de fundo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(12,18,29,0.95) 40%, rgba(12,18,29,0.3))',
      }} />

      {/* Conteúdo */}
      <div style={{ position: 'relative', zIndex: 2, padding: '3rem 4%', maxWidth: '600px' }}>
        <span style={{
          background: '#FFD700', color: '#000', fontSize: '0.7rem',
          fontWeight: 800, padding: '4px 10px', borderRadius: '4px', letterSpacing: '1px',
          display: 'inline-block', marginBottom: '1rem'
        }}>
          EM DESTAQUE
        </span>
        <h1 style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 900, margin: '0 0 0.75rem', lineHeight: 1.2 }}>
          {video.titulo}
        </h1>
        {video.descricao && (
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {video.descricao.length > 120 ? video.descricao.slice(0, 120) + '...' : video.descricao}
          </p>
        )}
        <Link href={`/watch/${video.id}`} style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#FFD700', color: '#000', textDecoration: 'none',
          padding: '12px 28px', borderRadius: '10px', fontWeight: 800, fontSize: '1rem'
        }}>
          ▶ Assistir Agora
        </Link>
      </div>
    </div>
  )
}
