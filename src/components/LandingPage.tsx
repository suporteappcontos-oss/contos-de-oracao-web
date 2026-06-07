'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Play, ChevronRight, ChevronLeft, Star, BookOpen, CheckCircle, Users, Eye, Shield, Smartphone } from 'lucide-react';
import { login } from '@/app/login/actions';
import PasswordField from '@/components/PasswordField';
import SubmitButton from '@/components/SubmitButton';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { CATEGORIAS_CONFIG } from '@/app/materiais/constants';
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
    texto: '"Finalmente uma plataforma segura que ajuda minha família a viver a fé de verdade. Recomendo!"',
    estrelas: 5,
  },
  {
    nome: 'Patrícia Soares',
    avatar: 'PS',
    texto: '"As histórias são encantadoras e meus filhos pedem para assistir todos os dias. Muito bom!"',
    estrelas: 4,
  },
  {
    nome: 'Ana Clara',
    avatar: 'AC',
    texto: '"Como catequista, o material pedagógico me salvou! Tudo pronto e lindamente feito."',
    estrelas: 5,
  },
  {
    nome: 'Mariana Silva',
    avatar: 'MS',
    texto: '"Excelente conteúdo. Os desenhos e atividades em PDF facilitam muito o ensino da fé em casa."',
    estrelas: 4,
  },
  {
    nome: 'Diácono Roberto',
    avatar: 'DR',
    texto: '"Uma ferramenta fantástica para a nova evangelização. Linguagem acessível e fidelidade doutrinária."',
    estrelas: 5,
  },
  {
    nome: 'Paula Mendes',
    avatar: 'PM',
    texto: '"Os jogos e cruzadinhas ajudam a fixar o conteúdo bíblico de forma super interativa."',
    estrelas: 4,
  },
  {
    nome: 'Thiago Ramos',
    avatar: 'TR',
    texto: '"O aplicativo é maravilhoso. Segurança total para deixar os filhos assistindo sozinhos."',
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
      {Array.from({ length: 5 }).map((_, i) => (
        <Star 
          key={i} 
          size={14} 
          fill={i < count ? PRIMARY : 'transparent'} 
          style={{ color: i < count ? PRIMARY : 'rgba(255,255,255,0.15)' }} 
        />
      ))}
    </div>
  );
}

