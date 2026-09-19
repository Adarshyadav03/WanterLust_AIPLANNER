import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function AnimatedCard({ children, onClick, className = '', liftDistance = -6 }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? {}
          : {
              y: liftDistance,
              transition: { duration: 0.25, ease: 'easeOut' },
            }
      }
      whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
      onClick={onClick}
      className={`transition-shadow duration-300 hover:shadow-xl ${className}`}
    >
      {children}
    </motion.div>
  );
}
