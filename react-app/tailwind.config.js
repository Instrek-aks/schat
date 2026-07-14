/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgDark: '#070B14',
        accentBlue: '#5B7CFF',
        accentPurple: '#A855F7',
        cardDark: 'rgba(13, 20, 38, 0.4)',
        borderDark: 'rgba(255, 255, 255, 0.06)',
      },
      borderRadius: {
        'premium': '20px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
