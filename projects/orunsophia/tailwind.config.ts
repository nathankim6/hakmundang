
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
				toss: {
					blue: '#4C6EF5',
					lightBlue: '#748FFC',
					indigo: '#5F3DC4',
					purple: '#7950F2',
					violet: '#9775FA',
					gray: '#343A40',
					lightGray: '#495057',
					extraLightGray: '#F8F9FA',
					background: '#F9FAFB',
					secondary: '#E9ECEF',
					focus: '#F1F3F5',
					cardBg: '#FFFFFF',
					primary: '#4C6EF5',
					success: '#51CF66',
					warning: '#FCC419',
					danger: '#FF6B6B',
					text: '#212529',
					textSecondary: '#868E96',
					border: '#DEE2E6',
				},
				oracle: {
					navy: '#121212',
					gold: '#D5AB55',
					green: '#4DFA91',
					lightGreen: '#68F5A6',
					cream: '#F5F5DC',
					blue: '#143D59',
					lightBlue: '#6A8EAE',
					dark: '#0A0A0A',
					gray: '#2A2A2A',
					lightGray: '#3A3A3A',
					darkGreen: '#2C3C35',
					darkBeige: '#35302A',
					oliveGreen: '#556B2F',
					sage: '#736F4E',
				}
			},
			fontFamily: {
				serif: ['Playfair Display', 'Georgia', 'serif'],
				sans: ['Pretendard', 'Inter', 'system-ui', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				'pulse-slow': {
					'0%, 100%': { opacity: '.5' },
					'50%': { opacity: '1' },
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' },
				},
				'corona-pulse': {
					'0%, 100%': { 
						textShadow: '0 0 8px rgba(213, 171, 85, 0.7), 0 0 16px rgba(213, 171, 85, 0.5), 0 0 24px rgba(213, 171, 85, 0.3)' 
					},
					'50%': { 
						textShadow: '0 0 12px rgba(213, 171, 85, 0.9), 0 0 20px rgba(213, 171, 85, 0.7), 0 0 28px rgba(213, 171, 85, 0.5)' 
					},
				},
				'slide-up': {
					from: { transform: 'translateY(10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' },
				},
				'slide-down': {
					from: { transform: 'translateY(-10px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'pulse-slow': 'pulse-slow 3s infinite',
				'bounce-subtle': 'bounce-subtle 3s infinite',
				'corona-effect': 'corona-pulse 3s ease-in-out infinite',
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-down': 'slide-down 0.3s ease-out',
			},
			backgroundImage: {
				'geometric-pattern': "url('/lovable-uploads/150a6c60-d455-4a1b-8da1-8ab67acef374.png')",
				'saint-pattern': "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+CjxyZWN0IHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgZmlsbD0ibm9uZSIvPgo8cGF0aCBkPSJNMzAgMTBMMzAgNTAgTTEwIDMwTDUwIDMwIiBzdHJva2U9IiNENUFCNTUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjMiLz4KPGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMjAiIHN0cm9rZT0iI0Q1QUI1NSIgc3Ryb2tlLXdpZHRoPSIwLjUiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuMiIvPgo8cGF0aCBkPSJNMTUgMTVMNDUgNDUgTTQ1IDE1TDE1IDQ1IiBzdHJva2U9IiNENUFCNTUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+Cg==')"
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
