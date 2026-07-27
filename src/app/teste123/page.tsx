"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Teste123Page() {
  const [selectedStyle, setSelectedStyle] = useState<"1a" | "1b" | "2a" | "2b">("1a");

  // Renderização dinâmica do Badge / Marca de acordo com a variação escolhida
  const renderBrandStyle = (size: "sm" | "lg" = "sm") => {
    const isLg = size === "lg";

    if (selectedStyle === "1a") {
      // Variação 1A: Badge Selo Ouro Reluzente
      return (
        <div className="inline-flex items-center gap-2">
          <span className={`font-black tracking-wide text-white ${isLg ? 'text-3xl sm:text-5xl md:text-6xl' : 'text-base sm:text-xl md:text-2xl'}`}>
            Contos de Oração
          </span>
          <span className={`gold-badge-glow text-slate-950 font-black uppercase tracking-widest rounded-full shadow-xl border border-amber-300/60 ${isLg ? 'text-xs md:text-sm px-4 py-1.5 ml-2' : 'text-[10px] sm:text-xs px-2.5 py-0.5 ml-1'}`}>
            CLUB
          </span>
        </div>
      );
    }

    if (selectedStyle === "1b") {
      // Variação 1B: Badge Ouro Nobre com Estrela Sacra ✨
      return (
        <div className="inline-flex items-center gap-2">
          <span className={`font-black tracking-wide text-white ${isLg ? 'text-3xl sm:text-5xl md:text-6xl' : 'text-base sm:text-xl md:text-2xl'}`}>
            Contos de Oração
          </span>
          <span className={`bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black uppercase tracking-widest rounded-lg shadow-md border border-amber-300/40 inline-flex items-center gap-1 ${isLg ? 'text-xs md:text-sm px-3.5 py-1 ml-2' : 'text-[10px] sm:text-xs px-2 py-0.5 ml-1'}`}>
            <span className="sparkle-anim">✨</span> CLUB
          </span>
        </div>
      );
    }

    if (selectedStyle === "2a") {
      // Variação 2A: Texto CLUB com Shimmer Passante Dinâmico
      return (
        <div className="inline-flex items-baseline gap-2">
          <span className={`font-black tracking-wide text-white ${isLg ? 'text-3xl sm:text-5xl md:text-6xl' : 'text-base sm:text-xl md:text-2xl'}`}>
            Contos de Oração
          </span>
          <span className={`shimmer-gold-text font-black uppercase tracking-wider ${isLg ? 'text-3xl sm:text-5xl md:text-6xl' : 'text-base sm:text-xl md:text-2xl'}`}>
            CLUB
          </span>
        </div>
      );
    }

    if (selectedStyle === "2b") {
      // Variação 2B: Dual-Tone Ouro Metálico + Glow Neon
      return (
        <div className="inline-flex items-baseline gap-2">
          <span className={`font-black tracking-wide bg-gradient-to-r from-amber-100 via-amber-200 to-yellow-100 bg-clip-text text-transparent ${isLg ? 'text-3xl sm:text-5xl md:text-6xl' : 'text-base sm:text-xl md:text-2xl'}`}>
            Contos de Oração
          </span>
          <span className={`font-black uppercase tracking-widest text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)] ${isLg ? 'text-3xl sm:text-5xl md:text-6xl ml-1' : 'text-base sm:text-xl md:text-2xl ml-1'}`}>
            CLUB
          </span>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-slate-100 font-['Outfit',sans-serif]">
      {/* Dynamic Style injection for animations */}
      <style jsx global>{`
        @keyframes goldPulseGlow {
          0%, 100% {
            box-shadow: 0 0 10px rgba(245, 158, 11, 0.4), 0 0 20px rgba(245, 158, 11, 0.2);
            background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          }
          50% {
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.8), 0 0 35px rgba(245, 158, 11, 0.4);
            background: linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%);
          }
        }
        .gold-badge-glow {
          animation: goldPulseGlow 2.5s infinite ease-in-out;
        }

        @keyframes shimmerGold {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-gold-text {
          background: linear-gradient(90deg, #F59E0B 0%, #FFF 50%, #F59E0B 100%);
          background-size: 200% auto;
          color: transparent;
          -webkit-background-clip: text;
          animation: shimmerGold 3s infinite linear;
        }

        @keyframes sparkleRotate {
          0% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.3) rotate(180deg); }
          100% { transform: scale(1) rotate(360deg); }
        }
        .sparkle-anim {
          display: inline-block;
          animation: sparkleRotate 3s infinite ease-in-out;
        }
      `}</style>

      {/* ════════ BARRA FLUTUANTE SELETORA DE ESTILOS (PARA O PATRÃO ESCOLHER) ════════ */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-4xl bg-slate-900/95 border border-amber-500/30 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-xs sm:text-sm font-bold text-amber-300">
              Painel de Escolha do Patrão:
            </span>
          </div>

          {/* BOTÕES DE SELEÇÃO RÁPIDA */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSelectedStyle("1a")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStyle === "1a"
                  ? "bg-amber-500 text-slate-950 shadow-lg scale-105"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              1A. Selo Ouro Luxo
            </button>
            <button
              onClick={() => setSelectedStyle("1b")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStyle === "1b"
                  ? "bg-amber-500 text-slate-950 shadow-lg scale-105"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              1B. Selo com Estrela ✨
            </button>
            <button
              onClick={() => setSelectedStyle("2a")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStyle === "2a"
                  ? "bg-amber-500 text-slate-950 shadow-lg scale-105"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              2A. Shimmer Passante
            </button>
            <button
              onClick={() => setSelectedStyle("2b")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedStyle === "2b"
                  ? "bg-amber-500 text-slate-950 shadow-lg scale-105"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              2B. Dual-Tone Neon
            </button>
          </div>
        </div>
      </div>

      {/* ════════ HEADER DA PÁGINA COM A LOGO ESCOLHIDA ════════ */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[72px] bg-[#090B10]/90 backdrop-blur-md border-b border-white/10 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-amber-400/30">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-cover" />
          </div>
          <div>{renderBrandStyle("sm")}</div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-xs font-extrabold uppercase tracking-wider text-slate-300">
          <span className="hover:text-amber-400 cursor-pointer">Início</span>
          <span className="hover:text-amber-400 cursor-pointer">Planos</span>
          <span className="hover:text-amber-400 cursor-pointer">Loja</span>
          <Link
            href="/planos"
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl transition-all shadow-lg"
          >
            Assinar Agora
          </Link>
        </div>
      </header>

      {/* ════════ HERO DA LANDING PAGE COM A MARCA EM DESTAQUE NA PÁGINA ════════ */}
      <main className="pt-28 pb-32 px-4 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-8">
          👑 Escolha a Melhor Versão para a Página Principal
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
          Bem-vindo ao <br />
          <div className="mt-2">{renderBrandStyle("lg")}</div>
        </h1>

        <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed font-medium">
          Desenhos bíblicos, HQs católicas e atividades pedagógicas que transformam o tempo de tela dos seus filhos em momentos abençoados de aprendizado e oração.
        </p>

        {/* CARDS DE DEMONSTRAÇÃO DOS 4 MODELOS COM INFORMAÇÕES DETALHADAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 text-left">
          
          <div
            onClick={() => setSelectedStyle("1a")}
            className={`p-6 rounded-2xl border transition-all cursor-pointer ${
              selectedStyle === "1a"
                ? "bg-amber-500/10 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-amber-400 text-xs uppercase tracking-wider">Modelo 1A</span>
              {selectedStyle === "1a" && <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">Selecionado</span>}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">1A. Selo Ouro Reluzente (VIP Badge)</h3>
            <p className="text-slate-400 text-sm">
              Selo metálico em dourado nobre com pulsação suave de luz. Transmite o prestígio de um clube fechado para assinantes de forma sofisticada.
            </p>
          </div>

          <div
            onClick={() => setSelectedStyle("1b")}
            className={`p-6 rounded-2xl border transition-all cursor-pointer ${
              selectedStyle === "1b"
                ? "bg-amber-500/10 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-amber-400 text-xs uppercase tracking-wider">Modelo 1B</span>
              {selectedStyle === "1b" && <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">Selecionado</span>}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">1B. Selo Ouro com Estrela Sacra ✨</h3>
            <p className="text-slate-400 text-sm">
              Combina o selo dourado com a estrela de Belém em rotação suave. Conecta a exclusividade da assinatura com a fé católico-infantil.
            </p>
          </div>

          <div
            onClick={() => setSelectedStyle("2a")}
            className={`p-6 rounded-2xl border transition-all cursor-pointer ${
              selectedStyle === "2a"
                ? "bg-amber-500/10 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-amber-400 text-xs uppercase tracking-wider">Modelo 2A</span>
              {selectedStyle === "2a" && <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">Selecionado</span>}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">2A. Shimmer Passante na Palavra CLUB</h3>
            <p className="text-slate-400 text-sm">
              Sem selo de fundo: a palavra CLUB recebe um feixe contínuo de luz reluzente em gradiente dourado. Limpo, moderno e direto.
            </p>
          </div>

          <div
            onClick={() => setSelectedStyle("2b")}
            className={`p-6 rounded-2xl border transition-all cursor-pointer ${
              selectedStyle === "2b"
                ? "bg-amber-500/10 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-amber-400 text-xs uppercase tracking-wider">Modelo 2B</span>
              {selectedStyle === "2b" && <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded">Selecionado</span>}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">2B. Dual-Tone Ouro Marfim + Neon Glow</h3>
            <p className="text-slate-400 text-sm">
              Texto principal em tom marfim nobre e a palavra CLUB com um aura amarelada Neon. Cria destaque máximo sem caixas ou botões.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}
