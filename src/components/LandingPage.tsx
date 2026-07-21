'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Play, ChevronRight, ChevronLeft, Star, BookOpen, CheckCircle, Users, Eye, Shield, Smartphone, Tv, Download, Printer, ShieldCheck } from 'lucide-react';
import { login } from '@/app/login/actions';
import PasswordField from '@/components/PasswordField';
import SubmitButton from '@/components/SubmitButton';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { CATEGORIAS_CONFIG } from '@/app/materiais/constants';
import CometTrailEffect from './CometTrailEffect';
import TouchMarquee from './TouchMarquee';
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
  const [revistaDestaque, setRevistaDestaque] = useState<{ titulo: string; edicao: string | null; capa_url: string | null; link_pdf?: string | null } | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: authListener } = supabase.auth.onAuthStateChange((_, sess) => setSession(sess));
    return () => authListener.subscription.unsubscribe();
  }, []);

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

        const validos = (data || []).filter(v => {
          if (v.categoria === 'Temporada' && v.episodio_numero === null) return false
          const t = (v.titulo || '').toLowerCase()
          return !t.includes('card da temporada') && !t.includes('capa da temporada')
        })
        setVideos(validos);
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
          .select('titulo, edicao, capa_url')
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
    <div style={{ position: 'relative', fontFamily: FONT, background: 'transparent', color: '#fff', overflowX: 'hidden' }}>
      <CometTrailEffect />

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="home"
        className="relative min-h-[100dvh] lg:h-[100dvh] flex items-center justify-center overflow-hidden pt-28 pb-16 lg:py-0"
        style={{ paddingTop: '0px' }}
      >
        <style>{`
          @keyframes animado-bounce {
            0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
            25% { transform: translateY(-4px) rotate(-3deg) scale(1.02); }
            50% { transform: translateY(0) rotate(0deg) scale(1.05); }
            75% { transform: translateY(-4px) rotate(3deg) scale(1.02); }
          }
          .animado-text {
            display: inline-block;
            animation: animado-bounce 2.5s infinite ease-in-out;
            color: #D4AF37; /* Dourado */
            text-shadow: 0 0 15px rgba(212, 175, 55, 0.6);
          }
        `}</style>

        {/* Brilho dourado sutil */}
        <div
          className="absolute bottom-0 left-0 w-[60vw] h-[60vh] z-0 blur-[120px] opacity-20"
          style={{ background: 'radial-gradient(circle, #D4AF37, transparent)' }}
        />

        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 lg:px-20 pb-28 pt-20 flex flex-col justify-center items-center h-full">
          <div className="w-full text-center max-w-[1200px] flex flex-col items-center">

            <h1
              className="font-extrabold leading-tight mb-4 text-white"
              style={{
                fontSize: 'clamp(1.8rem, 4.2vw, 3.5rem)',
                textShadow: '0 4px 15px rgba(0, 0, 0, 0.95), 0 2px 5px rgba(0, 0, 0, 0.9)',
                fontFamily: FONT,
              }}
            >
              <span className="block sm:whitespace-nowrap">O maior canal <span style={{ color: PRIMARY }}>CATÓLICO</span></span>
              <span className="block sm:whitespace-nowrap">em desenho <span className="animado-text">animado</span> do Brasil</span>
            </h1>

            <p
              className="text-white/90 leading-relaxed mb-3 w-full max-w-none font-medium"
              style={{
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.95)',
                fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)',
              }}
            >
              <span className="md:whitespace-nowrap">Assista, leia, aprenda e evangelize com filmes, revistas, aplicativos e materiais exclusivos.</span>
            </p>

            <p 
              className="text-white font-bold mb-10 text-center w-full max-w-none"
              style={{ textShadow: '0 2px 8px rgba(0,0,0,0.95)', fontSize: 'clamp(0.85rem, 1.2vw, 1rem)' }}
            >
              <span className="md:whitespace-nowrap">A partir de R$ 47,90. <span className="opacity-80 font-normal">Cancele quando quiser.</span></span>
            </p>

            <div className="flex flex-col items-center gap-5">
              <Link
                href="/planos"
                className="flex items-center justify-center gap-2 px-10 py-4 rounded-xl font-black text-sm md:text-base transition-all hover:brightness-110 hover:scale-[1.03] shadow-xl shadow-[#D4AF37]/20"
                style={{ background: PRIMARY, color: BG_ROOT, textDecoration: 'none', minWidth: '260px' }}
              >
                COMEÇAR AGORA <ChevronRight size={18} strokeWidth={3} />
              </Link>
              
              <Link
                href="/materiais"
                className="flex items-center gap-2 text-white/60 hover:text-white font-bold text-xs uppercase tracking-widest transition-all"
                style={{ textDecoration: 'none', textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}
              >
                EXPLORAR CONTEÚDOS
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* =========================================================================
          DIVISOR CURVO (Estilo Netflix) E FUNDO SÓLIDO PARA O RESTO DA PÁGINA
      ========================================================================= */}
      <div className="relative bg-[#090B10] z-20 pt-10 pb-4 mt-8 md:mt-16">
        <div className="absolute left-0 right-0 top-0 -translate-y-full w-full overflow-hidden leading-none pointer-events-none">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-[40px] md:h-[80px] block drop-shadow-[0_-15px_15px_rgba(212,175,55,0.15)]">
            <path d="M0,100 Q50,0 100,100 Z" fill="#090B10" />
            <path d="M0,100 Q50,0 100,100" fill="none" stroke="#D4AF37" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

      {/* ══════════════════════════════════════════════════════════════════════
          VÍDEOS EM DESTAQUE (Carrossel dinâmico do catálogo do Supabase)
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 w-full relative">
        <div className="flex items-center justify-between mb-8 px-6 lg:px-16">
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
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10 mx-6 lg:mx-16">
            <p className="text-white/60 text-sm">Nenhum vídeo disponível no catálogo no momento.</p>
          </div>
        ) : (
          <div className="relative overflow-hidden w-full py-2">
            {/* Efeitos de fade nas laterais para transição premium */}
            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-[#090B10] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-[#090B10] to-transparent z-10 pointer-events-none" />

            <TouchMarquee speed={0.8}>
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
                      {video.titulo
                        .replace(/\s*\([^)]*card da temporada[^)]*\)/gi, '')
                        .replace(/\s*\([^)]*capa da temporada[^)]*\)/gi, '')
                        .replace(/\s*card da temporada/gi, '')
                        .replace(/\s*capa da temporada/gi, '')
                        .trim()}
                    </h3>
                  </Link>
                );
              })}
            </TouchMarquee>
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          MATERIAIS PEDAGÓGICOS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 w-full relative">
        <div className="flex items-center justify-between mb-8 px-6 lg:px-16">
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

          <TouchMarquee speed={0.8} reverse={true}>
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
          </TouchMarquee>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          BANNER REVISTA DO MÊS
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-12 px-6 lg:px-10 max-w-6xl mx-auto">
        <div
          className="relative rounded-3xl overflow-hidden p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center border transition-all duration-500 hover:shadow-2xl group"
          style={{
            background: 'linear-gradient(145deg, #1A1025 0%, #0A0514 100%)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(212, 175, 55, 0.2)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          {/* Efeito de brilho de fundo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
             <div className="absolute top-[-50%] left-[-20%] w-[100%] h-[150%] opacity-20 transition-opacity duration-500 group-hover:opacity-40" style={{ background: `radial-gradient(ellipse at center, ${PRIMARY}40 0%, transparent 60%)` }} />
          </div>

          {/* Col esquerda */}
          <div className="flex-1 relative z-10">
            <div
              className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 shadow-lg border"
              style={{ background: 'rgba(212,175,55,0.1)', color: PRIMARY, borderColor: 'rgba(212,175,55,0.3)' }}
            >
              📰 Revista do mês
            </div>
            <h3 className="text-white font-black text-2xl md:text-3xl mb-3 leading-tight" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>Contos de Oração</h3>
            <p className="text-white/70 text-sm md:text-base leading-relaxed mb-6 font-medium">
              Histórias, passatempos, formação e muito mais para toda a família!
            </p>
            <Link
              href={session ? "/revistas" : "/planos"}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-black text-sm transition-all duration-300 hover:scale-[1.03] shadow-lg hover:shadow-xl"
              style={{ background: PRIMARY, color: BG_ROOT, textDecoration: 'none', boxShadow: `0 10px 25px -5px ${PRIMARY}66` }}
            >
              <BookOpen size={16} /> LER REVISTA
            </Link>
          </div>

          {/* Col centro — capa */}
          <div
            className="w-44 h-60 md:w-52 md:h-72 rounded-xl shrink-0 relative overflow-hidden transition-transform duration-500 hover:scale-[1.03] z-10"
            style={{
              background: 'linear-gradient(135deg, #D4AF37, #8B7322)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              border: '1px solid rgba(212, 175, 55, 0.4)'
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
                  <div className="text-6xl mb-3 drop-shadow-lg">📖</div>
                  <p className="text-black font-black text-sm md:text-base leading-tight">Contos de Oração</p>
                  <p className="text-black/80 text-[11px] font-bold mt-1.5 uppercase tracking-wider">Edição de Maio</p>
                </div>
              </div>
            )}
            <div
              className="absolute top-3 right-3 text-[10px] tracking-widest font-black px-2.5 py-1 rounded-full shadow-lg"
              style={{ background: 'rgba(0,0,0,0.8)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              NOVO
            </div>
          </div>

          {/* Col direita — lista */}
          <div className="flex-1 relative z-10 md:pl-4">
            <ul className="flex flex-col gap-3.5">
              {[
                { icon: '📖', text: 'História em quadrinhos' },
                { icon: '✝️', text: 'Formação Católica' },
                { icon: '🎯', text: 'Passatempos' },
                { icon: '🙏', text: 'Orações e devoções' },
                { icon: '❓', text: 'Curiosidades da fé' },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 group">
                  <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="text-white/80 font-medium text-sm md:text-base group-hover:text-white transition-colors">{item.text}</span>
                </li>
              ))}
            </ul>
            <div
              className="mt-6 inline-block text-xs font-black px-4 py-2 rounded-full uppercase tracking-wider"
              style={{ background: 'rgba(212,175,55,0.15)', color: PRIMARY, border: `1px dashed ${PRIMARY}40` }}
            >
              Nova edição todo mês!
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          TUDO PARA EVANGELIZAR SUA FAMÍLIA EM UM SÓ LUGAR
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 lg:px-10 max-w-[1200px] mx-auto">
        <h2 className="text-white font-black text-2xl md:text-3xl mb-8" style={{ fontFamily: FONT, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
          Tudo para evangelizar sua família em um só lugar
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              icon: <Tv size={32} strokeWidth={1.5} />,
              title: 'Assista Novos Filmes',
              desc: 'Histórias animadas sobre Jesus, Nossa Senhora, os santos e a Bíblia para fortalecer a fé de toda a família.',
            },
            {
              icon: <Download size={32} strokeWidth={1.5} />,
              title: 'Leve o Contos de Oração com Você',
              desc: 'Baixe os vídeos curtos do Contos de Oração para assistir offline, compartilhar e evangelizar onde estiver.',
            },
            {
              icon: <Printer size={32} strokeWidth={1.5} />,
              title: 'Conteúdo para Baixar e Imprimir',
              desc: 'Revistas mensais, jogos, músicas, atividades e materiais pedagógicos prontos para usar em casa ou na catequese.',
            },
            {
              icon: <ShieldCheck size={32} strokeWidth={1.5} />,
              title: 'Ambiente 100% Católico',
              desc: 'Conteúdo seguro para crianças e famílias, produzido com fidelidade à doutrina da Igreja Católica. Sem ideologias e com valores cristãos para todas as idades.',
            },
          ].map((c, index) => (
            <div
              key={index}
              className="group relative rounded-2xl p-6 border transition-all duration-300 overflow-hidden cursor-default flex flex-col h-full justify-between"
              style={{
                background: 'linear-gradient(180deg, rgba(26,16,37,0.6) 0%, rgba(10,5,20,0.8) 100%)',
                borderColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-6 group-hover:scale-105 transition-transform duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.15)]">
                  {c.icon}
                </div>
                <h3 className="text-white font-black text-lg md:text-xl mb-3 leading-tight relative z-10">{c.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed relative z-10">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          CTA ASSINATURA (COMPACTO)
      ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative py-12 px-6 w-full border-t border-b border-[#D4AF37]/20 flex justify-center mt-12 group" style={{ background: 'linear-gradient(135deg, rgba(25, 30, 50, 0.4), rgba(10, 14, 25, 0.8))' }}>
          
        {/* Imagens decorativas nas bordas */}
        <img 
          src="/jesus-criancas.webp" 
          alt="Jesus e Crianças" 
          className="hidden md:block absolute left-0 bottom-0 h-[150%] object-contain object-left-bottom pointer-events-none z-10"
        />
        
        <img 
          src="/mulher-orando.webp" 
          alt="Mulher Orando" 
          className="hidden md:block absolute right-0 bottom-0 h-[150%] object-contain object-right-bottom pointer-events-none z-10"
        />

        <div className="relative z-20 max-w-[900px] w-full flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex-1">
            <h2 className="text-white font-black text-xl md:text-2xl mb-2" style={{ fontFamily: FONT, textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
              Pronto para fortalecer a fé da sua família?
            </h2>
            <p className="text-white/90 text-sm md:text-base leading-relaxed max-w-[600px] mx-auto md:mx-0" style={{ textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>
              Tenha acesso a filmes, vídeos, revistas, atividades e conteúdos católicos exclusivos em um único lugar.
            </p>
          </div>
          <div className="shrink-0 mt-2 md:mt-0">
            <Link 
              href="/planos"
              className="inline-block py-4 px-10 rounded-full font-black text-sm md:text-base uppercase tracking-wider transition-all hover:scale-[1.03]"
              style={{ 
                background: 'linear-gradient(90deg, #D4AF37, #FFF8D6, #D4AF37)', 
                backgroundSize: '200% auto',
                color: '#000',
                boxShadow: '0 4px 20px rgba(212,175,55,0.4)'
              }}
            >
              Assinar Agora
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          MODAL DE LOGIN
      ══════════════════════════════════════════════════════════════════════ */}
      </div>

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
                      className="w-full px-5 py-4 rounded-xl text-white outline-none transition-all text-base focus:bg-white/10"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
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
