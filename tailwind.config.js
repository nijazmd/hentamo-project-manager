/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0B0F17',
          card: '#111827',
          surface: '#182234',
          border: '#1E293B',
          muted: '#64748B',
          text: '#F1F5F9',
        },
        hentamo: {
          blue: '#3B82F6',
          sky: '#38BDF8',
          rose: '#F43F5E',
          amber: '#F59E0B',
          purple: '#A855F7',
          emerald: '#10B981',
          orange: '#FB923C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      },
    },
  },
  plugins: [],
}
