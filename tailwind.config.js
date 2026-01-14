/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Duolingo-inspired clean colors
        duo: {
          green: '#58CC02',      // Main brand green
          'green-dark': '#58A700',
          blue: '#1CB0F6',       // Info/learning blue
          yellow: '#FFC800',     // Gold/achievement
          red: '#FF4B4B',        // Error/wrong
          purple: '#CE82FF',     // Accent purple
          gray: '#AFAFAF',       // Muted text
          'gray-dark': '#4B4B4B',
          'gray-light': '#E5E5E5',
          white: '#FFFFFF',
          black: '#1A1A1A',
        },
        // Keep some utility colors
        primary: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#58CC02',
          600: '#58A700',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'bounce-subtle': 'bounce-subtle 1s ease-in-out infinite',
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
}
