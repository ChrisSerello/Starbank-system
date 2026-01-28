/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        starbank: {
          dark: '#050510',
          primary: '#4b0082',
          gold: '#ffd700',
          cyan: '#00d4ff',
          glass: 'rgba(255, 255, 255, 0.05)',
        }
      },
      animation: {
        'twinkle': 'twinkle 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'nebula-flow': 'nebula 20s ease infinite alternate',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: 0.2, transform: 'scale(0.8)' },
          '50%': { opacity: 1, transform: 'scale(1.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        nebula: {
          '0%': { backgroundPosition: '0% 50%', filter: 'hue-rotate(0deg)' },
          '50%': { backgroundPosition: '100% 50%', filter: 'hue-rotate(30deg)' },
          '100%': { backgroundPosition: '0% 50%', filter: 'hue-rotate(0deg)' },
        }
      }
    },
  },
  plugins: [],
}