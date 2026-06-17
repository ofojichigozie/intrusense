/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
          muted: 'rgb(99 102 241 / 0.1)',
        },
      },
    },
  },
  plugins: [],
};
