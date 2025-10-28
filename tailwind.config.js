/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lilac: {
          light: '#E6E6FA',
          DEFAULT: '#C8A2C8',
          dark: '#9370DB',
        },
        gold: {
          DEFAULT: '#D4AF37',
          dark: '#B8941C',
        },
        pink: {
          100: '#F5E6F0',
          200: '#E8C4D8',
        },
      },
      fontFamily: {
        cursive: ['Dancing Script', 'cursive'],
        elegant: ['Fleur De Leah', 'cursive'],
        logo: ['Mea Culpa', 'cursive'],
      },
    },
  },
  plugins: [],
}
