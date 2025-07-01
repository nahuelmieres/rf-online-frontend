/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // o 'media'
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gym-orange': '#FF5A00',
        'gym-black': '#000000',
        gray: {
        850: '#1e293b', // Gris ultra oscuro
      }
      },
      fontFamily: {
        sans: ['"Roboto Serif"', 'serif'], // Aplica esta fuente como default
      },
    },
  },
  plugins: [],
}