// ── Grid Estático de Depoimentos Premium ─────────────────────────────────────────
function TestimonialsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {DEPOIMENTOS.map((d, i) => (
        <div
          key={i}
          className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:border-[#D4AF37]/30 flex flex-col justify-between"
          style={{ background: BG_CARD, border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0"
                style={{ background: PRIMARY, color: BG_ROOT }}
              >
                {d.avatar}
              </div>
              <div>
                <p className="text-white text-sm font-bold leading-none mb-1.5">{d.nome}</p>
                <Stars count={d.estrelas} />
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed italic">{d.texto}</p>
          </div>
        </div>
      ))}
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
  const [revistaDestaque, setRevistaDestaque] = useState<{ titulo: string; edicao: string | null; capa_url: string | null; link_pdf: string | null } | null>(null);

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

  // Busca a última revista publicada
  useEffect(() => {
    const fetchRevista = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from('revistas')
          .select('titulo, edicao, capa_url, link_pdf')
          .eq('ativo', true)
          .order('criado_em', { ascending: false })
          .limit(1)
          .single();
        if (data) setRevistaDestaque(data);
      } catch {}
    };
    fetchRevista();
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
        className="relative min-h-screen lg:h-screen flex items-center overflow-hidden pt-28 pb-16 lg:py-0"
        style={{ paddingTop: '0px' }}
      >
        {/* Imagem de fundo premium enquadrada com perfeição para se encaixar perfeitamente e cobrir toda a tela no desktop e celular */}
        <div
          className="absolute inset-0 z-0 transition-all duration-500 bg-[#090B10] bg-no-repeat bg-[position:62%_center] lg:bg-[position:50%_22%] bg-cover"
          style={{
            backgroundImage: "linear-gradient(rgba(9, 11, 16, 0.05), rgba(9, 11, 16, 0.1)), url('/background.jpg')",
          }}
        />
        {/* Gradiente azul de transição suave para fundir a imagem ao fundo preto absoluto (sem desfoque) */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 z-[1] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent 0%, rgba(30, 58, 138, 0.1) 40%, rgba(13, 22, 38, 0.4) 70%, rgba(9, 11, 16, 0.8) 90%, #090B10 100%)',
          }}
        />
        {/* Brilho dourado sutil */}
        <div
          className="absolute bottom-0 left-0 w-[60vw] h-[60vh] z-0 blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }}
        />

        <div className="relative z-10 w-full max-w-[1650px] mx-auto px-6 lg:px-20 pb-28 pt-12 flex flex-col lg:flex-row justify-between items-center gap-12 h-full">
          {/* Coluna esquerda (Fontes elegantes, compacta e alinhada à extrema esquerda) */}
          <div className="flex-1 text-center lg:text-left max-w-[550px] lg:-ml-8">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
              <span className="text-xs font-black uppercase tracking-widest" style={{ color: PRIMARY, textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                Biblioteca Católica
              </span>
              <span className="w-10 h-[1.5px]" style={{ background: PRIMARY }} />
            </div>

            <h1
              className="font-extrabold leading-tight mb-4 text-white"
              style={{
                fontSize: 'clamp(2rem, 3.8vw, 2.8rem)',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.9)',
                fontFamily: FONT,
              }}
            >
              Universo católico<br />
              para crianças,<br />
              <span style={{ color: PRIMARY }}>de forma divertida e<br />encantadora.</span>
            </h1>

            <p
              className="text-white/80 leading-relaxed mb-8 max-w-[440px] mx-auto lg:mx-0 font-medium"
              style={{
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.95), 0 1px 3px rgba(0, 0, 0, 0.9)',
                fontSize: '0.9rem',
              }}
            >
              Histórias, vídeos, jogos, atividades e muito mais para ensinar a fé católica de
              maneira moderna, segura e emocionante.
            </p>

            <div className="flex flex-wrap gap-3.5 justify-center lg:justify-start">
              <Link
                href="/planos"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs md:text-sm transition-all hover:brightness-110 hover:scale-[1.02] shadow-md shadow-[#D4AF37]/15"
                style={{ background: PRIMARY, color: BG_ROOT, textDecoration: 'none' }}
              >
                COMEÇAR AGORA <ChevronRight size={16} />
              </Link>
              <Link
                href="/planos"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs md:text-sm transition-all hover:bg-white/10 backdrop-blur-sm"
                style={{ border: '1px solid rgba(255,255,255,0.3)', color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.05)' }}
              >
                <Play size={16} fill="currentColor" /> EXPLORAR CONTEÚDOS
              </Link>
            </div>
          </div>

          {/* Card de benefícios (extrema direita, elegante e translúcido) */}
          <div
            className="w-full max-w-[400px] lg:max-w-none lg:w-[320px] shrink-0 rounded-2xl p-5 transition-all duration-300 lg:-mr-8"
            style={{
              background: 'rgba(15,22,42,0.85)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
            }}
          >
            <p className="text-white font-extrabold text-sm mb-4 flex items-center gap-1.5">
              <span style={{ color: PRIMARY }}>★</span> Conteúdo exclusivo para assinantes
            </p>
            <ul className="flex flex-col gap-3 mb-5">
              {[
                'Novos vídeos toda semana',
                'Materiais para catequistas',
                'Atividades para imprimir',
                'Jogos educativos',
                'Revista mensal digital',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-white/90 font-medium">
                  <CheckCircle size={14} style={{ color: PRIMARY, flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/planos"
              className="block w-full text-center py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all hover:brightness-110 active:scale-95"
              style={{ background: PRIMARY, color: BG_ROOT, textDecoration: 'none' }}
            >
              ASSINAR AGORA
            </Link>
          </div>
        </div>

      </section>

      {/* Cards de Métricas Premium posicionados exatamente no meio da divisória (overlap) de forma segura fora do overflow-hidden */}
      <div 
        className="relative z-30 -mt-10 sm:-mt-12 w-full max-w-[1300px] mx-auto px-6"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: <Users size={18} />, val: '+850 mil',   label: 'seguidores' },
            { icon: <Play size={18} fill="currentColor" />,   val: '+120 milhões', label: 'visualizações' },
            { icon: <Users size={18} />, val: '+200 mil',   label: 'famílias' },
            { icon: <Shield size={18} />, val: 'Ambiente 100%', label: 'seguro para crianças' },
          ].map((m, i) => (
            <div 
              key={i} 
              className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.03] hover:border-[#D4AF37]/45"
              style={{ 
                background: 'rgba(15, 18, 29, 0.92)', 
                borderColor: 'rgba(212, 175, 55, 0.22)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div 
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(212, 175, 55, 0.1)', color: PRIMARY }}
              >
                {m.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white font-extrabold text-sm sm:text-base tracking-tight leading-none">
                  {m.val}
                </span>
                <span className="text-white/60 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mt-1 truncate">
                  {m.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          VÍDEOS EM DESTAQUE (Carrossel dinâmico do catálogo do Supabase)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-6 lg:px-16 max-w-[1400px] mx-auto relative">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-white font-black text-xl md:text-2xl" style={{ fontFamily: FONT, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Vídeos em destaque
          </h2>
          <Link
            href="/planos"
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
          <div className="relative overflow-hidden w-full py-2">
            {/* Efeitos de fade nas laterais para transição premium */}
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#090B10] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#090B10] to-transparent z-10 pointer-events-none" />

            <div className="animate-marquee flex gap-5">
              {(videos.length < 6 ? [...videos, ...videos, ...videos, ...videos] : [...videos, ...videos]).map((video, idx) => {
                const imageUrl = video.thumbnail_url || 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80';
                return (
                  <Link
                    key={`${video.id}-${idx}`}
                    href="/planos"
                    className="shrink-0 block w-[240px] sm:w-[270px] md:w-[300px] group transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1"
                    style={{ textDecoration: 'none' }}
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-3 shadow-lg"
                      style={{ background: '#15243E', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <img
                        src={imageUrl}
                        alt={video.titulo}
                        className="w-full h-full object-cover"
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
      <section className="py-12 px-6 lg:px-16 max-w-[1400px] mx-auto relative">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-white font-black text-xl md:text-2xl" style={{ fontFamily: FONT, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            Materiais pedagógicos em PDF
          </h2>
          <Link
            href="/materiais"
            className="flex items-center gap-1 text-xs sm:text-sm font-black transition-all hover:brightness-125 hover:scale-[1.02]"
            style={{ color: PRIMARY, textDecoration: 'none' }}
          >
            VER TODOS <ChevronRight size={16} />
          </Link>
        </div>

        <div className="relative overflow-hidden w-full py-2">
          {/* Efeitos de fade nas laterais para transição premium */}
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#090B10] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#090B10] to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee-reverse flex gap-5">
            {[...CATEGORIAS_CONFIG, ...CATEGORIAS_CONFIG, ...CATEGORIAS_CONFIG, ...CATEGORIAS_CONFIG].map((cat, idx) => {
              const CatIcon = cat.icon;
              return (
                <Link
                  key={`${cat.value}-${idx}`}
                  href="/materiais"
                  className={`shrink-0 block w-[240px] sm:w-[270px] md:w-[300px] group transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1 rounded-[24px] border overflow-hidden ${cat.border}`}
                  style={{ backgroundColor: 'rgba(15, 20, 30, 0.6)', backdropFilter: 'blur(10px)', textDecoration: 'none' }}
                >
                  {/* Glow interno no hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-40"
                    style={{ boxShadow: `0 0 30px ${cat.glow} inset` }} />

                  {/* Imagem superior do card */}
                  <div className="relative aspect-video overflow-hidden flex items-end justify-center">
                    <Image 
                      src={cat.image} 
                      alt={cat.labelFlat} 
                      fill 
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,20,30,0.95)] via-transparent to-transparent z-10" />
                    <div className="absolute bottom-0 w-full h-[50px] bg-gradient-to-t from-[#090B10] to-transparent z-20" />
                  </div>

                  {/* Título e Ícone na mesma linha */}
                  <div className="p-5 flex items-center gap-3 relative z-30 -mt-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shrink-0"
                      style={{ background: `${cat.color}20`, border: `1px solid ${cat.color}40` }}>
                      <CatIcon size={16} style={{ color: cat.color }} />
                    </div>
                    
                    <h3 className="text-transparent bg-clip-text font-black text-sm tracking-tight truncate flex-1"
                      style={{ backgroundImage: `linear-gradient(135deg, #fff, ${cat.color})` }}>
                      {cat.labelFlat}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
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
              href="/planos"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-black text-sm transition-all hover:brightness-110"
              style={{ background: PRIMARY, color: BG_ROOT, textDecoration: 'none' }}
            >
              <BookOpen size={16} /> LER REVISTA
            </Link>
          </div>

          {/* Col centro — capa */}
          <div
            className="w-40 h-52 rounded-xl shrink-0 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #8B7322)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {revistaDestaque?.capa_url ? (
              <img
                src={revistaDestaque.capa_url}
                alt={revistaDestaque.titulo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-center px-4">
                <div>
                  <div className="text-5xl mb-2">📖</div>
                  <p className="text-black font-black text-sm leading-tight">Contos de Oração</p>
                  <p className="text-black/70 text-[10px] font-bold mt-1">Edição de Maio</p>
                </div>
              </div>
            )}
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
              href: '/planos',
            },
            {
              emoji: '👨‍👩‍👧',
              title: 'Conteúdo para Famílias',
              desc: 'Recursos para viver a fé em casa com as crianças.',
              href: '/planos',
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
          MODAL DE LOGIN
      ══════════════════════════════════════════════════════════════════════ */}
      {showLogin && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowLogin(false)}
        >
          <div className="w-full max-w-[430px]" onClick={e => e.stopPropagation()}>
            <div
              className="rounded-3xl shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative overflow-y-auto max-h-[90vh]"
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
