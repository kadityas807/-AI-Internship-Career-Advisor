'use client';

import { motion } from 'motion/react';

export default function GlobalBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-slate-50">
      {/* Drifting Orbs */}
      <motion.div
        animate={{
          x: [0, 150, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.9, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/20 blur-[64px] will-change-transform"
      />
      
      <motion.div
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 80, -100, 0],
          scale: [1, 0.8, 1.1, 1]
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-[10%] -right-[10%] w-[45vw] h-[45vw] rounded-full bg-fuchsia-500/20 blur-[64px] will-change-transform"
      />

      <motion.div
        animate={{
          x: [0, 100, -100, 0],
          y: [0, 100, -100, 0],
          scale: [1, 1.3, 0.8, 1]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[30%] left-[60%] w-[35vw] h-[35vw] rounded-full bg-teal-500/20 blur-[64px] will-change-transform"
      />

      {/* Continuously Panning Grid */}
      <motion.div
        animate={{
          backgroundPosition: ['0px 0px', '40px 40px']
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 opacity-60 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M40 0L0 0 0 40' fill='none' stroke='rgba(99,102,241,0.06)' stroke-width='1'/%3E%3C/svg%3E")`,
          WebkitMaskImage: 'linear-gradient(to bottom, white 10%, transparent 90%)',
          maskImage: 'linear-gradient(to bottom, white 10%, transparent 90%)'
        }}
      />
    </div>
  );
}
