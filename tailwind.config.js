/** @type {import('tailwindcss').Config} */
module.exports = {
  // Path to all your components/screens
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  // Tailwind's browser preflight resets every <button> background to
  // transparent. React Native Web applies TouchableOpacity colors through
  // atomic classes with the same specificity, so the reset can win and make
  // otherwise valid actions invisible. Native components already provide
  // their own base styles, so keep preflight disabled on the shared build.
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Luxury Indian Wedding Palette
        magenta: {
          50: '#fdf2f4',
          600: '#BA0F6B', // Flamboyant Pink (Interactive)
          900: '#800020', // Deep Burgundy (Primary CTA)
        },
        gold: {
          400: '#EEC219', // Exquisite Gold
          500: '#D4AF37', // Antique Gold (Accents)
        },
        blush: {
          100: '#FDFBF7', // Champagne/Cream Background
          200: '#F8C8DC', // Soft Blush Pink
        },
      },
      borderRadius: {
        'wedding': '16px', // Your standard border radius
      },
    },
  },
  plugins: [],
};
