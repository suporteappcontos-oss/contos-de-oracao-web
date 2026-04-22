import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

type Props = {
  params: Promise<{ videoId: string }>
}

export default async function VideoPlayerPage({ params }: Props) {
  const { videoId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Buscar dados do vídeo
  const { data: video } = await supabase
    .from('videos')
    .select('*')
    .eq('id', videoId)
    .eq('ativo', true)
    .single()

  if (!video) redirect('/watch')

  const embedUrl = `https://iframe.mediadelivery.net/embed/${video.bunny_library_id}/${video.bunny_video_id}?autoplay=false&responsive=true&preload=true`

  return (
    <div style={{ background: '#070d16', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Navbar ── */}
      <header style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50,
        background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: '1.5rem',
        padding: '0.9rem 4%'
      }}>
        <Link href="/watch" style={{
          color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
          fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px',
          transition: 'color 0.2s'
        }}>
          ← Voltar
        </Link>
        <div style={{ color: '#FFD700', fontSize: '1.3rem', fontWeight: 900 }}>
          Contos de Oração
        </div>
      </header>

      <main style={{ paddingTop: '60px' }}>

        {/* ── Player de Vídeo ── */}
        <div style={{
          background: '#000',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
        }}>
          <div style={{
            position: 'relative',
            paddingBottom: '56.25%', /* 16:9 */
            height: 0,
            overflow: 'hidden',
          }}>
            <iframe
              src={embedUrl}
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: '100%', height: '100%',
                border: 'none',
              }}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* ── Informações do Vídeo ── */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 4%' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(255,215,0,0.15)', color: '#FFD700',
                  fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px',
                  borderRadius: '6px', letterSpacing: '0.05em'
                }}>
                  {video.categoria}
                </span>
                {video.duracao && (
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                    ⏱ {video.duracao}
                  </span>
                )}
              </div>

              <h1 style={{
                color: '#fff', fontSize: '1.8rem', fontWeight: 900,
                margin: '0 0 1rem', lineHeight: 1.3
              }}>
                {video.titulo}
              </h1>

              {video.descricao && (
                <p style={{
                  color: 'rgba(255,255,255,0.55)', fontSize: '1rem',
                  lineHeight: 1.7, maxWidth: '700px', margin: 0
                }}>
                  {video.descricao}
                </p>
              )}
            </div>

            <Link href="/watch" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '0.9rem',
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '10px 20px', borderRadius: '10px', flexShrink: 0
            }}>
              🎬 Ver mais vídeos
            </Link>
          </div>

          {/* Separador */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '2rem 0' }} />

          {/* Card de assinatura ativa */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '14px', padding: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(100,220,100,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', flexShrink: 0
            }}>
              ✓
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>
                Assinatura Ativa
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '2px' }}>
                {user.email}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
