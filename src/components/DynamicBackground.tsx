'use client';
import React, { useEffect, useState } from 'react';

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#090B10]">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ backgroundImage: `url('/background.jpg')`, opacity: 1 }}
      />
      
      {/* Overlay Escuro / Gradiente que você encontrou */}
      <div 
        className="absolute inset-0" 
        style={{ background: 'linear-gradient(to bottom, rgba(9,11,16,0.65) 0%, rgba(9,11,16,0.6) 50%, #090B10 100%)' }} 
      />
    </div>
  );
}
