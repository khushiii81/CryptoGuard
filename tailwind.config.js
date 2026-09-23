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
        obsidian: '#060A14',
        navy: '#0A0F1E',
        'slate-deep': '#0D1527',
        'slate-panel': '#111726',
        'slate-border': '#1A2540',
        'slate-light': '#253555',
        cyber: {
          cyan: '#00F0FF',
          emerald: '#10B981',
          crimson: '#FF3366',
          amber: '#F59E0B',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'Consolas', 'monospace'],
      },
      animation: {
        'spin-slow':    'spin 3s linear infinite',
        'pulse-ring':   'pulse-ring 2s ease-in-out infinite',
        'glow-breathe': 'glow-breathe 2.5s ease-in-out infinite',
        'scanline':     'scanline 5s linear infinite',
        'float-y':      'float-y 5s ease-in-out infinite',
        'slide-up':     'slide-up-fade 0.5s ease-out',
        'hex-pulse':    'hex-pulse 4s ease-in-out infinite',
        'neon-flicker': 'flicker 4s linear infinite',
        'border-trace': 'border-trace 3s linear infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%':   { transform: 'scale(0.95)', opacity: '0.9' },
          '70%':  { transform: 'scale(1.15)', opacity: '0' },
          '100%': { transform: 'scale(1.15)', opacity: '0' },
        },
        'glow-breathe': {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px #00F0FF)' },
          '50%':      { filter: 'drop-shadow(0 0 16px #00F0FF)' },
        },
        scanline: {
          'from': { transform: 'translateY(-100%)' },
          'to':   { transform: 'translateY(120vh)' },
        },
        'float-y': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        'slide-up-fade': {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        'hex-pulse': {
          '0%, 100%': { opacity: '0.04' },
          '50%':      { opacity: '0.09' },
        },
        flicker: {
          '0%,19%,21%,23%,25%,54%,56%,100%': { opacity: '1' },
          '20%,24%,55%': { opacity: '0.4' },
        },
        'border-trace': {
          '0%':   { 'clip-path': 'inset(0 100% 100% 0)' },
          '25%':  { 'clip-path': 'inset(0 0 100% 0)' },
          '50%':  { 'clip-path': 'inset(0 0 0 0)' },
          '75%':  { 'clip-path': 'inset(100% 0 0 0)' },
          '100%': { 'clip-path': 'inset(0 100% 100% 0)' },
        },
      },
      boxShadow: {
        'cyan':    '0 0 20px rgba(0,240,255,0.3), 0 0 60px rgba(0,240,255,0.1)',
        'emerald': '0 0 20px rgba(16,185,129,0.35)',
        'crimson': '0 0 20px rgba(255,51,102,0.35)',
        'panel':   '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        'inner-cyan': 'inset 0 0 0 1px rgba(0,240,255,0.15)',
      },
      backgroundImage: {
        'hex-pattern': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='52'%3E%3Cpolygon points='30,1 55,15 55,37 30,51 5,37 5,15' fill='none' stroke='%2300F0FF' stroke-width='0.6' opacity='0.06'/%3E%3C/svg%3E\")",
        'grid-dark':   "linear-gradient(rgba(0,240,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.025) 1px, transparent 1px)",
        'cyber-grad':  'linear-gradient(135deg, #060A14 0%, #0A0F1E 50%, #060A14 100%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};
