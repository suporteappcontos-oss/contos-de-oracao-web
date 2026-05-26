'use client';

import React, { useState } from 'react';

/* ══════════════════════════════════════════════════════════
   PALETA DE CORES
══════════════════════════════════════════════════════════ */
const P = [
  '#FF4757','#FF6B81','#FF8FA3','#FFCCD5',
  '#FF6348','#FF8C00','#FFA502','#FFD700',
  '#2ED573','#7BED9F','#00B894','#55EFC4',
  '#1E90FF','#70A1FF','#74B9FF','#A3CFFF',
  '#5352ED','#7B68EE','#A29BFE','#D8D4FF',
  '#8B4513','#CD853F','#DEB887','#F5DEB3',
  '#D4AF37','#F5D06A','#FFF3CD','#FFF9E0',
  '#636E72','#B2BEC3','#DFE6E9','#FFFFFF',
];

/* ══════════════════════════════════════════════════════════
   TIPOS
══════════════════════════════════════════════════════════ */
interface Rgn {
  id: string;
  label: string;
  isCircle?: boolean;
  d?: string;
  cx?: number; cy?: number; r?: number;
  clip?: string;          // clipPath id
  lx: number; ly: number; // label % do viewBox
  color: string | null;
}

interface Drw {
  id: string;
  name: string;
  emoji: string;
  verse: string;
  vb: string;
  rgns: Rgn[];
}

