/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // MaxLabs brand: dark purple (student + lecturer portals). The Mini SOC keeps its own palette.
        brand: {
          50: '#f7f3ff',
          100: '#ede4ff',
          200: '#dccbff',
          300: '#c4a6fb',
          400: '#a67af1',
          500: '#8a4fe0',
          600: '#6d2fc4',
          700: '#5a22a3',
          800: '#481b83',
          900: '#371465',
          950: '#250c47',
        },
        // Restrained gold accent taken from the logo
        gold: {
          100: '#f8efd6',
          300: '#e3c37a',
          500: '#c9972c',
          600: '#a87b1f',
        },
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
