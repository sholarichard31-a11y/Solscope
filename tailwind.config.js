/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sol: {
          bg: '#0B0F14',
          surface: '#0F1923',
          card: '#111827',
          border: '#1F2937',
          accent: '#00DC82',
          green: '#00DC82',
          red: '#EF4444',
          gold: '#F0C040',
          purple: '#9945FF',
          muted: '#6B7280',
          text: '#E5E7EB',
          subtext: '#9CA3AF',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-sol': 'linear-gradient(135deg, #00DC82 0%, #00b36b 100%)',
        'gradient-card': 'linear-gradient(145deg, #111827 0%, #0F1923 100%)',
        'gradient-hero': 'radial-gradient(ellipse at 50% 0%, #00DC8215 0%, transparent 60%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
}
