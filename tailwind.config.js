/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gym-orange': '#FF5A00',
        'gym-black': '#000000',
      },
    },
  },
  plugins: [],
}