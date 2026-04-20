import React from 'react';

export default function Pricing() {
  return (
    <section id="planos" className="py-[80px] px-[4%] text-center bg-[#111]">
      <h2 className="text-3xl md:text-[2.8rem] mb-[60px] font-extrabold text-white">
        Planos de Teste (Kiwify)
      </h2>
      <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch flex-wrap gap-[30px]">
        {/* Plano 5 */}
        <div className="bg-card p-[40px] rounded-[16px] w-full max-w-[320px] relative transition-transform duration-300 border-2 border-transparent flex flex-col hover:-translate-y-2.5">
          <h3 className="text-[1.8rem] mb-2.5 text-text-muted font-bold text-left">Teste Básico</h3>
          <p className="text-4xl font-extrabold mb-[30px] text-white text-left">
            R$ 5,00 <span className="text-[1.2rem] font-normal text-text-muted">/mês</span>
          </p>
          <ul className="list-none mb-[40px] text-left grow">
            <li className="mb-4 pb-4 border-b border-white/5 text-[1.1rem] flex items-center text-text-main"><span className="text-primary font-bold text-[1.2rem] mr-4">✓</span> Resolução 720p</li>
            <li className="mb-4 pb-4 border-b border-white/5 text-[1.1rem] flex items-center text-text-main"><span className="text-primary font-bold text-[1.2rem] mr-4">✓</span> 1 tela</li>
            <li className="mb-4 pb-4 border-none text-[1.1rem] flex items-center text-text-main"><span className="text-primary font-bold text-[1.2rem] mr-4">✓</span> Acesso completo</li>
          </ul>
          <a href="https://pay.kiwify.com.br/YApXtLr" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full p-[15px] rounded-lg border-none bg-white/10 text-white font-semibold text-[1.2rem] cursor-pointer transition-all hover:bg-primary hover:text-black no-underline active:scale-95">
            Testar Pagamento →
          </a>
        </div>

        {/* Plano 6 */}
        <div className="bg-gradient-to-br from-[#222] to-[#2a0b0e] p-[40px] rounded-[16px] w-full max-w-[320px] relative transition-transform duration-300 border-2 border-primary shadow-[0_8px_40px_rgba(229,9,20,0.2)] flex flex-col md:scale-105 z-10 hover:-translate-y-2.5">
          <div className="absolute -top-[15px] left-1/2 -translate-x-1/2 bg-primary text-black px-4 py-1 rounded-[20px] text-[0.9rem] font-bold tracking-[1px]">
            Recomendado
          </div>
          <h3 className="text-[1.8rem] mb-2.5 text-primary font-bold text-left">Teste Padrão</h3>
          <p className="text-4xl font-extrabold mb-[30px] text-white text-left">
            R$ 6,00 <span className="text-[1.2rem] font-normal text-text-muted">/mês</span>
          </p>
          <ul className="list-none mb-[40px] text-left grow">
            <li className="mb-4 pb-4 border-b border-white/5 text-[1.1rem] flex items-center text-text-main"><span className="text-primary font-bold text-[1.2rem] mr-4">✓</span> Resolução 1080p</li>
            <li className="mb-4 pb-4 border-b border-white/5 text-[1.1rem] flex items-center text-text-main"><span className="text-primary font-bold text-[1.2rem] mr-4">✓</span> 2 telas simultâneas</li>
            <li className="mb-4 pb-4 border-none text-[1.1rem] flex items-center text-text-main"><span className="text-primary font-bold text-[1.2rem] mr-4">✓</span> Downloads offline</li>
          </ul>
          <a href="#" className="flex items-center justify-center w-full p-[15px] rounded-lg border-none bg-primary text-black font-extrabold text-[1.2rem] cursor-pointer transition-all no-underline active:scale-95">
            Testar Pagamento
          </a>
        </div>

        {/* Plano 7 */}
        <div className="bg-card p-[40px] rounded-[16px] w-full max-w-[320px] relative transition-transform duration-300 border-2 border-transparent flex flex-col hover:-translate-y-2.5">
          <h3 className="text-[1.8rem] mb-2.5 text-text-muted font-bold text-left">Teste Premium</h3>
          <p className="text-4xl font-extrabold mb-[30px] text-white text-left">
            R$ 7,00 <span className="text-[1.2rem] font-normal text-text-muted">/mês</span>
          </p>
          <ul className="list-none mb-[40px] text-left grow">
            <li className="mb-4 pb-4 border-b border-white/5 text-[1.1rem] flex items-center text-text-main"><span className="text-primary font-bold text-[1.2rem] mr-4">✓</span> 4K + HDR</li>
            <li className="mb-4 pb-4 border-b border-white/5 text-[1.1rem] flex items-center text-text-main"><span className="text-primary font-bold text-[1.2rem] mr-4">✓</span> 4 telas simultâneas</li>
            <li className="mb-4 pb-4 border-none text-[1.1rem] flex items-center text-text-main"><span className="text-primary font-bold text-[1.2rem] mr-4">✓</span> Áudio espacial</li>
          </ul>
          <a href="#" className="flex items-center justify-center w-full p-[15px] rounded-lg border-none bg-white/10 text-white font-semibold text-[1.2rem] cursor-pointer transition-all hover:bg-primary hover:text-black no-underline active:scale-95">
            Testar Pagamento
          </a>
        </div>
      </div>
    </section>
  );
}
