/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Trebuchet MS"', '"Gill Sans"', '"Segoe UI"', 'sans-serif'],
        display: ['"Palatino Linotype"', '"Book Antiqua"', 'Palatino', 'serif'],
      },
      colors: {
        ink: '#1f1d2b',
        stone: '#f5f0e8',
        clay: '#e07a5f',
        moss: '#3d5a5b',
        sand: '#f2e9e4',
      },
      boxShadow: {
        soft: '0 18px 40px -24px rgba(31, 29, 43, 0.35)',
      },
      keyframes: {
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.65' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'float-in': 'floatIn 700ms ease forwards',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        shimmer: 'shimmer 3.5s linear infinite',
      },
    },
  },
  plugins: [],
}

