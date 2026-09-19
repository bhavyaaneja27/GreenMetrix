// CursorTrail.tsx - Interactive persistent cursor particle and aura trail
import React, { useEffect, useRef } from "react";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

const sparkColors = [
  "rgba(16, 185, 129, ",   // Emerald
  "rgba(6, 182, 212, ",    // Cyan
  "rgba(52, 211, 153, ",   // Light Mint
  "rgba(110, 231, 183, ",  // Pale Emerald
  "rgba(245, 158, 11, "    // Amber sparkle
];

export const CursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let animId: number;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const sparks: Spark[] = [];
    let mousePos = { x: -500, y: -500 };
    let prevMouse = { x: -500, y: -500 };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos = { x: e.clientX, y: e.clientY };

      // Calculate speed of cursor
      const dist = Math.hypot(e.clientX - prevMouse.x, e.clientY - prevMouse.y);
      if (dist > 3) {
        // Spawn sparks along cursor movement path that remain and drift
        const count = Math.min(6, Math.max(2, Math.floor(dist / 6)));
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = Math.random() * 1.5 + 0.4;
          const colorBase = sparkColors[Math.floor(Math.random() * sparkColors.length)];
          sparks.push({
            x: e.clientX + (Math.random() - 0.5) * 8,
            y: e.clientY + (Math.random() - 0.5) * 8,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.3, // Slight upward buoyancy
            size: Math.random() * 3.5 + 1.5,
            color: colorBase,
            alpha: 1.0,
            decay: Math.random() * 0.012 + 0.008 // Lasts ~1.5 to 2 seconds
          });
        }
        prevMouse = { x: e.clientX, y: e.clientY };
      }
    };
    window.addEventListener("mousemove", handleMouseMove);

    const loop = () => {
      ctx.clearRect(0, 0, width, height);

      // Persistent smooth ambient radial aura under cursor
      if (mousePos.x > 0 && mousePos.y > 0) {
        const aura = ctx.createRadialGradient(
          mousePos.x,
          mousePos.y,
          0,
          mousePos.x,
          mousePos.y,
          180
        );
        aura.addColorStop(0, "rgba(16, 185, 129, 0.08)");
        aura.addColorStop(0.5, "rgba(6, 182, 212, 0.03)");
        aura.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and render lingering sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;
        s.size = Math.max(0.2, s.size * 0.985);

        if (s.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `${s.color}${s.alpha})`;
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ mixBlendMode: "screen" }}
    />
  );
};
