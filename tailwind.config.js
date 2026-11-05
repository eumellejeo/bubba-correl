/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        roseGold: {
          ivory: '#FAF7F5',
          blush: '#F8EDE8',
          tint: '#F3E2D9',
          border: '#E8D3CB',
          soft: '#D4A39A',
          DEFAULT: '#C68B80',
          main: '#C68B80',
          deep: '#B87B70',
          dark: '#9E6358',
        },
        espresso: {
          900: '#1A1615',
          800: '#2E2625',
          700: '#3C3230',
          600: '#574946',
        },
      },
      fontFamily: {
        display: ['"Paytone One"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'rose-sm': '0 2px 8px -2px rgba(184, 123, 112, 0.12)',
        'rose-md': '0 8px 24px -4px rgba(184, 123, 112, 0.16)',
        'rose-lg': '0 14px 34px -6px rgba(184, 123, 112, 0.22)',
      },
    },
  },
  plugins: [],
};

