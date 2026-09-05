
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
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
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
        },
        report: {
          primary: '#2563eb',
          secondary: '#0ea5e9',
          accent: '#38bdf8',
          light: '#bae6fd',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        yellow: {
          '50': '#fef7cd',
          '100': '#fef08a',
          '200': '#fde047',
          '300': '#facc15',
          '400': '#eab308',
          '500': '#ca8a04'
        },
        // Add vibrant accent colors
        vibrant: {
          pink: '#D946EF',
          orange: '#F97316',
          teal: '#0D9488',
          indigo: '#4F46E5',
          coral: '#FF6B6B',
          lavender: '#9B87F5',
          peach: '#FEC6A1',
          mint: '#86EFAC',
          sky: '#0EA5E9'
        },
        // Add soft pastel colors
        pastel: {
          blue: '#D3E4FD',
          green: '#F2FCE2',
          yellow: '#FEF7CD',
          purple: '#E5DEFF',
          pink: '#FFDEE2',
          peach: '#FDE1D3'
        },
        // School grade colors
        school: {
          // Middle school colors
          middle1: { // Yellow theme for 1st grade middle school
            DEFAULT: '#ca8a04',
            light: '#fef7cd',
            mid: '#fde047',
            dark: '#ca8a04',
          },
          middle2: { // Green theme for 2nd grade middle school
            DEFAULT: '#16a34a',
            light: '#f0fdf4',
            mid: '#86efac',
            dark: '#16a34a',
          },
          middle3: { // Blue theme for 3rd grade middle school
            DEFAULT: '#2563eb',
            light: '#dbeafe',
            mid: '#93c5fd',
            dark: '#2563eb',
          },
          // High school colors
          high1: { // Purple theme for 1st grade high school
            DEFAULT: '#9333ea',
            light: '#f3e8ff',
            mid: '#c084fc',
            dark: '#9333ea', 
          },
          high2: { // Pink theme for 2nd grade high school
            DEFAULT: '#db2777',
            light: '#fce7f3',
            mid: '#f472b6',
            dark: '#db2777',
          },
          high3: { // Red theme for 3rd grade high school
            DEFAULT: '#dc2626',
            light: '#fee2e2',
            mid: '#fca5a5',
            dark: '#dc2626',
          },
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        // Editorial 시스템 (Noto Sans 계열로 통일)
        sans: ['Noto Sans KR', 'Noto Sans', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'sans-serif'],
        display: ['Noto Sans KR', 'Noto Sans', 'system-ui', 'sans-serif'],
        serif: ['Noto Serif KR', 'Noto Sans KR', 'serif'],
        orbitron: ['Orbitron', 'Noto Sans KR', 'sans-serif'],
        noto: ['Noto Sans KR', 'Noto Sans', 'sans-serif'],
        inter: ['Noto Sans', 'Noto Sans KR', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' }
        },
        'gradient-slow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        'text-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'gradient-slow': 'gradient-slow 15s ease infinite',
        'text-blink': 'text-blink 1.2s ease-in-out infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
