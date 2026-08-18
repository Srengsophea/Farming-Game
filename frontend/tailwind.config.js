module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        farm: {
          soil: '#8B7355',
          grass: '#4CAF50',
          water: '#2196F3',
          stone: '#9E9E9E'
        }
      }
    }
  },
  plugins: []
};
