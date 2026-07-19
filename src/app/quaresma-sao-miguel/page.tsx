"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  started: boolean;
  ended: boolean;
}

function calcTimeLeft(): TimeLeft {
  const start = new Date("2025-08-10T00:00:00-03:00");
  const end   = new Date("2025-09-29T23:59:59-03:00");
  const now   = new Date();
  const diff  = start.getTime() - now.getTime();
  const started = now >= start;
  const ended   = now > end;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, started, ended };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    started,
    ended,
  };
}

const semanas = [
  { numero: 1, dias: "10 – 16 de agosto",     tema: "Conversão e Arrependimento",   intencao: "Pedir a São Miguel que interceda pela nossa conversão interior, arrependimento sincero e purificação da alma.", oracao: "Oração do Rosário + Chaplet de São Miguel" },
  { numero: 2, dias: "17 – 23 de agosto",     tema: "Proteção Espiritual",          intencao: "Invocar a proteção de São Miguel contra as forças do mal, pedindo escudo de luz para família e lar.",            oracao: "Litanias dos Santos + Salmo 91" },
  { numero: 3, dias: "24 – 30 de agosto",     tema: "Cura e Libertação",            intencao: "Pedir cura física, emocional e espiritual, especialmente para os membros mais vulneráveis da família.",          oracao: "Novena a São Miguel + Oração de Libertação" },
  { numero: 4, dias: "31 ago – 6 de setembro",tema: "Fé e Perseverança",            intencao: "Fortalecer a fé diante das provações e perseverar na vida cristã com coragem e confiança em Deus.",             oracao: "Terço Meditado + Lectio Divina" },
  { numero: 5, dias: "7 – 13 de setembro",    tema: "Missão e Serviço",             intencao: "Renovar nossa missão batismal e servir ao próximo com amor, humildade e dedicação.",                            oracao: "Via-Sacra + Oração pelo Mundo" },
  { numero: 6, dias: "14 – 29 de setembro",   tema: "Consagração e Festa",          intencao: "Consagrar-nos a São Miguel e celebrar com alegria a Festa do Arcanjo, vitoriosos na jornada espiritual.",       oracao: "Missa de São Miguel + Hino aos Anjos" },
];

