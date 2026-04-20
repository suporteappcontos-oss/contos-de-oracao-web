import React from 'react';

const planos = [
  {
    nome: 'Básico',
    preco: 'R$ 5,00',
    descricao: 'Para quem quer começar',
    link: 'https://pay.kiwify.com.br/YApXtLr',
    destaque: false,
    badge: null,
    cor: 'text-text-muted',
    beneficios: [
      'Acesso ilimitado ao catálogo',
      'Resolução HD (720p)',
      '1 tela por vez',
      'Suporte por e-mail',
    ],
  },
  {
    nome: 'Família',
    preco: 'R$ 6,00',
    descricao: 'O mais popular da plataforma',
    link: '#',
    destaque: true,
    badge: 'Mais Popular',
    cor: 'text-[#FFD700]',
    beneficios: [
      'Acesso ilimitado ao catálogo',
      'Resolução Full HD (1080p)',
      '2 telas simultâneas',
      'Perfil infantil protegido por PIN',
    ],
  },
  {
    nome: 'Premium',
    preco: 'R$ 7,00',
    descricao: 'A experiência completa',
    link: '#',
    destaque: false,
    badge: null,
    cor: 'text-text-muted',
    beneficios: [
      'Acesso ilimitado ao catálogo',
      'Resolução 4K + HDR',
      '4 telas simultâneas',
      'Áudio envolvente imersivo',
    ],
  },
];

export default function Pricing() {
  return (
    <section id="planos" className="py-[80px] px-[4%] text-center bg-[#111]">
      <p className="text-[#FFD700] uppercase tracking-widest text-sm font-semibold mb-4">Planos e Preços</p>
      <h2 className="text-3xl md:text-[2.8rem] mb-4 font-extrabold text-white">
        Escolha o plano ideal para você
      </h2>
      <p className="text-white/50 text-lg mb-[60px]">Cancele quando quiser. Sem taxas escondidas.</p>

      <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch flex-wrap gap-[30px]">
        {planos.map((plano) => (
          <div
            key={plano.nome}
            className={`relative flex flex-col p-[40px] rounded-[20px] w-full max-w-[320px] transition-all duration-300 border-2 hover:-translate-y-2 ${
              plano.destaque
                ? 'bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-[#FFD700] shadow-[0_8px_40px_rgba(255,215,0,0.15)] md:scale-105 z-10'
                : 'bg-[#1E2E3E] border-white/5 hover:border-white/20'
            }`}
          >
            {plano.badge && (
              <div className="absolute -top-[14px] left-1/2 -translate-x-1/2 bg-[#FFD700] text-black px-4 py-1 rounded-full text-[0.85rem] font-bold tracking-[1px] whitespace-nowrap">
                {plano.badge}
              </div>
            )}

            <div className="text-left mb-6">
              <h3 className={`text-[1.6rem] font-extrabold mb-1 ${plano.cor}`}>{plano.nome}</h3>
              <p className="text-white/40 text-sm">{plano.descricao}</p>
            </div>

            <div className="text-left mb-8">
              <span className="text-4xl font-extrabold text-white">{plano.preco}</span>
              <span className="text-white/40 text-base ml-1">/mês</span>
            </div>

            <ul className="list-none mb-8 text-left grow space-y-4">
              {plano.beneficios.map((b) => (
                <li key={b} className="flex items-start gap-3 text-white/80 text-[1rem]">
                  <span className="text-[#FFD700] font-bold mt-0.5">✓</span>
                  {b}
                </li>
              ))}
            </ul>

            <a
              href={plano.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center w-full py-4 rounded-xl font-bold text-[1.1rem] no-underline transition-all active:scale-95 ${
                plano.destaque
                  ? 'bg-[#FFD700] text-black hover:brightness-110'
                  : 'bg-white/10 text-white border border-white/10 hover:bg-white/20'
              }`}
            >
              Assinar agora →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
