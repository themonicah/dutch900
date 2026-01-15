import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  vx: number;
  vy: number;
}

const colors = ['#58CC02', '#1CB0F6', '#CE82FF', '#FF9600', '#FF4B4B', '#FFD900'];

export default function Confetti({ duration = 3000 }: { duration?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Create initial particles
    const initialParticles: Particle[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      scale: 0.5 + Math.random() * 0.5,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
    }));
    setParticles(initialParticles);

    // Hide after duration
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  // Animate particles
  useEffect(() => {
    if (!visible || particles.length === 0) return;

    const interval = setInterval(() => {
      setParticles(prev =>
        prev.map(p => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          rotation: p.rotation + 5,
          vy: p.vy + 0.1, // gravity
        })).filter(p => p.y < 120) // remove particles that fall off screen
      );
    }, 16);

    return () => clearInterval(interval);
  }, [visible, particles.length]);

  if (!visible || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
            transition: 'none',
          }}
        />
      ))}
    </div>
  );
}
