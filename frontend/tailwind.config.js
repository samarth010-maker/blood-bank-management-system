/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        drip: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '30%': { opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { transform: 'translateY(20px)', opacity: '0' },
        },
        pulseRing: {
          '0%': { width: '70px', height: '70px', opacity: '0.8' },
          '100%': { width: '170px', height: '170px', opacity: '0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        drip: 'drip 1.8s ease-in-out infinite',
        pulseRing: 'pulseRing 2.6s ease-out infinite',
        fadeUp: 'fadeUp 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
}