'use client';
import React, { useEffect, useState } from 'react';

export default function DynamicBackground() {
  return (
    <div className="fixed inset-0 z-[-1] bg-[#090B10]">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ backgroundImage: `url('/background.jpg')`, opacity: 0.12 }}
      />
    </div>
  );
}
