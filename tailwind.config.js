/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SmartStay Luxury Brand Palette
        brand: {
          primary: '#171717',     // Obsidian
          secondary: '#292724',   // Warm Charcoal
          background: '#F8F5EF',  // Ivory
          surface: '#FFFFFF',     // Pearl White
          accent: '#C6A15B',      // Champagne Gold
          text: '#24211E',        // Deep Charcoal
          muted: '#7C756B',       // Warm Gray
        },
        obsidian: '#171717',
        warmCharcoal: '#292724',
        ivory: '#F8F5EF',
        pearlWhite: '#FFFFFF',
        champagneGold: '#C6A15B',
        deepCharcoal: '#24211E',
        warmGray: '#7C756B',

        // Teal / Legacy Primary
        teal: {
          500: '#0F9F91',
          600: '#0B857A',
          700: '#086F66',
          bg: '#E8F7F5',
          text: '#0F5F59',
          link: '#0F857C',
        },
        // Background Palette
        bg: {
          main: '#F8F5EF',
          secondary: '#F1EFEA',
          card: '#FFFFFF',
          soft: '#EEF4F7',
        },
        // Text Palette
        text: {
          primary: '#24211E',
          secondary: '#526174',
          muted: '#7C756B',
          disabled: '#A8B2C0',
        },
        // Hospitality Accent
        gold: {
          500: '#C6A15B',
          bg: '#FBF5E8',
          text: '#8A6A2F',
        },
        // Status Palette
        status: {
          success: '#16A34A',
          successBg: '#EAF8EF',
          info: '#2563EB',
          infoBg: '#EFF6FF',
          warning: '#D97706',
          warningBg: '#FFF7E6',
          error: '#DC2626',
          errorBg: '#FEF2F2',
          disabled: '#64748B',
          disabledBg: '#F1F5F9',
        },
        border: {
          default: '#E2E8F0',
          input: '#CBD5E1',
          hover: '#94A3B8',
          focus: '#C6A15B',
        }
      }
    },
  },
  plugins: [],
}
