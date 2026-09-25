/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Manrope', 'sans-serif'] },
      colors: { ink: '#232520', muted: '#898b82', paper: '#f8f8f5', line: '#e9e9e3', forest: '#335c49', lime: '#dce88d' },
      boxShadow: { soft: '0 12px 36px rgba(37, 42, 32, .06)' },
    },
  },
  plugins: [],
}
