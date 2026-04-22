import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart, LogOut, Key, ChevronLeft, Calendar,
  Crown, XCircle, CheckCircle2, Play, Mail,
  Pencil, AlertTriangle, Shield
} from 'lucide-react'
import { salvarNome, cancelarPlano } from './actions'

type VideoFavorito = {
  id: string
  video_id: string
  videos: {
    id: string
    titulo: string
    categoria: string
    thumbnail_url: string | null
    duracao: string | null
  }
}

const FALLBACK = [
  'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&q=70',
  'https://images.unsplash.com/photo-1476725994324-6f6833cfb205?w=400&q=70',
  'https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?w=400&q=70',
  'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=400&q=70',
]
function getFallback(id: string) {
  const code = (id.charCodeAt(0) || 0) + (id.charCodeAt(id.length - 1) || 0)
  return FALLBACK[code % FALLBACK.length]
}

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfis').select('role, plano').eq('id', user.id).single()

  const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com'
  const planoAtivo = user.user_metadata?.plano_ativo === true || isAdmin

  const { data: favoritos } = await supabase
    .from('favoritos')
    .select('id, video_id, videos(id, titulo, categoria, thumbnail_url, duracao)')
    .eq('user_id', user.id)
    .order('criado_em', { ascending: false })

  async function logout() {
    'use server'
    const sb = await createClient()
    await sb.auth.signOut()
    redirect('/')
  }

  const email = user.email || ''
  const nome = user.user_metadata?.nome || ''
  const displayName = nome || email.split('@')[0]
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}&backgroundColor=transparent`

  const dataCriacao = user.created_at
    ? new Date(user.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  const PLANO_LABEL: Record<string, string> = {
    basico: 'Básico', familia: 'Família', premium: 'Premium',
  }
  const planoLabel = isAdmin ? 'Administrador' : (PLANO_LABEL[perfil?.plano ?? ''] ?? 'Assinante')

  return (
    <div className="min-h-screen text-white pb-20" style={{ background: '#090B10', fontFamily: 'Outfit, sans-serif' }}>

      {/* Navbar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-8 h-[60px]"
        style={{ background: '#090B10', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <Link href="/watch" className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Contos de Oração" width={36} height={36} className="object-contain" />
          <div className="hidden sm:block">
            <div className="text-white font-black text-sm leading-tight">Contos de Oração</div>
            <div className="text-[0.5rem] font-extrabold uppercase tracking-widest -mt-0.5" style={{ color: '#D4AF37' }}>{planoLabel}</div>
          </div>
        </Link>
        <Link href="/watch"
          className="flex items-center gap-1.5 text-[#94A3B8] hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <ChevronLeft size={12} /> Voltar
        </Link>
      </header>

      <main className="pt-[80px] px-4 md:px-8 max-w-4xl mx-auto">

        {/* ── CABEÇALHO ── */}
        <div className="relative rounded-2xl overflow-hidden mb-6 p-6 md:p-8"
          style={{ background: 'linear-gradient(135deg, #15243E 0%, #1a2d4a 100%)', border: '1px solid rgba(212,175,55,0.15)' }}>

          {/* Fundo decorativo */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #D4AF37 0%, transparent 60%)' }} />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar DiceBear */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 shadow-xl bg-[#D4AF37]/10"
                style={{ borderColor: 'rgba(212,175,55,0.4)' }}>
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              {/* Badge de status */}
              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#090B10] ${planoAtivo ? 'bg-emerald-500' : 'bg-red-500'}`} />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-white font-black text-xl md:text-2xl capitalize">{displayName}</h1>
                <span className={`flex items-center gap-1 text-[0.6rem] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  planoAtivo
                    ? 'text-emerald-400 border border-emerald-500/25 bg-emerald-500/10'
                    : 'text-red-400 border border-red-500/25 bg-red-500/10'
                }`}>
                  {planoAtivo ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
                  {planoAtivo ? 'Ativo' : 'Expirado'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[#64748B] text-xs mb-3">
                <Mail size={11} /> {email}
              </div>
              <div className="flex flex-wrap gap-4 text-xs text-[#64748B]">
                <span className="flex items-center gap-1"><Calendar size={10} /> Membro desde {dataCriacao}</span>
                <span className="flex items-center gap-1"><Crown size={10} /> <b style={{ color: '#D4AF37' }}>{planoLabel}</b></span>
                <span className="flex items-center gap-1"><Heart size={10} fill="#D4AF37" style={{ color: '#D4AF37' }} /> {favoritos?.length ?? 0} favorito(s)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── EDITAR NOME ── */}
        <div className="rounded-2xl p-5 mb-5"
          style={{ background: '#15243E', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Pencil size={14} style={{ color: '#D4AF37' }} />
            <h2 className="text-white font-bold text-sm">Editar Nome</h2>
          </div>
          <form action={salvarNome} className="flex gap-2">
            <input
              name="nome"
              defaultValue={nome}
              placeholder="Como você quer ser chamado(a)?"
              maxLength={40}
              className="flex-1 bg-[#0f171e] border border-[#1e3040] focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-white placeholder-[#4a6373] focus:outline-none transition-colors text-sm"
            />
            <button type="submit"
              className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:brightness-110 shrink-0"
              style={{ background: '#D4AF37', color: '#090B10' }}>
              Salvar
            </button>
          </form>
          <p className="text-[#4a6373] text-xs mt-2">Este nome aparecerá na plataforma no lugar do seu e-mail.</p>
        </div>

        {/* ── STATUS DO PLANO ── */}
        <div className="rounded-2xl p-5 mb-6"
          style={{
            background: planoAtivo ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)',
            border: `1px solid ${planoAtivo ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)'}`,
          }}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 font-bold mb-1"
                style={{ color: planoAtivo ? '#10B981' : '#ef4444' }}>
                {planoAtivo ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                {planoAtivo ? 'Assinatura Ativa' : 'Assinatura Inativa'}
              </div>
              <p className="text-[#64748B] text-xs max-w-md">
                {planoAtivo
                  ? 'Você tem acesso completo. Para cancelar sua assinatura, clique no botão ao lado.'
                  : 'Sua assinatura expirou. Renove para continuar assistindo ao conteúdo.'}
              </p>
            </div>
            {planoAtivo && !isAdmin ? (
              <form action={cancelarPlano}>
                <button type="submit"
                  className="shrink-0 px-4 py-2 rounded-xl font-bold text-xs transition-all hover:brightness-110 border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer"
                  style={{ background: 'rgba(239,68,68,0.05)' }}
                  onClick={(e) => {
                    if (!confirm('Tem certeza que deseja cancelar seu plano? Você perderá o acesso ao conteúdo.')) {
                      e.preventDefault()
                    }
                  }}
                >
                  Cancelar Plano
                </button>
              </form>
            ) : !planoAtivo && (
              <a href="https://pay.kiwify.com.br/YApXtLr" target="_blank" rel="noreferrer"
                className="shrink-0 px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all hover:brightness-110"
                style={{ background: '#D4AF37', color: '#090B10' }}>
                Renovar →
              </a>
            )}
          </div>
        </div>

        {/* ── AÇÕES RÁPIDAS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          <Link href="/esqueci-senha"
            className="flex items-start gap-3 p-4 rounded-xl transition-all hover:scale-[1.02]"
            style={{ background: '#15243E', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
              <Key size={16} style={{ color: '#D4AF37' }} />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Alterar Senha</div>
              <div className="text-[#64748B] text-xs mt-0.5">Redefina sua senha de acesso</div>
            </div>
          </Link>
          <a href="mailto:suporte.appcontos@gmail.com"
            className="flex items-start gap-3 p-4 rounded-xl transition-all hover:scale-[1.02]"
            style={{ background: '#15243E', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(0,168,225,0.1)', border: '1px solid rgba(0,168,225,0.2)' }}>
              <Shield size={16} style={{ color: '#00a8e1' }} />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Suporte</div>
              <div className="text-[#64748B] text-xs mt-0.5">Fale conosco por e-mail</div>
            </div>
          </a>
        </div>

        {/* ── AVISO SEGURANÇA ── */}
        <div className="rounded-xl p-4 mb-8 flex items-start gap-3"
          style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.12)' }}>
          <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: '#D4AF37' }} />
          <p className="text-[#64748B] text-xs">
            Ao cancelar o plano, seu acesso será bloqueado imediatamente. Para reativar, acesse o link de compra e assine novamente.
          </p>
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
              <Heart size={36} className="mx-auto mb-3 opacity-20" />
              <p className="text-[#64748B] text-sm">Você ainda não adicionou favoritos.</p>
              <p className="text-[#4a5568] text-xs mt-1">Passe o mouse nos vídeos e clique no ❤️ para salvar aqui.</p>
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
                    className="group relative rounded-xl overflow-hidden block transition-transform hover:scale-[1.04]"
                    style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="aspect-video relative"
                      style={{ backgroundImage: `url(${thumb})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
                          <Play fill="#090B10" size={14} className="ml-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-xs font-bold truncate">{v.titulo}</p>
                        <p className="text-[0.6rem] font-bold uppercase" style={{ color: '#D4AF37' }}>{v.categoria}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Logout */}
        <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <form action={logout}>
            <button type="submit"
              className="flex items-center gap-2 text-sm text-[#4a5568] hover:text-red-400 transition-colors cursor-pointer">
              <LogOut size={14} /> Sair da conta
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
