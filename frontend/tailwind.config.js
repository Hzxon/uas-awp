/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#FFF1F3',
          100: '#FFE4E9',
          200: '#FFCCD7',
          300: '#FFA3B8',
          400: '#FF6B9D',
          500: '#FF5C8D',
          600: '#E5438A',
          700: '#C92A7A',
          800: '#A61E69',
          900: '#8B1A5B',
        },
      },
      borderRadius: {
        'card': '1rem',
        'button': '0.75rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'card': '0 4px 16px rgba(0, 0, 0, 0.08)',
        'hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}