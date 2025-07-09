// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  corePlugins: {
    preflight: false, // Disables base styles but keeps other Tailwind features
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
