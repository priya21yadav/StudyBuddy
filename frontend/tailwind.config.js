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
        darkBg: '#090E1A',
        cardBg: '#0F172A',
        glowBlue: '#00F0FF',
        glowPurple: '#8B5CF6',
        glowOrange: '#FF6B00',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -3px rgba(0, 240, 255, 0.4)',
        'glow-purple': '0 0 20px -3px rgba(139, 92, 246, 0.4)',
        'glow-orange': '0 0 20px -3px rgba(255, 107, 0, 0.4)',
      }
    },
  },
  plugins: [],
}