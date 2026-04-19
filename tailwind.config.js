/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
    ],
  darkMode: 'class', // Habilitar dark mode manualmente si fuese necesario, pero forzaremos los colores
  theme: {
    extend: {
      colors: {
        dark: {
          main: '#0a0a0f',
          card: '#111118',
        },
        border: {
          subtle: '#1e1e2e',
        },
        text: {
          primary: '#e8e8f0',
          secondary: '#6b6b8a',
        },
        accent: {
          soma: '#00d4aa',
          pneuma: '#8b5cf6',
          techne: '#f59e0b',
          neutral: '#94a3b8',
        }
      }
    },
  },
  plugins: [],
}
