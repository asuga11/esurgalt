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
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
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