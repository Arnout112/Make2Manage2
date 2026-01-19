/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        }
      },
      fontSize: {
        'xs-accessible': ['0.75rem', { lineHeight: '1.5' }],
        'sm-accessible': ['0.875rem', { lineHeight: '1.5' }],
        'base-accessible': ['1rem', { lineHeight: '1.6' }],
        'lg-accessible': ['1.125rem', { lineHeight: '1.6' }],
        'xl-accessible': ['1.25rem', { lineHeight: '1.6' }],
        '2xl-accessible': ['1.5rem', { lineHeight: '1.6' }],
      },
      spacing: {
        'touch-target': '44px', // Minimum touch target size
      },
      ringWidth: {
        'accessibility': '3px',
      },
      ringOffsetWidth: {
        'accessibility': '3px',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      screens: {
        'reduce-motion': { 'raw': '(prefers-reduced-motion: reduce)' },
        'high-contrast': { 'raw': '(prefers-contrast: high)' },
      }
    },
  },
  plugins: [
    // Custom plugin for accessibility utilities
    function({ addUtilities, addComponents, theme }) {
      addUtilities({
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        },
        '.focus\\:not-sr-only:focus': {
          position: 'static',
          width: 'auto',
          height: 'auto',
          padding: 'inherit',
          margin: 'inherit',
          overflow: 'visible',
          clip: 'auto',
          whiteSpace: 'normal',
        },
        '.touch-target': {
          minHeight: theme('spacing.touch-target'),
          minWidth: theme('spacing.touch-target'),
        },
        '.focus-ring-enhanced': {
          '&:focus': {
            outline: '3px solid currentColor',
            outlineOffset: '2px',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.5)',
          }
        },
        '.reduced-motion': {
          '*': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          }
        }
      })
      
      addComponents({
        '.btn-accessible': {
          minHeight: theme('spacing.touch-target'),
          minWidth: theme('spacing.touch-target'),
          '&:focus': {
            outline: 'none',
            ringWidth: '3px',
            ringColor: theme('colors.blue.500'),
            ringOffsetWidth: '2px',
          }
        },
        '.skip-link': {
          position: 'absolute',
          top: '-2.5rem',
          left: '0.5rem',
          backgroundColor: theme('colors.blue.600'),
          color: theme('colors.white'),
          padding: '0.5rem 1rem',
          borderRadius: theme('borderRadius.md'),
          textDecoration: 'none',
          zIndex: '9999',
          transition: 'top 0.3s ease',
          '&:focus': {
            top: '0.5rem',
          }
        }
      })
    }
  ],
}
