/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./*.{js,html}",
    "./tree/*.html" // Include tree/index.html if it exists
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}