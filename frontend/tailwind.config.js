/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf7',
          100: '#dbfceb',
          200: '#b8f8d6',
          300: '#7feeb7',
          400: '#3edb92',
          500: '#15c074',
          600: '#0ca05e',
          700: '#0b7e4c',
          800: '#0c633d',
          900: '#0b5234',
          950: '#052e1d',
          deep: '#092c24', // Deepest forest green from reference image
          pine: '#156550', // Pine green from reference image
          emerald: '#1b7a63', // Botanical leaf green
        },
        mint: {
          50: '#f2f9f6',
          100: '#e1f2ec',
          200: '#c5e6db',
          300: '#99d2c2',
          400: '#69b7a4',
          500: '#479b89',
          600: '#357d6f',
          700: '#2d6459',
          800: '#275149',
          900: '#23443e',
          bg: '#e8f5f0', // Sky/canvas tint from reference image
        },
        risk: {
          low: '#10b981',
          moderate: '#f59e0b',
          high: '#f97316',
          extreme: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
