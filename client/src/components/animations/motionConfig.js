export const motionConfig = {
  transition: {
    fast: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1.0] },
    normal: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1.0] },
    slow: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1.0] },
    spring: { type: 'spring', damping: 25, stiffness: 300 },
    bounce: { type: 'spring', damping: 15, stiffness: 400 },
  },
  viewport: {
    once: true,
    amount: 0.2,
  },
};

export default motionConfig;
