/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: {
          600: '#059669',
          700: '#047857',
        },
        navy: {
          900: '#1E3A8A',
        }
      }
    },
  },
  plugins: [],
}