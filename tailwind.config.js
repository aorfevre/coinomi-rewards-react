/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  important: '#root',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#5bb4ff',
          dark: '#1976d2',
        },
        background: {
          light: '#ffffff',
          dark: '#121212',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  corePlugins: {
    // Disable Tailwind's preflight as it conflicts with MUI
    preflight: false,
  },
}; 