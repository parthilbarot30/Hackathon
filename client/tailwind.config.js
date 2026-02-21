/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1c3f4e',
          orange: '#ef9d44',
          teal: '#15b5a4',
          bg: '#f4f5f7',
          muted: '#8ba3a9'
        }
      }
    },
  },
  plugins: [],
}