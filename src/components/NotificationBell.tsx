'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

type VideoNotif = {
  id: string;
  titulo: string;
  criado_em: string;
  thumbnail_url: string | null;
  categoria: string;
};

// Fallback caso não tenha thumbnail
const FALLBACK_IMGS = [
  'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=400&q=60',
  'https://images.unsplash.com/photo-1476725994324-6f6833cfb205?w=400&q=60',
  'https://images.unsplash.com/photo-1507036066871-b7e8032b3dea?w=400&q=60',
  'https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=400&q=60',
];
function getFallback(id: string) {
  const c = (id.charCodeAt(0) || 0) + (id.charCodeAt(id.length - 1) || 0);
  return FALLBACK_IMGS[c % FALLBACK_IMGS.length];
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [videos, setVideos] = useState<VideoNotif[]>([]);
  const [lastSeen, setLastSeen] = useState<string>('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const seen = localStorage.getItem('last_seen_notif') || '';
    setLastSeen(seen);

    const supabase = createClient();
    supabase
      .from('videos')
      .select('id, titulo, criado_em, thumbnail_url, categoria')
      .eq('ativo', true)
      .order('criado_em', { ascending: false })
      .limit(8)
      .then(({ data }) => { if (data) setVideos(data); });
  }, []);

  // Fecha ao clicar fora
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const unread = videos.filter(v => v.criado_em > lastSeen).length;

  const handleOpen = () => {
    setOpen(o => !o);
    if (!open) {
      const now = new Date().toISOString();
      localStorage.setItem('last_seen_notif', now);
      setLastSeen(now);
    }
  };

  const timeAgo = (iso: string) => {
    const isoUtc = iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z';
    const diff = Date.now() - new Date(isoUtc).getTime();
    if (diff < 0) return 'agora';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d atrás`;
    return new Date(isoUtc).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  // Label de categoria curta
  const catLabel = (cat: string) => {
    const map: Record<string, string> = {
      'Temporada': '📺 Episódio',
      'Vídeo Clipe': '🎵 Clipe',
      'Infantil': '🧒 Infantil',
      'Documentário': '🎬 Doc',
      'Louvor': '🎶 Louvor',
      'Sermão': '✝️ Sermão',
      'Adulto': '👤 Adulto',
      'Testemunho': '🙏 Testemunho',
    };
    return map[cat] || '▶ Vídeo';
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-110"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
        title="Notificações"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center" style={{ background: '#D4AF37', color: '#090B10' }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute -right-12 sm:right-0 top-12 w-[320px] sm:w-[340px] rounded-2xl overflow-hidden shadow-2xl z-50"
          style={{ background: '#0F1117', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-white font-bold text-sm">🔔 Novos Vídeos</p>
            <p className="text-white/40 text-xs">Últimos lançamentos da plataforma</p>
          </div>

          {/* Lista com thumbnails */}
          <div className="max-h-[360px] overflow-y-auto">
            {videos.length === 0 ? (
              <div className="p-6 text-center text-white/30 text-sm">Nenhum vídeo ainda</div>
            ) : videos.map(v => {
              const isNew = v.criado_em > lastSeen;
              const imgSrc = v.thumbnail_url || getFallback(v.id);
              return (
                <a
                  key={v.id}
                  href={`/watch/${v.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors border-b relative group"
                  style={{ borderColor: 'rgba(255,255,255,0.04)', textDecoration: 'none' }}
                  onClick={() => setOpen(false)}
                >
                  {/* Indicador de novo (bolinha dourada) */}
                  {isNew && (
                    <span
                      className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                      style={{ background: '#D4AF37' }}
                    />
                  )}

                  {/* Thumbnail do vídeo */}
                  <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 shadow-lg">
                    <img
                      src={imgSrc}
                      alt={v.titulo}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getFallback(v.id);
                      }}
                    />
                    {/* Overlay escuro com ícone play no hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="#D4AF37"
                        className="opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
                      >
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                    </div>
                  </div>

                  {/* Texto */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold leading-tight line-clamp-2 transition-colors group-hover:text-[#D4AF37] ${isNew ? 'text-white' : 'text-white/70'}`}>
                      {v.titulo}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-white/30 text-[10px]">{timeAgo(v.criado_em)}</span>
                      <span className="text-white/20 text-[10px]">·</span>
                      <span className="text-white/30 text-[10px]">{catLabel(v.categoria)}</span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          {/* Rodapé */}
          <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <a href="/watch" className="block text-center text-xs text-[#D4AF37] hover:underline font-semibold" onClick={() => setOpen(false)}>
              Ver todo o catálogo →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
