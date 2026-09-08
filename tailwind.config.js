/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FAF6F0',
          100: '#F5ECE0',
          200: '#EBD8BE',
          300: '#DFC29A',
          400: '#D4AF77',
          500: '#C5A880', // Principal tom ouro suave
          600: '#B08E5F',
          700: '#8C6D3F',
          800: '#6B522F',
          900: '#4A371F',
        },
        champagne: {
          50: '#FDFBF7',
          100: '#FAF8F5',
          200: '#F3EFEA',
          300: '#E8E1D7',
          400: '#D9CFC2',
          500: '#C7BBAA',
        },
        studio: {
          bg: '#FAF8F5',
          card: '#FFFFFF',
          darkBg: '#121110',
          darkCard: '#1C1A18',
          darkBorder: '#2E2B27',
          text: '#2C2825',
          muted: '#7A7269',
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Montserrat', 'sans-serif'],
      },
      boxShadow: {
        'lux': '0 10px 30px -10px rgba(197, 168, 128, 0.2)',
        'lux-sm': '0 4px 15px -3px rgba(197, 168, 128, 0.15)',
        'lux-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
