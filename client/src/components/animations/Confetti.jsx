import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';

export function Confetti({ isActive }) {
  if (!isActive) return null;

  const particles = Array.from({ length: 24 });
  const colors = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#f59e0b', '#ec4899'];

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((_, i) => {
        const randomX = (Math.random() - 0.5) * 600;
        const randomY = -100 - Math.random() * 400;
        const randomRotate = Math.random() * 720;
        const color = colors[i % colors.length];

        return (
          <motion.div
            key={i}
            initial={{ opacity: 1, x: '50vw', y: '50vh', scale: 1 }}
            animate={{
              opacity: [1, 1, 0],
              x: `calc(50vw + ${randomX}px)`,
              y: `calc(50vh + ${randomY}px)`,
              rotate: randomRotate,
              scale: [1, 1.2, 0.5],
            }}
            transition={{ duration: 1.5 + Math.random(), ease: 'easeOut' }}
            style={{ backgroundColor: color }}
            className="absolute w-3 h-3 rounded-sm shadow-sm"
          />
        );
      })}
    </div>
  );
}

export function AIThinkingAnimation({ message = 'AI is planning your trip...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/30 flex items-center justify-center"
      >
        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>
      </motion.div>

      <motion.p
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-sm font-extrabold text-slate-800 tracking-wide"
      >
        {message}
      </motion.p>
    </div>
  );
}

export function AnimatedHeart({ isFavorite, onClick, className = '' }) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.85 }}
      onClick={onClick}
      className={`p-2 rounded-full transition-colors focus:outline-none ${className}`}
    >
      <motion.div
        animate={isFavorite ? { scale: [1, 1.35, 1] } : { scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`w-5 h-5 transition-colors ${
            isFavorite ? 'fill-rose-500 text-rose-500 drop-shadow-md' : 'text-slate-400 hover:text-rose-500'
          }`}
        />
      </motion.div>
    </motion.button>
  );
}

export function AnimatedBadge({ children, variant = 'emerald', className = '' }) {
  const styles = {
    emerald: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
    rose: 'bg-rose-500/10 text-rose-700 border-rose-500/30',
    teal: 'bg-teal-500/10 text-teal-700 border-teal-500/30',
  };

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${styles[variant] || styles.emerald} ${className}`}
    >
      {children}
    </motion.span>
  );
}
