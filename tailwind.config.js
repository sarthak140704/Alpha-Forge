/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        comet: {
          '0%': { transform: 'translateX(0) translateY(0) scale(1)' },
          '100%': { transform: 'translateX(-100vw) translateY(100vh) scale(0)' }
        }
      },
      animation: {
        comet: 'comet 3s linear infinite'
      }
    },
  },
  plugins: [],
};
