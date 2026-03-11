/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dojo: {
          black:   '#0D0D0D',
          dark:    '#141414',
          card:    '#1A1A1A',
          border:  '#2A2A2A',
          muted:   '#3A3A3A',
          text:    '#C8C8C8',
          light:   '#E8E8E8',
          white:   '#F5F5F0',
          red:     '#C0392B',
          'red-bright': '#E74C3C',
          'red-dark':   '#922B21',
          gold:    '#D4AF37',
          'gold-light': '#F0C94A',
          success: '#27AE60',
          warning: '#E67E22',
          info:    '#2980B9',
        }
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body:    ['"DM Sans"', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'dojo':      '0 4px 24px rgba(192,57,43,0.15)',
        'dojo-lg':   '0 8px 40px rgba(192,57,43,0.25)',
        'card':      '0 2px 16px rgba(0,0,0,0.4)',
        'card-hover':'0 8px 32px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [],
}
