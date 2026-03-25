// ===========================
// Shared Motion Animation Variants
// ===========================

/** Shake animation for "running" / "thinking" state icons */
export const shakeAnimation = {
  animate: {
    rotate: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 0.8,
      ease: 'easeInOut' as const,
    },
  },
};

/** Standard floating panel enter/exit (slide from right) */
export const floatingPanelVariants = {
  initial: { x: 40, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 40, opacity: 0 },
  transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
};

/** Standard dropdown/popover enter/exit */
export const dropdownVariants = {
  initial: { opacity: 0, y: -4, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -4, scale: 0.97 },
  transition: { duration: 0.12 },
};

/** Collapsible section expand/collapse */
export const collapseVariants = {
  initial: { height: 0, opacity: 0 },
  animate: { height: 'auto' as const, opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { duration: 0.15 },
};

/** Lightbox overlay fade */
export const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/** Lightbox content scale */
export const lightboxContentVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
};
