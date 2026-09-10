import type { Config } from 'tailwindcss';

/**
 * Design tokens จากไฟล์ Figma ของ CyberJob
 * brand = น้ำเงิน, accent = เหลือง
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF3FF',
          100: '#E1EAFC',
          200: '#C3D4F7',
          300: '#8FAEEE',
          400: '#4C7AE0',
          500: '#2B5AD1',
          600: '#1B45B8',
          700: '#17348C',
          800: '#122A6E',
          900: '#0F2A6B',
          950: '#0A1C4A',
        },
        accent: {
          50: '#FFF9E5',
          100: '#FFF0BF',
          200: '#FFE485',
          300: '#FFD64A',
          400: '#FFCC2B',
          500: '#FFC629',
          600: '#E8A800',
          700: '#B98400',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Prompt', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 42, 107, 0.08), 0 8px 24px -12px rgba(15, 42, 107, 0.18)',
        pop: '0 12px 32px -8px rgba(15, 42, 107, 0.22)',
      },
      maxWidth: {
        page: '1440px',
      },
    },
  },
  plugins: [],
};

export default config;

