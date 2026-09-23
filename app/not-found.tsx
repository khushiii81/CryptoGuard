'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Zap, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let angle = 0;
    let animId: number;

    // Radar particles
    const particles: { x: number; y: number; life: number; maxLife: number; angle: number; dist: number }[] = [];

    function addParticle(cx: number, cy: number, scanAngle: number) {
      const dist = Math.random() * Math.min(cx, cy) * 0.9;
      particles.push({
        x: cx + Math.cos(scanAngle) * dist,
        y: cy + Math.sin(scanAngle) * dist,
        life: 60,
        maxLife: 60,
        angle: scanAngle,
        dist,
      });
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(cx, cy) * 0.9;

      ctx!.clearRect(0, 0, w, h);

      // Background
      ctx!.fillStyle = 'rgba(10, 13, 20, 0.92)';
      ctx!.fillRect(0, 0, w, h);

      // Grid
      ctx!.strokeStyle = 'rgba(0, 240, 255, 0.04)';
      ctx!.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, h); ctx!.stroke();
      }
      for (let y = 0; y < h; y += 40) {
        ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(w, y); ctx!.stroke();
      }

      // Radar rings
      const rings = 5;
      for (let i = 1; i <= rings; i++) {
        const r = (maxR / rings) * i;
        ctx!.beginPath();
        ctx!.arc(cx, cy, r, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(0, 240, 255, ${0.05 + (i / rings) * 0.04})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      // Cross hairs
      ctx!.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx!.lineWidth = 1;
      ctx!.beginPath(); ctx!.moveTo(cx, cy - maxR); ctx!.lineTo(cx, cy + maxR); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(cx - maxR, cy); ctx!.lineTo(cx + maxR, cy); ctx!.stroke();

      // Radar sweep
      const sweepGrad = (ctx as any)!.createConicGradient
        ? null
        : null;
      
      // Draw sweep as arc fill
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(angle);
      const grad = ctx!.createLinearGradient(0, -maxR * 0.5, maxR, 0);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0)');
      grad.addColorStop(1, 'rgba(0, 240, 255, 0.12)');
      
      ctx!.beginPath();
      ctx!.moveTo(0, 0);
      ctx!.arc(0, 0, maxR, -0.6, 0);
      ctx!.fillStyle = grad;
      ctx!.fill();
      ctx!.restore();

      // Sweep line
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(angle);
      ctx!.beginPath();
      ctx!.moveTo(0, 0);
      ctx!.lineTo(maxR, 0);
      ctx!.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      ctx!.lineWidth = 2;
      ctx!.shadowBlur = 12;
      ctx!.shadowColor = '#00F0FF';
      ctx!.stroke();
      ctx!.restore();

      // Add particles on sweep
      if (Math.random() < 0.3) addParticle(cx, cy, angle);

      // Draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const alpha = (p.life / p.maxLife) * 0.8;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255, 51, 102, ${alpha})`;
        ctx!.shadowBlur = 6;
        ctx!.shadowColor = '#FF3366';
        ctx!.fill();
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Center dot
      ctx!.beginPath();
      ctx!.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx!.fillStyle = '#FF3366';
      ctx!.shadowBlur = 16;
      ctx!.shadowColor = '#FF3366';
      ctx!.fill();

      // "PACKET DROPPED" blinking text on radar
      if (Math.floor(Date.now() / 600) % 2 === 0) {
        ctx!.font = 'bold 11px monospace';
        ctx!.fillStyle = 'rgba(255, 51, 102, 0.7)';
        ctx!.textAlign = 'center';
        ctx!.shadowBlur = 8;
        ctx!.shadowColor = '#FF3366';
        ctx!.fillText('PACKET DROPPED', cx, cy + maxR * 0.5);
        ctx!.shadowBlur = 0;
      }

      angle += 0.025;
      animId = requestAnimationFrame(draw);
    }

    draw();

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-obsidian">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="scanline" />

      {/* Radar Canvas */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <canvas ref={canvasRef} className="w-[600px] h-[600px] max-w-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        {/* Alert icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-[rgba(255,51,102,0.1)] border border-[rgba(255,51,102,0.3)]">
            <AlertTriangle className="w-12 h-12 text-[#FF3366]" style={{ filter: 'drop-shadow(0 0 12px rgba(255,51,102,0.8))' }} />
          </div>
        </div>

        {/* 404 Glitch */}
        <div
          className="font-mono font-black text-8xl sm:text-9xl mb-2 glitch-text"
          data-text="404"
          style={{ color: '#FF3366', textShadow: '0 0 40px rgba(255,51,102,0.5)' }}
        >
          404
        </div>

        <div className="font-mono text-base sm:text-lg font-bold text-[#FF3366] mb-2 tracking-wider">
          ERROR: PACKET DROPPED
        </div>

        <div className="font-mono text-sm sm:text-base text-slate-400 mb-2 px-4">
          ROUTE UNREACHABLE BY CRYPTOGUARD DEFENSE GATEWAY
        </div>

        <div className="font-mono text-xs text-slate-600 mb-10 cursor-blink">
          {'// Destination route not found in routing table_'}
        </div>

        {/* Syslog-style error */}
        <div className="glass-panel p-4 font-mono text-xs text-left mb-8 max-w-lg mx-auto">
          <div className="text-[#FF3366] mb-1">
            [{new Date().toISOString()}] DENY | TCP &lt;client&gt;:&lt;port&gt; → 0.0.0.0:404
          </div>
          <div className="text-slate-500 mb-1">
            REASON: No route exists in the routing table for requested URI.
          </div>
          <div className="text-slate-500">
            ACTION: Connection terminated. Redirecting to known-good route.
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/simulator" className="btn-cyber-emerald text-sm px-6 py-3">
            <Zap className="w-4 h-4" />
            Reroute to Simulator
          </Link>
          <Link href="/" className="btn-cyber text-sm px-6 py-3">
            Return to Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
