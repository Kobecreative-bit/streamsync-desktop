import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/renderer/src/**/*.{ts,tsx}', './src/renderer/index.html'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0a0e1a',
          secondary: '#111827',
          card: '#1a1f35'
        },
        accent: '#f97316',
        text: {
          primary: '#f1f5f9',
          secondary: '#94a3b8'
        },
        tiktok: '#ff0050',
        youtube: '#ff0000',
        instagram: '#e1306c',
        facebook: '#1877f2',
        success: '#22c55e',
        danger: '#ef4444'
      }
    }
  },
  plugins: []
}

export default config
