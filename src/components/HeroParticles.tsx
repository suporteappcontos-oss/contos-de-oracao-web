'use client';

import { useEffect, useRef } from 'react';

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Cria as estrelinhas
    const stars = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.4 + 0.3,
      speed: Math.random() * 0.25 + 0.05,
      opacity: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI * 2, // fase inicial aleatória
    }));

    // Cria os raios de luz ("beams") que sobem lentamente
    const beams = Array.from({ length: 6 }, (_, i) => ({
      x: (canvas.width / 7) * (i + 1),
      width: Math.random() * 60 + 20,
      speed: Math.random() * 0.15 + 0.05,
      opacity: Math.random() * 0.04 + 0.01,
      offset: Math.random() * 100,
    }));

    let frame = 0;
    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      // Desenha os raios de luz verticais suaves
      beams.forEach(b => {
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, `rgba(212, 175, 55, 0)`);
        gradient.addColorStop(0.5, `rgba(212, 175, 55, ${b.opacity})`);
        gradient.addColorStop(1, `rgba(212, 175, 55, 0)`);
        ctx.fillStyle = gradient;
        ctx.fillRect(b.x - b.width / 2, 0, b.width, canvas.height);
      });

      // Desenha as estrelinhas pulsantes
      stars.forEach(s => {
        s.pulse += 0.02;
        const pulsedOpacity = s.opacity * (0.6 + 0.4 * Math.sin(s.pulse));

        // Estrela com brilho dourado
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${pulsedOpacity})`;
        ctx.fill();

        // Halo em volta
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        grd.addColorStop(0, `rgba(212, 175, 55, ${pulsedOpacity * 0.3})`);
        grd.addColorStop(1, `rgba(212, 175, 55, 0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Move levemente para cima e quando sai reinicia embaixo
        s.y -= s.speed;
        if (s.y < -5) {
          s.y = canvas.height + 5;
          s.x = Math.random() * canvas.width;
        }
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7 }}
    />
  );
}
