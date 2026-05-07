'use client';
import React, { useEffect, useState } from 'react';

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#090B10]">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ backgroundImage: `url('/background.jpg')`, opacity: 0.35 }}
      />
      {/* Efeito de Cinema: Mais escuro nas bordas inferior e superior para o texto ficar legível */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090B10]/60 via-transparent to-[#090B10] pointer-events-none" />
    </div>
  );
}
