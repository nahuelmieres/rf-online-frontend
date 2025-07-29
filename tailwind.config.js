module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'gym-orange': '#FF5A00',
        'gym-black': '#000000',
        gray: {
          850: '#1e293b',
        },
        primary: {
          light: '#FF5A00',
          dark: '#FF5A00', // Mantenemos el mismo naranja en dark mode (más contundente)
        },
        background: {
          light: '#ffffff', // Blanco puro como hwpo
          dark: '#000000',  // Negro puro
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Cambiamos a Inter
      },
      borderRadius: {
        'none': '0', // Bordes cuadrados
      },
      boxShadow: {
        'hard': '4px 4px 0px 0px rgba(0,0,0,1)', // Sombras duras como hwpo
      }
    },
  },
  plugins: [],
}