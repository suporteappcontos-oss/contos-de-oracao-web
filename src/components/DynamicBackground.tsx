'use client';
import React, { useEffect, useState } from 'react';

export default function DynamicBackground() {
  const [backgroundUrl, setBackgroundUrl] = useState('https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1920&q=60');

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const timestamp = new Date().getTime();
        const res = await fetch(`https://contos-apks.b-cdn.net/config.json?t=${timestamp}`, { cache: 'no-store' });
        if (res.ok) {
          const config = await res.json();
          if (config.background_url) {
            setBackgroundUrl(config.background_url);
          }
        }
      } catch (e) {
        // Fallback já definido
      }
    };
    fetchConfig();
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[-1] bg-cover bg-center transition-opacity duration-1000"
      style={{ 
        backgroundImage: `url('${backgroundUrl}')`, 
        opacity: 0.12 
      }} 
    />
  );
}
