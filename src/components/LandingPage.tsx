'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Play, ChevronRight, ChevronLeft, Star, BookOpen, CheckCircle, Users, Eye, Shield, Smartphone } from 'lucide-react';
import { login } from '@/app/login/actions';
import PasswordField from '@/components/PasswordField';
import SubmitButton from '@/components/SubmitButton';
import dynamic from 'next/dynamic';
import { createClient } from '@/utils/supabase/client';
const QRLogin = dynamic(() => import('@/components/QRLogin'), { ssr: false });

// ── Design tokens ─────────────────────────────────────────────────────────────
const PRIMARY = '#D4AF37';
const BG_ROOT  = '#090B10';
const BG_CARD  = 'rgba(255,255,255,0.04)';
const FONT     = "'Outfit', sans-serif";

// ── Dados estáticos ───────────────────────────────────────────────────────────
const CATEGORIAS = [
  { id: 'videos',      label: 'Vídeos Exclusivos',          cor: '#1E3A5F', emoji: '🎬', href: '/watch' },
  { id: 'materiais',   label: 'Ferramentas Pedagógicas',    cor: '#1A3A2A', emoji: '📚', href: '/materiais' },
  { id: 'hq',          label: 'HQs e Ebooks',              cor: '#3A1A4F', emoji: '📖', href: '/hq' },
  { id: 'jogos',       label: 'Jogos Digitais',             cor: '#1F2A4A', emoji: '🎮', href: '/materiais' },
  { id: 'revista',     label: 'Revista Mensal',             cor: '#3A2A1A', emoji: '📰', href: '/materiais' },
  { id: 'aplicativos', label: 'Aplicativos Religiosos',     cor: '#1A3A3A', emoji: '📱', href: '/planos' },
  { id: 'catequese',   label: 'Ensinamentos e Catequese',   cor: '#2A3A1A', emoji: '✝️', href: '/material-catequese' },
  { id: 'oracoes',     label: 'Orações',                   cor: '#3A1A1A', emoji: '🙏', href: '/watch' },
  { id: 'praticas',    label: 'Práticas Religiosas',        cor: '#1A2A3A', emoji: '⛪', href: '/materiais' },
];

const DEPOIMENTOS = [
  {
    nome: 'Juliana Martins',
    avatar: 'JM',
    texto: '"Meus filhos aprendem se divertindo! O conteúdo é lindo, educativo e totalmente católico."',
    estrelas: 5,
  },
  {
    nome: 'Carlos Eduardo',
    avatar: 'CE',
    texto: '"Finalmente uma plataforma segura que já ajudei minha família a assinar a fé de verdade. Recomendo!"',
    estrelas: 5,
  },
  {
    nome: 'Patrícia Soares',
    avatar: 'PS',
    texto: '"As histórias são encantadoras e meus filhos pedem para assistir todos os dias."',
    estrelas: 5,
  },
  {
    nome: 'Ana Clara',
    avatar: 'AC',
    texto: '"Como catequista, o material pedagógico me salvou! Tudo pronto e lindamente feito."',
    estrelas: 5,
  },
];

const MATERIAIS_PEDAGOGICOS = [
  { icon: '📄', label: 'Atividades para imprimir',    count: '+90 materiais' },
  { icon: '🎲', label: 'Jogos educativos',            count: '+80 jogos' },
  { icon: '📋', label: 'Planos de aula catequéticos', count: '+30 planos' },
  { icon: '🎨', label: 'Colorir e pintar',            count: '+60 desenhos' },
  { icon: '🔤', label: 'Caça-palavras e cruzadinhas', count: '+40 atividades' },
  { icon: '💡', label: 'Dinâmicas e projetos',        count: '+30 dinâmicas' },
];

// ── Componente de Estrelas ────────────────────────────────────────────────────
function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} fill={PRIMARY} style={{ color: PRIMARY }} />
      ))}
    </div>
  );
}

