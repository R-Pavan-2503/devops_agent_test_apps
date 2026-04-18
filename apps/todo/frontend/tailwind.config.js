/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0eeff',
          100: '#e2dcff',
          200: '#c9bcff',
          300: '#a78bfa',
          400: '#8b5cf6',
          500: '#6c63ff',
          600: '#5a52d5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      boxShadow: {
        glow: '0 0 20px rgba(108, 99, 255, 0.3)',
      },
    },
  },
  plugins: [],
};
