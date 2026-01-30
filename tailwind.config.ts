/**
 * Tailwind CSS configuration for @dirigent/workflow-viewer
 *
 * Configured to align with Knutpunkt frontend's Catppuccin theme system.
 */

import type { Config } from 'tailwindcss'

export default {
  // Disable preflight - consuming apps have their own resets
  corePlugins: {
    preflight: false,
  },
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
    './index.html',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic colors that inherit from CSS variables
        // These variables are defined in src/styles/theme.css and scoped to .workflow-viewer
        border: 'var(--wfv-border)',
        input: 'var(--wfv-input)',
        ring: 'var(--wfv-ring)',
        background: 'var(--wfv-background)',
        foreground: 'var(--wfv-foreground)',
        primary: {
          DEFAULT: 'var(--wfv-primary)',
          foreground: 'var(--wfv-primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--wfv-secondary)',
          foreground: 'var(--wfv-secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--wfv-destructive)',
          foreground: 'var(--wfv-destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--wfv-muted)',
          foreground: 'var(--wfv-muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--wfv-accent)',
          foreground: 'var(--wfv-accent-foreground)',
        },
        card: {
          DEFAULT: 'var(--wfv-card)',
          foreground: 'var(--wfv-card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--wfv-popover)',
          foreground: 'var(--wfv-popover-foreground)',
        },
        // Catppuccin-specific colors
        'ctp-green': 'var(--wfv-ctp-green)',
        'ctp-yellow': 'var(--wfv-ctp-yellow)',
        'ctp-peach': 'var(--wfv-ctp-peach)',
        'ctp-lavender': 'var(--wfv-ctp-lavender)',
        'ctp-mauve': 'var(--wfv-ctp-mauve)',
        'ctp-blue': 'var(--wfv-ctp-blue)',
      },
      fontFamily: {
        // Typography aligned with Knutpunkt design system
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        serif: ['Georgia', 'ui-serif', 'serif'],
      },
      borderRadius: {
        // Border radius scale matching Knutpunkt
        lg: 'var(--wfv-radius)',
        md: 'calc(var(--wfv-radius) - 2px)',
        sm: 'calc(var(--wfv-radius) - 4px)',
      },
      keyframes: {
        // Pulse animation for current step indicator
        pulse: {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 12px rgba(245, 158, 11, 0.5)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 24px rgba(245, 158, 11, 0.8)',
          },
        },
        // Dash animation for execution path
        dashdraw: {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '10' },
        },
      },
      animation: {
        pulse: 'pulse 2s ease-in-out infinite',
        dashdraw: 'dashdraw 0.5s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
