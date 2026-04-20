import React from 'react';

export default function Hero() {
  return (
    <section id="home" className="relative h-[90vh] flex items-center justify-center text-center bg-[url('https://images.unsplash.com/photo-1594909122845-11baa439b7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')] bg-center bg-cover bg-no-repeat">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-black/80 z-10"></div>
      <div className="relative z-20 max-w-[800px] px-5 mt-[50px]">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-5 drop-shadow-[2px_2px_5px_rgba(0,0,0,0.7)] text-white leading-tight">
          Filmes, séries e muito mais. Sem limites.
        </h1>
        <p className="text-xl md:text-2xl mb-[30px] font-normal drop-shadow-[1px_1px_3px_rgba(0,0,0,0.6)] text-white">
          Assista onde quiser. Cancele quando quiser.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-0 max-w-[700px] mx-auto">
          <input 
            type="email" 
            placeholder="Email" 
            className="flex-1 p-[18px] text-[1.2rem] border border-white/40 border-r-0 rounded-l-[4px] sm:rounded-r-none rounded-[4px] sm:mb-0 mb-4 outline-none bg-black/50 text-white backdrop-blur-[5px] transition-colors focus:bg-white/10 focus:border-white placeholder:text-[#bbb]"
          />
          <button className="px-6 py-[18px] sm:px-[40px] text-[1.4rem] bg-[#e50914] text-white border-none rounded-r-[4px] sm:rounded-l-none rounded-[4px] font-semibold cursor-pointer transition-all hover:bg-[#f40612] hover:brightness-110">
            Vamos Lá &gt;
          </button>
        </div>
        <p className="text-[1.1rem] text-white mt-5 font-light">
          Pronto para assistir? Informe seu email para criar ou reiniciar sua assinatura.
        </p>
      </div>
    </section>
  );
}
