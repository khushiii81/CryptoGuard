'use client';

import { motion } from 'framer-motion';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-obsidian">
      {/* Background Grid */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      
      {/* Slow pulsing cyan orb */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -50, 100, 0],
          scale: [1, 1.2, 0.8, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(0,240,255,0.4) 0%, transparent 70%)' }}
      />
      
      {/* Slow pulsing emerald orb */}
      <motion.div
        animate={{
          x: [0, -100, 50, 0],
          y: [0, 50, -100, 0],
          scale: [0.8, 1.1, 1, 0.8],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[20%] right-[20%] w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.3) 0%, transparent 70%)' }}
      />

      {/* Crimson accent orb */}
      <motion.div
        animate={{
          x: [0, 50, -50, 0],
          y: [0, 100, -50, 0],
          scale: [1, 1.3, 0.9, 1],
          opacity: [0.05, 0.1, 0.05],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[50%] left-[60%] w-[400px] h-[400px] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(255,51,102,0.2) 0%, transparent 70%)' }}
      />
    </div>
  );
}
