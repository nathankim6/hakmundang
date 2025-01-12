import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        nanum: ['Nanum Gothic', 'sans-serif'],
      },
      colors: {
        platinum: '#E5E4E2',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        luxury: {
          dark: '#1A1F2C',
          purple: '#7E69AB',
          accent: '#9b87f5',
          light: '#F1F0FB'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        }
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(100%)' }
        },
        gradient: {
          '0%, 100%': {
            opacity: '0.7'
          },
          '50%': {
            opacity: '0.9'
          }
        },
        'luxury-fade': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        twinkle: {
          '0%, 100%': {
            opacity: '0.85',
            textShadow: '0 0 5px rgba(229, 228, 226, 0.5), 0 0 10px rgba(229, 228, 226, 0.3)',
          },
          '50%': {
            opacity: '1',
            textShadow: '0 0 10px rgba(229, 228, 226, 0.8), 0 0 20px rgba(229, 228, 226, 0.5), 0 0 30px rgba(229, 228, 226, 0.3)',
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'shimmer': 'shimmer 0.5s infinite',
        'gradient': 'gradient 3s ease-in-out infinite',
        'luxury-fade': 'luxury-fade 0.5s ease-out',
        'twinkle': 'twinkle 2s ease-in-out infinite',
      },
      backgroundImage: {
        'luxury-gradient': 'linear-gradient(135deg, #1A1F2C 0%, #403E43 100%)',
        'luxury-accent': 'linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%)',
        'luxury-light': 'linear-gradient(135deg, #F1F0FB 0%, #E5DEFF 100%)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
