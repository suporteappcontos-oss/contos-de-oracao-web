'use client'

import React from 'react'
import { Download, Sparkles, X, ShieldAlert, CreditCard } from 'lucide-react'
import Link from 'next/link'

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function ModalBloqueioDownloadTrial({ isOpen, onClose }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg overflow-hidden bg-[#0d131f] border-2 border-[#D4AF37]/50 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(212,175,55,0.2)] text-center">
        
        {/* Glow Dourado */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-2"
        >
          <X size={20} />
        </button>

        {/* Ícone */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#D4AF37] flex items-center justify-center text-black shadow-lg shadow-[#D4AF37]/20 transform -rotate-3">
          <Download size={32} />
        </div>

        {/* Título */}
        <h3 className="text-white text-2xl font-black tracking-tight mb-2">
          Downloads Restritos no Período de Teste
        </h3>

        <p className="text-white/70 text-sm leading-relaxed mb-6">
          Você está aproveitando seus <strong className="text-[#D4AF37]">7 Dias Grátis</strong>! 🎬📖 <br />
          Você pode assistir a todos os vídeos e ler todos os materiais online ilimitadamente.
        </p>

        {/* Card de Alerta */}
        <div className="bg-[#151c2c] border border-white/10 rounded-2xl p-4 mb-6 text-left flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Libere Downloads Ilimitados</h4>
            <p className="text-white/50 text-xs">Para baixar os arquivos PDF e vídeos em HD para o seu celular ou computador, conclua sua assinatura sem período de teste.</p>
          </div>
        </div>

        {/* Ações */}
        <div className="space-y-3">
          <Link
            href="/planos"
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#D4AF37] text-black font-black text-sm uppercase tracking-wider hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20"
          >
            <CreditCard size={18} />
            <span>Assinar Plano Completo Agora</span>
          </Link>

          <button
            onClick={onClose}
            className="w-full py-3 text-white/50 hover:text-white text-xs font-semibold transition-colors"
          >
            Continuar assistindo online
          </button>
        </div>

      </div>
    </div>
  )
}
