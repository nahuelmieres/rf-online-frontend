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
        // Nuevos colores estilo FullstackOpen
        primary: {
          light: '#FF5A00', // Usamos tu naranja como primario
          dark: '#FF8C66',  // Naranja más claro para dark mode
        },
        background: {
          light: '#f8f9fa',
          dark: '#121212',  // Más oscuro que el original para contraste
        }
      },
      fontFamily: {
        sans: ['"Roboto Serif"', 'serif'],
        mono: ['"Roboto Mono"', 'monospace'] // Para código/comentarios
      },
    },
  },
  plugins: [],
}