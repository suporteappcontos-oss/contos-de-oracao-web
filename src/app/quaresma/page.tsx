"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";

const STORAGE_KEY = "quaresma_sao_miguel_2025";

/* ── 40 dias de oração ──────────────────────────────────────────────────── */
const DIAS = [
  { dia: 1,  data: "10 de agosto",     tema: "O Chamado do Arcanjo",            oracao: "São Miguel Arcanjo, eu me apresento diante de vós hoje, no primeiro dia desta sagrada jornada. Intercedei por mim diante do Trono de Deus. Purificai meu coração e preparai meu espírito para estes 40 dias de oração e conversão. Amém." },
  { dia: 2,  data: "11 de agosto",     tema: "Arrependimento Sincero",           oracao: "Senhor meu Deus, sob a proteção de São Miguel, venho com o coração contrito arrependido dos meus pecados. Perdoai minhas ofensas assim como eu perdoo a quem me ofendeu. Concedei-me a graça da verdadeira conversão. Amém." },
  { dia: 3,  data: "12 de agosto",     tema: "Purificação do Coração",           oracao: "São Miguel, vós que sois o protetor das almas, pedi ao Senhor que purifique meu coração de todo rancor, mágoa e impureza. Que o amor de Deus flua livremente em mim a partir deste dia. Amém." },
  { dia: 4,  data: "13 de agosto",     tema: "Fortaleza Interior",               oracao: "Príncipe da Milícia Celestial, concedei-me a fortaleza que só vem de Deus para enfrentar as batalhas do dia a dia. Que eu nunca me deixe vencer pelo desânimo ou pelo medo. Com vossa espada, cortai em mim toda fraqueza de alma. Amém." },
  { dia: 5,  data: "14 de agosto",     tema: "Véspera da Assunção",              oracao: "Em véspera da gloriosa Assunção de Nossa Senhora, peço que Maria e São Miguel intercadam juntos por mim. Que a Mãe de Deus me cubra com seu manto e me guie nesta quaresma espiritual. Amém." },
  { dia: 6,  data: "15 de agosto",     tema: "Assunção de Nossa Senhora",        oracao: "Gloriosa Virgem Maria, assumida em corpo e alma ao Céu, intercedei com São Miguel por nossa proteção. Neste dia santo, ofereço esta quaresma como ato de amor a Deus e devoção a vós. Amém." },
  { dia: 7,  data: "16 de agosto",     tema: "Fé Renovada",                      oracao: "Senhor, renova a minha fé neste sétimo dia. Que como São Miguel que nunca duvidou de Vós, eu também permaneça inabalável na certeza de que sois meu Deus e meu pastor. Amém." },
  { dia: 8,  data: "17 de agosto",     tema: "Escudo da Fé",                     oracao: "São Miguel, Arcanjo poderoso, cobri-me com vosso escudo celestial. Que o mal não encontre passagem em minha vida, em minha família e em minha casa. Guardai-nos sob vossas asas protetoras. Amém." },
  { dia: 9,  data: "18 de agosto",     tema: "Proteção da Família",              oracao: "Glorioso Arcanjo, estendei vosso manto protetor sobre minha família. Afastai de nós toda influência maligna, toda divisão e todo mal. Que Cristo reine em nosso lar como Senhor e Rei. Amém." },
  { dia: 10, data: "19 de agosto",     tema: "Combate Espiritual",               oracao: "São Miguel guerreiro, ensinai-me a combater espiritualmente com as armas da fé, da oração e do jejum. Que eu nunca baixe a guarda diante das tentações do mundo, da carne e do demônio. Amém." },
  { dia: 11, data: "20 de agosto",     tema: "Libertação dos Medos",             oracao: "Senhor Deus, pelo poder de São Miguel, liberai-me de todo medo que me impede de cumprir Vossa vontade. Que o vosso amor perfeito expulse todo temor do meu coração e me liberte para viver plenamente. Amém." },
  { dia: 12, data: "21 de agosto",     tema: "Proteção dos Filhos",              oracao: "São Miguel, guardião das almas inocentes, protegei nossas crianças e jovens das influências do mal. Que nossos filhos cresçam no amor a Deus e na prática das virtudes cristãs. Amém." },
  { dia: 13, data: "22 de agosto",     tema: "Rainha dos Anjos",                 oracao: "Rainha dos Anjos, Nossa Senhora que reina sobre São Miguel e toda a Milícia Celestial, intercedei por nós. Enviai vossos anjos para nos guardar em todos os nossos caminhos. Amém." },
  { dia: 14, data: "23 de agosto",     tema: "Armadura de Deus",                 oracao: "Senhor, ajudai-me a vestir cada dia a armadura de Deus: o cinto da verdade, a couraça da justiça, o escudo da fé e o elmo da salvação. São Miguel, guiai minhas mãos no combate espiritual. Amém." },
  { dia: 15, data: "24 de agosto",     tema: "Cura Interior",                    oracao: "Deus de misericórdia, pela intercessão de São Miguel, curai as feridas mais profundas do meu coração. Toda dor, toda rejeição, todo abandono: tudo entrego nas vossas mãos para ser curado pelo vosso amor infinito. Amém." },
  { dia: 16, data: "25 de agosto",     tema: "Libertação de Vícios",             oracao: "São Miguel, rogai por todos que lutam contra vícios e dependências. Pela espada de fogo do vosso poder, cortai as cadeias que aprisionam tantas almas. Que Cristo os liberte completamente hoje. Amém." },
  { dia: 17, data: "26 de agosto",     tema: "Cura dos Relacionamentos",         oracao: "Senhor, curai nossos relacionamentos feridos. Que onde houve traição, haja perdão. Que onde houve abandono, haja reconciliação. São Miguel, sede mediador da paz nas famílias. Amém." },
  { dia: 18, data: "27 de agosto",     tema: "Saúde e Cura Física",              oracao: "Deus que sois o grande médico, pela intercessão de São Miguel, dai saúde aos enfermos. Confortai os que sofrem, dai forças aos que estão fracos e esperança aos que estão desesperados. Amém." },
  { dia: 19, data: "28 de agosto",     tema: "Santo Agostinho",                  oracao: "Em memória de Santo Agostinho, que encontrou a Deus após longos anos de afastamento, peço que São Miguel interceda pelos que vivem longe de Vós. Que Vosso amor os alcance hoje, Senhor. Amém." },
  { dia: 20, data: "29 de agosto",     tema: "São João Batista",                 oracao: "São João Batista, que não temestes a morte por amor à verdade, intercedei por nós com São Miguel. Dai-nos coragem para testemunhar nossa fé em qualquer circunstância da vida. Amém." },
  { dia: 21, data: "30 de agosto",     tema: "Cura da Memória",                  oracao: "Senhor, curai as memórias dolorosas que ainda me perturbam. Pela proteção de São Miguel, que o vosso amor sele as feridas do passado e me liberte para viver plenamente o presente em Vós. Amém." },
  { dia: 22, data: "31 de agosto",     tema: "Perseverança",                     oracao: "São Miguel, que permanecestes fiel a Deus na grande batalha celestial, pedimos-vos perseverança. Que não nos cansemos de fazer o bem, mesmo quando os frutos tardarem a aparecer em nossas vidas. Amém." },
  { dia: 23, data: "1 de setembro",    tema: "Confiança em Deus",                oracao: "Senhor, aprendo com São Miguel que Vós sois o Senhor da história e da eternidade. Que eu confie completamente em Vós, mesmo quando não compreendo os Vossos caminhos misteriosos e sublimes. Amém." },
  { dia: 24, data: "2 de setembro",    tema: "Esperança Viva",                   oracao: "Deus da esperança, enchei-nos de toda alegria e paz na fé. São Miguel, intercessor dos desesperançados, alcançai do Senhor a graça de renovar nossa esperança a cada novo amanhecer. Amém." },
  { dia: 25, data: "3 de setembro",    tema: "Caridade",                         oracao: "Senhor do amor, derramai em nossos corações a caridade verdadeira que só Vós podeis dar. Que São Miguel nos inspire a sermos instrumentos Vossos para amar o próximo sem medida e sem condição. Amém." },
  { dia: 26, data: "4 de setembro",    tema: "Humildade",                        oracao: "Deus humilde que viestes ao mundo como um bebê em Belém, ensinai-me a humildade. São Miguel, que se prostrou diante de Deus dizendo Quem como Deus, sejais meu modelo de serviço humilde. Amém." },
  { dia: 27, data: "5 de setembro",    tema: "Mansidão",                         oracao: "Senhor manso e humilde de coração, dai-me a mansidão que transforma conflitos em paz e inimigos em amigos. São Miguel, que combateis com poder mas servitis com amor, intercedei por nós. Amém." },
  { dia: 28, data: "6 de setembro",    tema: "Paciência nas Provações",          oracao: "Senhor, ensinai-me a paciência de Jó. Que nas tribulações eu diga como ele: O Senhor deu, o Senhor tirou; seja bendito o nome do Senhor. São Miguel, fortalecei-me nas provas. Amém." },
  { dia: 29, data: "7 de setembro",    tema: "Nossa Senhora da Vitória",         oracao: "Nossa Senhora da Vitória, em véspera de vossa gloriosa Natividade, unimos nossa oração à de São Miguel. Que vossa vitória sobre o dragão seja também a nossa vitória sobre o pecado. Amém." },
  { dia: 30, data: "8 de setembro",    tema: "Natividade de Nossa Senhora",      oracao: "Feliz aniversário, Mãe! Neste dia de vossa Natividade, junto com São Miguel, cantamos vossas glórias. Que possamos imitar vossa pureza, fé e total entrega à vontade de Deus em cada momento. Amém." },
  { dia: 31, data: "9 de setembro",    tema: "Prudência e Sabedoria",            oracao: "Espírito Santo, fonte de toda sabedoria, concedei-nos a prudência para discernir a vontade de Deus em cada situação. São Miguel, modelo de sabedoria angélica, guiai nossas decisões diárias. Amém." },
  { dia: 32, data: "10 de setembro",   tema: "Justiça",                          oracao: "Deus justo e misericordioso, dai-nos a virtude da justiça para dar a cada um o que lhe é devido. São Miguel, patrono da justiça divina, intercedei pelos que sofrem injustiças no mundo. Amém." },
  { dia: 33, data: "11 de setembro",   tema: "Fortaleza das Virtudes",           oracao: "Deus todo-poderoso, que destes força ao arcanjo São Miguel para vencer Satanás, dai-me também fortaleza para vencer meus próprios pecados e vícios. Que eu seja mais forte do que minhas fraquezas. Amém." },
  { dia: 34, data: "12 de setembro",   tema: "O Santo Nome de Maria",            oracao: "Santíssimo Nome de Maria, que os demônios tremem ao ouvi-lo! Com São Miguel, invocamos vosso nome sobre nossas vidas, famílias e nações. Que a vossa presença afugente todo o mal. Amém." },
  { dia: 35, data: "13 de setembro",   tema: "Santidade dos Sacerdotes",         oracao: "Senhor, pela intercessão de São Miguel guardião da Igreja, santificai vossos sacerdotes. Que sirvam com fidelidade, anunciem a verdade com coragem e sejam pastores segundo Vosso coração. Amém." },
  { dia: 36, data: "14 de setembro",   tema: "Exaltação da Santa Cruz",          oracao: "Glorioso Sinal da Cruz, que São Miguel venera diante do Trono de Deus! Hoje contemplamos o preço da nossa redenção. Pela Cruz de Cristo e por São Miguel, renunciamos ao diabo e a todas as suas obras. Amém." },
  { dia: 37, data: "15 de setembro",   tema: "Nossa Senhora das Dores",          oracao: "Mãe Dolorosa, que sofrestes junto à Cruz do vosso Filho, sede nossa intercessora neste penúltimo trecho da jornada. Com São Miguel, oferecemos nossos sofrimentos unidos aos de Cristo. Amém." },
  { dia: 38, data: "16 de setembro",   tema: "Coragem dos Mártires",             oracao: "Santos mártires que derrastes vosso sangue pela fé, intercedei por nós com São Miguel. Que tenhamos coragem para professarmos nossa fé abertamente em qualquer situação da vida. Amém." },
  { dia: 39, data: "17 de setembro",   tema: "Conformação com Cristo",           oracao: "São Francisco que recebestes os estigmas de Cristo, intercedei com São Miguel por nossa total conformidade com Jesus. Que carreguemos nossa cruz diária com amor e alegria filial. Amém." },
  { dia: 40, data: "18 de setembro",   tema: "Consagração Final ao Arcanjo",     oracao: "São Miguel Arcanjo, Príncipe da Milícia Celestial, completamos estes 40 dias de jornada espiritual ao vosso lado. Hoje nos consagramos completamente à vossa proteção. Que a vossa espada nos defenda. Que a vossa luz nos ilumine. Que o vosso poder nos guie até a presença de Deus na eternidade. Ahora e na hora de nossa morte. Amém." },
];

