/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#1a56db',
          600: '#1447c0',
          700: '#1e3a8a',
          800: '#1e3270',
          900: '#172554',
        },
        gold: {
          300: '#fcd34d',
          400: '#f59e0b',
          500: '#d4a017',
          600: '#b8860b',
          700: '#92680a',
        },
        dark: {
          900: '#0a0a0f',
          800: '#0f0f14',
          700: '#14141a',
          600: '#1c1c24',
          500: '#2a2a35',
          400: '#3d3d4d',
        },
        light: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
        }
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #1a56db 0%, #1e3a8a 40%, #92680a 80%, #d4a017 100%)',
        'brand-gradient-h': 'linear-gradient(90deg, #1a56db 0%, #d4a017 100%)',
        'hero-gradient': 'linear-gradient(135deg, #1e3a8a 0%, #1a56db 35%, #92680a 70%, #d4a017 100%)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
