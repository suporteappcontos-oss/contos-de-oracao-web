import React, { useEffect, useRef } from 'react';

export default function CometTrailEffect() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    let particles: HTMLSpanElement[] = [];
    
    // Throttle particle creation
    let lastSpawn = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSpawn < 15) return; // spawn every 15ms max (super smooth)
      lastSpawn = now;

      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Spawn 3 to 6 particles per move for a thick trail
      const count = Math.floor(Math.random() * 4) + 3;
      for (let i = 0; i < count; i++) {
        createParticle(x, y);
      }
    };

    const createParticle = (x: number, y: number) => {
      const particle = document.createElement('span');
      // Set z-index high so it's above other elements if used globally
      particle.className = 'pointer-events-none absolute rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFF8D6] shadow-[0_0_15px_rgba(212,175,55,1)] z-[100]';
      
      const size = Math.random() * 6 + 3; // 3px to 9px (larger)
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      // Random movement (falling down and drifting much further)
      const angle = Math.random() * Math.PI * 2;
      // Drift horizontally and vertically by 50 to 150 pixels (roughly 3cm on screens)
      const velocity = Math.random() * 100 + 50; 
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity + 80; // strong gravity effect
      
      // Animate using Web Animations API for extreme performance
      particle.animate(
        [
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
        ],
        {
          duration: Math.random() * 800 + 800, // 800ms to 1600ms (lives much longer)
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          fill: 'forwards'
        }
      ).onfinish = () => {
        particle.remove();
        particles = particles.filter(p => p !== particle);
      };

      parent.appendChild(particle);
      particles.push(particle);
    };

    parent.addEventListener('mousemove', handleMouseMove);
    return () => {
      parent.removeEventListener('mousemove', handleMouseMove);
      particles.forEach(p => p.remove());
    };
  }, []);

  return <div ref={containerRef} className="hidden" />;
}
