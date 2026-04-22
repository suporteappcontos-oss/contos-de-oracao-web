"use client";
import React, { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 w-full flex justify-between items-center py-3 px-[4%] transition-all duration-400 z-[100] ${
        scrolled ? "bg-[#090B10]/95 shadow-lg shadow-black/70 backdrop-blur-md border-b border-white/5" : "bg-transparent"
      }`}
    >
      {/* Logo + Nome (idêntico à navbar interna) */}
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/logo.png"
          alt="Contos de Oração"
          width={46}
          height={46}
          className="object-contain drop-shadow-lg"
        />
        <div>
          <div className="text-white font-black text-lg leading-tight tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Contos de Oração
          </div>
          <div className="text-[#D4AF37] text-[0.6rem] font-bold uppercase tracking-widest -mt-0.5">
            Premium
          </div>
        </div>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-5">
        <a href="#home" className="hidden md:inline text-white/70 hover:text-white text-sm transition-colors">Início</a>
        <a href="#planos" className="hidden md:inline text-white/70 hover:text-white text-sm transition-colors">Planos</a>
        <Link
          href="/login"
          className="text-white text-sm font-bold px-5 py-2 rounded-xl transition-all hover:scale-105"
          style={{ background: '#D4AF37', color: '#090B10' }}
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}
