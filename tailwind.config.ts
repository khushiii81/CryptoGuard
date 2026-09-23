/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0D14',
        slate: {
          deep: '#111726',
          panel: '#151F35',
          border: '#1E2D4A',
        },
        cyan: {
          glow: '#00F0FF',
          dim: '#00B8C4',
          muted: 'rgba(0,240,255,0.15)',
        },
        emerald: {
          glow: '#10B981',
          dim: '#0D9669',
        },
        crimson: {
          glow: '#FF3366',
          dim: '#CC2952',
          muted: 'rgba(255,51,102,0.15)',
        },
        amber: {
          glow: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': `linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)`,
        'hero-gradient': 'radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.12) 0%, rgba(10,13,20,0) 70%)',
        'panel-gradient': 'linear-gradient(135deg, #111726 0%, #0F1520 100%)',
        'cyber-border': 'linear-gradient(135deg, #00F0FF22, #10B98122, #00F0FF22)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'scanner': 'scanner 3s linear infinite',
        'flicker': 'flicker 0.15s infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'radar': 'radar 3s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 8px #00F0FF, 0 0 20px rgba(0,240,255,0.3)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 4px #00F0FF, 0 0 10px rgba(0,240,255,0.15)' },
        },
        scanner: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        radar: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      boxShadow: {
        'cyan': '0 0 20px rgba(0,240,255,0.3), 0 0 40px rgba(0,240,255,0.1)',
        'cyan-sm': '0 0 8px rgba(0,240,255,0.4)',
        'emerald': '0 0 20px rgba(16,185,129,0.3)',
        'crimson': '0 0 20px rgba(255,51,102,0.4)',
        'panel': '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      dropShadow: {
        'cyan': '0 0 8px rgba(0,240,255,0.8)',
        'crimson': '0 0 8px rgba(255,51,102,0.8)',
      },
    },
  },
  plugins: [],
};
