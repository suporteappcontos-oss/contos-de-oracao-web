import React, { useEffect, useRef } from 'react';

export default function CometTrailEffect() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    let particles: HTMLSpanElement[] = [];
    
    // Throttle particle creation so we don't spawn 1000s per second
    let lastSpawn = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastSpawn < 30) return; // spawn every 30ms max
      lastSpawn = now;

      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Spawn 1 to 3 particles per move
      const count = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < count; i++) {
        createParticle(x, y);
      }
    };

    const createParticle = (x: number, y: number) => {
      const particle = document.createElement('span');
      particle.className = 'pointer-events-none absolute rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFF8D6] shadow-[0_0_10px_rgba(212,175,55,0.8)] z-0';
      
      const size = Math.random() * 4 + 2; // 2px to 6px
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      // Random movement (falling down and drifting)
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 30 + 10;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity + 40; // gravity effect
      
      // Animate using Web Animations API for extreme performance
      particle.animate(
        [
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`, opacity: 0 }
        ],
        {
          duration: Math.random() * 400 + 400, // 400ms to 800ms
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
