/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sea-blue': {
          50: '#eff8ff',
          100: '#dbeefe',
          200: '#bfe3fe',
          300: '#93d2fd',
          400: '#60b9fa',
          500: '#3b9df6',
          600: '#2580eb',
          700: '#1d6ad8',
          800: '#1e56af',
          900: '#1e4a8a',
          950: '#172e54',
        },
      },
    },
  },
  plugins: [],
}
