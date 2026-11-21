/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.js',
    './index.js',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef3ff',
          100: '#e1e9ff',
          200: '#c9d7ff',
          300: '#a7bfff',
          500: '#5574dd',
          600: '#3754bf',
          700: '#2b459f',
          800: '#253a81',
          900: '#1d2d63',
          950: '#152449',
        },
        canvas: '#f4f7fc',
        line: '#e1e7f0',
        ink: '#182641',
        slateText: '#0f172a',
        mutedText: '#64748b',
        softBg: '#f8fafc',
        cardBorder: '#e2e8f0',
        success: '#16a34a',
        danger: '#dc2626',
        warning: '#f59e0b',
      },
      borderRadius: {
        xl2: '20px',
      },
      boxShadow: {
        card: '0 10px 25px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
};