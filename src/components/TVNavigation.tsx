"use client";

import { useEffect, useState, useRef } from 'react';

interface TVNavigationProps {
  children: React.ReactNode;
}

export function TVNavigation({ children }: TVNavigationProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detectar teclas de navegação D-pad
      switch(e.key) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'Enter':
        case ' ':
          // Garantir que o elemento focado seja visível
          const activeElement = document.activeElement;
          if (activeElement) {
            activeElement.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
              inline: 'nearest'
            });
          }
          break;
        case 'Back':
        case 'Escape':
          // Voltar (específico de TV)
          window.history.back();
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <>{children}</>;
}

// Hook para detectar se está em TV
export function useIsTV(): boolean {
  const [isTV, setIsTV] = useState(false);

  useEffect(() => {
    // Detectar se está em Android TV ou Google TV
    const userAgent = navigator.userAgent;
    const tvDetected = /Android.*TV|GoogleTV/.test(userAgent) ||
                        // Detectar se não tem touch (indica TV)
                        (!('ontouchstart' in window) && window.innerWidth > 1000);

    setIsTV(tvDetected);
  }, []);

  return isTV;
}

// Componente para adicionar foco visual aprimorado
export function Focusable({ children, className = '', ...props }: React.HTMLAttributes<HTMLElement>) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className={`${className} ${isFocused ? 'ring-4 ring-[#D4AF37] ring-offset-2 ring-offset-[#090B10] scale-105' : ''} transition-all duration-200`}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
}
