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
        // These variables are defined in src/styles/theme.css (unprefixed for Tailwind)
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        // Catppuccin-specific colors
        'ctp-green': 'var(--ctp-green)',
        'ctp-yellow': 'var(--ctp-yellow)',
        'ctp-peach': 'var(--ctp-peach)',
        'ctp-lavender': 'var(--ctp-lavender)',
        'ctp-mauve': 'var(--ctp-mauve)',
        'ctp-blue': 'var(--ctp-blue)',
      },
      fontFamily: {
        // Typography aligned with Knutpunkt design system
        sans: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        serif: ['Georgia', 'ui-serif', 'serif'],
      },
      borderRadius: {
        // Border radius scale matching Knutpunkt
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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
