import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart, LogOut, Key, ChevronLeft, Calendar,
  Crown, XCircle, CheckCircle2, Play, Mail,
  AlertTriangle, MessageCircle
} from 'lucide-react'
import ClientEditableName from './ClientEditableName'
import GerenciarStripeBtn from '@/components/GerenciarStripeBtn'
import Pricing from '@/components/Pricing'

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

  // Busca favoritos — protegido com try/catch caso a tabela ainda não exista
  let favoritos: unknown[] = []
  try {
    const { data } = await supabase
      .from('favoritos')
      .select('id, video_id, videos(id, titulo, categoria, thumbnail_url, duracao)')
      .eq('user_id', user!.id)
      .order('criado_em', { ascending: false })
    favoritos = data ?? []
  } catch {
    favoritos = []
  }



  async function logout() {
    'use server'
    const sb = await createClient()
    await sb.auth.signOut()
    redirect('/')
  }

  const email = user.email || ''
  const nome = user.user_metadata?.nome || ''
  const displayName = nome || email.split('@')[0]
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=111827&color=D4AF37&bold=true&size=128`

  const dataCriacao = user.created_at
    ? new Date(user.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  // Etiqueta dinâmica vinda do metadata da Stripe (salva pelo webhook)
  const planoLabel = isAdmin ? 'Administrador' : (user.user_metadata?.etiqueta_plano || perfil?.plano || 'Assinante')

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
        <div className="relative rounded-[2.5rem] overflow-hidden mb-8 p-8 md:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)' }}>

          {/* Fundo decorativo (Glow) */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#D4AF37]/15 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#15243E]/50 blur-[100px] rounded-full pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8 z-10 text-center md:text-left">
            {/* Avatar */}
            <div className="relative shrink-0 group">
              <div className="absolute inset-0 bg-[#D4AF37] blur-md opacity-20 group-hover:opacity-40 transition-opacity rounded-[2rem]" />
              <div className="relative w-28 h-28 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl bg-[#090B10]">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
              </div>
              {/* Badge de status */}
              <div className={`absolute -bottom-2 -right-2 w-7 h-7 rounded-xl border-4 border-[#090B10] flex items-center justify-center ${planoAtivo ? 'bg-emerald-500' : 'bg-red-500'}`}>
                {planoAtivo ? <CheckCircle2 size={12} className="text-[#090B10]" /> : <XCircle size={12} className="text-[#090B10]" />}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col items-center md:items-start">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <ClientEditableName initialName={nome} defaultName={displayName} />
                <span className={`flex items-center gap-1.5 text-[0.65rem] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full ${
                  planoAtivo
                    ? 'text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : 'text-red-400 border border-red-500/30 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                }`}>
                  {planoAtivo ? 'Acesso Ativo' : 'Acesso Expirado'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-[#94A3B8] text-sm mb-5 font-light">
                <Mail size={14} className="text-white/30" /> {email}
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-[#94A3B8]">
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <Calendar size={12} className="text-white/40" /> 
                  Membro desde <span className="text-white font-medium">{dataCriacao}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#D4AF37]/5 px-3 py-1.5 rounded-lg border border-[#D4AF37]/10">
                  <Crown size={12} className="text-[#D4AF37]" /> 
                  <span className="text-[#D4AF37] font-bold">{planoLabel}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <Heart size={12} fill="#ef4444" className="text-red-500" /> 
                  <span className="text-white font-medium">{favoritos?.length ?? 0}</span> favoritos
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── GERENCIAMENTO BENTO GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          
          {/* Box 1: Status do Plano (Ocupa 2 colunas no desktop) */}
          <div className="lg:col-span-2 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group"
            style={{
              background: planoAtivo ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)' : 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.02) 100%)',
              border: `1px solid ${planoAtivo ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
            <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl transition-opacity opacity-0 group-hover:opacity-100 ${planoAtivo ? 'bg-emerald-500/10' : 'bg-red-500/10'}`} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${planoAtivo ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                   {planoAtivo ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                </div>
                <span className="font-black text-lg" style={{ color: planoAtivo ? '#34d399' : '#f87171' }}>
                  {planoAtivo ? 'Assinatura Ativa' : 'Assinatura Inativa'}
                </span>
              </div>
              <p className="text-[#94A3B8] text-sm mb-6 max-w-[80%] leading-relaxed font-light">
                {planoAtivo ? 'Você tem acesso ilimitado a todos os conteúdos exclusivos, novenas e retiros espirituais.' : 'Sua assinatura expirou e seu acesso foi suspenso. Renove agora para continuar assistindo.'}
              </p>
            </div>
            <div className="relative z-10">
              {planoAtivo && !isAdmin ? (
                <GerenciarStripeBtn />
              ) : !planoAtivo && (
                <Link href="/#planos" className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]" style={{ background: '#D4AF37', color: '#090B10' }}>
                  Renovar Assinatura <Crown size={16} />
                </Link>
              )}
            </div>
          </div>

          {/* Box 2: Alterar Senha */}
          <Link href="/esqueci-senha"
            className="rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-white/5 border border-white/10 text-white/70 group-hover:bg-white/10 group-hover:text-white transition-all">
                <Key size={22} />
              </div>
              <div className="text-white font-bold text-base mb-1">Segurança</div>
              <div className="text-[#64748B] text-xs leading-relaxed">Altere sua senha de acesso a qualquer momento.</div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-widest text-white/40 group-hover:text-white/80 transition-colors">
              Alterar Senha <ChevronLeft size={12} className="rotate-180" />
            </div>
          </Link>

          {/* Box 3: Suporte */}
          <a href="https://wa.me/5566997182760" target="_blank" rel="noopener noreferrer"
            className="rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-xl"
            style={{ background: 'linear-gradient(135deg, rgba(37,211,102,0.05) 0%, rgba(37,211,102,0) 100%)', border: '1px solid rgba(37,211,102,0.15)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div>
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-[#090B10] transition-all">
                <MessageCircle size={22} />
              </div>
              <div className="text-white font-bold text-base mb-1">Suporte</div>
              <div className="text-[#64748B] text-xs leading-relaxed">Fale conosco via WhatsApp para tirar dúvidas.</div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[0.7rem] font-bold uppercase tracking-widest text-[#25D366]/60 group-hover:text-[#25D366] transition-colors">
              Chamar no Zap <ChevronLeft size={12} className="rotate-180" />
            </div>
          </a>

        </div>

        {/* ── AVISO SEGURANÇA ── */}
        <div className="rounded-xl p-4 mb-8 flex items-start gap-3"
          style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.12)' }}>
          <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: '#D4AF37' }} />
          <p className="text-[#64748B] text-xs">
            Ao cancelar sua assinatura, <b>você continuará com acesso total até o final do período que já foi pago.</b> Após essa data, o plano não será renovado e o acesso será suspenso.
          </p>
        </div>

        {/* ── DETALHES DOS PLANOS ── */}
        <div className="mb-12 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
          <Pricing />
        </div>


        {/* ── MEUS FAVORITOS ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Heart size={16} style={{ color: '#D4AF37' }} fill="#D4AF37" />
            <h2 className="text-white font-bold text-lg">Meus Favoritos</h2>
            <span className="text-[#64748B] text-sm">({favoritos?.length ?? 0})</span>
          </div>

          {favoritos.length === 0 ? (
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
              className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all cursor-pointer shadow-lg shadow-red-500/5">
              <LogOut size={16} /> Sair da Conta
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}