/* ══════════════════════════════════════════════════════════
   DADOS DOS DESENHOS
══════════════════════════════════════════════════════════ */
function mkDrawings(): Drw[] {
  return [
    /* ── CRUZ SAGRADA ─────────────────────────────────────────── */
    {
      id: 'cruz', name: 'Cruz', emoji: '✝️',
      verse: '"Deus é amor." — 1 João 4:8',
      vb: '0 0 400 480',
      rgns: [
        { id:'topo',  label:'Topo',          d:'M 172,48 H 228 V 172 H 172 Z',      lx:50, ly:19, color:null },
        { id:'bEsq',  label:'Braço Esq.',    d:'M 78,172 H 172 V 228 H 78 Z',       lx:18, ly:52, color:null },
        { id:'cntr',  label:'Centro',        d:'M 172,172 H 228 V 228 H 172 Z',     lx:50, ly:52, color:null },
        { id:'bDir',  label:'Braço Dir.',    d:'M 228,172 H 322 V 228 H 228 Z',     lx:82, ly:52, color:null },
        { id:'haste', label:'Haste',         d:'M 172,228 H 228 V 444 H 172 Z',     lx:50, ly:73, color:null },
      ],
    },

    /* ── CORAÇÃO ──────────────────────────────────────────────── */
    {
      id: 'coracao', name: 'Coração', emoji: '❤️',
      verse: '"Jesus te ama." — João 3:16',
      vb: '0 0 400 380',
      rgns: [
        { id:'lE',  label:'', clip:'clipHeart', d:'M 35,45 H 200 V 205 H 35 Z',     lx:28, ly:34, color:null },
        { id:'lD',  label:'', clip:'clipHeart', d:'M 200,45 H 365 V 205 H 200 Z',   lx:72, ly:34, color:null },
        { id:'pt',  label:'', clip:'clipHeart', d:'M 35,203 H 365 V 380 H 35 Z',    lx:50, ly:66, color:null },
        { id:'brl', label:'', clip:'clipHeart', isCircle:true, cx:152, cy:108, r:26, lx:38, ly:28, color:null },
      ],
    },

    /* ── POMBA ────────────────────────────────────────────────── */
    {
      id: 'pomba', name: 'Pomba', emoji: '🕊️',
      verse: '"A paz esteja com vocês." — João 20:21',
      vb: '0 0 460 340',
      rgns: [
        {
          id:'asa', label:'Asa',
          d:'M 204,180 C 178,156 125,120 68,94 C 82,144 138,180 204,208 Z',
          lx:24, ly:46, color:null,
        },
        {
          id:'corp', label:'Corpo',
          d:'M 115,224 C 113,192 155,170 214,173 C 273,176 345,200 352,238 C 359,276 322,302 262,297 C 202,292 117,256 115,224 Z',
          lx:52, ly:65, color:null,
        },
        {
          id:'cab', label:'Cabeça',
          isCircle:true, cx:372, cy:184, r:50,
          lx:87, ly:46, color:null,
        },
        {
          id:'caud', label:'Cauda',
          d:'M 117,230 C 90,256 54,248 32,232 C 50,214 84,222 117,230 Z',
          lx:14, ly:70, color:null,
        },
        {
          id:'ramo', label:'Ramo 🌿',
          d:'M 258,295 C 236,320 210,333 186,320 C 200,308 228,314 258,295 Z',
          lx:52, ly:86, color:null,
        },
      ],
    },

    /* ── ANJO ─────────────────────────────────────────────────── */
    {
      id: 'anjo', name: 'Anjo', emoji: '👼',
      verse: '"Os anjos do Senhor te guardam." — Salmo 91:11',
      vb: '0 0 400 520',
      rgns: [
        {
          id:'aureola', label:'Auréola',
          d:'M 152,78 C 152,34 248,34 248,78 C 228,62 172,62 152,78 Z',
          lx:50, ly:14, color:null,
        },
        {
          id:'cab', label:'Rosto',
          isCircle:true, cx:200, cy:118, r:52,
          lx:50, ly:22, color:null,
        },
        {
          id:'corpo', label:'Manto',
          d:'M 162,166 C 136,188 118,224 112,272 L 112,450 L 288,450 L 288,272 C 282,224 264,188 238,166 Z',
          lx:50, ly:58, color:null,
        },
        {
          id:'aEsq', label:'Asa Esq.',
          d:'M 160,180 C 128,158 74,138 32,116 C 46,168 90,206 160,226 Z',
          lx:17, ly:42, color:null,
        },
        {
          id:'aDir', label:'Asa Dir.',
          d:'M 240,180 C 272,158 326,138 368,116 C 354,168 310,206 240,226 Z',
          lx:83, ly:42, color:null,
        },
        {
          id:'saia', label:'Veste',
          d:'M 112,342 C 94,386 80,420 76,458 L 324,458 C 320,420 306,386 288,342 Z',
          lx:50, ly:83, color:null,
        },
      ],
    },

    /* ── NOSSA SENHORA ────────────────────────────────────────── */
    {
      id: 'nsa', name: 'N. Senhora', emoji: '🌹',
      verse: '"Ave Maria, cheia de graça." — Lucas 1:28',
      vb: '0 0 400 540',
      rgns: [
        {
          id:'coroa', label:'Coroa',
          d:'M 174,56 L 160,30 L 180,50 L 190,18 L 200,46 L 210,18 L 220,50 L 240,30 L 226,56 Z',
          lx:50, ly:11, color:null,
        },
        {
          id:'cab', label:'Rosto',
          isCircle:true, cx:200, cy:108, r:50,
          lx:50, ly:20, color:null,
        },
        {
          id:'manto', label:'Manto Azul',
          d:'M 200,62 C 160,80 115,128 98,202 L 86,468 L 314,468 L 302,202 C 285,128 240,80 200,62 Z',
          lx:50, ly:54, color:null,
        },
        {
          id:'vest', label:'Vestido',
          d:'M 200,156 C 182,170 164,198 158,228 L 156,442 L 244,442 L 242,228 C 236,198 218,170 200,156 Z',
          lx:50, ly:68, color:null,
        },
        {
          id:'maos', label:'Mãos',
          d:'M 176,286 H 192 V 318 H 174 Z M 208,286 H 226 V 318 H 208 Z',
          lx:50, ly:62, color:null,
        },
      ],
    },

    /* ── SAGRADO CORAÇÃO ──────────────────────────────────────── */
    {
      id: 'sagrado', name: 'S. Coração', emoji: '🔥',
      verse: '"Sagrado Coração de Jesus, eu confio em Vós."',
      vb: '0 0 400 500',
      rgns: [
        {
          id:'chamas', label:'Chamas',
          d:'M 168,95 C 165,68 175,50 182,38 C 189,56 184,72 198,44 C 200,32 200,14 200,14 C 200,14 200,32 202,44 C 216,72 211,56 218,38 C 225,50 235,68 232,95 Z',
          lx:50, ly:18, color:null,
        },
        {
          id:'cruzSC', label:'Cruz',
          d:'M 193,10 H 207 V 24 H 215 V 34 H 207 V 50 H 193 V 34 H 185 V 24 H 193 Z',
          lx:50, ly:6, color:null,
        },
        {
          id:'lE2', label:'', clip:'clipSagrado',
          d:'M 52,72 H 200 V 242 H 52 Z',
          lx:29, ly:42, color:null,
        },
        {
          id:'lD2', label:'', clip:'clipSagrado',
          d:'M 200,72 H 348 V 242 H 200 Z',
          lx:71, ly:42, color:null,
        },
        {
          id:'ptSC', label:'', clip:'clipSagrado',
          d:'M 52,240 H 348 V 500 H 52 Z',
          lx:50, ly:73, color:null,
        },
        {
          id:'espSC', label:'Coroa',
          d:'M 147,188 Q 200,205 253,188 Q 248,214 200,216 Q 152,214 147,188 Z',
          lx:50, ly:42, color:null,
        },
      ],
    },
  ];
}

