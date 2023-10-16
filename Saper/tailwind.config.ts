/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: ['./index.html', './src/**/*.{vue, js,ts,jsx,tsx}'],
  safelist: [
    'bg-red-500',
    'text-3xl',
    'lg:text-4xl',
    'grid-cols-8',
    'grid-rows-8',
    { pattern: /grid-(rows|cols)-\d+(\.\d+)?/ }
  ],
  theme: {
    extend: {}
  },
  plugins: []
}
