/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0e1a',
        surface: '#111827',
        primary: {
          DEFAULT: '#00d4ff',
          glow: 'rgba(0, 212, 255, 0.2)',
        },
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        muted: '#64748b',
        'text-primary': '#f1f5f9',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
