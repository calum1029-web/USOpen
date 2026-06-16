/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'usopen-dark':  '#07101f',
        'usopen-navy':  '#0b2d6b',
        'usopen-blue':  '#1a4aa0',
        'usopen-gold':  '#c9a84c',
        'usopen-silver': '#a8b2c0',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
