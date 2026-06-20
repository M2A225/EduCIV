import { Variants, Transition } from 'framer-motion';

const defaultTransition: Transition = {
  duration: 0.25,
  ease: [0.4, 0, 0.2, 1],
};

const springTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

const emphasizedTransition: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 20,
};

export const presets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  } as Variants,

  fadeOut: {
    initial: { opacity: 1 },
    animate: { opacity: 0 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 },
  } as Variants,

  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: springTransition,
  } as Variants,

  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: springTransition,
  } as Variants,

  slideLeft: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: springTransition,
  } as Variants,

  slideRight: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: springTransition,
  } as Variants,

  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: springTransition,
  } as Variants,

  scaleOut: {
    initial: { opacity: 1, scale: 1 },
    animate: { opacity: 0, scale: 0.95 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
  } as Variants,

  staggerContainer: {
    animate: {
      transition: { staggerChildren: 0.06, delayChildren: 0.1 },
    },
  } as Variants,

  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: springTransition,
  } as Variants,

  pageTransition: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  } as Variants,

  modalOverlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  } as Variants,

  modalContent: {
    initial: { opacity: 0, scale: 0.95, y: 8 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -8 },
    transition: springTransition,
  } as Variants,

  drawer: {
    initial: { opacity: 0, x: '100%' },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: '100%' },
    transition: emphasizedTransition,
  } as Variants,

  toast: {
    initial: { opacity: 0, x: 40, y: -20 },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: 40, y: -20 },
    transition: springTransition,
  } as Variants,

  hoverLift: {
    whileHover: { y: -2, transition: { duration: 0.15 } },
    whileTap: { scale: 0.97 },
  },

  tapScale: {
    whileTap: { scale: 0.97 },
  },

  cardHover: {
    whileHover: {
      y: -4,
      boxShadow: 'var(--shadow-4)',
      transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
    },
  },

  rowHover: {
    whileHover: {
      backgroundColor: 'var(--color-primary-bg)',
      transition: { duration: 0.15 },
    },
  },

  shimmer: {
    animate: {
      backgroundPosition: ['-200% 0', '200% 0'],
      transition: { duration: 2, ease: 'linear', repeat: Infinity },
    },
  },
};

export function createStaggerVariants(
  containerDelay = 0.1,
  itemDelay = 0.06
): Variants {
  return {
    animate: {
      transition: {
        staggerChildren: itemDelay,
        delayChildren: containerDelay,
      },
    },
  };
}

export function createSlideVariants(
  direction: 'up' | 'down' | 'left' | 'right' = 'up',
  distance = 20
): Variants {
  const transforms = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  };

  return {
    initial: { opacity: 0, ...transforms[direction] },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...Object.fromEntries(Object.entries(transforms[direction]).map(([k, v]) => [k, -v])) },
    transition: springTransition,
  };
}

export function createPageTransitionVariants(): Variants {
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  };
}
