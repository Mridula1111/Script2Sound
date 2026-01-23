/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        "gradient-dark": "#0f0f0f",
        "gradient-darker": "#1a1a1a",
      },
      backgroundImage: {
        "gradient-dark-vertical": "linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)",
        "gradient-dark-horizontal": "linear-gradient(90deg, #1a1a1a 0%, #0f0f0f 100%)",
        "gradient-accent": "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
      },
    },
  },
  plugins: [],
};
