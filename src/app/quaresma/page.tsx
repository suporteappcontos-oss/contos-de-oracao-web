
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check } from "lucide-react";

/* ── FUNÇÕES DE DATAS ──────────────────────────────────────────────────────── */

// Retorna data da Páscoa (Algoritmo de Meeus/Jones/Butcher)
function getEasterDate(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month, day);
}

function getQuaresmasForYear(year: number) {
  const easter = getEasterDate(year);
  
  const ashWednesday = new Date(easter);
  ashWednesday.setDate(easter.getDate() - 46);
  
  const holySaturday = new Date(easter);
  holySaturday.setDate(easter.getDate() - 1);

  return [
    {
      id: "pascoa",
      name: "Quaresma (Páscoa)",
      color: "#8E44AD", 
      start: ashWednesday,
      end: holySaturday,
    },
    {
      id: "sao-miguel",
      name: "Quaresma de São Miguel",
      color: "#D4AF37", 
      start: new Date(year, 7, 15), // 15 Ago
      end: new Date(year, 8, 29),   // 29 Set
    },
    {
      id: "advento",
      name: "Advento (São Martinho)",
      color: "#2980B9", 
      start: new Date(year, 10, 12), // 12 Nov
      end: new Date(year, 11, 24),   // 24 Dez
    }
  ];
}

/* ── TEXTOS E ORAÇÕES ──────────────────────────────────────────────────────── */

