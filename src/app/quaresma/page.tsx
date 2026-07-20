
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check, Lock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

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

function getSolemnitiesForYear(year: number) {
  const easter = getEasterDate(year);
  
  // Corpus Christi is 60 days after Easter
  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);

  // Sexta-feira Santa is 2 days before Easter
  const GoodFriday = new Date(easter);
  GoodFriday.setDate(easter.getDate() - 2);

  // Domingo de Ramos is 7 days before Easter
  const PalmSunday = new Date(easter);
  PalmSunday.setDate(easter.getDate() - 7);

  // Pentecostes is 49 days after Easter
  const pentecost = new Date(easter);
  pentecost.setDate(easter.getDate() + 49);

  return [
    { id: "mae-de-deus", date: new Date(year, 0, 1), name: "Mãe de Deus", type: "solemnity", desc: "Solenidade de Santa Maria, Mãe de Deus. Dia de Preceito." },
    { id: "reis", date: new Date(year, 0, 6), name: "Epifania (Reis)", type: "solemnity", desc: "Solenidade da Epifania do Senhor (Dia de Reis)." },
    { id: "sao-jose", date: new Date(year, 2, 19), name: "São José", type: "solemnity", desc: "Solenidade de São José, Esposo da Virgem Maria." },
    { id: "anunciacao", date: new Date(year, 2, 25), name: "Anunciação", type: "solemnity", desc: "Solenidade da Anunciação do Senhor." },
    { id: "ramos", date: PalmSunday, name: "Domingo de Ramos", type: "solemnity", desc: "Domingo de Ramos. Início da Semana Santa." },
    { id: "sexta-santa", date: GoodFriday, name: "Sexta-feira Santa", type: "solemnity", desc: "Sexta-feira Santa da Paixão do Senhor (Jejum e Abstinência)." },
    { id: "pascoa", date: easter, name: "Páscoa da Ressurreição", type: "solemnity", desc: "Solenidade da Páscoa da Ressurreição do Senhor. A maior festa cristã do ano." },
    { id: "pentecostes", date: pentecost, name: "Pentecostes", type: "solemnity", desc: "Solenidade de Pentecostes. Vinda do Espírito Santo sobre os Apóstolos." },
    { id: "corpus-christi", date: corpusChristi, name: "Corpus Christi", type: "solemnity", desc: "Solenidade do Santíssimo Corpo e Sangue de Cristo. Dia de Preceito." },
    { id: "sao-joao", date: new Date(year, 5, 24), name: "São João Batista", type: "solemnity", desc: "Solenidade do Nascimento de São João Batista." },
    { id: "pedro-paulo", date: new Date(year, 5, 29), name: "São Pedro e São Paulo", type: "solemnity", desc: "Solenidade de São Pedro e São Paulo, Apóstolos." },
    { id: "assuncao", date: new Date(year, 7, 15), name: "Assunção de Maria", type: "solemnity", desc: "Solenidade da Assunção de Nossa Senhora ao Céu. Dia de Preceito." },
    { id: "padroeira", date: new Date(year, 9, 12), name: "Nossa Senhora Aparecida", type: "solemnity", desc: "Solenidade de Nossa Senhora da Conceição Aparecida, Padroeira do Brasil. Dia de Preceito." },
    { id: "todos-santos", date: new Date(year, 10, 1), name: "Todos os Santos", type: "solemnity", desc: "Solenidade de Todos os Santos." },
    { id: "finados", date: new Date(year, 10, 2), name: "Finados", type: "commemoration", desc: "Comemoração de Todos os Fiéis Defuntos." },
    { id: "imaculada", date: new Date(year, 11, 8), name: "Imaculada Conceição", type: "solemnity", desc: "Solenidade da Imaculada Conceição de Nossa Senhora. Dia de Preceito." },
    { id: "natal", date: new Date(year, 11, 25), name: "Natal do Senhor", type: "solemnity", desc: "Solenidade do Natal de Nosso Senhor Jesus Cristo. Dia de Preceito." },
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

const getLevelName = (lvl: number) => {
  if (lvl === 1) return "Iniciante na Fé 🕊️";
  if (lvl === 2) return "Peregrino Fiel 👣";
  if (lvl === 3) return "Orante Devoto 🙏";
  if (lvl === 4) return "Guerreiro de Oração ⚔️";
  if (lvl === 5) return "Sentinela Celestial 🛡️";
  return "Sacerdócio Espiritual 🕯️";
};

const BADGES = [
  { id: "guerreiro-oracao", icon: "⚔️", name: "Guerreiro de Oração", desc: "Complete 5 orações" },
  { id: "sentinela-luz", icon: "🛡️", name: "Sentinela da Luz", desc: "Complete 15 orações" },
  { id: "fidelidade-apostolica", icon: "📜", name: "Fidelidade Apostólica", desc: "Complete 30 orações" },
  { id: "campeao-fe", icon: "👑", name: "Campeão da Fé", desc: "Complete 40 orações" },
  { id: "fogo-santo", icon: "🔥", name: "Fogo Santo", desc: "Mantenha um streak de 7 dias seguidos" },
];

/* ── COMPONENTE PRINCIPAL ────────────────────────────────────────────────── */

export default function QuaresmaCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeQuaresma, setActiveQuaresma] = useState<any>(null);
  const [selectedSolemnity, setSelectedSolemnity] = useState<any>(null);
  const [showSolemnities, setShowSolemnities] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0); // Para forçar re-render do calendário
  const [particles, setParticles] = useState<{ id: number; style: React.CSSProperties }[]>([]);

  // Gamification state
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [streak, setStreak] = useState(0);
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);

  const recalculateGamification = () => {
    if (typeof window === "undefined") return;
    
    let totalCompleted = 0;
    const year = currentDate.getFullYear();
    const quaresmas = getQuaresmasForYear(year);
    
    // Contar total completados
    quaresmas.forEach(q => {
      let current = new Date(q.start);
      const end = new Date(q.end);
      while (current <= end) {
        if (isDayCompleted(current, q.id)) {
          totalCompleted++;
        }
        current.setDate(current.getDate() + 1);
      }
    });

    // Calcular Streak de dias seguidos (no geral)
    let currentStreak = 0;
    let checkDate = new Date();
    checkDate.setHours(0,0,0,0);
    
    const isAnyQuaresmaCompletedOn = (d: Date) => {
      return quaresmas.some(q => isDayCompleted(d, q.id));
    };

    const completedToday = isAnyQuaresmaCompletedOn(checkDate);
    const yesterday = new Date(checkDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const completedYesterday = isAnyQuaresmaCompletedOn(yesterday);

    if (completedToday || completedYesterday) {
      let tempDate = completedToday ? new Date(checkDate) : yesterday;
      while (isAnyQuaresmaCompletedOn(tempDate)) {
        currentStreak++;
        tempDate.setDate(tempDate.getDate() - 1);
      }
    }

    const calculatedXp = (totalCompleted * 100) + (currentStreak * 20);
    const calculatedLevel = Math.floor(calculatedXp / 500) + 1;
    
    const badges = [];
    if (totalCompleted >= 5) badges.push("guerreiro-oracao");
    if (totalCompleted >= 15) badges.push("sentinela-luz");
    if (totalCompleted >= 30) badges.push("fidelidade-apostolica");
    if (totalCompleted >= 40) badges.push("campeao-fe");
    if (currentStreak >= 7) badges.push("fogo-santo");

    setXp(calculatedXp);
    setLevel(calculatedLevel);
    setStreak(currentStreak);
    setUnlockedBadges(badges);
  };

  useEffect(() => {
    if (mounted) {
      recalculateGamification();
    }
  }, [mounted, updateTrigger, currentDate]);

  useEffect(() => {
    setMounted(true);
    
    // Verifica se o usuário está logado e se possui plano ativo
    const checkUserAccess = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          window.location.href = "/login?redirect=/quaresma";
          return;
        }

        const planoAtivo = user.user_metadata?.plano_ativo === true;
        const { data: perfil } = await supabase.from('perfis').select('role').eq('id', user.id).maybeSingle();
        const isAdmin = perfil?.role === 'admin' || user.email === 'suporte.appcontos@gmail.com';

        if (!isAdmin && !planoAtivo) {
          window.location.href = "/planos";
          return;
        }

        setLoadingUser(false);
      } catch (err) {
        console.error("Erro na verificação de acesso:", err);
        window.location.href = "/";
      }
    };

    checkUserAccess();
  }, []);

  const playSuccessSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        
        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.45);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.55);
      });
    } catch (err) {
      console.error("Erro ao reproduzir som:", err);
    }
  };

  const spawnParticles = () => {
    const newParticles = Array.from({ length: 45 }).map((_, idx) => {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 40 + Math.random() * 140;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      const size = 3 + Math.random() * 6;
      const colors = ["#D4AF37", "#10B981", "#34D399", "#A78BFA", "#F59E0B", "#EF4444"];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return {
        id: Date.now() + idx,
        style: {
          position: "fixed" as const,
          left: "50%",
          top: "50%",
          width: `${size}px`,
          height: `${size}px`,
          background: color,
          borderRadius: Math.random() > 0.4 ? "50%" : "2px",
          transform: "translate(-50%, -50%)",
          zIndex: 150,
          pointerEvents: "none" as const,
          animation: "explode 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards",
          "--tx": `${tx}px`,
          "--ty": `${ty}px`,
        } as React.CSSProperties
      };
    });
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 1500);
  };

  const playLockedSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      
      [150, 150].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        
        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.1);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.12);
      });
    } catch (err) {
      console.error(err);
    }
  };

  const isDayLocked = (date: Date, quaresma: any) => {
    if (!quaresma) return false;
    const dayIndex = getDayIndex(date, quaresma.start);
    if (dayIndex === 0) return false; // O primeiro dia sempre é aberto
    
    const prevDate = new Date(date);
    prevDate.setDate(date.getDate() - 1);
    
    return !isDayCompleted(prevDate, quaresma.id);
  };

  if (!mounted || loadingUser) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#090B10",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "Outfit, sans-serif",
        color: "#fff"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "4px solid rgba(212,175,55,0.1)",
          borderTop: "4px solid #D4AF37",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
          Verificando assinatura...
        </span>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

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
  const handleDayClick = (dayNum: number, quaresma: any, solemnity: any) => {
    if (!quaresma && !solemnity) return;
    const clickedDate = new Date(year, month, dayNum);
    
    // Bloqueia se for um dia de Quaresma e estiver bloqueado
    if (quaresma && isDayLocked(clickedDate, quaresma)) {
      playLockedSound();
      return;
    }
    
    setSelectedDate(clickedDate);
    setActiveQuaresma(quaresma || null);
    setSelectedSolemnity(solemnity || null);
  };

  const handleComplete = () => {
    if (selectedDate && activeQuaresma) {
      completeDay(selectedDate, activeQuaresma.id);
      setUpdateTrigger(prev => prev + 1); // Força atualização do ícone na grade
      playSuccessSound();
      spawnParticles();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([70, 40, 70]);
      }
    }
  };

  return (
    <main style={{ minHeight: "100vh", background: "#090B10", fontFamily: "Outfit, sans-serif", color: "#fff", paddingBottom: "80px", paddingTop: "96px" }}>
      
      {/* ── HEADER MENSAL ──────────────────────────────────────────────────────── */}
      <div style={{ padding: "16px 16px 32px", textAlign: "center", background: "linear-gradient(180deg, rgba(212,175,55,0.05) 0%, transparent 100%)" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "8px", background: "linear-gradient(135deg,#fff 0%,#D4AF37 50%,#fff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Calendário Católico
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: "0 auto 24px", maxWidth: "400px" }}>
          Acompanhe o tempo litúrgico e suas orações diárias.
        </p>

        {/* Chave de Teste / Toggle */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "16px" }}>
          <label style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.02)", padding: "6px 14px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <input 
              type="checkbox" 
              checked={showSolemnities} 
              onChange={(e) => setShowSolemnities(e.target.checked)}
              style={{ accentColor: "#D4AF37", cursor: "pointer" }}
            />
            ✨ Modo Litúrgico Completo (Solenidades e Festas)
          </label>
        </div>

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

      {/* ── CONTEÚDO PRINCIPAL (LAYOUT DUPLO GAMIFICADO) ────────────────────────── */}
      <div className="main-content-layout">
        
        {/* Painel de Gamificação */}
        <div style={{
          background: "#111520",
          border: "1px solid rgba(212, 175, 55, 0.15)",
          borderRadius: "20px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          height: "fit-content",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)"
        }}>
          {/* Perfil & Nível */}
          <div>
            <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
              Seu Progresso
            </span>
            <h3 style={{ fontSize: "20px", fontWeight: 900, margin: "4px 0 2px", color: "#D4AF37" }}>
              Nível {level}
            </h3>
            <p style={{ fontSize: "14px", fontWeight: 600, margin: 0, color: "rgba(255,255,255,0.8)" }}>
              {getLevelName(level)}
            </p>
            
            {/* XP progress bar */}
            <div style={{ marginTop: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>
                <span>XP Total: {xp}</span>
                <span>{xp % 500} / 500 XP</span>
              </div>
              <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "999px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{
                  width: `${((xp % 500) / 500) * 100}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #D4AF37 0%, #10B981 100%)",
                  borderRadius: "999px",
                  transition: "width 0.5s ease-out"
                }} />
              </div>
            </div>
          </div>

          <hr style={{ border: "none", height: "1px", background: "rgba(255,255,255,0.08)", margin: 0 }} />

          {/* Fogo / Streak */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", padding: "16px", borderRadius: "16px" }}>
            <div className="streak-flame" style={{ fontSize: "32px", animation: "pulse 2s infinite" }}>
              🔥
            </div>
            <div>
              <h4 style={{ fontSize: "18px", fontWeight: 900, margin: 0, color: "#10B981" }}>
                {streak} {streak === 1 ? "Dia Seguido" : "Dias Seguidos"}
              </h4>
              <p style={{ fontSize: "12px", margin: "2px 0 0", color: "rgba(255,255,255,0.6)" }}>
                {streak > 0 ? "Mantenha o fogo da fé aceso!" : "Complete uma oração para iniciar seu streak!"}
              </p>
            </div>
          </div>

          <hr style={{ border: "none", height: "1px", background: "rgba(255,255,255,0.08)", margin: 0 }} />

          {/* Conquistas (Badges) */}
          <div>
            <h4 style={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px", color: "rgba(255,255,255,0.5)" }}>
              Medalhas da Alma
            </h4>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {BADGES.map((badge: any) => {
                const isUnlocked = unlockedBadges.includes(badge.id);
                return (
                  <div 
                    key={badge.id} 
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: isUnlocked ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.02)",
                      border: isUnlocked ? "1.5px solid #D4AF37" : "1px solid rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      opacity: isUnlocked ? 1 : 0.25,
                      cursor: "pointer",
                      position: "relative",
                      transition: "all 0.3s"
                    }}
                    className="badge-item"
                  >
                    {badge.icon}
                    
                    <div className="badge-tooltip">
                      <strong>{badge.name}</strong>
                      <span>{badge.desc}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <hr style={{ border: "none", height: "1px", background: "rgba(255,255,255,0.08)", margin: 0 }} />

          {/* Desafio Diário Devocional */}
          <div style={{ background: "rgba(212, 175, 55, 0.03)", border: "1px dashed rgba(212, 175, 55, 0.25)", padding: "16px", borderRadius: "16px" }}>
            <span style={{ fontSize: "10px", fontWeight: 800, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Desafio Litúrgico do Dia
            </span>
            <p style={{ fontSize: "13px", margin: "6px 0 0", color: "rgba(255,255,255,0.85)", lineHeight: 1.5, fontWeight: 500 }}>
              "Ofereça 10 minutos de silêncio e meditação contemplativa hoje, agradecendo a Deus por todas as graças recebidas."
            </p>
          </div>

        </div>

        {/* Lado Direito: Calendário */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Legenda de quaresmas */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            {quaresmas.filter(q => q.start.getMonth() === month || q.end.getMonth() === month || (q.start.getMonth() < month && q.end.getMonth() > month)).map(q => (
              <div key={q.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", background: "rgba(255,255,255,0.03)", padding: "4px 12px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: q.color }} />
                {q.name}
              </div>
            ))}
          </div>

          {/* Grid do Calendário */}
          <div style={{
            background: "#111520",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "16px" }}>
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                <div key={day} style={{ textAlign: "center", fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
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
                
                const solemnities = showSolemnities ? getSolemnitiesForYear(year) : [];
                const solemnity = solemnities.find(s => {
                  const d = new Date(s.date);
                  return d.getFullYear() === date.getFullYear() &&
                         d.getMonth() === date.getMonth() &&
                         d.getDate() === date.getDate();
                });

                // Re-render check based on updateTrigger state
                const done = mounted && quaresma ? isDayCompleted(date, quaresma.id) : false;
                const locked = mounted && quaresma ? isDayLocked(date, quaresma) : false;

                const isClickable = quaresma || solemnity;

                // Cores e estilos do botão baseados nos estados
                let bg = "rgba(255,255,255,0.02)";
                let border = "1px solid rgba(255,255,255,0.05)";
                let color = "rgba(255,255,255,0.3)";
                let shadow = "none";
                let opacity = 0.5;

                if (quaresma) {
                  opacity = locked ? 0.35 : 1;
                  bg = locked ? "rgba(255,255,255,0.01)" : `${quaresma.color}15`;
                  border = done ? "2px solid #10B981" : isToday ? "2px solid #fff" : locked ? "1px solid rgba(255,255,255,0.03)" : `1px solid ${quaresma.color}50`;
                  color = done ? "#10B981" : locked ? "rgba(255,255,255,0.2)" : quaresma.color;
                  shadow = done ? "0 0 10px rgba(16, 185, 129, 0.2)" : "none";
                } else if (solemnity) {
                  opacity = 1;
                  bg = "rgba(212,175,55,0.05)";
                  border = isToday ? "2px solid #fff" : "1px dashed #D4AF37";
                  color = "#D4AF37";
                  shadow = "0 0 8px rgba(212, 175, 55, 0.1)";
                }

                return (
                  <button
                    key={dayNum}
                    onClick={() => handleDayClick(dayNum, quaresma, solemnity)}
                    disabled={!isClickable}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "12px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      background: bg,
                      border: border,
                      color: color,
                      boxShadow: shadow,
                      cursor: isClickable && (!quaresma || !locked) ? "pointer" : "default",
                      opacity: opacity,
                      position: "relative",
                      transition: "all 0.2s"
                    }}
                  >
                    <span style={{ fontSize: "16px", fontWeight: 700 }}>{dayNum}</span>
                    {done && quaresma && (
                      <div style={{ position: "absolute", top: "4px", right: "4px", color: "#10B981" }}>
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                    {locked && quaresma && (
                      <div style={{ position: "absolute", top: "4px", right: "4px", color: "rgba(255,255,255,0.25)" }}>
                        <Lock size={10} />
                      </div>
                    )}
                    {!quaresma && solemnity && (
                      <div style={{ position: "absolute", top: "4px", right: "4px", color: "#D4AF37", fontSize: "10px", fontWeight: "bold" }}>
                        ✝
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>



      {/* ── MODAL DE ORAÇÃO E SOLENIDADE ────────────────────────────────────────── */}
      {selectedDate && (activeQuaresma || selectedSolemnity) && (() => {
        const themeColor = activeQuaresma ? activeQuaresma.color : "#D4AF37";
        const hasQuaresma = !!activeQuaresma;
        
        let dayIndex = 0;
        let prayer = null;
        let done = false;

        if (hasQuaresma) {
          dayIndex = getDayIndex(selectedDate, activeQuaresma.start);
          prayer = getPrayerForDay(activeQuaresma.id, dayIndex);
          done = isDayCompleted(selectedDate, activeQuaresma.id);
        }

        return (
          <div style={{
            position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease"
          }}>
            <div style={{
              background: "#111520", border: `1px solid ${themeColor}40`, borderRadius: "20px",
              width: "100%", maxWidth: "500px", maxHeight: "90vh", overflowY: "auto", position: "relative",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)", animation: "slideUp 0.3s ease",
            }}>
              <button 
                onClick={() => {
                  setSelectedDate(null);
                  setActiveQuaresma(null);
                  setSelectedSolemnity(null);
                }}
                style={{
                  position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.1)", border: "none",
                  width: "32px", height: "32px", borderRadius: "16px", color: "#fff", cursor: "pointer", display: "flex",
                  alignItems: "center", justifyContent: "center", zIndex: 10
                }}
              >
                <X size={16} />
              </button>

              <div style={{ padding: "32px 24px", position: "relative" }}>
                
                {/* Cabeçalho da celebração */}
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  {selectedSolemnity && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(212,175,55,0.15)", padding: "4px 12px", borderRadius: "999px", color: "#D4AF37", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                      ⛪ {selectedSolemnity.name}
                    </div>
                  )}
                  
                  {/* Se tem Quaresma, mostra a etiqueta dela também */}
                  {!selectedSolemnity && activeQuaresma && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: `${activeQuaresma.color}15`, padding: "4px 12px", borderRadius: "999px", color: activeQuaresma.color, fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                      {activeQuaresma.name}
                    </div>
                  )}

                  <h2 style={{ fontSize: "22px", fontWeight: 900, margin: 0, color: "#fff" }}>
                    {done && <span style={{ marginRight: "8px" }}>✨</span>}
                    {prayer ? prayer.tema : selectedSolemnity?.name}
                  </h2>
                  
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px", marginTop: "8px" }}>
                    {hasQuaresma ? `Dia ${dayIndex + 1} • ` : ""} {selectedDate.toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {/* Card da Solenidade se tiver ambas no mesmo dia */}
                {selectedSolemnity && hasQuaresma && (
                  <div style={{
                    background: "rgba(212, 175, 55, 0.05)",
                    border: "1px dashed rgba(212, 175, 55, 0.3)",
                    borderRadius: "16px",
                    padding: "16px",
                    marginBottom: "20px",
                    fontSize: "13px",
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: 1.5
                  }}>
                    🌟 <strong>Hoje também celebramos:</strong> {selectedSolemnity.desc}
                  </div>
                )}

                {/* Descrição da Solenidade para dias normais (sem Quaresma) */}
                {selectedSolemnity && !hasQuaresma && (
                  <div style={{
                    background: "rgba(212, 175, 55, 0.05)",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                    borderRadius: "16px",
                    padding: "20px",
                    marginBottom: "24px",
                    textAlign: "center"
                  }}>
                    <p style={{ margin: 0, fontSize: "15px", color: "rgba(255,255,255,0.9)", lineHeight: 1.6, fontStyle: "italic" }}>
                      "{selectedSolemnity.desc}"
                    </p>
                  </div>
                )}

                {/* Texto da Oração (se tiver Quaresma) */}
                {prayer && (
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px", lineHeight: 1.7, margin: 0, fontStyle: "italic", textAlign: "center" }}>
                      "{prayer.oracao}"
                    </p>
                  </div>
                )}

                {/* Ações de Concluir (se tiver Quaresma) */}
                {hasQuaresma && !done && (
                  <button
                    onClick={handleComplete}
                    style={{
                      width: "100%", padding: "16px", borderRadius: "12px", border: "none",
                      background: themeColor, color: "#090B10", fontWeight: 900, fontSize: "15px", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.3s",
                      boxShadow: `0 4px 20px ${themeColor}40`,
                    }}
                  >
                    <Check size={20} /> Concluir este Dia
                  </button>
                )}

                {/* Relato (se tiver Quaresma e estiver concluída) */}
                {hasQuaresma && done && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", animation: "slideUp 0.3s ease" }}>
                    <div style={{
                      width: "100%", padding: "14px", borderRadius: "12px", background: `${themeColor}15`,
                      border: `1px solid ${themeColor}40`, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                    }}>
                      <span style={{ fontSize: "18px" }}>🌟</span>
                      <span style={{ color: themeColor, fontWeight: 800, fontSize: "14px" }}>Dia concluído com sucesso!</span>
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
                        onFocus={(e) => ((e.target as HTMLTextAreaElement).style.border = `1px solid ${themeColor}`)}
                        onMouseLeave={(e) => ((e.target as HTMLTextAreaElement).style.border = "1px solid rgba(255,255,255,0.1)")}
                      />
                    </div>
                  </div>
                )}

                {/* Botão de Fechar Simples para dias de Solenidade pura */}
                {!hasQuaresma && (
                  <button
                    onClick={() => {
                      setSelectedDate(null);
                      setActiveQuaresma(null);
                      setSelectedSolemnity(null);
                    }}
                    style={{
                      width: "100%", padding: "16px", borderRadius: "12px",
                      background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 700, fontSize: "15px", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s",
                      border: "1px solid rgba(255,255,255,0.1)"
                    }}
                  >
                    Fechar
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {particles.map(p => (
        <div key={p.id} style={p.style} />
      ))}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes explode {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        .main-content-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: 32px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }
        @media (min-width: 1024px) {
          .main-content-layout {
            grid-template-columns: 350px 1fr;
          }
        }
        .badge-item {
          position: relative;
        }
        .badge-item:hover .badge-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(-10px);
        }
        .badge-tooltip {
          position: absolute;
          bottom: 110%;
          left: 50%;
          transform: translateX(-50%) translateY(0);
          background: #181d2a;
          border: 1px solid rgba(212, 175, 55, 0.3);
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 11px;
          color: #fff;
          width: 200px;
          text-align: center;
          box-shadow: 0 10px 20px rgba(0,0,0,0.5);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .badge-tooltip strong {
          color: #D4AF37;
          font-size: 12px;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 2px rgba(16,185,129,0)); }
          50% { transform: scale(1.08); filter: drop-shadow(0 0 8px rgba(16,185,129,0.5)); }
        }
      `}</style>
    </main>
  );
}
