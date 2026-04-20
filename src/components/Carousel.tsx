"use client";
import React, { useEffect, useState } from 'react';

interface CarouselProps {
  title: string;
  images: string[];
}

export default function Carousel({ title, images }: CarouselProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-[30px] px-[4%] relative z-30">
      <h2 className="text-[1.6rem] mb-5 text-[#e5e5e5] transition-colors duration-300 hover:text-white font-semibold">
        {title}
      </h2>
      <div className="flex gap-[15px] overflow-x-auto py-5 scroll-smooth no-scrollbar overflow-visible items-center">
        {images.map((src, index) => (
          <div 
            key={index} 
            className={`flex-shrink-0 w-[200px] md:w-[280px] h-[120px] md:h-[160px] bg-card rounded cursor-pointer transition-all duration-300 ease-out hover:scale-[1.15] hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/80 hover:z-40 relative group ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            style={{ transitionDelay: mounted ? `${index * 100}ms` : '0ms' }}
          >
            <img 
              src={src} 
              alt="Thumbnail" 
              loading="lazy" 
              className="w-full h-full object-cover rounded"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