const ORACOES_SAO_MIGUEL = [
  {
    "tema": "O Chamado do Arcanjo",
    "oracao": "S\u00e3o Miguel Arcanjo, eu me apresento diante de v\u00f3s hoje, no primeiro dia desta sagrada jornada. Intercedei por mim diante do Trono de Deus. Purificai meu cora\u00e7\u00e3o e preparai meu esp\u00edrito para estes 40 dias de ora\u00e7\u00e3o e convers\u00e3o. Am\u00e9m."
  },
  {
    "tema": "Arrependimento Sincero",
    "oracao": "Senhor meu Deus, sob a prote\u00e7\u00e3o de S\u00e3o Miguel, venho com o cora\u00e7\u00e3o contrito arrependido dos meus pecados. Perdoai minhas ofensas assim como eu perdoo a quem me ofendeu. Concedei-me a gra\u00e7a da verdadeira convers\u00e3o. Am\u00e9m."
  },
  {
    "tema": "Purifica\u00e7\u00e3o do Cora\u00e7\u00e3o",
    "oracao": "S\u00e3o Miguel, v\u00f3s que sois o protetor das almas, pedi ao Senhor que purifique meu cora\u00e7\u00e3o de todo rancor, m\u00e1goa e impureza. Que o amor de Deus flua livremente em mim a partir deste dia. Am\u00e9m."
  },
  {
    "tema": "Fortaleza Interior",
    "oracao": "Pr\u00edncipe da Mil\u00edcia Celestial, concedei-me a fortaleza que s\u00f3 vem de Deus para enfrentar as batalhas do dia a dia. Que eu nunca me deixe vencer pelo des\u00e2nimo ou pelo medo. Com vossa espada, cortai em mim toda fraqueza de alma. Am\u00e9m."
  },
  {
    "tema": "V\u00e9spera da Assun\u00e7\u00e3o",
    "oracao": "Em v\u00e9spera da gloriosa Assun\u00e7\u00e3o de Nossa Senhora, pe\u00e7o que Maria e S\u00e3o Miguel intercadam juntos por mim. Que a M\u00e3e de Deus me cubra com seu manto e me guie nesta quaresma espiritual. Am\u00e9m."
  },
  {
    "tema": "Assun\u00e7\u00e3o de Nossa Senhora",
    "oracao": "Gloriosa Virgem Maria, assumida em corpo e alma ao C\u00e9u, intercedei com S\u00e3o Miguel por nossa prote\u00e7\u00e3o. Neste dia santo, ofere\u00e7o esta quaresma como ato de amor a Deus e devo\u00e7\u00e3o a v\u00f3s. Am\u00e9m."
  },
  {
    "tema": "F\u00e9 Renovada",
    "oracao": "Senhor, renova a minha f\u00e9 neste s\u00e9timo dia. Que como S\u00e3o Miguel que nunca duvidou de V\u00f3s, eu tamb\u00e9m permane\u00e7a inabal\u00e1vel na certeza de que sois meu Deus e meu pastor. Am\u00e9m."
  },
  {
    "tema": "Escudo da F\u00e9",
    "oracao": "S\u00e3o Miguel, Arcanjo poderoso, cobri-me com vosso escudo celestial. Que o mal n\u00e3o encontre passagem em minha vida, em minha fam\u00edlia e em minha casa. Guardai-nos sob vossas asas protetoras. Am\u00e9m."
  },
  {
    "tema": "Prote\u00e7\u00e3o da Fam\u00edlia",
    "oracao": "Glorioso Arcanjo, estendei vosso manto protetor sobre minha fam\u00edlia. Afastai de n\u00f3s toda influ\u00eancia maligna, toda divis\u00e3o e todo mal. Que Cristo reine em nosso lar como Senhor e Rei. Am\u00e9m."
  },
  {
    "tema": "Combate Espiritual",
    "oracao": "S\u00e3o Miguel guerreiro, ensinai-me a combater espiritualmente com as armas da f\u00e9, da ora\u00e7\u00e3o e do jejum. Que eu nunca baixe a guarda diante das tenta\u00e7\u00f5es do mundo, da carne e do dem\u00f4nio. Am\u00e9m."
  },
  {
    "tema": "Liberta\u00e7\u00e3o dos Medos",
    "oracao": "Senhor Deus, pelo poder de S\u00e3o Miguel, liberai-me de todo medo que me impede de cumprir Vossa vontade. Que o vosso amor perfeito expulse todo temor do meu cora\u00e7\u00e3o e me liberte para viver plenamente. Am\u00e9m."
  },
  {
    "tema": "Prote\u00e7\u00e3o dos Filhos",
    "oracao": "S\u00e3o Miguel, guardi\u00e3o das almas inocentes, protegei nossas crian\u00e7as e jovens das influ\u00eancias do mal. Que nossos filhos cres\u00e7am no amor a Deus e na pr\u00e1tica das virtudes crist\u00e3s. Am\u00e9m."
  },
  {
    "tema": "Rainha dos Anjos",
    "oracao": "Rainha dos Anjos, Nossa Senhora que reina sobre S\u00e3o Miguel e toda a Mil\u00edcia Celestial, intercedei por n\u00f3s. Enviai vossos anjos para nos guardar em todos os nossos caminhos. Am\u00e9m."
  },
  {
    "tema": "Armadura de Deus",
    "oracao": "Senhor, ajudai-me a vestir cada dia a armadura de Deus: o cinto da verdade, a coura\u00e7a da justi\u00e7a, o escudo da f\u00e9 e o elmo da salva\u00e7\u00e3o. S\u00e3o Miguel, guiai minhas m\u00e3os no combate espiritual. Am\u00e9m."
  },
  {
    "tema": "Cura Interior",
    "oracao": "Deus de miseric\u00f3rdia, pela intercess\u00e3o de S\u00e3o Miguel, curai as feridas mais profundas do meu cora\u00e7\u00e3o. Toda dor, toda rejei\u00e7\u00e3o, todo abandono: tudo entrego nas vossas m\u00e3os para ser curado pelo vosso amor infinito. Am\u00e9m."
  },
  {
    "tema": "Liberta\u00e7\u00e3o de V\u00edcios",
    "oracao": "S\u00e3o Miguel, rogai por todos que lutam contra v\u00edcios e depend\u00eancias. Pela espada de fogo do vosso poder, cortai as cadeias que aprisionam tantas almas. Que Cristo os liberte completamente hoje. Am\u00e9m."
  },
  {
    "tema": "Cura dos Relacionamentos",
    "oracao": "Senhor, curai nossos relacionamentos feridos. Que onde houve trai\u00e7\u00e3o, haja perd\u00e3o. Que onde houve abandono, haja reconcilia\u00e7\u00e3o. S\u00e3o Miguel, sede mediador da paz nas fam\u00edlias. Am\u00e9m."
  },
  {
    "tema": "Sa\u00fade e Cura F\u00edsica",
    "oracao": "Deus que sois o grande m\u00e9dico, pela intercess\u00e3o de S\u00e3o Miguel, dai sa\u00fade aos enfermos. Confortai os que sofrem, dai for\u00e7as aos que est\u00e3o fracos e esperan\u00e7a aos que est\u00e3o desesperados. Am\u00e9m."
  },
  {
    "tema": "Santo Agostinho",
    "oracao": "Em mem\u00f3ria de Santo Agostinho, que encontrou a Deus ap\u00f3s longos anos de afastamento, pe\u00e7o que S\u00e3o Miguel interceda pelos que vivem longe de V\u00f3s. Que Vosso amor os alcance hoje, Senhor. Am\u00e9m."
  },
  {
    "tema": "S\u00e3o Jo\u00e3o Batista",
    "oracao": "S\u00e3o Jo\u00e3o Batista, que n\u00e3o temestes a morte por amor \u00e0 verdade, intercedei por n\u00f3s com S\u00e3o Miguel. Dai-nos coragem para testemunhar nossa f\u00e9 em qualquer circunst\u00e2ncia da vida. Am\u00e9m."
  },
  {
    "tema": "Cura da Mem\u00f3ria",
    "oracao": "Senhor, curai as mem\u00f3rias dolorosas que ainda me perturbam. Pela prote\u00e7\u00e3o de S\u00e3o Miguel, que o vosso amor sele as feridas do passado e me liberte para viver plenamente o presente em V\u00f3s. Am\u00e9m."
  },
  {
    "tema": "Perseveran\u00e7a",
    "oracao": "S\u00e3o Miguel, que permanecestes fiel a Deus na grande batalha celestial, pedimos-vos perseveran\u00e7a. Que n\u00e3o nos cansemos de fazer o bem, mesmo quando os frutos tardarem a aparecer em nossas vidas. Am\u00e9m."
  },
  {
    "tema": "Confian\u00e7a em Deus",
    "oracao": "Senhor, aprendo com S\u00e3o Miguel que V\u00f3s sois o Senhor da hist\u00f3ria e da eternidade. Que eu confie completamente em V\u00f3s, mesmo quando n\u00e3o compreendo os Vossos caminhos misteriosos e sublimes. Am\u00e9m."
  },
  {
    "tema": "Esperan\u00e7a Viva",
    "oracao": "Deus da esperan\u00e7a, enchei-nos de toda alegria e paz na f\u00e9. S\u00e3o Miguel, intercessor dos desesperan\u00e7ados, alcan\u00e7ai do Senhor a gra\u00e7a de renovar nossa esperan\u00e7a a cada novo amanhecer. Am\u00e9m."
  },
  {
    "tema": "Caridade",
    "oracao": "Senhor do amor, derramai em nossos cora\u00e7\u00f5es a caridade verdadeira que s\u00f3 V\u00f3s podeis dar. Que S\u00e3o Miguel nos inspire a sermos instrumentos Vossos para amar o pr\u00f3ximo sem medida e sem condi\u00e7\u00e3o. Am\u00e9m."
  },
  {
    "tema": "Humildade",
    "oracao": "Deus humilde que viestes ao mundo como um beb\u00ea em Bel\u00e9m, ensinai-me a humildade. S\u00e3o Miguel, que se prostrou diante de Deus dizendo Quem como Deus, sejais meu modelo de servi\u00e7o humilde. Am\u00e9m."
  },
  {
    "tema": "Mansid\u00e3o",
    "oracao": "Senhor manso e humilde de cora\u00e7\u00e3o, dai-me a mansid\u00e3o que transforma conflitos em paz e inimigos em amigos. S\u00e3o Miguel, que combateis com poder mas servitis com amor, intercedei por n\u00f3s. Am\u00e9m."
  },
  {
    "tema": "Paci\u00eancia nas Prova\u00e7\u00f5es",
    "oracao": "Senhor, ensinai-me a paci\u00eancia de J\u00f3. Que nas tribula\u00e7\u00f5es eu diga como ele: O Senhor deu, o Senhor tirou; seja bendito o nome do Senhor. S\u00e3o Miguel, fortalecei-me nas provas. Am\u00e9m."
  },
  {
    "tema": "Nossa Senhora da Vit\u00f3ria",
    "oracao": "Nossa Senhora da Vit\u00f3ria, em v\u00e9spera de vossa gloriosa Natividade, unimos nossa ora\u00e7\u00e3o \u00e0 de S\u00e3o Miguel. Que vossa vit\u00f3ria sobre o drag\u00e3o seja tamb\u00e9m a nossa vit\u00f3ria sobre o pecado. Am\u00e9m."
  },
  {
    "tema": "Natividade de Nossa Senhora",
    "oracao": "Feliz anivers\u00e1rio, M\u00e3e! Neste dia de vossa Natividade, junto com S\u00e3o Miguel, cantamos vossas gl\u00f3rias. Que possamos imitar vossa pureza, f\u00e9 e total entrega \u00e0 vontade de Deus em cada momento. Am\u00e9m."
  },
  {
    "tema": "Prud\u00eancia e Sabedoria",
    "oracao": "Esp\u00edrito Santo, fonte de toda sabedoria, concedei-nos a prud\u00eancia para discernir a vontade de Deus em cada situa\u00e7\u00e3o. S\u00e3o Miguel, modelo de sabedoria ang\u00e9lica, guiai nossas decis\u00f5es di\u00e1rias. Am\u00e9m."
  },
  {
    "tema": "Justi\u00e7a",
    "oracao": "Deus justo e misericordioso, dai-nos a virtude da justi\u00e7a para dar a cada um o que lhe \u00e9 devido. S\u00e3o Miguel, patrono da justi\u00e7a divina, intercedei pelos que sofrem injusti\u00e7as no mundo. Am\u00e9m."
  },
  {
    "tema": "Fortaleza das Virtudes",
    "oracao": "Deus todo-poderoso, que destes for\u00e7a ao arcanjo S\u00e3o Miguel para vencer Satan\u00e1s, dai-me tamb\u00e9m fortaleza para vencer meus pr\u00f3prios pecados e v\u00edcios. Que eu seja mais forte do que minhas fraquezas. Am\u00e9m."
  },
  {
    "tema": "O Santo Nome de Maria",
    "oracao": "Sant\u00edssimo Nome de Maria, que os dem\u00f4nios tremem ao ouvi-lo! Com S\u00e3o Miguel, invocamos vosso nome sobre nossas vidas, fam\u00edlias e na\u00e7\u00f5es. Que a vossa presen\u00e7a afugente todo o mal. Am\u00e9m."
  },
  {
    "tema": "Santidade dos Sacerdotes",
    "oracao": "Senhor, pela intercess\u00e3o de S\u00e3o Miguel guardi\u00e3o da Igreja, santificai vossos sacerdotes. Que sirvam com fidelidade, anunciem a verdade com coragem e sejam pastores segundo Vosso cora\u00e7\u00e3o. Am\u00e9m."
  },
  {
    "tema": "Exalta\u00e7\u00e3o da Santa Cruz",
    "oracao": "Glorioso Sinal da Cruz, que S\u00e3o Miguel venera diante do Trono de Deus! Hoje contemplamos o pre\u00e7o da nossa reden\u00e7\u00e3o. Pela Cruz de Cristo e por S\u00e3o Miguel, renunciamos ao diabo e a todas as suas obras. Am\u00e9m."
  },
  {
    "tema": "Nossa Senhora das Dores",
    "oracao": "M\u00e3e Dolorosa, que sofrestes junto \u00e0 Cruz do vosso Filho, sede nossa intercessora neste pen\u00faltimo trecho da jornada. Com S\u00e3o Miguel, oferecemos nossos sofrimentos unidos aos de Cristo. Am\u00e9m."
  },
  {
    "tema": "Coragem dos M\u00e1rtires",
    "oracao": "Santos m\u00e1rtires que derrastes vosso sangue pela f\u00e9, intercedei por n\u00f3s com S\u00e3o Miguel. Que tenhamos coragem para professarmos nossa f\u00e9 abertamente em qualquer situa\u00e7\u00e3o da vida. Am\u00e9m."
  },
  {
    "tema": "Conforma\u00e7\u00e3o com Cristo",
    "oracao": "S\u00e3o Francisco que recebestes os estigmas de Cristo, intercedei com S\u00e3o Miguel por nossa total conformidade com Jesus. Que carreguemos nossa cruz di\u00e1ria com amor e alegria filial. Am\u00e9m."
  },
  {
    "tema": "Consagra\u00e7\u00e3o Final ao Arcanjo",
    "oracao": "S\u00e3o Miguel Arcanjo, Pr\u00edncipe da Mil\u00edcia Celestial, completamos estes 40 dias de jornada espiritual ao vosso lado. Hoje nos consagramos completamente \u00e0 vossa prote\u00e7\u00e3o. Que a vossa espada nos defenda. Que a vossa luz nos ilumine. Que o vosso poder nos guie at\u00e9 a presen\u00e7a de Deus na eternidade. Ahora e na hora de nossa morte. Am\u00e9m."
  }
];

