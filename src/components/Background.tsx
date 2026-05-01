import { useEffect, useRef } from 'react';

interface BackgroundProps {
  theme: 'dark' | 'light';
}

export default function Background({ theme }: BackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      weight: number;

      constructor(width: number, height: number, theme: 'dark' | 'light') {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = Math.random() * 0.4 - 0.2;
        // Small particles move up (bubbles), large particles move down (sediment)
        this.weight = this.size < 1.8 ? (Math.random() * -0.5 - 0.1) : (Math.random() * 0.5 + 0.1);
        this.speedY = 0; 
        
        const darkColors = [
          'hsla(180, 80%, 70%, ', // cyan
          'hsla(210, 90%, 60%, ', // blue
          'hsla(260, 80%, 60%, ', // purple
          'hsla(280, 70%, 50%, '  // violet
        ];

        const lightColors = [
          'hsla(180, 80%, 85%, ', // Soft Cyan
          'hsla(200, 80%, 90%, ', // Soft Air Blue
          'hsla(220, 70%, 92%, ', // Pale Blue
          'hsla(190, 70%, 88%, '  // Bright Water
        ];

        const colors = theme === 'dark' ? darkColors : lightColors;
        const baseColor = colors[Math.floor(Math.random() * colors.length)];
        const opacity = theme === 'dark' ? (Math.random() * 0.5 + 0.2) : (Math.random() * 0.3 + 0.2);
        this.color = `${baseColor}${opacity})`;
      }

      update(width: number, height: number) {
        this.x += this.speedX;
        this.y += this.speedY + this.weight;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 1;
      }

      draw(ctx: CanvasRenderingContext2D, theme: 'dark' | 'light') {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        
        ctx.fillStyle = this.color;
        if (theme === 'dark') {
          ctx.shadowBlur = this.size * 3;
          ctx.shadowColor = this.color;
        } else {
          ctx.shadowBlur = this.size * 2;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        }
        
        ctx.fill();
      }
    }

    const init = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      particles = [];
      for (let i = 0; i < 250; i++) {
        particles.push(new Particle(width, height, theme));
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update(canvas.width, canvas.height);
        p.draw(ctx, theme);
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      init();
    };

    window.addEventListener('resize', handleResize);
    init();
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="bg-canvas"
        className={`fixed inset-0 -z-10 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050b14]' : 'bg-slate-50'}`}
      />
      {theme === 'dark' && (
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-900/5 rounded-full blur-[150px]" />
        </div>
      )}
    </>
  );
}
