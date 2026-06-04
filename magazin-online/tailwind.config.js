/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1f1b17",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 2px 16px 0 rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
}