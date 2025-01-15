/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'ping': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'typing': 'typing 3.5s steps(40, end), blink .75s step-end infinite',
        'spotlight': 'spotlight 2s ease-in-out infinite',
        'moveLines': 'moveLines 15s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'scan': 'scan 2s linear infinite',
        'radar-ping': 'radar-ping 1.5s ease-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'bounce-once': 'bounce 0.5s ease-in-out 1',
        'blob': 'blob 7s infinite',
        'confetti-1': 'confetti-1 1s ease-out forwards',
        'confetti-2': 'confetti-2 1s ease-out forwards',
        'confetti-3': 'confetti-3 1s ease-out forwards',
        'confetti-4': 'confetti-4 1s ease-out forwards',
        'confetti-5': 'confetti-5 1s ease-out forwards',
        'line-draw': 'lineDraw 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'winning-line': 'winningLine 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'diagonal-line': 'diagonalDraw 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'diagonal-line-reverse': 'diagonalDrawReverse 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'vertical-line': 'verticalDraw 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'mouse-move-float': 'mouseFloat 3s ease-in-out infinite',
        'mouse-move-pulse': 'mousePulse 4s ease-in-out infinite',
        'mouse-move-gradient': 'mouseGradient 3s ease infinite',
        'shine-effect': 'shine 2s linear infinite',
        'hover-glow': 'hoverGlow 1.5s ease-in-out infinite',
        'slide-down': 'slide-down 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        'shrink-width': 'shrink-width 5s linear',
        'typing': 'typing 3.5s steps(40, end), blink .75s step-end infinite',
        'blink': 'blink 2s step-end infinite',
        'fadeIn': 'fadeIn 0.5s ease-out',
        'expandWidth': 'expandWidth 0.5s ease-out',
        'spotlight': 'spotlight 2s ease-in-out infinite',
        'moveLines': 'moveLines 15s linear infinite',
        'scan': 'scan 2s linear infinite',
        'radar-ping': 'radar-ping 1.5s ease-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'bounce-once': 'bounce 0.5s ease-in-out 1',
        'blob': 'blob 7s infinite',
        'line-draw': 'lineDraw 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'winning-line': 'winningLine 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'diagonal-line': 'diagonalDraw 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'diagonal-line-reverse': 'diagonalDrawReverse 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'vertical-line': 'verticalDraw 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'mouse-move-float': 'mouseFloat 3s ease-in-out infinite',
        'mouse-move-pulse': 'mousePulse 4s ease-in-out infinite',
        'mouse-move-gradient': 'mouseGradient 3s ease infinite',
        'shine-effect': 'shine 2s linear infinite',
        'hover-glow': 'hoverGlow 1.5s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        glow: {
          'from': {
            'text-shadow': '0 0 10px #FF5AAF, 0 0 20px #FF5AAF, 0 0 30px #FF5AAF',
          },
          'to': {
            'text-shadow': '0 0 20px #60B5FF, 0 0 30px #60B5FF, 0 0 40px #60B5FF',
          },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        blink: {
          'from, to': { 'border-color': 'transparent' },
          '50%': { 'border-color': 'white' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        expandWidth: {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        spotlight: {
          '0%, 100%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(100%)' },
        },
        moveLines: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        scan: {
          '0%': {
            transform: 'translateY(-50%) rotate(0deg)',
          },
          '100%': {
            transform: 'translateY(-50%) rotate(360deg)',
          },
        },
        'radar-ping': {
          '0%': {
            transform: 'scale(1)',
            opacity: '1',
          },
          '100%': {
            transform: 'scale(2)',
            opacity: '0',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
        'slide-up': {
          '0%': {
            transform: 'translateY(20px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'scale-in': {
          '0%': {
            transform: 'scale(0.9)',
            opacity: '0',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        blob: {
          '0%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
          '100%': {
            transform: 'translate(0px, 0px) scale(1)',
          },
        },
        'confetti-1': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: 0 },
        },
        'confetti-2': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(100vh) rotate(-720deg)', opacity: 0 },
        },
        'confetti-3': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(100vh) rotate(360deg)', opacity: 0 },
        },
        'confetti-4': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(100vh) rotate(-360deg)', opacity: 0 },
        },
        'confetti-5': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(100vh) rotate(540deg)', opacity: 0 },
        },
        lineDraw: {
          '0%': {
            transform: 'scaleX(0)',
            opacity: '0',
          },
          '100%': {
            transform: 'scaleX(1)',
            opacity: '1',
          },
        },
        winningLine: {
          '0%': {
            transform: 'scaleX(0)',
            opacity: '0',
          },
          '100%': {
            transform: 'scaleX(1)',
            opacity: '1',
          }
        },
        diagonalDraw: {
          '0%': {
            transform: 'scaleX(0) rotate(0deg)',
            opacity: '0'
          },
          '100%': {
            transform: 'scaleX(1) rotate(45deg)',
            opacity: '1'
          }
        },
        diagonalDrawReverse: {
          '0%': {
            transform: 'scaleX(0) rotate(135deg)',
            opacity: '0'
          },
          '100%': {
            transform: 'scaleX(1) rotate(135deg)',
            opacity: '1'
          }
        },
        verticalDraw: {
          '0%': {
            transform: 'scaleX(0) rotate(90deg)',
            opacity: '0'
          },
          '100%': {
            transform: 'scaleX(1) rotate(90deg)',
            opacity: '1'
          }
        },
        'slide-down': {
          '0%': {
            transform: 'translateY(-100%) translateX(-50%)',
            opacity: '0'
          },
          '100%': {
            transform: 'translateY(0) translateX(-50%)',
            opacity: '1'
          }
        },
        'shrink-width': {
          '0%': {
            width: '100%'
          },
          '100%': {
            width: '0%'
          }
        },
        mouseFloat: {
          '0%, 100%': {
            transform: 'translate(var(--mouse-x, 0), var(--mouse-y, 0))',
          },
          '50%': {
            transform: 'translate(calc(var(--mouse-x, 0) + 10px), calc(var(--mouse-y, 0) - 10px))',
          },
        },
        mousePulse: {
          '0%': {
            opacity: '0.4',
            transform: 'scale(1) translate(var(--mouse-x, 0), var(--mouse-y, 0))',
          },
          '50%': {
            opacity: '0.6',
            transform: 'scale(1.1) translate(var(--mouse-x, 0), var(--mouse-y, 0))',
          },
          '100%': {
            opacity: '0.4',
            transform: 'scale(1) translate(var(--mouse-x, 0), var(--mouse-y, 0))',
          },
        },
        mouseGradient: {
          '0%': {
            backgroundPosition: '0% 50%',
            transform: 'translate(var(--mouse-x, 0), var(--mouse-y, 0))',
          },
          '50%': {
            backgroundPosition: '100% 50%',
            transform: 'translate(calc(var(--mouse-x, 0) + 5px), calc(var(--mouse-y, 0) - 5px))',
          },
          '100%': {
            backgroundPosition: '0% 50%',
            transform: 'translate(var(--mouse-x, 0), var(--mouse-y, 0))',
          },
        },
        shine: {
          '0%': {
            transform: 'translateX(-100%)',
          },
          '100%': {
            transform: 'translateX(100%)',
          },
        },
        hoverGlow: {
          '0%, 100%': {
            opacity: '0.5',
            filter: 'blur(10px)',
          },
          '50%': {
            opacity: '0.8',
            filter: 'blur(15px)',
          },
        },
      },
      textShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.25)',
        DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.25)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.25)',
      },
      colors: {
        primary: {
          pink: '#FF5AAF',
          green: '#A1F55D',
          yellow: '#FFCA2C',
          blue: '#60B5FF',
          lavender: '#B66DFF',
          orange: '#FF8842',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(var(--tw-gradient-stops))',
        'conic-gradient': 'conic-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'neon': '0 0 5px theme(colors.primary.pink), 0 0 20px theme(colors.primary.pink)',
        'neon-blue': '0 0 5px theme(colors.primary.blue), 0 0 20px theme(colors.primary.blue)',
        'neon-hover': '0 0 10px theme(colors.primary.pink), 0 0 30px theme(colors.primary.pink)',
        'line': '0 0 15px rgba(255,255,255,0.5)',
      },
      transformStyle: {
        '3d': 'preserve-3d',
      },
      perspective: {
        '1000': '1000px',
      },
      translate: {
        'z-8': '8px',
        'z-12': '12px',
        'z-16': '16px',
      },
      extend: {
        variables: {
          '--mouse-x': '0px',
          '--mouse-y': '0px',
        },
      },
    },
  },
  plugins: [],
}; 