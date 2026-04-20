import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAF9',
        foreground: '#292524',
        primary: '#1A5C38',
        'primary-light': '#2D7A4D',
        'primary-dark': '#0F4024',
        accent: '#B45309',
        'accent-light': '#CD7F32',
        border: '#E7E5E4',
        'muted-text': '#78716F',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
