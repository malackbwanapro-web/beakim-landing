/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./*.html",
    "./assets/js/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'deep-forest': '#0D2318',
        'canopy': '#1A3D28',
        'moss': '#2C5A3A',
        'champagne': '#B8965A',
        'driftwood': '#D4B07A',
        'ivory': '#F5F0E8',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    }
  },
  plugins: [],
}
