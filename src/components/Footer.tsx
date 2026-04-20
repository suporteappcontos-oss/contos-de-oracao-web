import React from 'react';

export default function Footer() {
  return (
    <footer className="pt-[70px] pb-[30px] px-[4%] text-text-muted border-t-[8px] border-[#222] bg-black">
      <p className="text-[1rem]">Dúvidas? Ligue 0800 000 0000</p>
      <div className="flex flex-wrap gap-[30px] my-5 mb-10">
        <a href="#" className="text-text-muted no-underline text-[0.95rem] hover:underline">Perguntas frequentes</a>
        <a href="#" className="text-text-muted no-underline text-[0.95rem] hover:underline">Centro de ajuda</a>
        <a href="#" className="text-text-muted no-underline text-[0.95rem] hover:underline">Termos de uso</a>
        <a href="#" className="text-text-muted no-underline text-[0.95rem] hover:underline">Privacidade</a>
      </div>
      <p className="mt-5 text-[0.9rem]">© 2026 Contos de Oração Brasil</p>
    </footer>
  );
}
