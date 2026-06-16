/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Jisr brand — primary (banners/headers/backgrounds)
        primary: {
          50: '#f3f5f9',
          100: '#e7ebf3',
          200: '#cfd6e6',
          300: '#9ca8c4', // Brand grid
          400: '#7588af', // Brand grid
          500: '#2f6fa1',
          600: '#185A8D', // Brand grid (exact)
          700: '#134a74',
          800: '#0f3b5c',
          900: '#0b2b44',
          950: '#071b2c',
        },
        // Jisr brand — CTA / interactive (primary buttons)
        accent: {
          50: '#fff3f2',
          100: '#fde3df',
          200: '#f9b4a3', // Brand grid
          300: '#f6917f', // Brand grid
          400: '#f36f61', // Brand grid
          500: '#EF4545', // Brand grid (exact)
          600: '#d83a35',
          700: '#b92f2b',
          800: '#972826',
          900: '#7b2220',
          950: '#3f0f0e',
        },
        // Sunny yellow - achievements, badges
        sunny: {
          50: '#fffbeb',
          100: '#fff3c6',
          200: '#ffe689',
          300: '#ffd24b',
          400: '#ffba1f',
          500: '#f99c07',
          600: '#dd7402',
          700: '#b75006',
          800: '#943d0c',
          900: '#7a330d',
        },
        // Soft sky - friendly, calming sections (kept)
        sky: {
          50: '#eef9ff',
          100: '#d9f1ff',
          200: '#bbe7ff',
          300: '#88d9ff',
          400: '#4ec3ff',
          500: '#21a5ff',
          600: '#0a85f0',
          700: '#076bd1',
          800: '#0c58aa',
          900: '#114b86',
        },
        // Neutral grays for surfaces
        ink: {
          50: '#f8fafa',
          100: '#eef2f2',
          200: '#dde4e4',
          300: '#c1cccc',
          400: '#9bacac',
          500: '#7a8c8c',
          600: '#5e6e6e',
          700: '#4a5757',
          800: '#3a4444',
          900: '#1f2727',
        },
        brand: {
          primary: '#185A8D',
          accent: '#EF4545',
          surface: '#F1F2F2',
          text: '#231F20',
          white: '#FFFFFF',
          symbol: '#58595B',
        },
      },
      fontFamily: {
        sans: [
          'Montserrat',
          'Plus Jakarta Sans',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'Dela Gothic One',
          'Plus Jakarta Sans',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
        arabic: ['The Year of Handicrafts', 'Tajawal', 'Cairo', 'sans-serif'],
      },
      fontSize: {
        // Tighter, more modern scale
        xxs: ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        soft: '0 2px 8px -1px rgb(15 23 42 / 0.06), 0 1px 2px -1px rgb(15 23 42 / 0.04)',
        card: '0 8px 30px -8px rgb(15 23 42 / 0.10), 0 2px 6px -2px rgb(15 23 42 / 0.06)',
        glow: '0 0 0 4px rgb(24 90 141 / 0.15)',
        'glow-accent': '0 0 0 4px rgb(239 69 69 / 0.15)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-468px 0' },
          '100%': { backgroundPosition: '468px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease forwards',
        'pulse-soft': 'pulse-soft 2.4s ease-in-out infinite',
        shimmer: 'shimmer 1.4s linear infinite',
        float: 'float 4s ease-in-out infinite',
      },
      backgroundImage: {
        'mesh-primary':
          'radial-gradient(at 12% 8%, rgb(24 90 141 / 0.20) 0px, transparent 55%), radial-gradient(at 88% 12%, rgb(239 69 69 / 0.18) 0px, transparent 50%), radial-gradient(at 50% 95%, rgb(33 165 255 / 0.15) 0px, transparent 55%)',
        'gradient-radial':
          'radial-gradient(circle at center, var(--tw-gradient-stops))',
        'grid-faint':
          'linear-gradient(to right, rgb(15 23 42 / 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgb(15 23 42 / 0.04) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '32px 32px',
      },
    },
  },
  plugins: [],
}
