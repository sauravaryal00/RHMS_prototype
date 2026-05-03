/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc', // Light slate background
        surface: '#ffffff', // White surface
        primary: {
          DEFAULT: '#2563eb', // Clean blue accent
          glow: 'rgba(37, 99, 235, 0.2)',
        },
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        muted: '#64748b', // Slate muted text
        'text-primary': '#0f172a', // Dark slate text
        border: '#e2e8f0', // Light borders
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
