/**
 * Golf Okay Design Tokens
 *
 * Single source of truth for colors, spacing, and visual properties.
 * Extracted from NeuralDots orb palette and existing component patterns.
 */

// ============================================================================
// COLORS
// ============================================================================

export const colors = {
  // Background hierarchy (darkest to lightest)
  background: {
    base: '#0a0a0a', // True black, main page background
    elevated: '#131314', // Slightly lifted, for overlays/modals
    card: '#1E1F20', // Card surfaces, sidebars
    hover: '#282A2C', // Interactive hover states
    input: '#282A2C', // Input fields at rest
  },

  // Surface treatments
  surface: {
    // Glass morphism (use with backdrop-blur)
    glass: {
      bg: 'rgba(255, 255, 255, 0.03)',
      border: 'rgba(255, 255, 255, 0.1)',
      borderHover: 'rgba(255, 255, 255, 0.2)',
    },
    // Solid dark surfaces (no blur needed)
    solid: {
      bg: '#1E1F20',
      border: 'rgba(255, 255, 255, 0.05)',
    },
  },

  // Accent colors (from NeuralDots orb - the "fireflies")
  accent: {
    coral: '#FF6B35', // Primary accent - CTAs, highlights, brand warmth
    coralMuted: 'rgba(255, 107, 53, 0.20)', // Icon backgrounds, pill tints
    coralStrong: 'rgba(255, 107, 53, 0.30)', // Glow effects, stronger presence

    cyan: '#00D4FF', // Secondary accent - links, info states
    cyanMuted: 'rgba(0, 212, 255, 0.20)', // Icon backgrounds, pill tints
    cyanStrong: 'rgba(0, 212, 255, 0.30)', // Glow effects, stronger presence

    purple: '#A855F7', // Tertiary accent - premium features
    purpleMuted: 'rgba(168, 85, 247, 0.20)', // Icon backgrounds, pill tints
    purpleStrong: 'rgba(168, 85, 247, 0.30)', // Glow effects, stronger presence

    red: '#FF3B3B', // Danger/error states
    redMuted: 'rgba(255, 59, 59, 0.20)', // Error backgrounds, subtle alerts
    redStrong: 'rgba(255, 59, 59, 0.30)', // Glow effects, stronger presence

    gold: '#FBBF24', // Success, warnings, achievements, prices
    goldMuted: 'rgba(251, 191, 36, 0.20)', // Success backgrounds, pill tints
    goldStrong: 'rgba(251, 191, 36, 0.30)', // Glow effects, stronger presence
  },

  // Shimmer colors for skeleton loading animations
  shimmer: {
    base: '#282A2C', // Start/end of shimmer gradient
    highlight: '#333537', // Middle highlight of shimmer
  },

  // Text hierarchy
  text: {
    primary: '#FFFFFF', // Headlines, important content
    secondary: '#9CA3AF', // Body text, descriptions (gray-400)
    muted: '#6B7280', // Hints, placeholders (gray-500)
    disabled: '#4B5563', // Disabled states (gray-600)
  },

  // Semantic colors (derived from accent palette)
  semantic: {
    success: '#FBBF24', // Gold - positive actions, confirmations
    error: '#FF3B3B', // Red - errors, destructive actions
    warning: '#FF6B35', // Coral - warnings, attention needed
    info: '#00D4FF', // Cyan - informational states
  },
} as const;

// ============================================================================
// RADIUS
// ============================================================================

export const radius = {
  none: '0px',
  sm: '8px', // Small elements, tags
  md: '12px', // Buttons, small cards
  lg: '16px', // Cards, modals
  xl: '20px', // Large cards
  '2xl': '24px', // Hero cards
  '3xl': '32px', // Feature cards, main containers
  pill: '9999px', // Pills, avatars, full-round buttons
} as const;

// Semantic radius aliases
export const radiusTokens = {
  button: radius.md, // 12px - standard buttons
  buttonPill: radius.pill, // Full round buttons
  input: radius.xl, // 20px - chat input, form fields
  card: radius['3xl'], // 32px - main cards
  cardSmall: radius.lg, // 16px - compact cards
  modal: radius['3xl'], // 32px - modal dialogs
  tag: radius.pill, // Pills, badges
  avatar: radius.pill, // Profile images
  tooltip: radius.lg, // 16px - tooltips
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: 'none',

  // Subtle elevation
  sm: '0 1px 2px rgba(0, 0, 0, 0.5)',

  // Card elevation
  md: '0 4px 16px rgba(0, 0, 0, 0.4)',

  // Modal/popup elevation
  lg: '0 8px 32px rgba(0, 0, 0, 0.5)',

  // Glassmorphism shadow
  glass: '0 8px 32px rgba(0, 0, 0, 0.36)',

  // Accent glows (colored shadows for emphasis)
  glow: {
    coral: '0 0 20px rgba(255, 107, 53, 0.3)',
    cyan: '0 0 20px rgba(0, 212, 255, 0.3)',
    purple: '0 0 20px rgba(168, 85, 247, 0.3)',
    gold: '0 0 20px rgba(251, 191, 36, 0.3)',
    white: '0 0 20px rgba(255, 255, 255, 0.1)',
  },

  // Inner shadows for depth
  inset: 'inset 0 0 20px rgba(255, 255, 255, 0.02)',
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans), system-ui, -apple-system, sans-serif',
    mono: 'var(--font-geist-mono), ui-monospace, monospace',
  },

  fontSize: {
    xs: '0.75rem', // 12px - captions, labels
    sm: '0.875rem', // 14px - body small
    base: '1rem', // 16px - body
    lg: '1.125rem', // 18px - body large
    xl: '1.25rem', // 20px - heading 5
    '2xl': '1.5rem', // 24px - heading 4
    '3xl': '1.875rem', // 30px - heading 3
    '4xl': '2.25rem', // 36px - heading 2
    '5xl': '3rem', // 48px - heading 1
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem', // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem', // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
} as const;

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

// ============================================================================
// Z-INDEX
// ============================================================================

export const zIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
} as const;

// ============================================================================
// TAILWIND CLASS HELPERS
// ============================================================================

/**
 * Pre-composed Tailwind class strings for common patterns.
 * Use these for consistency across components.
 */
export const tw = {
  // Glass surface (requires backdrop-blur support)
  glass:
    'bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]',

  // Glass surface with hover state
  glassInteractive:
    'bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-colors',

  // Solid card surface
  card: 'bg-[#1E1F20] border border-white/5 rounded-3xl',

  // Input field styling
  input:
    'bg-[#282A2C] border border-white/5 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:border-white/20 focus:bg-[#1E1F20] transition-colors',

  // Primary button (coral accent)
  buttonPrimary:
    'bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-bold rounded-xl px-6 py-3 transition-colors',

  // Ghost button
  buttonGhost:
    'bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl px-6 py-3 border border-white/10 hover:border-white/20 transition-colors',

  // Pill/tag styling
  pill: 'px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-white/10 border border-white/10 text-white',

  // Text gradient (holographic effect)
  textGradient:
    'bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent',
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type AccentColor = keyof typeof colors.accent;
export type SemanticColor = keyof typeof colors.semantic;
export type RadiusToken = keyof typeof radius;
export type ShadowToken = keyof typeof shadows;
