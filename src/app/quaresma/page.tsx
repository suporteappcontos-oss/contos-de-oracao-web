"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Check, Lock, 
  BookOpen, HeartHandshake, BookMarked, Sparkles, Copy, CheckCircle2, 
  Flame, Award, Search, Share2, Volume2, Shield, Cross
} from "lucide-react";
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
  
  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60);

  const GoodFriday = new Date(easter);
  GoodFriday.setDate(easter.getDate() - 2);

  const PalmSunday = new Date(easter);
  PalmSunday.setDate(easter.getDate() - 7);

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

/* ── TEXTOS E ORAÇÕES DOS 40 DIAS ─────────────────────────────────────────── */

const ORACOES_SAO_MIGUEL = [
  { tema: "O Chamado do Arcanjo", oracao: "São Miguel Arcanjo, eu me apresento diante de vós hoje, no primeiro dia desta sagrada jornada. Intercedei por mim diante do Trono de Deus. Purificai meu coração e preparai meu espírito para estes 40 dias de oração e conversão. Amém." },
  { tema: "Arrependimento Sincero", oracao: "Senhor meu Deus, sob a proteção de São Miguel, venho com o coração contrito arrependido dos meus pecados. Perdoai minhas ofensas assim como eu perdoo a quem me ofendeu. Concedei-me a graça da verdadeira conversão. Amém." },
  { tema: "Purificação do Coração", oracao: "São Miguel, vós que sois o protetor das almas, pedi ao Senhor que purifique meu coração de todo rancor, mágoa e impureza. Que o amor de Deus flua livremente em mim a partir deste dia. Amém." },
  { tema: "Fortaleza Interior", oracao: "Príncipe da Milícia Celestial, concedei-me a fortaleza que só vem de Deus para enfrentar as batalhas do dia a dia. Que eu nunca me deixe vencer pelo desânimo ou pelo medo. Com vossa espada, cortai em mim toda fraqueza de alma. Amém." },
  { tema: "Véspera da Assunção", oracao: "Em véspera da gloriosa Assunção de Nossa Senhora, peço que Maria e São Miguel intercedam juntos por mim. Que a Mãe de Deus me cubra com seu manto e me guie nesta quaresma espiritual. Amém." },
  { tema: "Assunção de Nossa Senhora", oracao: "Gloriosa Virgem Maria, assumida em corpo e alma ao Céu, intercedei com São Miguel por nossa proteção. Neste dia santo, ofereço esta quaresma como ato de amor a Deus e devoção a vós. Amém." },
  { tema: "Fé Renovada", oracao: "Senhor, renova a minha fé neste sétimo dia. Que como São Miguel que nunca duvidou de Vós, eu também permaneça inabalável na certeza de que sois meu Deus e meu pastor. Amém." },
  { tema: "Escudo da Fé", oracao: "São Miguel, Arcanjo poderoso, cobri-me com vosso escudo celestial. Que o mal não encontre passagem em minha vida, em minha família e em minha casa. Guardai-nos sob vossas asas protetoras. Amém." },
  { tema: "Proteção da Família", oracao: "Glorioso Arcanjo, estendei vosso manto protetor sobre minha família. Afastai de nós toda influência maligna, toda divisão e todo mal. Que Cristo reine em nosso lar como Senhor e Rei. Amém." },
  { tema: "Combate Espiritual", oracao: "São Miguel guerreiro, ensinai-me a combater espiritualmente com as armas da fé, da oração e do jejum. Que eu nunca baixe a guarda diante das tentações do mundo, da carne e do demônio. Amém." },
  { tema: "Libertação dos Medos", oracao: "Senhor Deus, pelo poder de São Miguel, liberai-me de todo medo que me impede de cumprir Vossa vontade. Que o vosso amor perfeito expulse todo temor do meu coração e me liberte para viver plenamente. Amém." },
  { tema: "Proteção dos Filhos", oracao: "São Miguel, guardião das almas inocentes, protegei nossas crianças e jovens das influências do mal. Que nossos filhos cresçam no amor a Deus e na prática das virtudes cristãs. Amém." },
  { tema: "Rainha dos Anjos", oracao: "Rainha dos Anjos, Nossa Senhora que reina sobre São Miguel e toda a Milícia Celestial, intercedei por nós. Enviai vossos anjos para nos guardar em todos os nossos caminhos. Amém." },
  { tema: "Armadura de Deus", oracao: "Senhor, ajudai-me a vestir cada dia a armadura de Deus: o cinto da verdade, a couraça da justiça, o escudo da fé e o elmo da salvação. São Miguel, guiai minhas mãos no combate espiritual. Amém." },
  { tema: "Cura Interior", oracao: "Deus de misericórdia, pela intercessão de São Miguel, curai as feridas mais profundas do meu coração. Toda dor, toda rejeição, todo abandono: tudo entrego nas vossas mãos para ser curado pelo vosso amor infinito. Amém." },
  { tema: "Libertação de Vícios", oracao: "São Miguel, rogai por todos que lutam contra vícios e dependências. Pela espada de fogo do vosso poder, cortai as cadeias que aprisionam tantas almas. Que Cristo os liberte completamente hoje. Amém." },
  { tema: "Cura dos Relacionamentos", oracao: "Senhor, curai nossos relacionamentos feridos. Que onde houve traição, haja perdão. Que onde houve abandono, haja reconciliação. São Miguel, sede mediador da paz nas famílias. Amém." },
  { tema: "Saúde e Cura Física", oracao: "Deus que sois o grande médico, pela intercessão de São Miguel, dai saúde aos enfermos. Confortai os que sofrem, dai forças aos que estão fracos e esperança aos que estão desesperados. Amém." },
  { tema: "Santo Agostinho", oracao: "Em memória de Santo Agostinho, que encontrou a Deus após longos anos de afastamento, peço que São Miguel interceda pelos que vivem longe de Vós. Que Vosso amor os alcance hoje, Senhor. Amém." },
  { tema: "São João Batista", oracao: "São João Batista, que não temestes a morte por amor à verdade, intercedei por nós com São Miguel. Dai-nos coragem para testemunhar nossa fé em qualquer circunstância da vida. Amém." },
  { tema: "Cura da Memória", oracao: "Senhor, curai as memórias dolorosas que ainda me perturbam. Pela proteção de São Miguel, que o vosso amor sele as feridas do passado e me liberte para viver plenamente o presente em Vós. Amém." },
  { tema: "Perseverança", oracao: "São Miguel, que permanecestes fiel a Deus na grande batalha celestial, pedimos-vos perseverança. Que não nos cansemos de fazer o bem, mesmo quando os frutos tardarem a aparecer em nossas vidas. Amém." },
  { tema: "Confiança em Deus", oracao: "Senhor, aprendo com São Miguel que Vós sois o Senhor da história e da eternidade. Que eu confie completamente em Vós, mesmo quando não compreendo os Vossos caminhos misteriosos e sublimes. Amém." },
  { tema: "Esperança Viva", oracao: "Deus da esperança, enchei-nos de toda alegria e paz na fé. São Miguel, intercessor dos desesperançados, alcançai do Senhor a graça de renovar nossa esperança a cada novo amanhecer. Amém." },
  { tema: "Caridade Verdadeira", oracao: "Senhor do amor, derramai em nossos corações a caridade verdadeira que só Vós podeis dar. Que São Miguel nos inspire a sermos instrumentos Vossos para amar o próximo sem medida e sem condição. Amém." },
  { tema: "Humildade de Espírito", oracao: "Deus humilde que viestes ao mundo como um bebê em Belém, ensinai-me a humildade. São Miguel, que se prostrou diante de Deus dizendo Quem como Deus, sejais meu modelo de serviço humilde. Amém." },
  { tema: "Mansidão Sagrada", oracao: "Senhor manso e humilde de coração, dai-me a mansidão que transforma conflitos em paz e inimigos em amigos. São Miguel, que combateis com poder mas servis com amor, intercedei por nós. Amém." },
  { tema: "Paciência nas Provações", oracao: "Senhor, ensinai-me a paciência de Jó. Que nas tribulações eu diga como ele: O Senhor deu, o Senhor tirou; seja bendito o nome do Senhor. São Miguel, fortalecei-me nas provas. Amém." },
  { tema: "Nossa Senhora da Vitória", oracao: "Nossa Senhora da Vitória, em véspera de vossa gloriosa Natividade, unimos nossa oração à de São Miguel. Que vossa vitória sobre o dragão seja também a nossa vitória sobre o pecado. Amém." },
  { tema: "Natividade de Nossa Senhora", oracao: "Feliz aniversário, Mãe! Neste dia de vossa Natividade, junto com São Miguel, cantamos vossas glórias. Que possamos imitar vossa pureza, fé e total entrega à vontade de Deus em cada momento. Amém." },
  { tema: "Prudência e Sabedoria", oracao: "Espírito Santo, fonte de toda sabedoria, concedei-nos a prudência para discernir a vontade de Deus em cada situação. São Miguel, modelo de sabedoria angélica, guiai nossas decisões diárias. Amém." },
  { tema: "Justiça Divina", oracao: "Deus justo e misericordioso, dai-nos a virtude da justiça para dar a cada um o que lhe é devido. São Miguel, patrono da justiça divina, intercedei pelos que sofrem injustiças no mundo. Amém." },
  { tema: "Fortaleza das Virtudes", oracao: "Deus todo-poderoso, que destes força ao arcanjo São Miguel para vencer Satanás, dai-me também fortaleza para vencer meus próprios pecados e vícios. Que eu seja mais forte do que minhas fraquezas. Amém." },
  { tema: "O Santo Nome de Maria", oracao: "Santíssimo Nome de Maria, que os demônios tremem ao ouvi-lo! Com São Miguel, invocamos vosso nome sobre nossas vidas, famílias e nações. Que a vossa presença afugente todo o mal. Amém." },
  { tema: "Santidade dos Sacerdotes", oracao: "Senhor, pela intercessão de São Miguel guardião da Igreja, santificai vossos sacerdotes. Que sirvam com fidelidade, anunciem a verdade com coragem e sejam pastores segundo Vosso coração. Amém." },
  { tema: "Exaltação da Santa Cruz", oracao: "Glorioso Sinal da Cruz, que São Miguel venera diante do Trono de Deus! Hoje contemplamos o preço da nossa redenção. Pela Cruz de Cristo e por São Miguel, renunciamos ao diabo e a todas as suas obras. Amém." },
  { tema: "Nossa Senhora das Dores", oracao: "Mãe Dolorosa, que sofrestes junto à Cruz do vosso Filho, sede nossa intercessora neste penúltimo trecho da jornada. Com São Miguel, oferecemos nossos sofrimentos unidos aos de Cristo. Amém." },
  { tema: "Coragem dos Mártires", oracao: "Santos mártires que derramastes vosso sangue pela fé, intercedei por nós com São Miguel. Que tenhamos coragem para professarmos nossa fé abertamente em qualquer situação da vida. Amém." },
  { tema: "Conformação com Cristo", oracao: "São Francisco que recebestes os estigmas de Cristo, intercedei com São Miguel por nossa total conformidade com Jesus. Que carreguemos nossa cruz diária com amor e alegria filial. Amém." },
  { tema: "Consagração Final ao Arcanjo", oracao: "São Miguel Arcanjo, Príncipe da Milícia Celestial, completamos estes 40 dias de jornada espiritual ao vosso lado. Hoje nos consagramos completamente à vossa proteção. Que a vossa espada nos defenda. Que a vossa luz nos ilumine. Que o vosso poder nos guie até a presença de Deus na eternidade. Agora e na hora de nossa morte. Amém." }
];