export default function QuaresmaPage() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft());
  const [expanded, setExpanded] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setTimeLeft(calcTimeLeft()), 1000);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearInterval(tick); window.removeEventListener("scroll", onScroll); };
  }, []);

  const parallaxOffset = scrollY * 0.3;

  return (
    <main className="min-h-screen w-full overflow-x-hidden" style={{ background: "#090B10", fontFamily: "Outfit, sans-serif", color: "#fff" }}>

      {/* HERO */}
      <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ transform: `translateY(${parallaxOffset}px)`, willChange: "transform" }}>
          <Image src="/sao-miguel-hero.jpg" alt="São Miguel Arcanjo" fill className="object-cover object-center" priority quality={90} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(9,11,16,0.55) 0%, rgba(9,11,16,0.2) 40%, rgba(9,11,16,0.85) 80%, #090B10 100%)" }} />
        </div>

        {/* Partículas */}
        <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
          {[...Array(40)].map((_, i) => (
            <span key={i} style={{ position: "absolute", width: "2px", height: "2px", borderRadius: "50%", top: `${(i * 7) % 100}%`, left: `${(i * 11 + 13) % 100}%`, background: "#D4AF37", opacity: 0.4, animation: `twinkle ${2 + (i % 4)}s ease-in-out infinite`, animationDelay: `${(i % 5) * 0.5}s` }} />
          ))}
        </div>

        <div className="relative z-10 text-center px-4 sm:px-8 max-w-4xl mx-auto pt-28 pb-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6" style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.35)" }}>
            <span style={{ fontSize: "1rem" }}>⚔️</span>
            <span className="text-[#D4AF37] text-xs font-black uppercase tracking-widest">10 de agosto · 29 de setembro</span>
          </div>

          {/* Título */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-tight mb-4" style={{ background: "linear-gradient(135deg,#fff 0%,#D4AF37 40%,#fff 70%,#D4AF37 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "shimmer 4s linear infinite" }}>
            Quaresma de<br />São Miguel
          </h1>
          <p className="text-white/70 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            40 dias de oração, jejum e consagração ao Príncipe da Milícia Celestial. Uma jornada espiritual rumo à Festa do Arcanjo.
          </p>

          {/* Contador */}
          {!timeLeft.started && !timeLeft.ended && (
            <div className="mb-10">
              <p className="text-white/50 text-xs uppercase tracking-widest mb-4 font-bold">A jornada começa em</p>
              <div className="flex justify-center gap-3 sm:gap-5">
                {[{ value: timeLeft.days, label: "dias" }, { value: timeLeft.hours, label: "horas" }, { value: timeLeft.minutes, label: "min" }, { value: timeLeft.seconds, label: "seg" }].map(({ value, label }) => (
                  <div key={label} className="flex flex-col items-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl font-black" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37" }}>
                      {String(value).padStart(2, "0")}
                    </div>
                    <span className="text-white/40 text-[10px] uppercase tracking-widest mt-2 font-bold">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {timeLeft.started && !timeLeft.ended && (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-10" style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.35)" }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-sm font-black uppercase tracking-wider">Em andamento agora</span>
            </div>
          )}

          {timeLeft.ended && (
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-10" style={{ background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)" }}>
              <span className="text-[#D4AF37] text-sm font-black uppercase tracking-wider">🏆 Jornada concluída — Festa de São Miguel</span>
            </div>
          )}

          <Link href="/planos" className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-black transition-all duration-300 hover:scale-105 active:scale-95 no-underline" style={{ background: "linear-gradient(135deg,#D4AF37,#B8962E)", color: "#090B10", boxShadow: "0 8px 32px rgba(212,175,55,0.4)" }}>
            <span>⚔️</span> Começar a Jornada
          </Link>
          <p className="text-white/30 text-xs mt-4">Acesso completo com assinatura Contos de Oração</p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
        </div>
      </section>

      {/* O QUE É */}
      <section className="py-20 px-4 sm:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] text-xs font-black uppercase tracking-widest mb-3">A Devoção</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">O que é a Quaresma<br /><span style={{ color: "#D4AF37" }}>de São Miguel?</span></h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
          {[
            { icon: "📅", title: "40 Dias",          desc: "Da preparação do Arcanjo à sua grande festa. 40 dias que espelham os 40 dias de jejum de Cristo no deserto." },
            { icon: "⚔️", title: "Batalha Espiritual",desc: "São Miguel é o Príncipe da Milícia Celestial. Invocá-lo é se colocar sob sua proteção na luta contra o mal." },
            { icon: "🙏", title: "Consagração",       desc: "Ao final dos 40 dias, renova-se a consagração ao Arcanjo na sua solenidade: 29 de setembro." },
          ].map((c) => (
            <div key={c.title} className="flex flex-col items-start gap-4 p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "rgba(212,175,55,0.1)" }}>{c.icon}</div>
              <h3 className="text-white font-black text-lg">{c.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="relative p-8 rounded-3xl overflow-hidden text-center" style={{ background: "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(26,35,126,0.15))", border: "1px solid rgba(212,175,55,0.2)" }}>
          <div className="text-5xl mb-4 opacity-30 select-none font-serif text-[#D4AF37]">"</div>
          <p className="text-white/80 text-base sm:text-lg italic leading-relaxed max-w-2xl mx-auto">
            Houve uma batalha no céu: Miguel e os seus anjos combatiam o dragão... O grande dragão, a antiga serpente, foi precipitado.
          </p>
          <p className="text-[#D4AF37] text-sm font-black uppercase tracking-widest mt-4">Apocalipse 12, 7–9</p>
        </div>
      </section>

      {/* PROGRAMA */}
      <section className="py-20 px-4 sm:px-8" style={{ background: "rgba(255,255,255,0.015)" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#D4AF37] text-xs font-black uppercase tracking-widest mb-3">A Jornada</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">Programa dos <span style={{ color: "#D4AF37" }}>40 Dias</span></h2>
          </div>
          <div className="flex flex-col gap-3">
            {semanas.map((s, i) => (
              <div key={s.numero} className="rounded-2xl overflow-hidden transition-all duration-300" style={{ background: expanded === i ? "rgba(212,175,55,0.07)" : "rgba(255,255,255,0.03)", border: expanded === i ? "1px solid rgba(212,175,55,0.3)" : "1px solid rgba(255,255,255,0.07)" }}>
                <button onClick={() => setExpanded(expanded === i ? null : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer" style={{ background: "transparent", border: "none" }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0" style={{ background: expanded === i ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.05)", color: expanded === i ? "#D4AF37" : "rgba(255,255,255,0.4)" }}>{s.numero}ª</div>
                    <div>
                      <p className="text-white font-black text-sm sm:text-base leading-tight">{s.tema}</p>
                      <p className="text-white/40 text-xs mt-0.5">{s.dias}</p>
                    </div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={expanded === i ? "#D4AF37" : "rgba(255,255,255,0.3)"} strokeWidth="2.5" style={{ transform: expanded === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s", flexShrink: 0 }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expanded === i && (
                  <div className="px-5 pb-5 flex flex-col gap-3">
                    <p className="text-white/65 text-sm leading-relaxed">{s.intencao}</p>
                    <div className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl w-fit" style={{ background: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.2)" }}>🕊️ {s.oracao}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-8 p-7 rounded-3xl text-center" style={{ background: "linear-gradient(135deg, rgba(26,35,126,0.3), rgba(212,175,55,0.08))", border: "1px solid rgba(212,175,55,0.2)" }}>
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="text-white font-black text-lg mb-2">Conteúdo completo disponível para assinantes</h3>
            <p className="text-white/50 text-sm mb-5 max-w-md mx-auto">Acesse as orações diárias, meditações guiadas e os vídeos temáticos de cada semana com sua assinatura.</p>
            <Link href="/planos" className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-black text-sm no-underline transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#D4AF37,#B8962E)", color: "#090B10" }}>⚔️ Assinar Agora</Link>
          </div>
        </div>
      </section>

      {/* COMO PARTICIPAR */}
      <section className="py-20 px-4 sm:px-8 max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#D4AF37] text-xs font-black uppercase tracking-widest mb-3">Simples Assim</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">Como Participar</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { step: "01", icon: "📱", title: "Assine o Plano",       desc: "Escolha seu plano Mensal ou Anual e tenha acesso a toda a biblioteca católica." },
            { step: "02", icon: "📅", title: "Siga o Programa",      desc: "A cada semana, acesse as orações, meditações e intenções da Quaresma de São Miguel." },
            { step: "03", icon: "🙏", title: "Festeje em 29/09",     desc: "Chegue à Festa de São Miguel renovado e fortalecido pela jornada espiritual." },
          ].map((c) => (
            <div key={c.step} className="relative flex flex-col gap-4 p-7 rounded-2xl text-center transition-all hover:-translate-y-1 duration-300" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black tracking-widest" style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.3)", color: "#D4AF37" }}>PASSO {c.step}</div>
              <div className="text-4xl mt-3">{c.icon}</div>
              <h3 className="text-white font-black text-base">{c.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ORAÇÃO */}
      <section className="py-20 px-4 sm:px-8" style={{ background: "linear-gradient(135deg, rgba(26,35,126,0.2) 0%, rgba(9,11,16,1) 50%, rgba(212,175,55,0.05) 100%)" }}>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[#D4AF37] text-xs font-black uppercase tracking-widest mb-3">A Grande Oração</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight mb-10">Oração a São Miguel Arcanjo</h2>
          <div className="p-8 sm:p-10 rounded-3xl text-left relative overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.15)" }}>
            <div className="absolute -right-10 -bottom-10 text-[120px] opacity-[0.03] select-none pointer-events-none" style={{ color: "#D4AF37" }}>⚔️</div>
            <p className="text-white/80 leading-loose text-sm sm:text-base italic">
              São Miguel Arcanjo, defendei-nos no combate.<br />
              Sede nosso refúgio contra a perversidade e as ciladas do demônio.<br />
              Que Deus sobre ele impere, humildemente o pedimos.<br />
              E vós, Príncipe da Milícia Celestial,<br />
              pelo poder divino, precipitai no inferno Satanás e os outros espíritos malignos,<br />
              que andam pelo mundo para perder as almas.
            </p>
            <p className="mt-6 font-black text-sm uppercase tracking-widest" style={{ color: "#D4AF37" }}>Amém.</p>
          </div>
          <p className="text-white/30 text-xs mt-4">Oração composta pelo Papa Leão XIII (1886)</p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-6">⚔️</div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-4">Junte-se à <span style={{ color: "#D4AF37" }}>Milícia Celestial</span></h2>
          <p className="text-white/55 text-base sm:text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Assine o Contos de Oração e tenha acesso completo à Quaresma de São Miguel, além de toda a nossa biblioteca de vídeos, HQs e materiais católicos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/planos" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-base no-underline transition-all hover:scale-105" style={{ background: "linear-gradient(135deg,#D4AF37,#B8962E)", color: "#090B10", boxShadow: "0 8px 32px rgba(212,175,55,0.35)" }}>⚔️ Ver Planos e Assinar</Link>
            <Link href="/watch" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-base no-underline transition-all hover:bg-white/10" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }}>🎬 Explorar Vídeos</Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes shimmer { 0%{background-position:0% center} 100%{background-position:200% center} }
        @keyframes twinkle { 0%,100%{opacity:0.2;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.4)} }
      `}</style>
    </main>
  );
}
