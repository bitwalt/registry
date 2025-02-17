import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'ks-blue': '#8FD5EA',
        'ks-blue-dark': '#7AC3D9',
        'ks-yellow': '#FFF970',
        'ks-yellow-dark': '#F1EA3C',
        'ks-purple': '#A788FF',
        'ks-pink': '#FD9B99',
        'ks-pink-dark': '#F58D8A',
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
          "primary": "#8FD5EA",    // ks-blue
          "secondary": "#A788FF",   // ks-purple
          "accent": "#FFF970",      // ks-yellow
          "neutral": "#1F2937",
          "base-100": "#FFFFFF",
          "base-200": "#F8FAFC",
          "base-300": "#F1F5F9",
          "info": "#7AC3D9",        // ks-blue-dark
          "success": "#10B981",
          "warning": "#F1EA3C",     // ks-yellow-dark
          "error": "#F58D8A",       // ks-pink-dark
        },
        dark: {
          "primary": "#8FD5EA",     // ks-blue
          "secondary": "#A788FF",    // ks-purple
          "accent": "#FFF970",       // ks-yellow
          "neutral": "#1F2937",
          "base-100": "#0F172A",
          "base-200": "#1E293B",
          "base-300": "#334155",
          "info": "#7AC3D9",         // ks-blue-dark
          "success": "#10B981",
          "warning": "#F1EA3C",      // ks-yellow-dark
          "error": "#F58D8A",        // ks-pink-dark
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