import { useEffect, useState, useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  delay: number;
  duration: number;
  size: number;
  color: string;
  blur: number;
}

const PRISM_COLORS = [
  "hsl(0, 100%, 70%)",    // Red
  "hsl(30, 100%, 65%)",   // Orange
  "hsl(50, 100%, 60%)",   // Yellow
  "hsl(120, 70%, 55%)",   // Green
  "hsl(180, 80%, 55%)",   // Cyan
  "hsl(220, 90%, 65%)",   // Blue
  "hsl(270, 80%, 65%)",   // Purple
  "hsl(310, 80%, 65%)",   // Pink
];

const PrismParticles = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 2 + Math.random() * 4,
      color: PRISM_COLORS[Math.floor(Math.random() * PRISM_COLORS.length)],
      blur: Math.random() > 0.6 ? 2 : 0,
    }));
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-prism-rise"
          style={{
            left: `${particle.x}%`,
            bottom: "-20px",
            width: `${particle.size}px`,
            height: `${particle.size * 3}px`,
            background: `linear-gradient(to top, transparent, ${particle.color}, transparent)`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            filter: particle.blur ? `blur(${particle.blur}px)` : "none",
            opacity: 0,
          }}
        />
      ))}
      
      {/* Extra glow orbs for depth */}
      {particles.slice(0, 15).map((particle) => (
        <div
          key={`glow-${particle.id}`}
          className="absolute rounded-full animate-prism-rise"
          style={{
            left: `${(particle.x + 50) % 100}%`,
            bottom: "-30px",
            width: `${particle.size * 2}px`,
            height: `${particle.size * 2}px`,
            background: particle.color,
            boxShadow: `0 0 ${particle.size * 4}px ${particle.color}`,
            animationDelay: `${particle.delay + 2}s`,
            animationDuration: `${particle.duration + 2}s`,
            filter: "blur(1px)",
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
};

export default PrismParticles;
