/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#bae3ff',
          300: '#7cc5ff',
          400: '#36a3ff',
          500: '#0078d4',
          600: '#0063b1',
          700: '#004a8d',
          800: '#003d75',
          900: '#002d52',
        },
      },
    },
  },
  plugins: [],
}