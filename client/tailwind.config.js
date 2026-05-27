/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // support light mode toggle
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B0F19',
          card: 'rgba(17, 24, 39, 0.7)',
          indigo: '#6366F1',
          indigoGlow: 'rgba(99, 102, 241, 0.15)',
          teal: '#14B8A6',
          tealGlow: 'rgba(20, 184, 166, 0.15)',
          purple: '#A855F7',
          grayText: '#9CA3AF'
        }
      },
      fontFamily: {
        heading: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'indigo-glow': '0 0 20px 2px rgba(99, 102, 241, 0.35)',
        'teal-glow': '0 0 20px 2px rgba(20, 184, 166, 0.35)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
