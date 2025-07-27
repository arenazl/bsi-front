module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./src/**/*.component.html",
    "./src/**/*.component.ts"
  ],
  theme: {
    extend: {
      colors: {
        'bsi-blue': '#4680FF',
        'bsi-green': '#2CA87F', 
        'bsi-orange': '#FF6B35',
        'bsi-purple': '#6C63FF',
        'bsi-red': '#FF4757',
        'bsi-teal': '#00D2D3',
        'bsi-dark': '#1D2630',
        'bsi-gray': '#F8F9FA',
        // Additional modern colors
        'bsi-indigo': '#667eea',
        'bsi-cyan': '#17a2b8',
        'bsi-pink': '#e83e8c',
        'bsi-yellow': '#ffc107',
        'bsi-lime': '#32d74b',
        'bsi-emerald': '#10b981',
        'bsi-sky': '#0ea5e9',
        'bsi-violet': '#8b5cf6',
        'bsi-rose': '#f43f5e',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'zoom-in': 'zoomIn 0.3s ease-out',
        'zoom-out': 'zoomOut 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-soft': 'pulseSoft 2s infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        zoomIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        zoomOut: {
          '0%': { transform: 'scale(1.1)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(70, 128, 255, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(70, 128, 255, 0.8)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      fontFamily: {
        'bsi': ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        'bsi-mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
        '6xl': '4rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'hard': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(70, 128, 255, 0.3)',
        'glow-lg': '0 0 40px rgba(70, 128, 255, 0.4)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
      },
      gradientColorStops: {
        'bsi-primary': '#4680FF',
        'bsi-secondary': '#6C63FF',
        'bsi-accent': '#00D2D3',
      },
    },
  },
  plugins: [
    // Custom plugin for glass morphism effect
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(10px)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        '.glass-dark': {
          background: 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(10px)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
        },
        '.text-gradient': {
          background: 'linear-gradient(45deg, #4680FF, #6C63FF)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-gradient-orange': {
          background: 'linear-gradient(45deg, #FF6B35, #FF4757)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-gradient-green': {
          background: 'linear-gradient(45deg, #2CA87F, #00D2D3)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}