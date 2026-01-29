/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        display: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        sija: {
          primary: 'var(--color-primary)',
          dark: 'var(--color-dark)',
          light: 'var(--color-light)',
          surface: 'var(--color-surface)',
          text: 'var(--color-text)',
          border: 'var(--color-border)',
          background: 'var(--color-background)',
        }
      },
      boxShadow: {
        'hard': '4px 4px 0px 0px var(--color-primary)',
        'hard-sm': '2px 2px 0px 0px var(--color-primary)',
      }
    }
  },
  plugins: [],
}