/* ══════════════════════════════════════════════════════════
   COMPONENT PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function ColoringGame() {
  const [drws, setDrws] = useState<Drw[]>(mkDrawings);
  const [idx, setIdx]   = useState(0);
  const [clr, setClr]   = useState(P[0]);
  const [era, setEra]   = useState(false);
  const [hov, setHov]   = useState<string | null>(null);
  const [hist, setHist] = useState<{i:number;r:string;p:string|null}[]>([]);
  const [cel, setCel]   = useState(false);

  const drw = drws[idx];
  const painted = drw.rgns.filter(r => r.color !== null).length;
  const total   = drw.rgns.length;
  const pct     = total ? painted / total : 0;
  const [vbW, vbH] = drw.vb.split(' ').slice(2).map(Number);

  /* ── Pintar / Apagar ── */
  function paint(rid: string) {
    const prev = drw.rgns.find(r => r.id === rid)?.color ?? null;
    const nxt  = era ? null : clr;
    if (prev === nxt) return;
    setHist(h => [...h, { i: idx, r: rid, p: prev }]);
    setDrws(ds => ds.map((d, i) =>
      i !== idx ? d : { ...d, rgns: d.rgns.map(r => r.id === rid ? { ...r, color: nxt } : r) }
    ));
    const nc = drw.rgns.filter(r => r.id === rid ? nxt !== null : r.color !== null).length;
    if (nc === total) setTimeout(() => setCel(true), 350);
  }

  function undo() {
    if (!hist.length) return;
    const last = hist[hist.length - 1];
    setHist(h => h.slice(0, -1));
    setDrws(ds => ds.map((d, i) =>
      i !== last.i ? d : { ...d, rgns: d.rgns.map(r => r.id === last.r ? { ...r, color: last.p } : r) }
    ));
  }

  function clearAll() {
    setDrws(ds => ds.map((d, i) =>
      i !== idx ? d : { ...d, rgns: d.rgns.map(r => ({ ...r, color: null })) }
    ));
    setHist([]);
    setCel(false);
  }

  function save() {
    const el = document.getElementById('g-svg') as SVGSVGElement | null;
    if (!el) return;
    const xml = new XMLSerializer().serializeToString(el);
    const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml' }));
    Object.assign(document.createElement('a'), { href: url, download: `${drw.id}.svg` }).click();
    URL.revokeObjectURL(url);
  }

  /* ── Renderiza uma região SVG ── */
  function RgnEl({ r }: { r: Rgn }) {
    const fill   = r.color ?? (r.id === hov ? '#FFF8E1' : '#F8F8F8');
    const cp     = r.clip ? `url(#${r.clip})` : undefined;
    const hasBdr = !r.clip; // sem borda quando está clipado (a borda fica no overlay)
    const shared = {
      fill,
      stroke: hasBdr ? '#1a1a2e' : 'none',
      strokeWidth: hasBdr ? 2.5 : 0,
      clipPath: cp,
      onClick:       () => paint(r.id),
      onMouseEnter:  () => setHov(r.id),
      onMouseLeave:  () => setHov(null),
      style: { cursor: 'pointer', transition: 'fill 0.18s' } as React.CSSProperties,
    };
    if (r.isCircle) {
      return <circle key={r.id} cx={r.cx} cy={r.cy} r={r.r} strokeLinejoin="round" {...shared} />;
    }
    return <path key={r.id} d={r.d ?? ''} strokeLinejoin="round" {...shared} />;
  }

  return (
    <div className="fixed inset-0 flex flex-col" style={{ background: '#090B10' }}>

      {/* ══ HEADER ══════════════════════════════════════════════ */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 14px', height: 56, flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: '#0C1018',
      }}>
        <a href="/" style={{ color: 'rgba(255,255,255,0.45)', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Voltar
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>🎨</span>
          <span style={{ fontWeight: 700, color: '#fff', fontSize: 17 }}>Pintar e Colorir</span>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {[
            { t: 'Desfazer', dis: !hist.length, fn: undo,     icon: <UndoIco /> },
            { t: 'Limpar',   dis: false,         fn: clearAll, icon: <TrashIco /> },
            { t: 'Salvar',   dis: false,         fn: save,     icon: <SaveIco /> },
          ].map(b => (
            <button key={b.t} title={b.t} onClick={b.fn} disabled={b.dis}
              style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 9, border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.04)',
                color: b.dis ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.65)',
                cursor: b.dis ? 'not-allowed' : 'pointer',
              }}>
              {b.icon}
            </button>
          ))}
        </div>
      </header>

      {/* ══ CORPO ════════════════════════════════════════════════ */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ─ SIDEBAR — seleção de desenho ─ */}
        <aside style={{
          width: 88, flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: 7,
          padding: '10px 6px', overflowY: 'auto',
          background: '#0A0E16',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}>
          {drws.map((d, i) => {
            const p   = d.rgns.filter(r => r.color).length / d.rgns.length;
            const sel = i === idx;
            return (
              <button key={d.id} onClick={() => { setIdx(i); setCel(false); }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 3, padding: '8px 4px', borderRadius: 12, cursor: 'pointer',
                  background: sel ? 'rgba(212,175,55,0.14)' : 'rgba(255,255,255,0.02)',
                  border: `2px solid ${sel ? '#D4AF37' : 'rgba(255,255,255,0.05)'}`,
                  transition: 'all 0.18s',
                }}>
                <span style={{ fontSize: 22 }}>{d.emoji}</span>
                <span style={{ fontSize: 9, fontWeight: 700, textAlign: 'center', lineHeight: 1.25,
                  color: sel ? '#D4AF37' : 'rgba(255,255,255,0.55)' }}>
                  {d.name}
                </span>
                {p > 0 && (
                  <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 2 }}>
                    <div style={{ width: `${p * 100}%`, height: '100%', background: '#D4AF37', borderRadius: 2 }} />
                  </div>
                )}
              </button>
            );
          })}
        </aside>

        {/* ─ CANVAS CENTRAL ─ */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '10px 12px', gap: 8, overflow: 'hidden', minWidth: 0 }}>
          {/* Progresso */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3 }}>
              <div style={{
                width: `${pct * 100}%`, height: '100%', borderRadius: 3,
                background: 'linear-gradient(90deg,#D4AF37,#F5D06A)',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <span style={{ fontSize: 11, color: '#D4AF37', fontWeight: 700, whiteSpace: 'nowrap' }}>
              {painted}/{total} regiões
            </span>
          </div>

          {/* SVG Canvas */}
          <div style={{
            flex: 1, borderRadius: 18, overflow: 'hidden',
            background: '#fff',
            boxShadow: '0 0 60px rgba(212,175,55,0.1), 0 12px 40px rgba(0,0,0,0.6)',
            border: '1.5px solid rgba(212,175,55,0.18)',
          }}>
            <svg id="g-svg" viewBox={drw.vb} style={{ width: '100%', height: '100%', display: 'block' }} xmlns="http://www.w3.org/2000/svg">
              {/* Clip paths específicos por desenho */}
              <DrwDefs id={drw.id} />

              {/* Fundo branco */}
              <rect width={vbW} height={vbH} fill="#FFFFFF" />

              {/* Regiões clicáveis */}
              {drw.rgns.map(r => <RgnEl key={r.id} r={r} />)}

              {/* Labels das regiões (apenas se sem cor) */}
              {drw.rgns.map(r => (!r.color && r.label) ? (
                <text key={`l${r.id}`}
                  x={r.lx * vbW / 100} y={r.ly * vbH / 100}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="11" fill="#9BA3B0"
                  fontFamily="Outfit,system-ui,sans-serif"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {r.label}
                </text>
              ) : null)}

              {/* Overlay (contornos + detalhes decorativos, não interativo) */}
              <DrwOverlay id={drw.id} />
            </svg>
          </div>

          {/* Versículo */}
          <p style={{
            margin: 0, textAlign: 'center', fontSize: 12,
            color: 'rgba(255,255,255,0.35)', fontStyle: 'italic',
            flexShrink: 0, padding: '0 8px',
          }}>
            {drw.verse}
          </p>
        </main>
      </div>

      {/* ══ PALETA INFERIOR ══════════════════════════════════════ */}
      <div style={{
        background: '#0A0E16', borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '9px 12px 10px', flexShrink: 0,
      }}>
        {/* Ferramentas */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          {[
            { label: '🖌️ Pincel', active: !era, ac: '#D4AF37', fn: () => setEra(false) },
            { label: '🧹 Apagar', active:  era,  ac: '#FF4757', fn: () => setEra(true)  },
          ].map(t => (
            <button key={t.label} onClick={t.fn}
              style={{
                padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                background: t.active ? `${t.ac}22` : 'transparent',
                border: `1.5px solid ${t.active ? t.ac : 'rgba(255,255,255,0.1)'}`,
                color: t.active ? t.ac : 'rgba(255,255,255,0.45)',
                transition: 'all 0.15s',
              }}>
              {t.label}
            </button>
          ))}
          {!era && (
            <div style={{
              marginLeft: 'auto', width: 30, height: 30, borderRadius: 8,
              background: clr, border: '2px solid rgba(255,255,255,0.2)',
              boxShadow: `0 0 14px ${clr}66`,
            }} />
          )}
        </div>

        {/* Cores */}
        <div className="no-scrollbar" style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {P.map(c => {
            const sel = c === clr && !era;
            return (
              <button key={c} onClick={() => { setClr(c); setEra(false); }}
                style={{
                  flexShrink: 0,
                  width: sel ? 38 : 32, height: sel ? 38 : 32,
                  borderRadius: '50%', background: c, cursor: 'pointer',
                  border: sel ? '3px solid #D4AF37' : `2px solid ${c === '#FFFFFF' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)'}`,
                  transform: sel ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: sel ? `0 0 16px ${c}90` : 'none',
                  transition: 'all 0.15s ease',
                }} />
            );
          })}
        </div>
      </div>

      {/* ══ CELEBRAÇÃO ═══════════════════════════════════════════ */}
      {cel && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(14px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <style>{`
            @keyframes gfall { to { transform: translateY(105vh) rotate(560deg); opacity: 0; } }
            @keyframes gpopin { 0%{transform:scale(0.45);opacity:0} 70%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
            @keyframes gstar  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }
          `}</style>
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute', left: `${(i * 3.7) % 100}%`, top: '-18px',
              width: 7 + (i % 6) * 2, height: 7 + (i % 6) * 2,
              borderRadius: i % 2 ? '50%' : '3px',
              background: P[(i * 7) % P.length],
              animation: `gfall ${1.2 + (i % 5) * 0.3}s ${(i % 7) * 0.14}s ease-in infinite`,
            }} />
          ))}
          <div style={{
            background: 'linear-gradient(145deg,#131622,#0A0E16)',
            border: '2px solid rgba(212,175,55,0.55)',
            borderRadius: 28, padding: '44px 36px',
            maxWidth: 400, width: '90%', textAlign: 'center',
            boxShadow: '0 0 100px rgba(212,175,55,0.3)',
            animation: 'gpopin 0.55s cubic-bezier(.34,1.56,.64,1) forwards',
            position: 'relative',
          }}>
            <button onClick={() => setCel(false)} style={{
              position: 'absolute', top: 14, right: 16,
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
              fontSize: 20, cursor: 'pointer',
            }}>✕</button>
            <div style={{ fontSize: 72, animation: 'gstar 1.2s ease-in-out infinite', display: 'inline-block', marginBottom: 16 }}>⭐</div>
            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 24, marginBottom: 8 }}>
              Parabéns! Que lindo! ✨
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.48)', fontStyle: 'italic', marginBottom: 26, fontSize: 13 }}>
              {drw.verse}
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={save}
                style={{ flex: 1, padding: '13px', borderRadius: 13, fontWeight: 700, cursor: 'pointer',
                  background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', color: '#D4AF37',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <SaveIco /> Salvar
              </button>
              <button
                onClick={() => { setIdx((idx + 1) % drws.length); setCel(false); }}
                style={{ flex: 1, padding: '13px', borderRadius: 13, fontWeight: 800,
                  background: '#D4AF37', color: '#0A0E16', cursor: 'pointer' }}>
                Próximo →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CLIP PATHS (por desenho)
══════════════════════════════════════════════════════════ */
function DrwDefs({ id }: { id: string }) {
  if (id === 'coracao') return (
    <defs>
      <clipPath id="clipHeart">
        <path d="M200,350 C200,340 35,268 35,163 C35,88 88,45 140,45 C165,45 185,58 200,75 C215,58 235,45 260,45 C312,45 365,88 365,163 C365,268 200,340 200,350 Z" />
      </clipPath>
    </defs>
  );
  if (id === 'sagrado') return (
    <defs>
      <clipPath id="clipSagrado">
        <path d="M200,390 C200,380 52,305 52,195 C52,118 104,72 153,72 C177,72 196,85 200,100 C204,85 223,72 247,72 C296,72 348,118 348,195 C348,305 200,380 200,390 Z" />
      </clipPath>
    </defs>
  );
  return null;
}

/* ══════════════════════════════════════════════════════════
   OVERLAYS (contornos + detalhes, pointerEvents="none")
══════════════════════════════════════════════════════════ */
function DrwOverlay({ id }: { id: string }) {
  if (id === 'cruz') return (
    <g pointerEvents="none">
      {/* Tablet INRI */}
      <rect x="163" y="26" width="74" height="26" rx="4" fill="none" stroke="#1a1a2e" strokeWidth="2" />
      <text x="200" y="40" textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontWeight="700" fill="rgba(0,0,0,0.45)" fontFamily="serif">INRI</text>
    </g>
  );

  if (id === 'coracao') return (
    <g pointerEvents="none">
      {/* Contorno do coração */}
      <path d="M200,350 C200,340 35,268 35,163 C35,88 88,45 140,45 C165,45 185,58 200,75 C215,58 235,45 260,45 C312,45 365,88 365,163 C365,268 200,340 200,350 Z"
        fill="none" stroke="#1a1a2e" strokeWidth="3.5" />
      {/* Divisória vertical */}
      <line x1="200" y1="75" x2="200" y2="260" stroke="#1a1a2e" strokeWidth="2" />
      {/* Divisória horizontal (curva) */}
      <path d="M 60,205 Q 200,225 340,205" fill="none" stroke="#1a1a2e" strokeWidth="2" />
    </g>
  );

  if (id === 'pomba') return (
    <g pointerEvents="none">
      {/* Asa */}
      <path d="M 204,180 C 178,156 125,120 68,94 C 82,144 138,180 204,208 Z"
        fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
      {/* Corpo */}
      <path d="M 115,224 C 113,192 155,170 214,173 C 273,176 345,200 352,238 C 359,276 322,302 262,297 C 202,292 117,256 115,224 Z"
        fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
      {/* Cabeça */}
      <circle cx="372" cy="184" r="50" fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
      {/* Cauda */}
      <path d="M 117,230 C 90,256 54,248 32,232 C 50,214 84,222 117,230 Z"
        fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
      {/* Olho */}
      <circle cx="368" cy="174" r="5" fill="#1a1a2e" />
      {/* Bico */}
      <path d="M 418,190 L 440,186 L 440,194 Z" fill="#E67E22" />
      {/* Ramo de oliveira */}
      <path d="M 260,296 C 238,320 212,333 188,320" fill="none" stroke="#27AE60" strokeWidth="2.5" />
      <ellipse cx="234" cy="312" rx="9" ry="5.5" fill="#2ECC71" transform="rotate(-30,234,312)" />
      <ellipse cx="212" cy="322" rx="9" ry="5.5" fill="#2ECC71" transform="rotate(-50,212,322)" />
      <ellipse cx="254" cy="302" rx="9" ry="5.5" fill="#2ECC71" transform="rotate(-15,254,302)" />
    </g>
  );

  if (id === 'anjo') return (
    <g pointerEvents="none">
      {/* Auréola dourada */}
      <path d="M 152,78 C 152,34 248,34 248,78 C 228,62 172,62 152,78 Z"
        fill="none" stroke="#D4AF37" strokeWidth="3.5" />
      <circle cx="200" cy="118" r="52" fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
      <path d="M 162,166 C 136,188 118,224 112,272 L 112,450 L 288,450 L 288,272 C 282,224 264,188 238,166 Z"
        fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
      <path d="M 160,180 C 128,158 74,138 32,116 C 46,168 90,206 160,226 Z"
        fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
      <path d="M 240,180 C 272,158 326,138 368,116 C 354,168 310,206 240,226 Z"
        fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
      <path d="M 112,342 C 94,386 80,420 76,458 L 324,458 C 320,420 306,386 288,342 Z"
        fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
      {/* Rosto */}
      <circle cx="185" cy="112" r="5" fill="#1a1a2e" />
      <circle cx="215" cy="112" r="5" fill="#1a1a2e" />
      <path d="M 189,130 Q 200,138 211,130" fill="none" stroke="#1a1a2e" strokeWidth="2" />
    </g>
  );

  if (id === 'nsa') return (
    <g pointerEvents="none">
      {/* Coroa dourada */}
      <path d="M 174,56 L 160,30 L 180,50 L 190,18 L 200,46 L 210,18 L 220,50 L 240,30 L 226,56 Z"
        fill="none" stroke="#D4AF37" strokeWidth="2.5" />
      <circle cx="200" cy="108" r="50" fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
      {/* Manto externo */}
      <path d="M 200,62 C 160,80 115,128 98,202 L 86,468 L 314,468 L 302,202 C 285,128 240,80 200,62 Z"
        fill="none" stroke="#1a1a2e" strokeWidth="2.5" />
      {/* Vestido interno */}
      <path d="M 200,156 C 182,170 164,198 158,228 L 156,442 L 244,442 L 242,228 C 236,198 218,170 200,156 Z"
        fill="none" stroke="#1a1a2e" strokeWidth="2" />
      {/* Rosto */}
      <circle cx="187" cy="102" r="4.5" fill="#1a1a2e" />
      <circle cx="213" cy="102" r="4.5" fill="#1a1a2e" />
      <path d="M 192,118 Q 200,126 208,118" fill="none" stroke="#1a1a2e" strokeWidth="1.8" />
      {/* Terço */}
      <path d="M 170,292 Q 165,370 172,440" fill="none" stroke="#8B4513" strokeWidth="1.5" />
      <circle cx="168" cy="322" r="4" fill="#8B4513" />
      <circle cx="170" cy="354" r="4" fill="#8B4513" />
      <circle cx="172" cy="386" r="4" fill="#8B4513" />
    </g>
  );

  if (id === 'sagrado') return (
    <g pointerEvents="none">
      {/* Contorno do coração */}
      <path d="M200,390 C200,380 52,305 52,195 C52,118 104,72 153,72 C177,72 196,85 200,100 C204,85 223,72 247,72 C296,72 348,118 348,195 C348,305 200,380 200,390 Z"
        fill="none" stroke="#1a1a2e" strokeWidth="3.5" />
      <line x1="200" y1="100" x2="200" y2="280" stroke="#1a1a2e" strokeWidth="2" />
      <path d="M 76,242 Q 200,260 324,242" fill="none" stroke="#1a1a2e" strokeWidth="2" />
      {/* Chamas */}
      <path d="M 168,95 C 165,68 175,50 182,38 C 189,56 184,72 198,44 C 200,32 200,14 200,14 C 200,14 200,32 202,44 C 216,72 211,56 218,38 C 225,50 235,68 232,95 Z"
        fill="none" stroke="#FF6348" strokeWidth="2.5" />
      {/* Cruz */}
      <path d="M 193,10 H 207 V 24 H 215 V 34 H 207 V 50 H 193 V 34 H 185 V 24 H 193 Z"
        fill="none" stroke="#1a1a2e" strokeWidth="2" />
      {/* Coroa de espinhos */}
      <path d="M 147,188 Q 200,205 253,188 Q 248,214 200,216 Q 152,214 147,188 Z"
        fill="none" stroke="#5C4033" strokeWidth="2" strokeDasharray="5,3" />
    </g>
  );

  return null;
}

/* ══════════════════════════════════════════════════════════
   ÍCONES
══════════════════════════════════════════════════════════ */
function UndoIco() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>;
}
function TrashIco() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
}
function SaveIco() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
}
