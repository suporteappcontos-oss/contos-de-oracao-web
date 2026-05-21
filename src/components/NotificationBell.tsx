'use client';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';

type VideoNotif = {
  id: string;
  titulo: string;
  criado_em: string;
};

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
      .select('id, titulo, criado_em')
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
    // Supabase retorna timestamps sem 'Z' — forçar UTC adicionando 'Z' se necessário
    const isoUtc = iso.endsWith('Z') || iso.includes('+') ? iso : iso + 'Z';
    const diff = Date.now() - new Date(isoUtc).getTime();
    // Evitar valores negativos (relógio do servidor vs cliente)
    if (diff < 0) return 'agora';
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins}min atrás`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atrás`;
    return `${Math.floor(hrs / 24)}d atrás`;
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
          className="absolute -right-12 sm:right-0 top-12 w-[300px] sm:w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
          style={{ background: '#0F1117', border: '1px solid rgba(212,175,55,0.2)' }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-white font-bold text-sm">🔔 Novos Vídeos</p>
            <p className="text-white/40 text-xs">Últimos lançamentos da plataforma</p>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {videos.length === 0 ? (
              <div className="p-6 text-center text-white/30 text-sm">Nenhum vídeo ainda</div>
            ) : videos.map(v => (
              <a
                key={v.id}
                href={`/watch/${v.id}`}
                className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b"
                style={{ borderColor: 'rgba(255,255,255,0.04)', textDecoration: 'none' }}
                onClick={() => setOpen(false)}
              >
                <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#D4AF37"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold leading-tight truncate">{v.titulo}</p>
                  <p className="text-white/30 text-[10px]">{timeAgo(v.criado_em)}</p>
                </div>
              </a>
            ))}
          </div>
          <div className="px-4 py-3">
            <a href="/watch" className="block text-center text-xs text-[#D4AF37] hover:underline font-semibold">
              Ver todo o catálogo →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
