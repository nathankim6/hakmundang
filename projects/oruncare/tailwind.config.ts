
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
        sans: ['Noto Sans KR', 'sans-serif'],
        mono: ['Share Tech Mono', 'JetBrains Mono', 'monospace'],
        display: ['Rajdhani', 'Share Tech Mono', 'sans-serif'],
        noto: ['Noto Sans KR', 'sans-serif'],
        blackhan: ['Black Han Sans', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#5a6373',
          light: '#7a8595',
          dark: '#3d4554',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: '#8b919d',
          light: '#a8adb7',
          dark: '#6b7280',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        accent: {
          DEFAULT: '#6b7280',
          light: '#9ca3af',
          dark: '#4b5563',
          foreground: 'hsl(var(--accent-foreground))'
        },
        teal: {
          light: '#9ca3af',
          DEFAULT: '#6b7280',
          dark: '#4b5563'
        },
        cyber: {
          black: '#111827',
          darker: '#0D1320',
          dark: '#1E293B',
          border: '#2D3748',
          blue: '#00E5FF',
          green: '#0FFF50',
          red: '#FF3D71',
          yellow: '#FFD76E',
          orange: '#FF9E58',
          purple: '#BF5AF2',
          gray: '#6E7191',
          text: '#A0AEC0'
        },
        soft: {
          green: '#a3be8c',
          yellow: '#ebcb8b',
          red: '#bf616a',
          orange: '#d08770',
          purple: '#b48ead',
          blue: '#81a1c1'
        },
        metallic: {
          light: '#E8E9F3',
          DEFAULT: '#B8B8D1',
          dark: '#5B5B8F'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
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
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' }
        },
        glow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' }
        },
        'digital-flow': {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            boxShadow: '0 0 5px rgba(0, 229, 255, 0.7)'
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.9)' 
          }
        },
        'scanning': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' }
        },
        'typing': {
          '0%': { width: '0%' },
          '50%': { width: '100%' },
          '100%': { width: '0%' }
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' }
        },
        'rotate-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'data-flow': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '50%': { transform: 'scale(1.05)', opacity: '0.3' },
          '100%': { transform: 'scale(0.95)', opacity: '0.7' }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'shimmer': 'shimmer 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'digital-flow': 'digital-flow 3s ease infinite',
        'scanning': 'scanning 2s ease-in-out infinite',
        'typing': 'typing 4s steps(20) infinite',
        'blink': 'blink 1s step-end infinite',
        'rotate-slow': 'rotate-slow 10s linear infinite',
        'data-flow': 'data-flow 5s linear infinite',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(220, 12%, 50%) 0%, hsl(220, 15%, 40%) 100%)',
        'gradient-secondary': 'linear-gradient(135deg, hsl(220, 8%, 60%) 0%, hsl(220, 10%, 50%) 100%)',
        'gradient-accent': 'linear-gradient(135deg, hsl(220, 10%, 55%) 0%, hsl(220, 12%, 45%) 100%)',
        'gradient-surface': 'linear-gradient(135deg, hsl(220, 10%, 100%) 0%, hsl(220, 8%, 98%) 100%)',
        'gradient-card': 'linear-gradient(135deg, hsl(220, 8%, 100%) 0%, hsl(220, 6%, 99%) 100%)',
        'gradient-hero': 'linear-gradient(135deg, hsl(220, 12%, 50%) 0%, hsl(220, 10%, 55%) 50%, hsl(220, 8%, 60%) 100%)',
        'gradient-figma': 'linear-gradient(135deg, #5a6373 0%, #3d4554 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        'gradient-mesh': 'radial-gradient(circle at 30% 20%, rgba(90,99,115,0.08), transparent 50%), radial-gradient(circle at 80% 80%, rgba(90,99,115,0.08), transparent 50%)',
        'gradient-soft': 'linear-gradient(135deg, rgba(90,99,115,0.05) 0%, rgba(107,114,128,0.05) 100%)',
        'gradient-metallic': 'linear-gradient(90deg, #d1d5db 0%, #f3f4f6 50%, #d1d5db 100%)',
        'gradient-cyber': 'linear-gradient(180deg, #111827 0%, #0D1320 100%)',
        'gradient-cyber-blue': 'linear-gradient(135deg, #00E5FF 0%, #0092A3 100%)',
        'gradient-cyber-grid': 'linear-gradient(rgba(0, 229, 255, 0.1) 1px, transparent 1px), linear-gradient(to right, rgba(0, 229, 255, 0.1) 1px, transparent 1px)',
        'gradient-cyber-glow': 'radial-gradient(circle at center, rgba(0, 229, 255, 0.15), transparent 70%)',
        'gradient-cyber-scan': 'linear-gradient(transparent, rgba(0, 229, 255, 0.15), transparent)',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