// ── Carrossel de Depoimentos ──────────────────────────────────────────────────
function TestimonialsCarousel() {
  const [idx, setIdx] = useState(0);
  const prev = () => setIdx(i => (i - 1 + DEPOIMENTOS.length) % DEPOIMENTOS.length);
  const next = () => setIdx(i => (i + 1) % DEPOIMENTOS.length);

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {DEPOIMENTOS.map((d, i) => (
            <div key={i} className="w-full shrink-0 px-2">
              <div
                className="rounded-2xl p-6 h-full"
                style={{ background: BG_CARD, border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black"
                    style={{ background: PRIMARY, color: BG_ROOT }}
                  >
                    {d.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">{d.nome}</p>
                    <Stars count={d.estrelas} />
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed">{d.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={prev}
        className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${PRIMARY}44` }}
      >
        <ChevronLeft size={16} style={{ color: PRIMARY }} />
      </button>
      <button
        onClick={next}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(212,175,55,0.15)', border: `1px solid ${PRIMARY}44` }}
      >
        <ChevronRight size={16} style={{ color: PRIMARY }} />
      </button>
    </div>
  );
}

// ── Seção Title ───────────────────────────────────────────────────────────────
function SectionTitle({ title, href, label = 'VER TODOS' }: { title: string; href?: string; label?: string }) {
  return (
    <div className="flex items-center justify-between mb-6 px-0">
      <h2 className="text-white font-black text-lg md:text-xl" style={{ fontFamily: FONT }}>{title}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-xs font-bold transition-all hover:brightness-125"
          style={{ color: PRIMARY, textDecoration: 'none' }}
        >
          {label} <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

// ── Componente Principal ──────────────────────────────────────────────────────
export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);
  const [tab, setTab]           = useState<'login' | 'qr'>('login');
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('videos')
          .select('*')
          .eq('ativo', true)
          .order('criado_em', { ascending: false });
        if (error) throw error;
        setVideos(data || []);
      } catch (err) {
        console.error("Erro ao carregar vídeos do catálogo:", err);
      } finally {
        setLoadingVideos(false);
      }
    };
    fetchVideos();
  }, []);

  // Abre modal de login via evento global (disparado pela Navbar)
  useEffect(() => {
    const handler = () => setShowLogin(true);
    window.addEventListener('open-login', handler);
    return () => window.removeEventListener('open-login', handler);
  }, []);

  // Fecha com ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowLogin(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{ fontFamily: FONT, background: BG_ROOT, color: '#fff', overflowX: 'hidden' }}>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="home"
        className="relative h-screen min-h-[600px] flex items-center overflow-hidden"
        style={{ paddingTop: '0px' }}
      >
        {/* Imagem de fundo premium com apenas 15% de escurecimento */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-no-repeat transition-all duration-500"
          style={{
            backgroundImage: "linear-gradient(rgba(9, 11, 16, 0.15), rgba(9, 11, 16, 0.15)), url('/background.jpg')",
            backgroundPosition: 'center bottom',
          }}
        />
        {/* Gradiente azul e desfocado premium para transição suave com o fundo preto absoluto */}
        <div
          className="absolute bottom-0 left-0 right-0 h-60 z-[1] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(13, 22, 38, 0.45) 30%, rgba(9, 11, 16, 0.88) 70%, #090B10 100%)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        />
        {/* Brilho dourado sutil */}
        <div
          className="absolute bottom-0 left-0 w-[60vw] h-[60vh] z-0 blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }}
        />

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 lg:px-24 py-12 flex flex-col lg:flex-row justify-between items-center gap-12">
          {/* Coluna esquerda */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div
              className="inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-3"
              style={{ background: 'rgba(212,175,55,0.2)', color: PRIMARY, border: `1px solid ${PRIMARY}55`, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}
            >
              Catequese Digital
            </div>

            <h1
              className="font-black leading-tight mb-3 text-white"
              style={{
                fontSize: 'clamp(1.1rem, 2.25vw, 1.9rem)',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.9)',
              }}
            >
              Universo católico para crianças,{' '}
              <span style={{ color: PRIMARY }}>de forma divertida e encantadora.</span>
            </h1>

            <p
              className="text-white/90 leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0 font-semibold"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.9)',
                fontSize: '0.8rem',
              }}
            >
              Histórias, vídeos, jogos, atividades e muito mais para ensinar a fé católica de
              maneira moderna, segura e emocionante.
            </p>

            <div className="flex flex-wrap gap-2.5 justify-center lg:justify-start">
              <Link
                href="/planos"
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl font-black text-xs transition-all hover:brightness-110 hover:scale-[1.03] shadow-md shadow-[#D4AF37]/15"
                style={{ background: PRIMARY, color: BG_ROOT, textDecoration: 'none' }}
              >
                Começar Agora <ChevronRight size={12} />
              </Link>
              <Link
                href="/watch"
                className="flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl font-bold text-xs transition-all hover:bg-white/10 backdrop-blur-md"
                style={{ border: '1px solid rgba(255,255,255,0.4)', color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.05)' }}
              >
                <Play size={12} /> Explorar Conteúdos
              </Link>
            </div>

            {/* Métricas */}
            <div className="flex flex-wrap gap-3.5 mt-8 justify-center lg:justify-start">
              {[
                { icon: <Users size={12} />, val: '+850 mil',   label: 'seguidores' },
                { icon: <Eye size={12} />,   val: '+120 mi',    label: 'visualizações' },
                { icon: <Users size={12} />, val: '+200 mil',   label: 'famílias' },
                { icon: <Shield size={12} />, val: '100%',      label: 'seguro p/ crianças' },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/5 shadow-md">
                  <span style={{ color: PRIMARY }}>{m.icon}</span>
                  <span>
                    <span className="text-white font-black text-[11px]" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{m.val}</span>
                    <span className="text-white/70 text-[9px] ml-1 font-bold">{m.label}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card de benefícios (direita) */}
          <div
            className="w-full lg:w-[340px] shrink-0 rounded-2xl p-6 transition-all duration-300"
            style={{
              background: 'rgba(15,22,42,0.92)',
              border: `1px solid ${PRIMARY}44`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 10px 40px rgba(0,0,0,0.6), 0 0 60px ${PRIMARY}15`,
            }}
          >
            <p className="text-white font-black text-base mb-4 flex items-center gap-1.5">
              🌟 Conteúdo exclusivo para assinantes
            </p>
            <ul className="flex flex-col gap-3 mb-6">
              {[
                'Novos vídeos toda semana',
                'Materiais para catequistas',
                'Atividades para imprimir',
                'Jogos educativos',
                'Revista mensal digital',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/90 font-medium">
                  <CheckCircle size={15} style={{ color: PRIMARY, flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/planos"
              className="block w-full text-center py-3 rounded-xl font-black text-sm transition-all hover:brightness-110 active:scale-95 shadow-md shadow-[#D4AF37]/10"
              style={{ background: PRIMARY, color: BG_ROOT, textDecoration: 'none' }}
            >
              ASSINAR AGORA
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          VÍDEOS EM DESTAQUE (Carrossel dinâmico do catálogo do Supabase)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-6 lg:px-16 max-w-[1400px] mx-auto relative">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-white font-black text-xl md:text-2xl" style={{ fontFamily: FONT, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Vídeos em destaque
          </h2>
          <Link
            href="/watch"
            className="flex items-center gap-1 text-xs sm:text-sm font-black transition-all hover:brightness-125 hover:scale-[1.02]"
            style={{ color: PRIMARY, textDecoration: 'none' }}
          >
            VER CATÁLOGO COMPLETO <ChevronRight size={16} />
          </Link>
        </div>

        {loadingVideos ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2" style={{ borderColor: PRIMARY }}></div>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-white/60 text-sm">Nenhum vídeo disponível no catálogo no momento.</p>
          </div>
        ) : (
          <div className="relative group/carousel">
            {/* Botão Esquerda */}
            <button
              onClick={() => {
                const el = document.getElementById('featured-videos-scroll');
                if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
              }}
              className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full z-20 flex items-center justify-center transition-all bg-[#090B10]/80 border border-white/10 opacity-0 group-hover/carousel:opacity-100 shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronLeft size={20} style={{ color: PRIMARY }} />
            </button>

            {/* Container do Scroll */}
            <div
              id="featured-videos-scroll"
              className="flex gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {videos.map((video) => {
                const imageUrl = video.thumbnail_url || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80';
                return (
                  <Link
                    key={video.id}
                    href={`/watch/${video.id}`}
                    className="shrink-0 snap-start block w-[240px] sm:w-[270px] md:w-[300px] group transition-transform duration-300 hover:scale-[1.03]"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 shadow-lg"
                      style={{ background: '#15243E', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <img
                        src={imageUrl}
                        alt={video.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Overlay gradiente premium */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
                      
                      {/* Botão de play central visível no hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                          <Play fill="#090B10" className="w-5 h-5 text-[#090B10] ml-0.5" />
                        </div>
                      </div>
                    </div>
                    {/* Título do vídeo (sem a duração) */}
                    <h3 className="text-white text-sm font-extrabold line-clamp-2 leading-snug group-hover:text-[#D4AF37] transition-colors px-1"
                      style={{ fontFamily: FONT }}>
                      {video.titulo}
                    </h3>
                  </Link>
                );
              })}
            </div>

            {/* Botão Direita */}
            <button
              onClick={() => {
                const el = document.getElementById('featured-videos-scroll');
                if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
              }}
              className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full z-20 flex items-center justify-center transition-all bg-[#090B10]/80 border border-white/10 opacity-0 group-hover/carousel:opacity-100 shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
            >
              <ChevronRight size={20} style={{ color: PRIMARY }} />
            </button>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          MATERIAIS PEDAGÓGICOS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-6 lg:px-10 max-w-6xl mx-auto">
        <SectionTitle title="Materiais pedagógicos em PDF" href="/materiais" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {MATERIAIS_PEDAGOGICOS.map((m, i) => (
            <Link
              key={i}
              href="/materiais"
              className="flex flex-col items-center gap-2 p-4 rounded-2xl transition-all hover:scale-105 hover:bg-white/10"
              style={{ background: BG_CARD, border: '1px solid rgba(255,255,255,0.07)', textDecoration: 'none' }}
            >
              <span className="text-3xl">{m.icon}</span>
              <span className="text-white text-xs font-bold text-center leading-tight">{m.label}</span>
              <span className="text-xs font-bold" style={{ color: PRIMARY }}>{m.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          BANNER REVISTA DO MÊS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-8 px-6 lg:px-10 max-w-6xl mx-auto">
        <div
          className="rounded-3xl overflow-hidden p-6 md:p-10 flex flex-col md:flex-row gap-8 items-center"
          style={{
            background: 'linear-gradient(135deg, #0D1625 0%, #1a2a40 50%, #0D1625 100%)',
            border: `1px solid ${PRIMARY}33`,
          }}
        >
          {/* Col esquerda */}
          <div className="flex-1">
            <div
              className="inline-block text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-3"
              style={{ background: `${PRIMARY}22`, color: PRIMARY }}
            >
              📰 Revista do mês
            </div>
            <h3 className="text-white font-black text-xl md:text-2xl mb-2">Contos de Oração</h3>
            <p className="text-white/60 text-sm leading-relaxed mb-5">
              Histórias, passatempos, formação e muito mais para toda a família!
            </p>
            <Link
              href="/materiais"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm transition-all hover:brightness-110"
              style={{ background: PRIMARY, color: BG_ROOT, textDecoration: 'none' }}
            >
              <BookOpen size={16} /> LER REVISTA
            </Link>
          </div>

          {/* Col centro — capa */}
          <div
            className="w-40 h-52 rounded-xl shrink-0 flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #8B7322)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            <div className="text-center px-4">
              <div className="text-5xl mb-2">📖</div>
              <p className="text-black font-black text-sm leading-tight">Contos de Oração</p>
              <p className="text-black/70 text-[10px] font-bold mt-1">Edição de Maio</p>
            </div>
            <div
              className="absolute top-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}
            >
              NOVO
            </div>
          </div>

          {/* Col direita — lista */}
          <div className="flex-1">
            <ul className="flex flex-col gap-2.5">
              {[
                '📖 História em quadrinhos',
                '✝️ Formação Católica',
                '🎯 Passatempos',
                '🙏 Orações e devoções',
                '❓ Curiosidades da fé',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-white/70 text-sm">{item}</li>
              ))}
            </ul>
            <div
              className="mt-4 inline-block text-xs font-black px-3 py-1.5 rounded-full"
              style={{ background: PRIMARY, color: BG_ROOT }}
            >
              Nova edição todo mês!
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PARA CATEQUISTAS E FAMÍLIAS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-6 lg:px-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              emoji: '🎓',
              title: 'Formação para Catequistas',
              desc: 'Cursos, ferramentas e materiais exclusivos para sua missão.',
              href: '/material-catequese',
            },
            {
              emoji: '👨‍👩‍👧',
              title: 'Conteúdo para Famílias',
              desc: 'Recursos para viver a fé em casa com as crianças.',
              href: '/watch',
            },
            {
              emoji: '🔒',
              title: 'Ambiente Seguro',
              desc: 'Todo conteúdo é revisado por especialistas e 100% seguro para crianças.',
              href: '/planos',
            },
          ].map((c, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 flex flex-col gap-4 transition-all hover:scale-[1.02]"
              style={{ background: BG_CARD, border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: 'rgba(212,175,55,0.1)', border: `1px solid ${PRIMARY}33` }}
              >
                {c.emoji}
              </div>
              <div>
                <h3 className="text-white font-black text-base mb-1">{c.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{c.desc}</p>
              </div>
              <Link
                href={c.href}
                className="flex items-center gap-1 text-xs font-black transition-all hover:brightness-125 mt-auto"
                style={{ color: PRIMARY, textDecoration: 'none' }}
              >
                SAIBA MAIS <ChevronRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          DEPOIMENTOS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-6 lg:px-10 max-w-6xl mx-auto">
        <SectionTitle title="O que dizem as famílias" />
        <div className="px-4">
          <TestimonialsCarousel />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CTA FINAL
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-8 px-6 lg:px-10 max-w-6xl mx-auto pb-20">
        <div
          className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0D1B2A 0%, #1a2640 50%, #0D1B2A 100%)',
            border: `1px solid ${PRIMARY}44`,
            boxShadow: `0 0 80px ${PRIMARY}18`,
          }}
        >
          {/* Brilho de fundo */}
          <div
            className="absolute right-0 bottom-0 w-64 h-64 blur-[80px] opacity-20 pointer-events-none"
            style={{ background: PRIMARY }}
          />

          {/* Texto */}
          <div className="flex-1 relative z-10">
            <h2
              className="text-white font-black text-2xl md:text-3xl leading-tight mb-6"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)' }}
            >
              Comece hoje a transformar a catequese em uma{' '}
              <span style={{ color: PRIMARY }}>experiência inesquecível!</span>
            </h2>
            <ul className="flex flex-col gap-2.5 mb-6">
              {[
                '7 dias grátis para experimentar',
                'Cancelamento fácil',
                'Conteúdo exclusivo',
                'Suporte dedicado',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-white/70 text-sm">
                  <CheckCircle size={15} style={{ color: PRIMARY, flexShrink: 0 }} /> {item}
                </li>
              ))}
            </ul>
            <Link
              href="/planos"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-black text-base transition-all hover:brightness-110 hover:scale-[1.02]"
              style={{ background: PRIMARY, color: BG_ROOT, textDecoration: 'none' }}
            >
              ASSINAR AGORA <ChevronRight size={18} />
            </Link>
          </div>

          {/* Download dos apps */}
          <div className="relative z-10 flex flex-col gap-3 shrink-0 items-center md:items-end">
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-1">Baixe nosso app</p>
            <a
              href="https://play.google.com/store/apps/details?id=com.ldpstudios.contosdeoracao"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', textDecoration: 'none' }}
            >
              <Smartphone size={18} style={{ color: PRIMARY }} />
              Google Play
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-5 py-3 rounded-xl font-bold text-sm transition-all hover:scale-105"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', textDecoration: 'none' }}
            >
              <Smartphone size={18} style={{ color: PRIMARY }} />
              App Store (em breve)
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL DE LOGIN
      ══════════════════════════════════════════════════════════════════════ */}
      {showLogin && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowLogin(false)}
        >
          <div className="w-full max-w-[430px]" onClick={e => e.stopPropagation()}>
            <div
              className="rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-hidden"
              style={{ background: 'rgba(15,22,42,0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(24px)', fontFamily: FONT }}
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <button onClick={() => setShowLogin(false)}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
              </button>

              <div className="flex border-b mx-6 mt-6 mb-0" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <button onClick={() => setTab('login')} className="flex-1 pb-3 text-sm font-bold transition-all"
                  style={{ color: tab === 'login' ? '#fff' : 'rgba(255,255,255,0.4)', borderBottom: tab === 'login' ? `2px solid ${PRIMARY}` : '2px solid transparent' }}>
                  🔑 Senha
                </button>
                <button onClick={() => setTab('qr')} className="flex-1 pb-3 text-sm font-bold transition-all"
                  style={{ color: tab === 'qr' ? '#fff' : 'rgba(255,255,255,0.4)', borderBottom: tab === 'qr' ? `2px solid ${PRIMARY}` : '2px solid transparent' }}>
                  📱 Celular / TV
                </button>
              </div>

              {tab === 'login' && (
                <div className="p-6 md:p-8">
                  <h2 className="text-white text-2xl font-black mb-1">Acessar</h2>
                  <p className="text-white/70 text-xs mb-5 font-bold">Entre para continuar assistindo.</p>
                  <form className="flex flex-col gap-4">
                    <input type="email" name="email" placeholder="E-mail de acesso" required
                      className="w-full px-5 py-4 rounded-xl text-white outline-none transition-all text-sm focus:bg-white/10"
                      style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(10px)' }}
                    />
                    <PasswordField name="password" label="" placeholder="Sua Senha" />
                    <SubmitButton formAction={login}>
                      <span className="font-extrabold tracking-wide text-sm md:text-base">Entrar na Plataforma</span>
                    </SubmitButton>
                    <Link href="/esqueci-senha" className="text-center text-white/50 text-sm hover:text-[#D4AF37] transition-colors no-underline font-bold mt-1">
                      Esqueci minha senha
                    </Link>
                  </form>
                </div>
              )}
              {tab === 'qr' && (
                <div className="p-2 md:p-4"><QRLogin /></div>
              )}

              <div className="w-full h-[1px] bg-white/10" />
              <div className="p-4 md:p-5">
                <Link href="/planos"
                  className="flex items-center justify-center w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] no-underline text-center"
                  style={{ background: 'transparent', color: PRIMARY, border: `1px solid ${PRIMARY}66` }}>
                  Criar Conta e Assinar
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
