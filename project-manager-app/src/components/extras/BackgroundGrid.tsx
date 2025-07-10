"use client";
import { useEffect, useRef, useState } from "react";

export function BackgroundGrid() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Calcula o deslocamento baseado na posição do mouse
  const offsetX = mousePosition.x * 0.02;
  const offsetY = mousePosition.y * 0.02;

  return (
    <div 
      ref={gridRef}
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{
        backgroundImage: "url('/grid-pattern.svg')",
        backgroundPosition: `${50 + offsetX}% ${50 + offsetY}%`,
        backgroundSize: '40px 40px',
        backgroundRepeat: 'repeat',
        opacity: 0.15,
        transition: 'background-position 0.3s ease-out'
      }}
    />
  );
}