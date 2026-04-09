import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        'ks-green': '#17B581',
        'ks-green-light': '#15E99A',
        'ks-purple': '#6F32FF',
        'ks-teal': '#2dd4bf',
        'ks-yellow': '#FFF970',
        'ks-yellow-dark': '#F1EA3C',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        gradient: 'gradient 6s ease infinite',
      },
      backgroundSize: {
        '200%': '200%',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#17B581",
          "secondary": "#6F32FF",
          "accent": "#15E99A",
          "neutral": "#1F2937",
          "base-100": "#FFFFFF",
          "base-200": "#F8FAFC",
          "base-300": "#E2E8F0",
          "info": "#2dd4bf",
          "success": "#15E99A",
          "warning": "#F1EA3C",
          "error": "#ef4444",
        },
        dark: {
          "primary": "#15E99A",
          "secondary": "#6F32FF",
          "accent": "#17B581",
          "neutral": "#21262d",
          "base-100": "#0d1117",
          "base-200": "#161b22",
          "base-300": "#21262d",
          "info": "#2dd4bf",
          "success": "#15E99A",
          "warning": "#F1EA3C",
          "error": "#f87171",
        },
      },
    ],
    darkTheme: "dark",
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: false,
    themeRoot: ":root",
  },
}