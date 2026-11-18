/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant', 'Georgia', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      colors: {
        canvas: {
          DEFAULT: '#FAF9F5',
          pure: '#FFFFFF',
          subtle: '#F3F1EB',
          deep: '#EBE8DE',
        },
        ink: {
          DEFAULT: '#141413',
          muted: '#666560',
          subtle: '#9E9D96',
          faint: '#D4D2C9',
        },
        hairline: {
          DEFAULT: '#E5E3DA',
          dark: '#2A2927',
        },
        lacquer: {
          DEFAULT: '#B42B24',
          subtle: '#FBEBEA',
        },
        botanical: {
          DEFAULT: '#275B41',
          subtle: '#EAF3ED',
        },
        ochre: {
          DEFAULT: '#B27616',
          subtle: '#FAF2E6',
        },
        darkbg: {
          DEFAULT: '#0F0E0D',
          surface: '#181716',
          elevated: '#22211F',
        }
      },
      letterSpacing: {
        widest: '0.2em',
        ultra: '0.3em',
      },
    },
  },
  plugins: [],
};
