import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/renderer/src/**/*.{ts,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#080c18',
          secondary: '#0c1128',
          card: '#111630'
        },
        accent: '#00d4ff',
        accent2: '#8b5cf6',
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8'
        },
        tiktok: '#ff0050',
        youtube: '#ff0000',
        instagram: '#e1306c',
        facebook: '#1877f2',
        success: '#10b981',
        danger: '#ef4444'
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: []
}

export default config
