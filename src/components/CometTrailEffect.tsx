import React, { useEffect, useRef } from 'react';

export default function CometTrailEffect() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    let particles: HTMLSpanElement[] = [];
    
    // Track last mouse position to interpolate if it moves too fast
    let lastPos: { x: number, y: number } | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (lastPos) {
        // Calculate distance
        const dx = x - lastPos.x;
        const dy = y - lastPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // If mouse moved really fast, interpolate to avoid gaps in the "snake"
        const steps = Math.max(1, Math.floor(dist / 5)); // spawn a particle every 5px
        for (let i = 1; i <= steps; i++) {
          const interpX = lastPos.x + (dx * (i / steps));
          const interpY = lastPos.y + (dy * (i / steps));
          createParticle(interpX, interpY);
        }
      } else {
        createParticle(x, y);
      }

      lastPos = { x, y };
    };

    const handleMouseLeave = () => {
      lastPos = null; // reset when mouse leaves
    };

    const createParticle = (x: number, y: number) => {
      const particle = document.createElement('span');
      // Set z-index high and a strong golden glow
      particle.className = 'pointer-events-none absolute rounded-full bg-gradient-to-r from-[#FFF8D6] to-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,1)] z-[100]';
      
      const size = 10; // fixed size for the snake body
      
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${x}px`;
      particle.style.top = `${y}px`;
      
      // Animate: shrink and fade in place (no gravity, no drift)
      // This creates the "snake/tail" effect
      particle.animate(
        [
          { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
          { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 }
        ],
        {
          duration: 600, // trail length (600ms makes it nicely visible)
          easing: 'ease-out',
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
    parent.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
      particles.forEach(p => p.remove());
    };
  }, []);

  return <div ref={containerRef} className="hidden" />;
}
