/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.{js,html}",
    "./tree/*.html" // Include files like tree/dashboard.html
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}