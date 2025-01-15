/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        josefin: ['Josefin Sans', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      colors: {
        'primary': {
          50: '#f5f5ff',
          100: '#ebebff',
          200: '#d6d6ff',
          300: '#b5b5ff',
          400: '#9191ff',
          500: '#6b6bff',
          600: '#4646ff',
          700: '#2c2cff',
          800: '#0000ff',
          900: '#0000e6',
        },
        'iris': '#5D5FEF',
        'royal-purple': '#7879F1',
        'slate-blue': '#7879F1',
        'apricot': '#FFB4A2',
        'misty-rose': '#FFD6CC',
        'periwinkle': '#CCCCFF',
        'tekhelet': '#4B0082',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