/* ── BIBLIOTECA DE ORAÇÕES FIXAS ─────────────────────────────────────────── */

const BIBLIOTECA_ORACOES = [
  {
    id: "oracao-leao-xiii",
    titulo: "Oração a São Miguel Arcanjo (Papa Leão XIII)",
    categoria: "Oração Principal",
    texto: `São Miguel Arcanjo, defendei-nos no combate; sede o nosso refúgio contra as maldades e ciladas do demônio. Ordene-lhe Deus, instantemente o pedimos, e vós, príncipe da milícia celestial, pela virtude divina, precipitai no inferno a Satanás e aos outros espíritos malignos, que vagam pelo mundo para perder as almas. Amém.`
  },
  {
    id: "ladainha-sao-miguel",
    titulo: "Ladainha de São Miguel Arcanjo",
    categoria: "Devocional",
    texto: `Senhor, tende piedade de nós.
Jesus Cristo, tende piedade de nós.
Senhor, tende piedade de nós.
Jesus Cristo, ouvi-nos.
Jesus Cristo, atendei-nos.

Pai Celestial, que sois Deus, tende piedade de nós.
Filho Redentor do mundo, que sois Deus, tende piedade de nós.
Espírito Santo, que sois Deus, tende piedade de nós.
Santíssima Trindade, que sois um só Deus, tende piedade de nós.

Santa Maria, Rainha dos Anjos, rogai por nós.
São Miguel Arcanjo, rogai por nós.
São Miguel, cheio da graça de Deus, rogai por nós.
São Miguel, perfeito adorador do Verbo Divino, rogai por nós.
São Miguel, coroado de glória e de honra, rogai por nós.
São Miguel, poderosíssimo príncipe dos exércitos do Senhor, rogai por nós.
São Miguel, porta-bandeira da Santíssima Trindade, rogai por nós.
São Miguel, guardião do Paraíso, rogai por nós.
São Miguel, guia e consolador do povo de Deus, rogai por nós.
São Miguel, esplendor e fortaleza da Igreja militante, rogai por nós.
São Miguel, honra e alegria da Igreja triunfante, rogai por nós.
São Miguel, luz dos Anjos, rogai por nós.
São Miguel, baluarte dos Cristãos, rogai por nós.
São Miguel, força dos que combatem sob o estandarte da Cruz, rogai por nós.
São Miguel, luz e confiança das almas no último momento da vida, rogai por nós.
São Miguel, socorro certíssimo, rogai por nós.
São Miguel, nosso auxílio em todas as adversidades, rogai por nós.
São Miguel, mensageiro da sentença eterna, rogai por nós.
São Miguel, consolador das almas do Purgatório, rogai por nós.
São Miguel, a quem o Senhor incumbiu de receber as almas após a morte, rogai por nós.

Cordeiro de Deus, que tirais o pecado do mundo, perdoai-nos, Senhor.
Cordeiro de Deus, que tirais o pecado do mundo, ouvi-nos, Senhor.
Cordeiro de Deus, que tirais o pecado do mundo, tende piedade de nós.

Rogai por nós, ó glorioso São Miguel, príncipe da Igreja de Cristo.
Para que sejamos dignos de suas promessas. Amém.`
  },
  {
    id: "consagracao-sao-miguel",
    titulo: "Consagração a São Miguel Arcanjo",
    categoria: "Consagração",
    texto: `Ó nobilíssimo Príncipe das Hierarquias Angélicas, valente guerreiro do Altíssimo, zeloso defensor da glória do Senhor, terror dos anjos rebeldes, amor e delícia de todos os anjos justos, meu diletíssimo Arcanjo São Miguel, desejando eu fazer parte do número dos vossos devotos e servos, a vós hoje me ofereço, me dedico e me me me me me me dedico e me me entrego e me ponho a mim mesmo, a minha família e tudo o que me pertence, debaixo da vossa poderosíssima proteção.

É pequena a oferta do meu serviço, sendo eu um miserável pecador, mas vós grandificareis o afeto do meu coração. Lembrai-vos que de hoje em diante estou debaixo do vosso sustento, e deveis assistir-me em toda a minha vida, alcançar-me o perdão dos meus muitos e graves pecados, o amor de coração ao meu Deus, ao meu querido Salvador Jesus Cristo e à minha doce Mãe Maria Santíssima, e alcançar-me todos os auxílios necessários para chegar à coroa da glória.

Defendei-me sempre dos inimigos da minha alma, especialmente no último momento da minha vida. Vinde, ó príncipe gloriosíssimo, assistir-me na última luta, e com a vossa arma poderosa lançai para longe, nos abismos do inferno, aquele anjo quebrador de promessas e soberbo que um dia prostrastes no combate do Céu. Amém.`
  },
  {
    id: "salmo-91",
    titulo: "Salmo 91 (Sob a Proteção do Altíssimo)",
    categoria: "Bíblica",
    texto: `Tu que habitas sob a proteção do Altíssimo, que moras à sombra do Onipotente, dize ao Senhor: "Meu refúgio, minha fortaleza, meu Deus em quem confio!"

Ele te livrará do laço do caçador e da peste perniciosa. Ele te cobrirá com suas plumas, sob suas asas encontrarás refúgio; sua fidelidade será teu escudo e armadura.

Não temerás os terrores da noite, nem a flecha que voa de dia, nem a peste que se move nas trevas, nem o mal que devasta ao meio-dia.

Caiam mil ao teu lado e dez mil à tua direita: tu não serás atingido. Basta que olhes com teus olhos para veres o castigo dos ímpios.

Pois disseste: "O Senhor é meu refúgio!" Fizeste do Altíssimo tua morada. Nenhum mal te atingirá, praga nenhuma chegará à tua tenda.

Porque aos seus anjos ele dará ordens a teu respeito, para que te guardem em todos os teus caminhos. Eles te sustentarão em suas mãos, para que não tropeces em nenhuma pedra.

Caminharás sobre o leão e a víbora, pisarás o leãozinho e a serpente. "Porque se uniu a mim, eu o livrarei; eu o protegerei, pois conhece o meu nome."

Quando me invocar, eu o atenderei; estarei com ele na tribulação, vou livrá-lo e glorificá-lo. Vou saziá-lo com longos dias e mostrar-lhe a minha salvação.`
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
  const [activeTab, setActiveTab] = useState<"calendario" | "guiado" | "diario" | "biblioteca">("calendario");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [activeQuaresma, setActiveQuaresma] = useState<any>(null);
  const [selectedSolemnity, setSelectedSolemnity] = useState<any>(null);
  const [showSolemnities, setShowSolemnities] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [particles, setParticles] = useState<{ id: number; style: React.CSSProperties }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modo guiado state
  const [guidedStep, setGuidedStep] = useState(1);
  const [guidedNote, setGuidedNote] = useState("");

  // Diário search state
  const [journalSearch, setJournalSearch] = useState("");

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

        if (!isAdmin) {
          window.location.href = "/";
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
      const notes = [523.25, 659.25, 783.99, 1046.50];
      
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
      console.error(err);
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
    if (dayIndex === 0) return false;
    
    const prevDate = new Date(date);
    prevDate.setDate(date.getDate() - 1);
    
    return !isDayCompleted(prevDate, quaresma.id);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

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

  const handleDayClick = (dayNum: number, quaresma: any, solemnity: any) => {
    if (!quaresma && !solemnity) return;
    const clickedDate = new Date(year, month, dayNum);
    
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
      setUpdateTrigger(prev => prev + 1);
      playSuccessSound();
      spawnParticles();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([70, 40, 70]);
      }
    }
  };

  // Coletar todas as notas escritas no diário
  const getJournalEntries = () => {
    if (typeof window === "undefined") return [];
    const entries: { dateStr: string; quaresmaName: string; text: string; dateObj: Date; dayNum: number }[] = [];
    
    quaresmas.forEach(q => {
      let current = new Date(q.start);
      const end = new Date(q.end);
      let dayIndex = 0;

      while (current <= end) {
        const relato = loadRelato(current, q.id);
        if (relato && relato.trim().length > 0) {
          entries.push({
            dateStr: current.toLocaleDateString("pt-BR"),
            quaresmaName: q.name,
            text: relato,
            dateObj: new Date(current),
            dayNum: dayIndex + 1
          });
        }
        dayIndex++;
        current.setDate(current.getDate() + 1);
      }
    });

    return entries.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
  };

  const journalEntries = getJournalEntries().filter(e => 
    e.text.toLowerCase().includes(journalSearch.toLowerCase()) || 
    e.quaresmaName.toLowerCase().includes(journalSearch.toLowerCase())
  );

  // Calcula o dia atual da quaresma de São Miguel para o Modo Guiado
  const today = new Date();
  const saoMiguelQuaresma = quaresmas.find(q => q.id === "sao-miguel") || quaresmas[1];
  const currentGuidedDayIndex = Math.min(Math.max(0, getDayIndex(today, saoMiguelQuaresma.start)), 39);
  const currentGuidedPrayer = ORACOES_SAO_MIGUEL[currentGuidedDayIndex];
  const isGuidedCompleted = isDayCompleted(today, saoMiguelQuaresma.id);

  return (
    <main style={{ minHeight: "100vh", background: "#090B10", fontFamily: "Outfit, sans-serif", color: "#fff", paddingBottom: "80px", paddingTop: "96px" }}>
      
      {/* ── HEADER DA PÁGINA COM LOGO & NAVEGAÇÃO EM ABAS ───────────────────────── */}
      <div style={{ padding: "16px 16px 24px", textAlign: "center", background: "linear-gradient(180deg, rgba(212,175,55,0.08) 0%, transparent 100%)" }}>
        
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.25)", padding: "6px 16px", borderRadius: "999px", color: "#D4AF37", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "16px" }}>
          <Shield size={14} /> Quaresma de São Miguel Arcanjo 2026
        </div>

        <h1 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "8px", background: "linear-gradient(135deg,#fff 0%,#D4AF37 50%,#fff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Jornada Devocional de 40 Dias
        </h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: "0 auto 24px", maxWidth: "500px", lineHeight: 1.5 }}>
          Fortaleça sua vida espiritual com orações guiadas, reflexões diárias e o acompanhamento do seu progresso na fé.
        </p>

        {/* ── BARRA DE ABAS NAVEGÁVEIS (TABS) ─────────────────────────────────── */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", maxWidth: "700px", margin: "0 auto" }}>
          <button
            onClick={() => setActiveTab("calendario")}
            style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "12px",
              background: activeTab === "calendario" ? "linear-gradient(135deg, #D4AF37 0%, #B38F24 100%)" : "rgba(255,255,255,0.04)",
              color: activeTab === "calendario" ? "#000" : "rgba(255,255,255,0.7)",
              fontWeight: 800, fontSize: "13px", border: activeTab === "calendario" ? "none" : "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer", transition: "all 0.25s ease", boxShadow: activeTab === "calendario" ? "0 4px 15px rgba(212,175,55,0.3)" : "none"
            }}
          >
            <CalendarIcon size={16} /> Calendário & Progresso
          </button>

          <button
            onClick={() => setActiveTab("guiado")}
            style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "12px",
              background: activeTab === "guiado" ? "linear-gradient(135deg, #D4AF37 0%, #B38F24 100%)" : "rgba(255,255,255,0.04)",
              color: activeTab === "guiado" ? "#000" : "rgba(255,255,255,0.7)",
              fontWeight: 800, fontSize: "13px", border: activeTab === "guiado" ? "none" : "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer", transition: "all 0.25s ease", boxShadow: activeTab === "guiado" ? "0 4px 15px rgba(212,175,55,0.3)" : "none"
            }}
          >
            <BookOpen size={16} /> Modo Guiado (Hoje)
          </button>

          <button
            onClick={() => setActiveTab("diario")}
            style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "12px",
              background: activeTab === "diario" ? "linear-gradient(135deg, #D4AF37 0%, #B38F24 100%)" : "rgba(255,255,255,0.04)",
              color: activeTab === "diario" ? "#000" : "rgba(255,255,255,0.7)",
              fontWeight: 800, fontSize: "13px", border: activeTab === "diario" ? "none" : "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer", transition: "all 0.25s ease", boxShadow: activeTab === "diario" ? "0 4px 15px rgba(212,175,55,0.3)" : "none"
            }}
          >
            <BookMarked size={16} /> Diário Espiritual
          </button>

          <button
            onClick={() => setActiveTab("biblioteca")}
            style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "10px 18px", borderRadius: "12px",
              background: activeTab === "biblioteca" ? "linear-gradient(135deg, #D4AF37 0%, #B38F24 100%)" : "rgba(255,255,255,0.04)",
              color: activeTab === "biblioteca" ? "#000" : "rgba(255,255,255,0.7)",
              fontWeight: 800, fontSize: "13px", border: activeTab === "biblioteca" ? "none" : "1px solid rgba(255,255,255,0.08)",
              cursor: "pointer", transition: "all 0.25s ease", boxShadow: activeTab === "biblioteca" ? "0 4px 15px rgba(212,175,55,0.3)" : "none"
            }}
          >
            <HeartHandshake size={16} /> Biblioteca de Orações
          </button>
        </div>
      </div>

      {/* ── ABA 1: CALENDÁRIO & PROGRESSO ────────────────────────────────────────── */}
      {activeTab === "calendario" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", marginBottom: "24px" }}>
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
              <div>
                <span className="progress-title" style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)" }}>
                  Seu Progresso
                </span>
                <h3 className="level-title" style={{ fontWeight: 900, margin: "4px 0 2px", color: "#D4AF37" }}>
                  Nível {level}
                </h3>
                <p className="level-subtitle" style={{ fontWeight: 600, margin: 0, color: "rgba(255,255,255,0.8)" }}>
                  {getLevelName(level)}
                </p>
                
                <div style={{ marginTop: "12px" }}>
                  <div className="xp-text" style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>
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

              <div style={{ display: "flex", alignItems: "center", gap: "16px", background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.15)", padding: "16px", borderRadius: "16px" }}>
                <div className="streak-flame" style={{ fontSize: "32px", animation: "pulse 2s infinite" }}>
                  🔥
                </div>
                <div>
                  <h4 className="streak-title" style={{ fontWeight: 900, margin: 0, color: "#10B981" }}>
                    {streak} {streak === 1 ? "Dia Seguidos" : "Dias Seguidos"}
                  </h4>
                  <p className="streak-desc" style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.6)" }}>
                    {streak > 0 ? "Mantenha o fogo da fé aceso!" : "Complete uma oração para iniciar seu streak!"}
                  </p>
                </div>
              </div>

              <hr style={{ border: "none", height: "1px", background: "rgba(255,255,255,0.08)", margin: 0 }} />

              <div>
                <h4 className="section-title" style={{ fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px", color: "rgba(255,255,255,0.5)" }}>
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

              <div style={{ background: "rgba(212, 175, 55, 0.03)", border: "1px dashed rgba(212, 175, 55, 0.25)", padding: "16px", borderRadius: "16px" }}>
                <span className="challenge-title" style={{ fontWeight: 800, color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Desafio Litúrgico do Dia
                </span>
                <p className="challenge-desc" style={{ margin: "6px 0 0", color: "rgba(255,255,255,0.85)", lineHeight: 1.5, fontWeight: 500 }}>
                  "Ofereça 10 minutos de silêncio e meditação contemplativa hoje, agradecendo a Deus por todas as graças recebidas."
                </p>
              </div>

            </div>

            {/* Lado Direito: Calendário */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                {quaresmas.filter(q => q.start.getMonth() === month || q.end.getMonth() === month || (q.start.getMonth() < month && q.end.getMonth() > month)).map(q => (
                  <div key={q.id} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", background: "rgba(255,255,255,0.03)", padding: "4px 12px", borderRadius: "999px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: q.color }} />
                    {q.name}
                  </div>
                ))}
              </div>

              <div style={{
                background: "#111520",
                border: "1px solid rgba(255, 255, 255, 0.05)",
                borderRadius: "20px",
                padding: "24px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)"
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", marginBottom: "16px" }}>
                  {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(day => (
                    <div key={day} className="calendar-header-day" style={{ fontWeight: 700 }}>
                      {day}
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
                  {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

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

                    const done = mounted && quaresma ? isDayCompleted(date, quaresma.id) : false;
                    const locked = mounted && quaresma ? isDayLocked(date, quaresma) : false;
                    const isClickable = quaresma || solemnity;

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
                        <span className="calendar-day-num" style={{ fontWeight: 700 }}>{dayNum}</span>
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
        </div>
      )}

      {/* ── ABA 2: MODO GUIADO (HOJE) ────────────────────────────────────────── */}
      {activeTab === "guiado" && (
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 16px" }}>
          
          <div style={{ background: "#111520", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "24px", padding: "32px 24px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
            
            {/* Header do Dia */}
            <div style={{ textAlign: "center", marginBottom: "32px" }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(212,175,55,0.15)", padding: "6px 14px", borderRadius: "999px", color: "#D4AF37", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>
                Dia {currentGuidedDayIndex + 1} de 40 • {today.toLocaleDateString("pt-BR")}
              </div>
              <h2 style={{ fontSize: "26px", fontWeight: 900, margin: "0 0 6px", color: "#fff" }}>
                {currentGuidedPrayer.tema}
              </h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: 0 }}>
                Siga os passos abaixo para rezar e viver a graça do dia de hoje.
              </p>
            </div>

            {/* Stepper / Passos */}
            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
              {[1, 2, 3, 4, 5].map(step => (
                <button
                  key={step}
                  onClick={() => setGuidedStep(step)}
                  style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: guidedStep === step ? "#D4AF37" : guidedStep > step ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.05)",
                    color: guidedStep === step ? "#000" : guidedStep > step ? "#10B981" : "rgba(255,255,255,0.4)",
                    border: guidedStep === step ? "none" : guidedStep > step ? "1px solid #10B981" : "1px solid rgba(255,255,255,0.1)",
                    fontWeight: 800, fontSize: "14px", cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {guidedStep > step ? "✓" : step}
                </button>
              ))}
            </div>

            {/* Conteúdo do Passo */}
            {guidedStep === 1 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px", animation: "slideUp 0.3s ease" }}>
                <h3 style={{ color: "#D4AF37", fontSize: "16px", fontWeight: 800, margin: "0 0 12px", textTransform: "uppercase" }}>
                  Passo 1: Sinal da Cruz & Invocação Inicial
                </h3>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", lineHeight: 1.8, fontStyle: "italic" }}>
                  "Em nome do Pai, do Filho e do Espírito Santo. Amém.<br/><br/>
                  Vinde, ó Deus, em meu auxílio. Socorrei-me sem demora. Glória ao Pai, ao Filho e ao Espírito Santo, como era no princípio, agora e sempre. Amém."
                </p>
              </div>
            )}

            {guidedStep === 2 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px", animation: "slideUp 0.3s ease" }}>
                <h3 style={{ color: "#D4AF37", fontSize: "16px", fontWeight: 800, margin: "0 0 12px", textTransform: "uppercase" }}>
                  Passo 2: Oração do Dia ({currentGuidedPrayer.tema})
                </h3>
                <p style={{ color: "#fff", fontSize: "17px", lineHeight: 1.8, fontStyle: "italic", textAlign: "justify" }}>
                  "{currentGuidedPrayer.oracao}"
                </p>
              </div>
            )}

            {guidedStep === 3 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px", textAlign: "center", animation: "slideUp 0.3s ease" }}>
                <h3 style={{ color: "#D4AF37", fontSize: "16px", fontWeight: 800, margin: "0 0 12px", textTransform: "uppercase" }}>
                  Passo 3: Momento de Silêncio & Meditação
                </h3>
                <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "15px", lineHeight: 1.6, marginBottom: "20px" }}>
                  Feche os olhos por alguns instantes. Respire fundo e coloque diante de Deus a intenção do seu coração para o dia de hoje.
                </p>
                <div style={{ background: "rgba(212,175,55,0.05)", border: "1px dashed rgba(212,175,55,0.3)", borderRadius: "12px", padding: "20px" }}>
                  <span style={{ fontSize: "28px" }}>🧘‍♂️ 🕯️</span>
                  <p style={{ color: "#D4AF37", fontWeight: 700, margin: "8px 0 0", fontSize: "14px" }}>
                    "Aqueles que esperam no Senhor renovam suas forças." (Isaías 40,31)
                  </p>
                </div>
              </div>
            )}

            {guidedStep === 4 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px", animation: "slideUp 0.3s ease" }}>
                <h3 style={{ color: "#D4AF37", fontSize: "16px", fontWeight: 800, margin: "0 0 12px", textTransform: "uppercase" }}>
                  Passo 4: Oração de São Miguel Arcanjo
                </h3>
                <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "16px", lineHeight: 1.8, fontStyle: "italic" }}>
                  "{BIBLIOTECA_ORACOES[0].texto}"
                </p>
              </div>
            )}

            {guidedStep === 5 && (
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "24px", animation: "slideUp 0.3s ease" }}>
                <h3 style={{ color: "#D4AF37", fontSize: "16px", fontWeight: 800, margin: "0 0 12px", textTransform: "uppercase" }}>
                  Passo 5: Seu Diário Espiritual (Opcional)
                </h3>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", marginBottom: "12px" }}>
                  Escreva uma breve graça, propósito ou reflexão sobre a oração de hoje:
                </p>
                <textarea
                  placeholder="Escreva sua partilha ou graça alcançada hoje..."
                  value={guidedNote || loadRelato(today, saoMiguelQuaresma.id)}
                  onChange={(e) => {
                    setGuidedNote(e.target.value);
                    saveRelato(today, saoMiguelQuaresma.id, e.target.value);
                  }}
                  style={{
                    width: "100%", minHeight: "100px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,175,55,0.3)",
                    borderRadius: "12px", padding: "14px", color: "#fff", fontSize: "14px", fontFamily: "Outfit, sans-serif",
                    resize: "vertical", outline: "none"
                  }}
                />
              </div>
            )}

            {/* Controles do Stepper */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", gap: "12px" }}>
              <button
                disabled={guidedStep === 1}
                onClick={() => setGuidedStep(prev => Math.max(1, prev - 1))}
                style={{
                  padding: "12px 20px", borderRadius: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontWeight: 700, cursor: guidedStep === 1 ? "default" : "pointer", opacity: guidedStep === 1 ? 0.3 : 1
                }}
              >
                Anterior
              </button>

              {guidedStep < 5 ? (
                <button
                  onClick={() => setGuidedStep(prev => Math.min(5, prev + 1))}
                  style={{
                    padding: "12px 24px", borderRadius: "12px", background: "linear-gradient(135deg, #D4AF37 0%, #B38F24 100%)",
                    color: "#000", fontWeight: 900, border: "none", cursor: "pointer", boxShadow: "0 4px 15px rgba(212,175,55,0.3)"
                  }}
                >
                  Próximo Passo
                </button>
              ) : (
                <button
                  onClick={() => {
                    completeDay(today, saoMiguelQuaresma.id);
                    setUpdateTrigger(prev => prev + 1);
                    playSuccessSound();
                    spawnParticles();
                    alert("Glória a Deus! Você concluiu a oração guiada do dia de hoje com sucesso!");
                  }}
                  style={{
                    padding: "12px 24px", borderRadius: "12px", background: isGuidedCompleted ? "#10B981" : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    color: "#fff", fontWeight: 900, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px"
                  }}
                >
                  <Check size={18} /> {isGuidedCompleted ? "Dia já Concluído ✓" : "Finalizar Oração do Dia"}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ── ABA 3: DIÁRIO ESPIRITUAL ─────────────────────────────────────────── */}
      {activeTab === "diario" && (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: 900, margin: 0, color: "#fff" }}>
                Seu Diário Espiritual ✍️
              </h2>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", margin: "4px 0 0" }}>
                Reveja todas as suas reflexões, intenções e graças gravadas na jornada.
              </p>
            </div>

            {/* Campo de Busca */}
            <div style={{ position: "relative", width: "100%", maxWidth: "300px" }}>
              <Search size={16} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)" }} />
              <input
                type="text"
                placeholder="Buscar no diário..."
                value={journalSearch}
                onChange={(e) => setJournalSearch(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px 10px 38px", background: "#111520", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px", color: "#fff", fontSize: "13px", outline: "none"
                }}
              />
            </div>
          </div>

          {journalEntries.length === 0 ? (
            <div style={{ background: "#111520", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "20px", padding: "48px 24px", textAlign: "center" }}>
              <BookMarked size={48} style={{ color: "rgba(212,175,55,0.4)", marginBottom: "16px" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>
                {journalSearch ? "Nenhum relato encontrado para a busca." : "Seu Diário Espiritual está vazio."}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", maxWidth: "400px", margin: "0 auto 20px" }}>
                {journalSearch ? "Tente buscar por outras palavras-chave." : "Ao concluir o dia de oração no Calendário ou Modo Guiado, você pode salvar seu relato e ele aparecerá aqui!"}
              </p>
              {!journalSearch && (
                <button
                  onClick={() => setActiveTab("guiado")}
                  style={{
                    padding: "10px 20px", borderRadius: "12px", background: "#D4AF37", color: "#000", fontWeight: 800,
                    border: "none", cursor: "pointer", fontSize: "13px"
                  }}
                >
                  Ir para o Modo Guiado
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {journalEntries.map((entry, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#111520", border: "1px solid rgba(212,175,55,0.2)", borderRadius: "16px", padding: "20px",
                    display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ background: "rgba(212,175,55,0.15)", color: "#D4AF37", fontSize: "11px", fontWeight: 800, padding: "2px 8px", borderRadius: "6px" }}>
                        Dia {entry.dayNum}
                      </span>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                        {entry.dateStr}
                      </span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "14px", lineHeight: 1.6, margin: 0, fontStyle: "italic", whiteSpace: "pre-wrap" }}>
                      "{entry.text}"
                    </p>
                  </div>

                  <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: "11px", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Sparkles size={12} style={{ color: "#D4AF37" }} /> {entry.quaresmaName}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* ── ABA 4: BIBLIOTECA DE ORAÇÕES ─────────────────────────────────────── */}
      {activeTab === "biblioteca" && (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px" }}>
          
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: 900, margin: "0 0 8px", color: "#fff" }}>
              Biblioteca de Orações Sacras 📜
            </h2>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: 0, maxWidth: "500px", marginLeft: "auto", marginRight: "auto" }}>
              Orações clássicas e orações da tradição da Igreja para fortalecer a sua jornada de fé e libertação.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {BIBLIOTECA_ORACOES.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#111520", border: "1px solid rgba(212, 175, 55, 0.2)", borderRadius: "20px", padding: "24px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <span style={{ background: "rgba(212, 175, 55, 0.15)", color: "#D4AF37", fontSize: "11px", fontWeight: 800, padding: "4px 10px", borderRadius: "999px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {item.categoria}
                    </span>
                    <h3 style={{ fontSize: "20px", fontWeight: 900, color: "#fff", margin: "8px 0 0" }}>
                      {item.titulo}
                    </h3>
                  </div>

                  <button
                    onClick={() => copyToClipboard(item.texto, item.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "8px 14px",
                      color: copiedId === item.id ? "#10B981" : "rgba(255,255,255,0.8)", fontSize: "12px", fontWeight: 700, cursor: "pointer"
                    }}
                  >
                    {copiedId === item.id ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                    {copiedId === item.id ? "Copiado!" : "Copiar Oração"}
                  </button>
                </div>

                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "14px", padding: "20px" }}>
                  <p style={{ color: "rgba(255,255,255,0.9)", fontSize: "15px", lineHeight: 1.8, margin: 0, fontStyle: "italic", whiteSpace: "pre-wrap", textAlign: "justify" }}>
                    {item.texto}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ── MODAL DE ORAÇÃO E SOLENIDADE (CALENDÁRIO) ───────────────────────── */}
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
                
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  {selectedSolemnity && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(212,175,55,0.15)", padding: "4px 12px", borderRadius: "999px", color: "#D4AF37", fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>
                      ⛪ {selectedSolemnity.name}
                    </div>
                  )}
                  
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

                {prayer && (
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
                    <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "15px", lineHeight: 1.7, margin: 0, fontStyle: "italic", textAlign: "center" }}>
                      "{prayer.oracao}"
                    </p>
                  </div>
                )}

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

        .progress-title { font-size: 11px; }
        .level-title { font-size: 20px; }
        .level-subtitle { font-size: 14px; }
        .xp-text { font-size: 11px; }
        .streak-title { font-size: 18px; }
        .streak-desc { font-size: 12px; }
        .section-title { font-size: 14px; }
        .challenge-title { font-size: 10px; }
        .challenge-desc { font-size: 13px; }
        .calendar-header-day { text-align: center; font-size: 12px; color: rgba(255,255,255,0.4); text-transform: uppercase; }
        .calendar-day-num { font-size: 18px; }

        @media (max-width: 768px) {
          .progress-title { font-size: 13px; letter-spacing: 0.12em; }
          .level-title { font-size: 24px; margin: 6px 0 4px; }
          .level-subtitle { font-size: 16px; font-weight: 700; }
          .xp-text { font-size: 13px; font-weight: 600; }
          .streak-title { font-size: 22px; }
          .streak-desc { font-size: 14px; line-height: 1.4; }
          .section-title { font-size: 15px; letter-spacing: 0.1em; }
          .challenge-title { font-size: 12px; letter-spacing: 0.12em; }
          .challenge-desc { font-size: 15px; line-height: 1.6; }
          .calendar-header-day { font-size: 14px; font-weight: 800; }
          .calendar-day-num { font-size: 22px; font-weight: 800; }
        }
      `}</style>
    </main>
  );
}