function getPrayerForDay(quaresmaId: string, dayIndex: number) {
  if (quaresmaId === "sao-miguel") {
    return ORACOES_SAO_MIGUEL[dayIndex] || { tema: "Em breve", oracao: "As orações para este dia serão adicionadas em breve." };
  }
  return { tema: "Em breve", oracao: `As orações para o dia ${dayIndex + 1} desta quaresma estarão disponíveis em breve.` };
}

/* ── STORAGE HELPERS ─────────────────────────────────────────────────────── */
const getStorageKey = (date: Date, quaresmaId: string) => {
  return `quaresma_${quaresmaId}_${date.getFullYear()}_${date.getMonth()}_${date.getDate()}`;
}

const isDayCompleted = (date: Date, quaresmaId: string) => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(getStorageKey(date, quaresmaId) + "_done") === "true";
}

const completeDay = (date: Date, quaresmaId: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(date, quaresmaId) + "_done", "true");
}

const loadRelato = (date: Date, quaresmaId: string) => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(getStorageKey(date, quaresmaId) + "_relato") || "";
}

const saveRelato = (date: Date, quaresmaId: string, texto: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(date, quaresmaId) + "_relato", texto);
}

/* ── COMPONENTE PRINCIPAL ────────────────────────────────────────────────── */

