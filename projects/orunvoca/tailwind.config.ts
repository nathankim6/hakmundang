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
    				foreground: 'hsl(var(--primary-foreground))',
    				glow: 'hsl(var(--primary-glow))',
    				dark: 'hsl(var(--primary-dark))',
    				light: 'hsl(var(--primary-light))'
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))',
    				glow: 'hsl(var(--secondary-glow))',
    				dark: 'hsl(var(--secondary-dark))',
    				light: 'hsl(var(--secondary-light))'
    			},
    			accent: {
    				DEFAULT: 'hsl(var(--accent))',
    				foreground: 'hsl(var(--accent-foreground))',
    				glow: 'hsl(var(--accent-glow))'
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))',
    				glow: 'hsl(var(--destructive-glow))'
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
    			},
    			success: {
    				DEFAULT: 'hsl(var(--success))',
    				foreground: 'hsl(var(--success-foreground))',
    				glow: 'hsl(var(--success-glow))'
    			},
    			warning: {
    				DEFAULT: 'hsl(var(--warning))',
    				foreground: 'hsl(var(--warning-foreground))',
    				glow: 'hsl(var(--warning-glow))'
    			},
    			study: {
    				card: 'hsl(var(--study-card))',
    				shadow: 'hsl(var(--study-card-shadow))',
    				progress: 'hsl(var(--study-progress))',
    				correct: 'hsl(var(--study-correct))',
    				incorrect: 'hsl(var(--study-incorrect))'
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
    			silver: {
    				'50': 'hsl(0, 0%, 95%)',
    				'100': 'hsl(0, 0%, 90%)',
    				'200': 'hsl(0, 0%, 80%)',
    				'300': 'hsl(0, 0%, 70%)',
    				'400': 'hsl(0, 0%, 60%)',
    				'500': 'hsl(0, 0%, 50%)',
    				'600': 'hsl(0, 0%, 40%)',
    				'700': 'hsl(0, 0%, 30%)',
    				'800': 'hsl(0, 0%, 20%)',
    				'900': 'hsl(0, 0%, 10%)',
    				DEFAULT: 'hsl(0, 0%, 75%)'
    			},
    			gold: {
    				DEFAULT: 'hsl(var(--gold-primary))',
    				light: 'hsl(var(--gold-light))',
    				dark: 'hsl(var(--gold-dark))'
    			},
    			spacing: {
    				'safe-area': 'env(safe-area-inset-bottom)'
    			},
    			gridTemplateColumns: {
    				'13': 'repeat(13, minmax(0, 1fr))'
    			},
    			utilities: {
    				'.touch-target': {
    					'min-height': '44px',
    					'min-width': '44px',
    					'touch-action': 'manipulation'
    				},
    				'.text-gradient': {
    					background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)) 50%, hsl(var(--primary)/0.8))',
    					'background-clip': 'text',
    					'-webkit-background-clip': 'text',
    					color: 'transparent'
    				}
    			}
    		},
    		fontFamily: {
    			sans: [
    				'Noto Sans',
    				'Noto Sans KR',
    				'-apple-system',
    				'BlinkMacSystemFont',
    				'ui-sans-serif',
    				'system-ui',
    				'sans-serif'
    			],
    			heading: [
    				'Noto Sans',
    				'Noto Sans KR',
    				'-apple-system',
    				'BlinkMacSystemFont',
    				'system-ui',
    				'sans-serif'
    			],
    			body: [
    				'Noto Sans',
    				'Noto Sans KR',
    				'-apple-system',
    				'BlinkMacSystemFont',
    				'system-ui',
    				'sans-serif'
    			],
    			display: [
    				'Noto Sans',
    				'Noto Sans KR',
    				'-apple-system',
    				'BlinkMacSystemFont',
    				'system-ui',
    				'sans-serif'
    			],
    			korean: [
    				'Noto Sans KR',
    				'Pretendard',
    				'Apple SD Gothic Neo',
    				'Malgun Gothic',
    				'system-ui',
    				'-apple-system',
    				'sans-serif'
    			],

    			mono: [
    				'JetBrains Mono',
    				'ui-monospace',
    				'SFMono-Regular',
    				'Menlo',
    				'Monaco',
    				'Consolas',
    				'Liberation Mono',
    				'Courier New',
    				'monospace'
    			],
    			cinzel: [
    				'Cinzel Decorative',
    				'serif'
    			],
    			serif: [
    				'Merriweather',
    				'ui-serif',
    				'Georgia',
    				'Cambria',
    				'Times New Roman',
    				'Times',
    				'serif'
    			]
    		},
    		backgroundImage: {
    			'gradient-primary': 'var(--gradient-primary)',
    			'gradient-accent': 'var(--gradient-accent)',
    			'gradient-background': 'var(--gradient-background)',
    			'gradient-card': 'var(--gradient-card)',
    			'gradient-toss': 'var(--gradient-toss)'
    		},
    		boxShadow: {
    			xs: 'var(--shadow-xs)',
    			sm: 'var(--shadow-sm)',
    			md: 'var(--shadow-md)',
    			lg: 'var(--shadow-lg)',
    			xl: 'var(--shadow-xl)',
    			toss: 'var(--shadow-toss)',
    			button: 'var(--shadow-button)',
    			'button-hover': 'var(--shadow-button-hover)',
    			'2xs': 'var(--shadow-2xs)',
    			'2xl': 'var(--shadow-2xl)'
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)',
    			xl: 'var(--radius-xl)'
    		},
    		transitionTimingFunction: {
    			bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    			spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    			smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
    		},
    		keyframes: {
    			'accordion-down': {
    				from: {
    					height: '0',
    					opacity: '0'
    				},
    				to: {
    					height: 'var(--radix-accordion-content-height)',
    					opacity: '1'
    				}
    			},
    			'accordion-up': {
    				from: {
    					height: 'var(--radix-accordion-content-height)',
    					opacity: '1'
    				},
    				to: {
    					height: '0',
    					opacity: '0'
    				}
    			},
    			'fade-in': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(10px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			},
    			'fade-out': {
    				'0%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				},
    				'100%': {
    					opacity: '0',
    					transform: 'translateY(10px)'
    				}
    			},
    			'slide-up': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(30px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			},
    			'slide-down': {
    				'0%': {
    					opacity: '0',
    					transform: 'translateY(-30px)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'translateY(0)'
    				}
    			},
    			'scale-in': {
    				'0%': {
    					opacity: '0',
    					transform: 'scale(0.9)'
    				},
    				'100%': {
    					opacity: '1',
    					transform: 'scale(1)'
    				}
    			},
    			'scale-out': {
    				from: {
    					transform: 'scale(1)',
    					opacity: '1'
    				},
    				to: {
    					transform: 'scale(0.95)',
    					opacity: '0'
    				}
    			},
    			float: {
    				'0%, 100%': {
    					transform: 'translateY(0px) rotate(0deg)',
    					opacity: '0.6'
    				},
    				'50%': {
    					transform: 'translateY(-20px) rotate(180deg)',
    					opacity: '0.8'
    				}
    			},
    			'pulse-glow': {
    				'0%, 100%': {
    					boxShadow: '0 0 5px hsl(var(--primary) / 0.5)'
    				},
    				'50%': {
    					boxShadow: '0 0 20px hsl(var(--primary) / 0.8)'
    				}
    			},
    			shimmer: {
    				'0%, 100%': {
    					opacity: '0.1',
    					transform: 'scaleY(0.8)'
    				},
    				'50%': {
    					opacity: '0.3',
    					transform: 'scaleY(1.2)'
    				}
    			},
    			'grid-move': {
    				'0%': {
    					transform: 'translate(0, 0)'
    				},
    				'100%': {
    					transform: 'translate(50px, 50px)'
    				}
    			},
    			'slide-right': {
    				'0%': {
    					transform: 'translateX(-100%)'
    				},
    				'100%': {
    					transform: 'translateX(300%)'
    				}
    			},
    			'metallic-shimmer': {
    				'0%': {
    					backgroundPosition: '200% 50%'
    				},
    				'100%': {
    					backgroundPosition: '-200% 50%'
    				}
    			},
    			textGlow: {
    				'0%, 100%': {
    					filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.2))',
    					opacity: '0.9'
    				},
    				'50%': {
    					filter: 'drop-shadow(0 0 12px rgba(255,255,255,0.5))',
    					opacity: '1'
    				}
    			},
    			goldGlow: {
    				'0%, 100%': {
    					filter: 'drop-shadow(0 0 2px rgba(210,180,140,0.15))',
    					opacity: '0.95'
    				},
    				'50%': {
    					filter: 'drop-shadow(0 0 4px rgba(210,180,140,0.25))',
    					opacity: '1'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			'fade-in': 'fade-in 0.8s ease-out',
    			'fade-out': 'fade-out 0.3s ease-out',
    			'slide-up': 'slide-up 0.6s ease-out',
    			'slide-down': 'slide-down 0.6s ease-out',
    			'scale-in': 'scale-in 0.5s ease-out',
    			'scale-out': 'scale-out 0.2s ease-out',
    			float: 'float 6s ease-in-out infinite',
    			'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
    			shimmer: 'shimmer 4s ease-in-out infinite',
    			'grid-move': 'grid-move 20s linear infinite',
    			'slide-right': 'slide-right 3s ease-in-out infinite',
    			'metallic-shimmer': 'metallic-shimmer 25s ease-in-out infinite',
    			'gold-glow': 'goldGlow 3s ease-in-out infinite'
    		}
    	}
    },
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
