'use client'

import React, { useState, useEffect } from 'react'
import { Activity, Eye, Smartphone, Monitor, ExternalLink, Zap, Play, MousePointer, ShieldCheck, ArrowUpRight } from 'lucide-react'

type Props = {
  totalViews?: number
  views7Dias?: number
  acessosSite?: number
  acessosApp?: number
  topVideoNome?: string
}

export default function CardMetricasAnalytics({
  totalViews = 0,
  views7Dias = 0,
  acessosSite = 0,
  acessosApp = 0,
  topVideoNome
}: Props) {
  const totalAcessos = acessosSite + acessosApp
  const appPct = totalAcessos > 0 ? Math.round((acessosApp / totalAcessos) * 100) : 50
  const sitePct = totalAcessos > 0 ? 100 - appPct : 50

  return (
    <div className="bg-[#111827] border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden mb-10">
      {/* Glow de fundo */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header do componente */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-lg shadow-[#D4AF37]/10">
            <Activity size={24} className="text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-white text-xl md:text-2xl font-black tracking-tight">Analytics & Métricas Reais</h2>
              <span className="flex items-center gap-1 bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981] text-[0.65rem] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Ao Vivo
              </span>
            </div>
            <p className="text-white/40 text-xs mt-0.5">Métricas de acessos, visualizações reais e integração oficial com o PostHog.</p>
          </div>
        </div>

        <a
          href="https://us.posthog.com/project/531922"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] hover:text-white text-xs font-bold transition-all hover:scale-105 shadow-md"
        >
          <span>Abrir Painel Oficial do PostHog</span>
          <ArrowUpRight size={14} className="text-[#D4AF37]" />
        </a>
      </div>

      {/* Grid de Métricas Nativas e Reais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* Card 1: Total Acessos Registrados (Real) */}
        <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-5 relative group hover:border-[#10b981]/40 transition-all shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/50 text-[0.7rem] uppercase tracking-widest font-black">Acessos Totais</span>
            <div className="w-8 h-8 rounded-xl bg-[#10b981]/10 flex items-center justify-center text-[#10b981]">
              <Eye size={16} />
            </div>
          </div>
          <div className="text-white text-3xl font-black tracking-tight">{totalAcessos} <span className="text-xs font-medium text-white/40">acessos</span></div>
          <div className="text-white/40 text-xs font-semibold mt-2 flex items-center gap-2">
            <span>🖥️ Site: <strong className="text-white">{acessosSite}</strong></span>
            <span>·</span>
            <span>📱 App: <strong className="text-white">{acessosApp}</strong></span>
          </div>
        </div>

        {/* Card 2: Dispositivos Reais (App vs Web) */}
        <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-5 relative group hover:border-[#D4AF37]/40 transition-all shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/50 text-[0.7rem] uppercase tracking-widest font-black">Origem dos Acessos</span>
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <Smartphone size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-white text-3xl font-black tracking-tight">{appPct}%</span>
            <span className="text-white/40 text-xs font-semibold">App Mobile ({sitePct}% Web)</span>
          </div>
          {/* Barra de Progresso Real */}
          <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden flex">
            <div className="h-full bg-green-500" style={{ width: `${appPct}%` }} title={`App: ${appPct}%`} />
            <div className="h-full bg-blue-500" style={{ width: `${sitePct}%` }} title={`Web: ${sitePct}%`} />
          </div>
        </div>

        {/* Card 3: Engajamento de Vídeos (7 Dias - Real) */}
        <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-5 relative group hover:border-[#3b82f6]/40 transition-all shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/50 text-[0.7rem] uppercase tracking-widest font-black">Vídeos (Últimos 7 Dias)</span>
            <div className="w-8 h-8 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center text-[#3b82f6]">
              <Play size={16} />
            </div>
          </div>
          <div className="text-white text-3xl font-black tracking-tight">{views7Dias} <span className="text-xs font-medium text-[#3b82f6]">reproduções</span></div>
          <p className="text-white/40 text-xs mt-2">Total histórico: <strong className="text-white">{totalViews}</strong> reproduções.</p>
        </div>

        {/* Card 4: Session Replay do PostHog */}
        <div className="bg-[#0b0f19] border border-white/5 rounded-2xl p-5 relative group hover:border-[#ec4899]/40 transition-all shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/50 text-[0.7rem] uppercase tracking-widest font-black">Gravação de Sessões HD</span>
            <div className="w-8 h-8 rounded-xl bg-[#ec4899]/10 flex items-center justify-center text-[#ec4899]">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-white text-xl font-black tracking-tight">PostHog Oficial</div>
          <p className="text-white/40 text-xs mt-2">Assista aos vídeos das sessões de navegação dos usuários no painel PostHog.</p>
        </div>

      </div>
    </div>
  )
}
