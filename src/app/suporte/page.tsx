"use client";

import React, { useState } from "react";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";
import { MessageCircle, Mail, Clock, HelpCircle, ArrowRight, Check } from "lucide-react";

export default function SuportePage() {
  const [copiado, setCopiado] = useState(false);

  const handleEmailClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Copia o e-mail para a área de transferência
    navigator.clipboard.writeText("suporte.appcontos@gmail.com");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 4000);

    // Tenta abrir o webmail do Gmail em nova aba (perfeito para desktop)
    window.open("https://mail.google.com/mail/?view=cm&fs=1&to=suporte.appcontos@gmail.com", "_blank");
  };

  return (
    <main className="min-h-screen flex flex-col relative bg-transparent">
      <DynamicBackground />
      
      <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-32 text-white relative z-10">
        <div className="bg-[#090B10]/95 backdrop-blur-xl p-8 md:p-14 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col items-center">
          
          {/* Cabeçalho */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#8b7322] p-[1px] mb-6 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <div className="w-full h-full bg-[#090B10] rounded-[15px] flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-[#D4AF37]" />
            </div>
          </div>

          <h1 
            className="text-3xl md:text-5xl mb-4 text-center font-bold text-white tracking-tight"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Central de Suporte
          </h1>
          
          <p className="text-slate-300 text-center max-w-lg mb-12 text-base md:text-lg leading-relaxed" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Estamos aqui para ajudar você. Escolha um dos canais abaixo para falar diretamente com a nossa equipe de atendimento.
          </p>

          {/* Cards de Contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mb-12" style={{ fontFamily: '"Outfit", sans-serif' }}>
            
            {/* Botão WhatsApp */}
            <a 
              href="https://wa.me/556492994823?text=Olá,%20preciso%20de%20suporte%20no%20Contos%20de%20Oração" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col justify-between p-8 rounded-2xl transition-all duration-300 relative overflow-hidden no-underline cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.1), rgba(37, 211, 102, 0.05))',
                border: '1px solid rgba(37, 211, 102, 0.2)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/10 rounded-full blur-2xl group-hover:bg-[#25D366]/20 transition-all duration-300" />
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/30 group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="w-6 h-6 text-black fill-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white m-0 leading-tight">WhatsApp</h3>
                    <span className="text-xs text-[#25D366] font-semibold tracking-wide uppercase">Atendimento Rápido</span>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed m-0 mb-6">
                  Fale com um atendente via chat para tirar dúvidas sobre sua assinatura, acesso ou aplicativos.
                </p>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-[#25D366] group-hover:translate-x-1 transition-transform duration-300">
                <span>Iniciar conversa</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </a>

            {/* Botão E-mail com suporte a Desktop e Mobile */}
            <div 
              onClick={handleEmailClick}
              className="group flex flex-col justify-between p-8 rounded-2xl transition-all duration-300 relative overflow-hidden no-underline cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05))',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl group-hover:bg-[#D4AF37]/20 transition-all duration-300" />
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/30 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white m-0 leading-tight">E-mail</h3>
                    <span className="text-xs text-[#D4AF37] font-semibold tracking-wide uppercase">Suporte Dedicado</span>
                  </div>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed m-0 mb-3">
                  Envie sua solicitação para o nosso e-mail de suporte institucional:
                </p>
                <div className="bg-black/40 px-3 py-2 rounded-lg border border-white/5 select-all text-[#D4AF37] text-sm font-medium mb-6 inline-block">
                  suporte.appcontos@gmail.com
                </div>
              </div>
              <div className="flex items-center justify-between text-sm font-bold text-[#D4AF37] group-hover:translate-x-1 transition-transform duration-300">
                {copiado ? (
                  <span className="flex items-center gap-2 text-green-400">
                    <Check className="w-4 h-4 text-green-400" /> E-mail copiado!
                  </span>
                ) : (
                  <span>Enviar e-mail</span>
                )}
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

          </div>

          {/* Horários / Info */}
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium border-t border-white/5 pt-6 w-full justify-center" style={{ fontFamily: '"Outfit", sans-serif' }}>
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span>Nosso horário de atendimento é de Segunda a Sexta, em horário comercial.</span>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
