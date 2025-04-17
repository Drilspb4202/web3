/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef9ff',
          100: '#dcf3ff',
          200: '#b2e8ff',
          300: '#7cd9ff',
          400: '#3ecbff',
          500: '#13b8ff',
          600: '#0095ff',
          700: '#0077cc',
          800: '#0660a3',
          900: '#0a5386',
        },
        secondary: {
          50: '#fff8eb',
          100: '#ffecc7',
          200: '#ffd989',
          300: '#ffc14e',
          400: '#ffa41f',
          500: '#f98307',
          600: '#dd6302',
          700: '#b74306',
          800: '#94330c',
          900: '#7a2c0d',
        },
      },
    },
  },
  plugins: [],
}; 