export default function QuaresmaCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeQuaresma, setActiveQuaresma] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0); // Para forçar re-render do calendário

  useEffect(() => {
    setMounted(true);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const quaresmas = getQuaresmasForYear(year);

  // Calcula dias do mês
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // Função para verificar se um dia pertence a alguma quaresma
  const getQuaresmaForDate = (date: Date) => {
    return quaresmas.find(q => {
      const d = new Date(date);
      d.setHours(0,0,0,0);
      const start = new Date(q.start); start.setHours(0,0,0,0);
      const end = new Date(q.end); end.setHours(23,59,59,999);
      return d >= start && d <= end;
    });
  };

  const getDayIndex = (date: Date, start: Date) => {
    const diffTime = Math.abs(date.getTime() - start.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // Função para lidar com a abertura do modal
  const handleDayClick = (dayNum: number, quaresma: any) => {
    if (!quaresma) return;
    const clickedDate = new Date(year, month, dayNum);
    
    // Bloquear dias futuros se a quaresma for no passado? Não, deixa livre para ver.
    setSelectedDate(clickedDate);
    setActiveQuaresma(quaresma);
  };

  const handleComplete = () => {
    if (selectedDate && activeQuaresma) {
      completeDay(selectedDate, activeQuaresma.id);
      setUpdateTrigger(prev => prev + 1); // Força atualização do ícone na grade
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#090B10", fontFamily: "Outfit, sans-serif", color: "#fff", paddingBottom: "80px" }}>
      
      {/* ── HEADER MENSAL ──────────────────────────────────────────────────────── */}
      <div style={{ padding: "32px 16px", textAlign: "center", background: "linear-gradient(180deg, rgba(212,175,55,0.05) 0%, transparent 100%)" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "8px", background: "linear-gradient(135deg,#fff 0%,#D4AF37 50%,#fff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Calendário Católico
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: "0 auto 24px", maxWidth: "400px" }}>
          Acompanhe o tempo litúrgico e suas orações diárias.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", marginTop: "24px" }}>
          <button onClick={prevMonth} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>
            <ChevronLeft size={20} />
          </button>
          <div style={{ width: "200px", fontSize: "20px", fontWeight: 700, textTransform: "capitalize", color: "#D4AF37", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <CalendarIcon size={18} />
            {monthNames[month]} {year}
          </div>
          <button onClick={nextMonth} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer" }}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* ── LEGENDA DE QUARESMAS ATIVAS ────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", padding: "0 16px 24px" }}>
        {quaresmas.filter(q => q.start.getMonth() === month || q.end.getMonth() === month || (q.start.getMonth() < month && q.end.getMonth() > month)).map(q => (
          <div key={q.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", background: "rgba(255,255,255,0.03)", padding: "4px 12px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: q.color }} />
            {q.name}
          </div>
        ))}
      </div>

      {/* ── GRID DO CALENDÁRIO ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "8px" }}>
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
            <div key={day} style={{ textAlign: "center", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
          {/* Espaços vazios no início do mês */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {/* Dias do mês */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const date = new Date(year, month, dayNum);
            const quaresma = getQuaresmaForDate(date);
            const isToday = new Date().toDateString() === date.toDateString();
            
            // Re-render check based on updateTrigger state
            const done = mounted && quaresma ? isDayCompleted(date, quaresma.id) : false;

            return (
              <button
                key={dayNum}
                onClick={() => handleDayClick(dayNum, quaresma)}
                disabled={!quaresma}
                style={{
                  aspectRatio: "1",
                  borderRadius: "12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: quaresma ? `${quaresma.color}15` : "rgba(255,255,255,0.02)", // Hex opacity 15
                  border: isToday ? "2px solid #fff" : quaresma ? `1px solid ${quaresma.color}50` : "1px solid rgba(255,255,255,0.05)",
                  color: quaresma ? quaresma.color : "rgba(255,255,255,0.3)",
                  cursor: quaresma ? "pointer" : "default",
                  opacity: quaresma ? 1 : 0.5,
                  position: "relative",
                  transition: "all 0.2s"
                }}
              >
                <span style={{ fontSize: "16px", fontWeight: 700 }}>{dayNum}</span>
                {done && quaresma && (
                  <div style={{ position: "absolute", top: "4px", right: "4px", color: quaresma.color }}>
                    <Check size={12} strokeWidth={4} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: "48px" }}>
        <Link href="/" style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", textDecoration: "none", fontWeight: 600 }}>
          ← Voltar para o início
        </Link>
      </div>

      {/* ── MODAL DE ORAÇÃO ────────────────────────────────────────────────────── */}
      {selectedDate && activeQuaresma && (() => {
        const dayIndex = getDayIndex(selectedDate, activeQuaresma.start);
        const prayer = getPrayerForDay(activeQuaresma.id, dayIndex);
        const done = isDayCompleted(selectedDate, activeQuaresma.id);

        return (
          <div style={{
            position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease"
          }}>
            <div style={{
              background: "#111520", border: `1px solid ${activeQuaresma.color}40`, borderRadius: "20px",
              width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", position: "relative",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)", animation: "slideUp 0.3s ease",
            }}>
              <button 
                onClick={() => setSelectedDate(null)}
                style={{
                  position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.1)", border: "none",
                  width: "32px", height: "32px", borderRadius: "16px", color: "#fff", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", zIndex: 10
                }}
              >
                <X size={16} />
              </button>

              <div style={{ padding: "32px 24px", position: "relative" }}>
                
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: `${activeQuaresma.color}15`, padding: "4px 12px", borderRadius: "999px", color: activeQuaresma.color, fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                    {activeQuaresma.name}
                  </div>
                  <h2 style={{ fontSize: "22px", fontWeight: 900, margin: 0, color: "#fff" }}>
                    {done && <span style={{ marginRight: "8px" }}>✨</span>}
                    {prayer.tema}
                  </h2>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginTop: "8px" }}>
                    Dia {dayIndex + 1} • {selectedDate.toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
                  <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px", lineHeight: 1.7, margin: 0, fontStyle: "italic", textAlign: "center" }}>
                    "{prayer.oracao}"
                  </p>
                </div>

                {!done && (
                  <button
                    onClick={handleComplete}
                    style={{
                      width: "100%", padding: "16px", borderRadius: "12px", border: "none",
                      background: activeQuaresma.color, color: "#090B10", fontWeight: 900, fontSize: "15px", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.3s",
                      boxShadow: `0 4px 20px ${activeQuaresma.color}40`,
                    }}
                  >
                    <Check size={20} /> Concluir este Dia
                  </button>
                )}

                {done && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "slideUp 0.3s ease" }}>
                    <div style={{
                      width: "100%", padding: "14px", borderRadius: "12px", background: `${activeQuaresma.color}15`,
                      border: `1px solid ${activeQuaresma.color}40`, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    }}>
                      <span style={{ fontSize: "18px" }}>🌟</span>
                      <span style={{ color: activeQuaresma.color, fontWeight: 800, fontSize: "14px" }}>Dia concluído com sucesso!</span>
                    </div>

                    <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: "16px", padding: "20px", border: "1px solid rgba(255,255,255,0.05)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                        <span style={{ fontSize: "16px" }}>✍️</span>
                        <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>Seu Relato / Partilha</span>
                      </div>
                      <textarea
                        placeholder="Escreva seu relato aqui..."
                        defaultValue={loadRelato(selectedDate, activeQuaresma.id)}
                        onBlur={(e) => saveRelato(selectedDate, activeQuaresma.id, e.target.value)}
                        style={{
                          width: "100%", minHeight: "100px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px", padding: "14px", color: "#fff", fontSize: "14px", fontFamily: "Outfit, sans-serif",
                          resize: "vertical", outline: "none", transition: "border 0.3s"
                        }}
                        onFocus={(e) => ((e.target as HTMLTextAreaElement).style.border = `1px solid ${activeQuaresma.color}`)}
                        onMouseLeave={(e) => ((e.target as HTMLTextAreaElement).style.border = "1px solid rgba(255,255,255,0.1)")}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </main>
  );
}
