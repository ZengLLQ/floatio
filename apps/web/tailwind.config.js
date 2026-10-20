/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        theme: {
          darkest: '#181C14',
          dark: '#3C3D37',
          accent: '#697565',
          light: '#ECDFCC',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
