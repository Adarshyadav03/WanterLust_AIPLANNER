import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress({ className = '' }) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 origin-left z-[100] ${className}`}
    />
  );
}

export function Toast({ isVisible, message, type = 'success', onClose, duration = 3000 }) {
  React.useEffect(() => {
    if (isVisible && duration) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const bgColors = {
    success: 'bg-slate-900 border-emerald-500/50 text-white',
    error: 'bg-rose-950 border-rose-500/50 text-white',
    warning: 'bg-amber-950 border-amber-500/50 text-white',
    info: 'bg-slate-900 border-cyan-500/50 text-white',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-2xl backdrop-blur-lg ${bgColors[type] || bgColors.success}`}
    >
      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
        {icons[type]}
      </span>
      <span className="text-xs font-bold tracking-wide">{message}</span>
    </motion.div>
  );
}
