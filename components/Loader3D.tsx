import { motion } from 'motion/react';

interface Loader3DProps {
  text?: string;
}

export default function Loader3D({ text = "Loading..." }: Loader3DProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      {/* 3D Container with CSS perspective */}
      <div 
        className="relative w-32 h-32 flex items-center justify-center mb-8"
        style={{ perspective: '800px' }}
      >
        {/* Core Glowing Orb */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-8 h-8 rounded-full bg-indigo-500 shadow-[0_0_30px_10px_rgba(99,102,241,0.6)] z-10"
        />

        {/* Outer Ring 1 (X/Y Rotation) */}
        <motion.div
          animate={{ rotateX: 360, rotateZ: 180 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: 'preserve-3d' }}
          className="absolute inset-0 border-[3px] border-indigo-500/30 rounded-full border-t-indigo-500 shadow-[inset_0_0_15px_rgba(99,102,241,0.2)]"
        />

        {/* Middle Ring 2 (Y/Z Rotation) */}
        <motion.div
          animate={{ rotateY: 360, rotateX: 180 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: 'preserve-3d' }}
          className="absolute inset-3 border-[3px] border-purple-500/30 rounded-full border-b-purple-500 shadow-[inset_0_0_15px_rgba(168,85,247,0.2)]"
        />

        {/* Inner Ring 3 (Z/X Rotation) */}
        <motion.div
          animate={{ rotateZ: 360, rotateY: 180 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: 'preserve-3d' }}
          className="absolute inset-6 border-[3px] border-cyan-500/30 rounded-full border-l-cyan-500 shadow-[inset_0_0_15px_rgba(6,182,212,0.2)]"
        />
      </div>

      {/* Futuristic Text */}
      <motion.div 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-slate-500 font-medium tracking-[0.2em] uppercase text-sm"
      >
        {text}
      </motion.div>
    </div>
  );
}
