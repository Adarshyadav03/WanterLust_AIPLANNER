import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function FadeIn({ children, delay = 0, duration = 0.4, className = '', once = true }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once, amount: 0.15 }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : duration,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({ children, delay = 0, duration = 0.4, distance = 30, className = '', once = true }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: shouldReduceMotion ? 0 : distance,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{ once, amount: 0.15 }}
      transition={{
        duration: shouldReduceMotion ? 0.2 : duration,
        delay,
        ease: [0.215, 0.61, 0.355, 1.0],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
