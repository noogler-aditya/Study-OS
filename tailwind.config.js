/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        study: {
          paper: "#f6f4ef",
          ink: "#17201b",
          calm: "#1f6f5a"
        }
      }
    }
  },
  plugins: []
};