type DayEntry = typeof DIAS[0];

/* ── helpers ─────────────────────────────────────────────────────────────── */
function loadProgress(): number[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveProgress(days: number[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(days)); } catch {}
}

/* ── componente de partículas mágicas ───────────────────────────────────── */
function MagicBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const sparks = ["✨","⭐","🌟","✦","★","✧","⚡","🔥"];
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible", zIndex: 50 }}>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * 360;
        const distance = 60 + Math.random() * 40;
        const emoji = sparks[i % sparks.length];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              fontSize: `${12 + Math.random() * 10}px`,
              animation: `burst 0.9s ease-out forwards`,
              animationDelay: `${i * 0.04}s`,
              ["--angle" as string]: `${angle}deg`,
              ["--dist" as string]: `${distance}px`,
            }}
          >
            {emoji}
          </div>
        );
      })}
    </div>
  );
}

/* ── componente principal ────────────────────────────────────────────────── */
export default function QuaresmaPage() {
  const [completed, setCompleted] = useState<number[]>([]);
  const [celebrating, setCelebrating] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const dayRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    const saved = loadProgress();
    setCompleted(saved);
    const cur = saved.length + 1;
    setExpanded(cur <= 40 ? cur : 40);
    setMounted(true);
  }, []);

  const currentDay = completed.length < 40 ? completed.length + 1 : 41;
  const isCompleted = (d: number) => completed.includes(d);
  const isLocked    = (d: number) => d > currentDay;
  const isCurrent   = (d: number) => d === currentDay;

  const handleComplete = (dayNum: number) => {
    if (isCompleted(dayNum) || isLocked(dayNum) || celebrating !== null) return;
    const newCompleted = [...new Set([...completed, dayNum])].sort((a, b) => a - b);
    setCompleted(newCompleted);
    saveProgress(newCompleted);
    setCelebrating(dayNum);
    setTimeout(() => {
      setCelebrating(null);
      if (dayNum < 40) {
        setExpanded(dayNum + 1);
        setTimeout(() => {
          const el = dayRefs.current[dayNum + 1];
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    }, 2200);
  };

  const progress = (completed.length / 40) * 100;

  return (
    <main style={{ minHeight: "100vh", background: "#090B10", fontFamily: "Outfit, sans-serif", color: "#fff" }}>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div className="hero-bg" style={{ textAlign: "center", position: "relative" }}>
        <div className="hero-overlay" />
        
        <div className="hero-content" style={{ paddingTop: "80px", paddingBottom: "40px" }}>
          {/* Badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 16px", borderRadius: "999px", background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.3)", marginBottom: "16px" }}>
            <span>⚔️</span>
            <span style={{ color: "#D4AF37", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>10 de agosto · São Miguel Arcanjo</span>
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", fontWeight: 900, margin: "0 0 8px", background: "linear-gradient(135deg,#fff 0%,#D4AF37 50%,#fff 100%)", backgroundSize: "200% auto", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 4s linear infinite" }}>
            Quaresma
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(0.85rem, 2vw, 1rem)", margin: "0 auto 32px", maxWidth: "420px", lineHeight: 1.6, padding: "0 16px" }}>
            40 dias de oração e consagração ao Príncipe da Milícia Celestial
          </p>

          {/* ── Progresso ── */}
          {mounted && (
            <div style={{ maxWidth: "320px", margin: "0 auto", padding: "0 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>Progresso</span>
                <span style={{ fontSize: "12px", color: "#D4AF37", fontWeight: 800 }}>{completed.length}/40 dias</span>
              </div>
              <div style={{ height: "8px", borderRadius: "999px", background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: "999px", width: `${progress}%`, background: "linear-gradient(90deg,#B8962E,#D4AF37)", transition: "width 0.8s ease" }} />
              </div>
              {completed.length === 40 && (
                <p style={{ color: "#D4AF37", fontSize: "13px", fontWeight: 800, marginTop: "12px", textAlign: "center" }}>🏆 Quaresma concluída! São Miguel está com você!</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── LISTA DOS 40 DIAS ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "16px 16px 80px" }}>
        {DIAS.map((d: DayEntry) => {
          const done = mounted && isCompleted(d.dia);
          const locked = mounted && isLocked(d.dia);
          const current = mounted && isCurrent(d.dia);
          const isExpanded = expanded === d.dia;
          const isCelebrating = celebrating === d.dia;

          return (
            <div
              key={d.dia}
              id={`dia-${d.dia}`}
              ref={(el) => { dayRefs.current[d.dia] = el; }}
              style={{
                marginBottom: "8px",
                borderRadius: "16px",
                border: isCelebrating
                  ? "1px solid #D4AF37"
                  : done
                  ? "1px solid rgba(212,175,55,0.25)"
                  : current
                  ? "1px solid rgba(212,175,55,0.4)"
                  : locked
                  ? "1px solid rgba(255,255,255,0.04)"
                  : "1px solid rgba(255,255,255,0.06)",
                background: isCelebrating
                  ? "rgba(212,175,55,0.12)"
                  : done
                  ? "rgba(212,175,55,0.05)"
                  : current
                  ? "rgba(212,175,55,0.07)"
                  : locked
                  ? "rgba(255,255,255,0.015)"
                  : "rgba(255,255,255,0.03)",
                opacity: locked ? 0.45 : 1,
                transition: "all 0.4s ease",
                position: "relative",
                overflow: "hidden",
                boxShadow: isCelebrating ? "0 0 40px rgba(212,175,55,0.4)" : current ? "0 4px 20px rgba(212,175,55,0.1)" : "none",
                animation: isCelebrating ? "cardPulse 0.4s ease" : "none",
              }}
            >
              {/* Partículas mágicas */}
              <MagicBurst active={isCelebrating} />

              {/* Cabeçalho do card */}
              <button
                onClick={() => !locked && setExpanded(isExpanded ? null : d.dia)}
                disabled={locked}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "12px",
                  padding: "14px 16px", background: "transparent", border: "none",
                  cursor: locked ? "not-allowed" : "pointer", textAlign: "left",
                }}
              >
                {/* Ícone de status */}
                <div style={{
                  width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: done ? "16px" : "13px", fontWeight: 900,
                  background: done ? "rgba(212,175,55,0.2)" : current ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.05)",
                  color: done ? "#D4AF37" : current ? "#D4AF37" : "rgba(255,255,255,0.3)",
                }}>
                  {done ? "✓" : locked ? "🔒" : d.dia}
                </div>

                {/* Texto */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: "14px", fontWeight: 800, color: done ? "#D4AF37" : locked ? "rgba(255,255,255,0.3)" : "#fff",
                    textDecoration: done ? "none" : "none",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {done && <span style={{ marginRight: "6px" }}>✨</span>}{d.tema}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "2px", fontWeight: 600 }}>
                    Dia {d.dia} · {d.data}
                  </div>
                </div>

                {/* Chevron */}
                {!locked && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={done ? "#D4AF37" : "rgba(255,255,255,0.3)"} strokeWidth="2.5" style={{ flexShrink: 0, transform: isExpanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
              </button>

              {/* Conteúdo expandido */}
              {isExpanded && !locked && (
                <div style={{ padding: "0 16px 16px" }}>
                  {/* Oração */}
                  <div style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px", padding: "16px", marginBottom: "16px",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                      <span style={{ fontSize: "14px" }}>🙏</span>
                      <span style={{ fontSize: "11px", color: "#D4AF37", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Oração do Dia</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "14px", lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>
                      {d.oracao}
                    </p>
                  </div>

                  {/* Botão Concluir */}
                  {!done && (
                    <button
                      onClick={() => handleComplete(d.dia)}
                      disabled={celebrating !== null}
                      style={{
                        width: "100%", padding: "14px", borderRadius: "12px", border: "none",
                        background: celebrating !== null ? "rgba(212,175,55,0.3)" : "linear-gradient(135deg,#D4AF37,#B8962E)",
                        color: "#090B10", fontWeight: 900, fontSize: "14px", cursor: celebrating !== null ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                        transition: "all 0.3s", fontFamily: "Outfit, sans-serif",
                        boxShadow: "0 4px 20px rgba(212,175,55,0.3)",
                      }}
                    >
                      <span>✓</span>
                      <span>Concluir este Dia</span>
                    </button>
                  )}

                  {done && (
                    <div style={{
                      width: "100%", padding: "12px", borderRadius: "12px",
                      background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    }}>
                      <span style={{ fontSize: "16px" }}>🌟</span>
                      <span style={{ color: "#D4AF37", fontWeight: 800, fontSize: "13px" }}>Dia concluído! São Miguel te abençoa!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Link de volta */}
        <div style={{ textAlign: "center", marginTop: "32px" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", textDecoration: "none", fontWeight: 600 }}>
            ← Voltar para o início
          </Link>
        </div>
      </div>

      {/* ── CSS ANIMATIONS E RESPONSIVIDADE ─────────────────────────────────── */}
      <style>{`
        .hero-bg {
          background-image: url('https://placehold.co/1920x1080/090B10/D4AF37?text=Imagem+PC+(16:9)');
          background-size: cover;
          background-position: center;
          background-attachment: fixed;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(9,11,16,0.3) 0%, rgba(9,11,16,0.8) 60%, #090B10 100%);
          z-index: 0;
        }
        .hero-content {
          position: relative;
          z-index: 1;
        }
        @media (max-width: 768px) {
          .hero-bg {
            background-image: url('https://placehold.co/1080x1920/090B10/D4AF37?text=Imagem+Celular+(9:16)');
            background-attachment: scroll;
          }
        }
        @keyframes shimmer {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes burst {
          0%   { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(1); opacity: 1; }
          60%  { opacity: 1; }
          100% { transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--dist)) scale(0.3); opacity: 0; }
        }
        @keyframes cardPulse {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.02); }
          60%  { transform: scale(0.99); }
          100% { transform: scale(1); }
        }
      `}</style>
    </main>
  );
}
