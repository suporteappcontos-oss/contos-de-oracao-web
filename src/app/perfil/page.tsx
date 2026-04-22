import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  User, Mail, Shield, Star, Heart, LogOut, Key,
  ChevronLeft, Calendar, Crown, XCircle, CheckCircle2, Play
} from 'lucide-react'

// Tipo do vídeo favorito
type VideoFavorito = {
  id: string
  video_id: string
  videos: {
    id: string
    titulo: string
    categoria: string
    thumbnail_url: string | null
    duracao: string | null
    bunny_video_id: string
    bunny_library_id: string
  }
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&q=70',
  'https://images.unsplash.com/photo-1476725994324-6f6833cfb205?w=400&q=70',
  'https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?w=400&q=70',
  'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=400&q=70',
]
function getFallback(id: string) {
  const code = (id.charCodeAt(0) || 0) + (id.charCodeAt(id.length - 1) || 0)
  return FALLBACK_IMAGES[code % FALLBACK_IMAGES.length]
}

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfis').select('role, plano').eq('id', user.id).single()

  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'
  const planoAtivo = user.user_metadata?.plano_ativo === true || isAdmin

  // Busca os favoritos do usuário com os dados do vídeo
  const { data: favoritos } = await supabase
    .from('favoritos')
    .select('id, video_id, videos(id, titulo, categoria, thumbnail_url, duracao, bunny_video_id, bunny_library_id)')
    .eq('user_id', user.id)
    .order('criado_em', { ascending: false })

  // Logout server action
  async function logout() {
    'use server'
    const sb = await createClient()
    await sb.auth.signOut()
    redirect('/')
  }

  // Iniciais do usuário para o avatar
  const email = user.email || ''
  const iniciais = email.slice(0, 2).toUpperCase()

  // Data de criação formatada
  const dataCriacao = user.created_at
    ? new Date(user.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  const PLANO_LABEL: Record<string, string> = {
    basico: 'Básico', familia: 'Família', premium: 'Premium',
  }
  const planoLabel = isAdmin ? 'Administrador' : (PLANO_LABEL[perfil?.plano ?? ''] ?? 'Gratuito')

  return (
    <div className="min-h-screen text-white pb-20" style={{ background: '#090B10', fontFamily: 'Outfit, sans-serif' }}>

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-8 h-[60px]"
        style={{ background: '#090B10', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/watch" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Contos de Oração" width={36} height={36} className="object-contain" />
          <div className="hidden sm:block">
            <div className="text-white font-black text-sm leading-tight">Contos de Oração</div>
            <div className="text-[0.5rem] font-extrabold uppercase tracking-widest -mt-0.5" style={{ color: '#D4AF37' }}>
              {planoLabel}
            </div>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/watch"
            className="flex items-center gap-1.5 text-[#94A3B8] hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            <ChevronLeft size={12} /> Voltar
          </Link>
        </div>
      </header>

      <main className="pt-[80px] px-4 md:px-8 max-w-4xl mx-auto">

        {/* ── CABEÇALHO DO PERFIL ── */}
        <div className="relative rounded-2xl overflow-hidden mb-6 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5"
          style={{ background: 'linear-gradient(135deg, #15243E 0%, #1a2d4a 100%)', border: '1px solid rgba(212,175,55,0.15)' }}>

          {/* Avatar com iniciais */}
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0 shadow-xl"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #b8942e)', color: '#090B10' }}>
            {iniciais}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-white font-black text-xl md:text-2xl">Meu Perfil</h1>
              {/* Badge de status */}
              {planoAtivo ? (
                <span className="flex items-center gap-1 text-[0.6rem] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)' }}>
                  <CheckCircle2 size={10} /> Acesso Ativo
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[0.6rem] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <XCircle size={10} /> Acesso Expirado
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[#94A3B8] text-sm mb-3">
              <Mail size={13} />
              <span>{email}</span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-[#64748B]">
              <span className="flex items-center gap-1"><Calendar size={11} /> Membro desde {dataCriacao}</span>
              <span className="flex items-center gap-1"><Crown size={11} /> Plano: <b style={{ color: '#D4AF37' }}>{planoLabel}</b></span>
              <span className="flex items-center gap-1"><Heart size={11} /> {favoritos?.length ?? 0} favorito(s)</span>
            </div>
          </div>
        </div>

        {/* ── STATUS DO PLANO ── */}
        <div className="rounded-2xl p-5 mb-6"
          style={{
            background: planoAtivo ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
            border: `1px solid ${planoAtivo ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}`,
          }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="font-bold mb-0.5 flex items-center gap-2"
                style={{ color: planoAtivo ? '#10B981' : '#ef4444' }}>
                {planoAtivo ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {planoAtivo ? 'Assinatura Ativa' : 'Assinatura Inativa'}
              </div>
              <p className="text-[#64748B] text-xs">
                {planoAtivo
                  ? 'Você tem acesso completo ao catálogo. Para cancelar, entre em contato com o suporte.'
                  : 'Seu acesso foi cancelado ou expirou. Renove para continuar assistindo.'}
              </p>
            </div>
            {!planoAtivo && !isAdmin && (
              <a href="https://pay.kiwify.com.br/YApXtLr" target="_blank" rel="noreferrer"
                className="shrink-0 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all hover:brightness-110"
                style={{ background: '#D4AF37', color: '#090B10' }}>
                Renovar Assinatura →
              </a>
            )}
          </div>
        </div>

        {/* ── AÇÕES RÁPIDAS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            {
              icon: Key, label: 'Alterar Senha', desc: 'Redefina sua senha de acesso',
              href: '/esqueci-senha', color: '#D4AF37', external: false
            },
            {
              icon: Shield, label: 'Suporte', desc: 'Fale conosco por e-mail',
              href: 'mailto:suporte.appcontos@gmail.com', color: '#00a8e1', external: true
            },
            {
              icon: Star, label: 'Cancelar Plano', desc: 'Entre em contato para cancelar',
              href: 'mailto:suporte.appcontos@gmail.com?subject=Cancelamento de Assinatura',
              color: '#ef4444', external: true
            },
          ].map(({ icon: Icon, label, desc, href, color, external }) => (
            <a key={label} href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}
              className="flex items-start gap-3 p-4 rounded-xl transition-all hover:scale-[1.02]"
              style={{ background: '#15243E', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon size={17} style={{ color }} />
              </div>
              <div>
                <div className="text-white font-bold text-sm">{label}</div>
                <div className="text-[#64748B] text-xs mt-0.5">{desc}</div>
              </div>
            </a>
          ))}
        </div>

        {/* ── MEUS FAVORITOS ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Heart size={16} style={{ color: '#D4AF37' }} fill="#D4AF37" />
            <h2 className="text-white font-bold text-lg">Meus Favoritos</h2>
            <span className="text-[#64748B] text-sm">({favoritos?.length ?? 0})</span>
          </div>

          {!favoritos || favoritos.length === 0 ? (
            <div className="rounded-2xl p-10 text-center"
              style={{ background: '#15243E', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Heart size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-[#64748B]">Você ainda não adicionou favoritos.</p>
              <p className="text-[#4a5568] text-xs mt-1">Clique no coração ❤️ nos vídeos para salvar aqui.</p>
              <Link href="/watch"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:brightness-110"
                style={{ background: '#D4AF37', color: '#090B10' }}>
                <Play size={13} /> Explorar Catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {(favoritos as unknown as VideoFavorito[]).map((fav) => {
                const v = fav.videos
                const thumb = v.thumbnail_url || getFallback(v.id)
                return (
                  <Link key={fav.id} href={`/watch/${v.id}`}
                    className="group relative rounded-xl overflow-hidden block transition-transform hover:scale-[1.03]"
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="aspect-video bg-cover bg-center" style={{ backgroundImage: `url(${thumb})` }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2">
                      <p className="text-white text-xs font-bold truncate">{v.titulo}</p>
                      <p className="text-[0.6rem] font-bold uppercase" style={{ color: '#D4AF37' }}>{v.categoria}</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                        <Play fill="#090B10" size={16} className="ml-0.5" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* ── LOGOUT ── */}
        <div className="mt-10 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <form action={logout}>
            <button type="submit"
              className="flex items-center gap-2 text-sm text-[#64748B] hover:text-red-400 transition-colors cursor-pointer">
              <LogOut size={15} />
              Sair da conta
            </button>
          </form>
        </div>

      </main>
    </div>
  )
}
