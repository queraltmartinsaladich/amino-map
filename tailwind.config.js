/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {extend: {fontFamily: {'sans': ['"Glacial Indifference"', 'sans-serif'],'play': ['Elephant', '"Playfair Display"', 'serif'], 'grant': ['"EB Garamond"', 'serif']},
                    colors: {'peach': '#FFCCBB', 'water': '#6EB5C0','azure': '#006C84', 'arctic': '#E2E8E4', 'white': '#FFFFFF', 'burgundy': '#7B1B38', 'red': '#df3721ff','green': '#2a9723ff','yellow': '#d8a122ff', 'blue': '#35a1cfff',}}},
  plugins: [],
}