
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
				'crimson': ['Crimson Text', 'serif'],
				'orbitron': ['Orbitron', 'monospace'],
			},
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
				title: {
					primary: 'hsl(var(--title-primary))',
					secondary: 'hsl(var(--title-secondary))',
					accent: 'hsl(var(--title-accent))',
					glow: 'hsl(var(--title-glow))'
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
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				'slide-in': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'pulse-gentle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '200% 0' },
					'100%': { backgroundPosition: '-200% 0' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 10px 2px rgba(59, 130, 246, 0.3)' },
					'50%': { boxShadow: '0 0 20px 5px rgba(59, 130, 246, 0.6)' }
				},
				'new-task-glow': {
					'0%, 100%': { 
						'box-shadow': '0 0 15px rgba(255, 0, 150, 0.4), 0 0 30px rgba(0, 255, 255, 0.3), 0 0 40px rgba(255, 255, 0, 0.2)',
						'border-color': 'rgba(255, 0, 150, 0.4)' 
					},
					'25%': { 
						'box-shadow': '0 0 20px rgba(0, 255, 255, 0.5), 0 0 35px rgba(255, 255, 0, 0.4), 0 0 45px rgba(255, 0, 150, 0.3)',
						'border-color': 'rgba(0, 255, 255, 0.5)' 
					},
					'50%': { 
						'box-shadow': '0 0 25px rgba(255, 255, 0, 0.6), 0 0 40px rgba(255, 0, 150, 0.4), 0 0 50px rgba(0, 255, 255, 0.3)',
						'border-color': 'rgba(255, 255, 0, 0.5)' 
					},
					'75%': { 
						'box-shadow': '0 0 20px rgba(0, 150, 255, 0.5), 0 0 35px rgba(255, 100, 0, 0.4), 0 0 45px rgba(150, 255, 0, 0.3)',
						'border-color': 'rgba(0, 150, 255, 0.5)' 
					}
				},
				'holographic': {
					'0%, 100%': { 
						background: 'linear-gradient(45deg, #667eea 0%, #764ba2 25%, #667eea 50%, #764ba2 75%, #667eea 100%)',
						backgroundSize: '400% 400%'
					},
					'25%': { 
						background: 'linear-gradient(45deg, #f093fb 0%, #f5576c 25%, #4facfe 50%, #00f2fe 75%, #f093fb 100%)',
						backgroundSize: '400% 400%'
					},
					'50%': { 
						background: 'linear-gradient(45deg, #43e97b 0%, #38f9d7 25%, #667eea 50%, #764ba2 75%, #43e97b 100%)',
						backgroundSize: '400% 400%'
					},
					'75%': { 
						background: 'linear-gradient(45deg, #fa709a 0%, #fee140 25%, #667eea 50%, #764ba2 75%, #fa709a 100%)',
						backgroundSize: '400% 400%'
					}
				},
				'text-glow': {
					'0%, 100%': { 
						'text-shadow': '0 0 20px rgba(129, 140, 248, 0.8), 0 0 40px rgba(129, 140, 248, 0.6), 0 0 60px rgba(129, 140, 248, 0.4)'
					},
					'50%': { 
						'text-shadow': '0 0 30px rgba(129, 140, 248, 1), 0 0 50px rgba(129, 140, 248, 0.8), 0 0 70px rgba(129, 140, 248, 0.6)'
					}
				},
				'float-bounce': {
					'0%, 100%': { transform: 'translateY(0) scale(1)' },
					'25%': { transform: 'translateY(-5px) scale(1.01)' },
					'75%': { transform: 'translateY(-3px) scale(0.99)' }
				},
				'border-glow': {
					'0%, 100%': { 
						'box-shadow': '0 0 20px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.1)'
					},
					'50%': { 
						'box-shadow': '0 0 40px rgba(59, 130, 246, 0.6), inset 0 0 40px rgba(59, 130, 246, 0.2)'
					}
				},
				'starlight-glow': {
					'0%': { 
						'text-shadow': '0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 255, 255, 0.6), 0 0 15px rgba(255, 255, 255, 0.4)'
					},
					'25%': { 
						'text-shadow': '0 0 8px rgba(255, 255, 255, 1), 0 0 15px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 25px rgba(255, 255, 255, 0.4)'
					},
					'50%': { 
						'text-shadow': '0 0 10px rgba(255, 255, 255, 0.9), 0 0 20px rgba(255, 255, 255, 0.7), 0 0 30px rgba(255, 255, 255, 0.5)'
					},
					'75%': { 
						'text-shadow': '0 0 6px rgba(255, 255, 255, 0.7), 0 0 12px rgba(255, 255, 255, 0.5), 0 0 18px rgba(255, 255, 255, 0.3)'
					},
					'100%': { 
						'text-shadow': '0 0 5px rgba(255, 255, 255, 0.8), 0 0 10px rgba(255, 255, 255, 0.6), 0 0 15px rgba(255, 255, 255, 0.4)'
					}
				},
				'silver-glow': {
					'0%, 100%': { 
						'text-shadow': '0 0 8px rgba(230, 230, 230, 0.6), 0 0 16px rgba(240, 240, 240, 0.4), 0 0 24px rgba(250, 250, 250, 0.2)'
					},
					'50%': { 
						'text-shadow': '0 0 12px rgba(240, 240, 240, 0.8), 0 0 24px rgba(250, 250, 250, 0.6), 0 0 36px rgba(255, 255, 255, 0.4)'
					}
				},
				'spotlight': {
					'0%': { 
						background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
						transform: 'translateX(-100%)'
					},
					'100%': { 
						transform: 'translateX(200%)'
					}
				},
				'wave-effect': {
					'0%': { 
						transform: 'translateX(-100%) scaleX(0)', 
						opacity: '0'
					},
					'50%': { 
						transform: 'translateX(0%) scaleX(1)', 
						opacity: '1'
					},
					'100%': { 
						transform: 'translateX(100%) scaleX(0)', 
						opacity: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-in': 'slide-in 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'pulse-gentle': 'pulse-gentle 2s ease-in-out infinite',
				'shimmer': 'shimmer 8s infinite linear',
				'float': 'float 5s ease-in-out infinite',
				'glow': 'glow 3s ease-in-out infinite',
				'new-task-glow': 'new-task-glow 2.5s ease-in-out infinite',
				'spin-slow': 'spin 20s linear infinite',
				'holographic': 'holographic 8s ease-in-out infinite',
				'text-glow': 'text-glow 2s ease-in-out infinite alternate',
				'float-bounce': 'float-bounce 4s ease-in-out infinite',
				'border-glow': 'border-glow 3s ease-in-out infinite',
				'spotlight': 'spotlight 3s linear infinite',
				'starlight-glow': 'starlight-glow 3s ease-in-out infinite',
				'silver-glow': 'silver-glow 2.5s ease-in-out infinite',
				'wave-effect': 'wave-effect 2.5s ease-in-out infinite'
			},
			boxShadow: {
				'glass': '0 4px 20px rgba(0, 0, 0, 0.05), 0 8px 30px rgba(0, 0, 0, 0.1)',
				'neumorph': '10px 10px 20px rgba(0, 0, 0, 0.05), -10px -10px 20px rgba(255, 255, 255, 0.8)',
				'neumorph-dark': '10px 10px 20px rgba(0, 0, 0, 0.2), -10px -10px 20px rgba(255, 255, 255, 0.05)',
				'soft': '0 2px 10px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.06)'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'gradient-shine': 'linear-gradient(45deg, transparent 45%, rgba(255, 255, 255, 0.6) 50%, transparent 55%)',
				'gradient-premium': 'var(--gradient-premium)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-title-shine': 'var(--gradient-shine)',
				'gradient-circuit': 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23bfdcef\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
