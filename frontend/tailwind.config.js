/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',

  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],

  presets: [require('nativewind/preset')],

  theme: {
    extend: {
      fontFamily: {
        raleway: ['Raleway'],
        'raleway-light': ['RalewayLight'],
        'raleway-medium': ['RalewayMedium'],
        'raleway-semibold': ['RalewaySemiBold'],
        'raleway-bold': ['RalewayBold'],
        'raleway-extrabold': ['RalewayExtraBold'],
        'raleway-black': ['RalewayBlack'],
      },
    },
  },

  plugins: [],
};