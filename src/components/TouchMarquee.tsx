'use client';

import React, { useRef, useEffect } from 'react';

interface TouchMarqueeProps {
  children: React.ReactNode;
  speed?: number; // velocidade da animação
  reverse?: boolean; // inverter direção (rolar para a esquerda)
}

export default function TouchMarquee({ children, speed = 0.8, reverse = false }: TouchMarqueeProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isInteractingRef = useRef(false);
  const requestRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Inicializa o scroll no meio se for reverso para permitir rolagem para a esquerda imediata
    if (reverse) {
      const initScroll = () => {
        if (el.scrollWidth > 0) {
          el.scrollLeft = el.scrollWidth / 2;
        } else {
          requestRef.current = requestAnimationFrame(initScroll);
        }
      };
      requestRef.current = requestAnimationFrame(initScroll);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [reverse]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let lastTime = performance.now();

    const loop = (time: number) => {
      if (!el) return;
      if (!isInteractingRef.current) {
        const delta = time - lastTime;
        // Velocidade base em pixels por segundo ajustada pelo delta
        const pixelsPerSecond = speed * 32;
        const step = (pixelsPerSecond * delta) / 1000;

        if (reverse) {
          el.scrollLeft -= step;
          if (el.scrollLeft <= 0) {
            el.scrollLeft += el.scrollWidth / 2;
          }
        } else {
          el.scrollLeft += step;
          const halfWidth = el.scrollWidth / 2;
          if (el.scrollLeft >= halfWidth) {
            el.scrollLeft -= halfWidth;
          }
        }
      }
      lastTime = time;
      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [speed, reverse]);

  const handleTouchStart = () => {
    isInteractingRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleTouchEnd = () => {
    // Espera 2.5 segundos de inatividade após soltar para retomar o movimento automático
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 2500);
  };

  // Suporte para arrasto por mouse no PC (ótimo para testes e UX premium)
  const handleMouseDown = (e: React.MouseEvent) => {
    isInteractingRef.current = true;
    const el = scrollRef.current;
    if (!el) return;
    const startX = e.pageX - el.offsetLeft;
    const scrollLeft = el.scrollLeft;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const x = moveEvent.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5; // multiplicador de sensibilidade
      el.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      handleTouchEnd();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={scrollRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      className="flex gap-5 overflow-x-auto no-scrollbar select-none cursor-grab active:cursor-grabbing w-full py-2"
      style={{ 
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
      }}
    >
      {children}
    </div>
  );
}
