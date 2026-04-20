"use client";
import React, { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full flex justify-between items-center py-5 px-[4%] transition-all duration-400 z-[100] ${
        scrolled ? "bg-black/95 shadow-lg shadow-black/70 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="text-[2.2rem] font-extrabold text-[#FFD700] uppercase tracking-[1px] cursor-pointer drop-shadow-md">
        Contos de Oração
      </div>
      <div className="hidden md:flex items-center gap-[30px]">
        <a href="#home" className="text-text-main no-underline font-normal text-base transition-colors duration-300 hover:text-text-muted">Início</a>
        <a href="#planos" className="text-text-main no-underline font-normal text-base transition-colors duration-300 hover:text-text-muted">Planos</a>
        <button className="bg-[#e50914] text-white border-none py-2 px-5 rounded font-semibold text-base cursor-pointer transition-all duration-300 hover:bg-[#f40612] hover:scale-105">
          Entrar
        </button>
      </div>
    </header>
  );
}
