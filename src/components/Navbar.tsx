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
      {/* Logo + Nome (sem badge de plano — landing page é pública) */}
      <Link href="/" className="flex items-center gap-3 no-underline">
        <Image
          src="/logo.png"
          alt="Contos de Oração"
          width={44}
          height={44}
          className="object-contain drop-shadow-lg"
        />
        <span className="text-white font-black text-lg hidden sm:inline" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Contos de Oração
        </span>
      </Link>

      {/* Links */}
      <div className="flex items-center gap-4 sm:gap-5">
        {scrolled && (
          <a href="#home" className="hidden md:inline text-white/70 hover:text-white text-sm transition-colors no-underline">Início</a>
        )}
        <a href="#planos" className="text-white/70 hover:text-white text-sm transition-colors no-underline font-semibold">Planos</a>

        {/* Botão Instagram */}
        <a
          href="https://www.instagram.com/contosdeoracao"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 no-underline"
          style={{ background: 'linear-gradient(135deg,#833AB4,#FD1D1D,#FCB045)', color: '#FFF' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          <span className="hidden sm:inline">Instagram</span>
        </a>

        <Link
          href="/login"
          className="text-sm font-bold px-5 py-2 rounded-xl transition-all hover:scale-105 no-underline"
          style={{ background: '#D4AF37', color: '#090B10' }}
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}
