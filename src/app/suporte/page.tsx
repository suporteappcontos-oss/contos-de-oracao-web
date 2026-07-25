"use client";

import React, { useState } from "react";
import Footer from "@/components/Footer";
import DynamicBackground from "@/components/DynamicBackground";
import { Mail, Clock, HelpCircle, ArrowRight, Check, Copy } from "lucide-react";

export default function SuportePage() {
  const [copiado, setCopiado] = useState(false);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText("suporte.appcontos@gmail.com");
    setCopiado(true);
    setTimeout(() => setCopiado(false), 3000);
  };

  const handleEmailClick = () => {
    window.open("https://mail.google.com/mail/?view=cm&fs=1&to=suporte.appcontos@gmail.com", "_blank");
  };

  return (
    <main className="min-h-screen flex flex-col relative bg-[#07090E]">
      <DynamicBackground />

      <div className="flex-1 w-full max-w-5xl mx-auto px-6 py-28 md:py-36 text-white relative z-10 flex flex-col justify-center">
        
        {/* Card Principal Translucido */}
        <div className="bg-[#0B0F19]/90 backdrop-blur-2xl p-8 md:p-14 rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.75)] flex flex-col items-center relative overflow-hidden">
          
          {/* Brilho Superior sutil */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent pointer-events-none" />

          {/* Ícone de Ajuda / Suporte */}
          <div className="w-14 h-14 rounded-2xl bg-[#141A28] border border-[#D4AF37]/30 flex items-center justify-center mb-6 shadow-[0_0_25px_rgba(212,175,55,0.15)]">
            <HelpCircle className="w-7 h-7 text-[#D4AF37]" />
          </div>

          {/* Título Principal */}
          <h1
            className="text-3xl md:text-5xl mb-4 text-center font-bold text-white tracking-tight"
            style={{ fontFamily: '"Playfair Display", serif' }}
          >
            Central de Suporte
          </h1>

          <p className="text-slate-300 text-center max-w-xl mb-12 text-base md:text-lg leading-relaxed" style={{ fontFamily: '"Outfit", sans-serif' }}>
            Precisa de ajuda com sua conta, assinaturas ou aplicativos? Escolha o canal de sua preferência para falar conosco.
          </p>

          {/* Grid de Cards de Contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-10" style={{ fontFamily: '"Outfit", sans-serif' }}>

            {/* CARD 1: WHATSAPP (OFICIAL) */}
            <a
              href="https://wa.me/556492994823?text=Olá,%20preciso%20de%20suporte%20no%20Contos%20de%20Oração"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between p-7 rounded-2xl bg-[#111622] hover:bg-[#151C2C] border border-white/10 hover:border-[#25D366]/40 transition-all duration-300 relative overflow-hidden no-underline cursor-pointer shadow-lg hover:shadow-[0_12px_40px_rgba(37,211,102,0.15)] hover:-translate-y-1"
            >
              <div>
                {/* Linha do Topo: Ícone Oficial WhatsApp + Badge Status */}
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] group-hover:scale-105 transition-transform duration-300">
                    {/* SVG Oficial da Marca WhatsApp */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-7 h-7 text-white"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/10 border border-[#25D366]/20">
                    <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
                    <span className="text-[0.7rem] font-bold tracking-wider text-[#25D366] uppercase">WhatsApp Chat</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#25D366] transition-colors">
                  Atendimento via WhatsApp
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Tire dúvidas em tempo real sobre sua assinatura, acesso, cobranças ou navegação.
                </p>
              </div>

              {/* Botão de Ação */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-sm font-bold text-[#25D366]">
                <span>Iniciar conversa</span>
                <div className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:translate-x-1 group-hover:bg-[#25D366] group-hover:text-black transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </a>

            {/* CARD 2: E-MAIL */}
            <div
              onClick={handleEmailClick}
              className="group flex flex-col justify-between p-7 rounded-2xl bg-[#111622] hover:bg-[#151C2C] border border-white/10 hover:border-[#D4AF37]/40 transition-all duration-300 relative overflow-hidden no-underline cursor-pointer shadow-lg hover:shadow-[0_12px_40px_rgba(212,175,55,0.15)] hover:-translate-y-1"
            >
              <div>
                {/* Linha do Topo: Ícone E-mail + Badge */}
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#9a7e23] flex items-center justify-center shadow-[0_4px_20px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform duration-300">
                    <Mail className="w-6 h-6 text-black" />
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                    <span className="text-[0.7rem] font-bold tracking-wider text-[#D4AF37] uppercase">Suporte Oficial</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#D4AF37] transition-colors">
                  E-mail Institucional
                </h3>

                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Envie sua solicitação formal com anexos ou comprovantes de acesso.
                </p>

                {/* Box do Endereço de E-mail com Copiar */}
                <div
                  onClick={handleCopyEmail}
                  className="bg-[#090C12] hover:bg-[#0E131F] px-3.5 py-2.5 rounded-xl border border-white/10 flex items-center justify-between gap-2 text-sm font-semibold text-[#D4AF37] mb-6 transition-colors group/copy"
                  title="Clique para copiar e-mail"
                >
                  <span className="truncate select-all text-xs md:text-sm">suporte.appcontos@gmail.com</span>
                  <div className="flex items-center gap-1 shrink-0 text-slate-400 group-hover/copy:text-white transition-colors">
                    {copiado ? (
                      <span className="flex items-center gap-1 text-xs text-green-400 font-bold">
                        <Check className="w-3.5 h-3.5" /> Copiado
                      </span>
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-sm font-bold text-[#D4AF37]">
                <span>Escrever e-mail</span>
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:translate-x-1 group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>

          </div>

          {/* Horários / Info do Rodapé do Card */}
          <div className="flex items-center gap-2.5 text-slate-400 text-xs md:text-sm font-medium border-t border-white/5 pt-6 w-full justify-center" style={{ fontFamily: '"Outfit", sans-serif' }}>
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span>Atendimento humano de Segunda a Sexta, em horário comercial.</span>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
