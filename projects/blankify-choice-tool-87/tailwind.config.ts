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
					DEFAULT: 'hsl(var(--sidebar-background, 0 0% 100%))',
					foreground: 'hsl(var(--sidebar-foreground, 240 10% 3.9%))',
					primary: 'hsl(var(--sidebar-primary, 252 59% 48%))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground, 0 0% 98%))',
					accent: 'hsl(var(--sidebar-accent, 240 4.8% 95.9%))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground, 240 5.9% 10%))',
					border: 'hsl(var(--sidebar-border, 240 5.9% 90%))',
					ring: 'hsl(var(--sidebar-ring, 240 5.9% 10%))'
				}
			},
			backgroundImage: {
				'truth-pattern': 'linear-gradient(to bottom, rgba(240, 249, 255, 0.8), rgba(224, 242, 254, 0.7))',
				'grid-pattern': 'radial-gradient(circle, rgba(25, 113, 194, 0.05) 1px, transparent 1px)',
				'truth-circles': 'radial-gradient(circle at 25% 25%, rgba(79, 70, 229, 0.1) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
				'truth-lines': 'repeating-linear-gradient(45deg, rgba(59, 130, 246, 0.03) 0px, rgba(59, 130, 246, 0.03) 1px, transparent 1px, transparent 10px)',
				'ancient-map': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Cpath fill=\'none\' stroke=\'%23d1d5db\' stroke-opacity=\'0.15\' stroke-width=\'1\' d=\'M10,10 L90,10 L90,90 L10,90 Z\'/%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'30\' fill=\'none\' stroke=\'%23d1d5db\' stroke-opacity=\'0.1\' stroke-width=\'1\'/%3E%3Cpath fill=\'none\' stroke=\'%23d1d5db\' stroke-opacity=\'0.1\' stroke-width=\'1\' d=\'M25,50 L75,50 M50,25 L50,75\'/%3E%3C/svg%3E")',
				'sacred-geometry': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'40\' fill=\'none\' stroke=\'%239ca3af\' stroke-opacity=\'0.15\' stroke-width=\'0.5\'/%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'35\' fill=\'none\' stroke=\'%239ca3af\' stroke-opacity=\'0.15\' stroke-width=\'0.5\'/%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'30\' fill=\'none\' stroke=\'%239ca3af\' stroke-opacity=\'0.15\' stroke-width=\'0.5\'/%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'25\' fill=\'none\' stroke=\'%239ca3af\' stroke-opacity=\'0.15\' stroke-width=\'0.5\'/%3E%3Cpath fill=\'none\' stroke=\'%239ca3af\' stroke-opacity=\'0.15\' stroke-width=\'0.5\' d=\'M50,10 L90,50 L50,90 L10,50 Z\'/%3E%3Cpath fill=\'none\' stroke=\'%239ca3af\' stroke-opacity=\'0.15\' stroke-width=\'0.5\' d=\'M10,10 L90,90 M10,90 L90,10\'/%3E%3C/svg%3E")',
                'celestial': 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'100\' height=\'100\' viewBox=\'0 0 100 100\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'1.5\' fill=\'%23a5b4fc\' fill-opacity=\'0.5\'/%3E%3Ccircle cx=\'70\' cy=\'70\' r=\'2\' fill=\'%23a5b4fc\' fill-opacity=\'0.5\'/%3E%3Ccircle cx=\'20\' cy=\'80\' r=\'1\' fill=\'%23a5b4fc\' fill-opacity=\'0.5\'/%3E%3Ccircle cx=\'80\' cy=\'20\' r=\'1.2\' fill=\'%23a5b4fc\' fill-opacity=\'0.5\'/%3E%3Ccircle cx=\'50\' cy=\'50\' r=\'2.5\' fill=\'%23a5b4fc\' fill-opacity=\'0.5\'/%3E%3Ccircle cx=\'25\' cy=\'65\' r=\'1.3\' fill=\'%23a5b4fc\' fill-opacity=\'0.5\'/%3E%3Ccircle cx=\'75\' cy=\'35\' r=\'1.8\' fill=\'%23a5b4fc\' fill-opacity=\'0.5\'/%3E%3Ccircle cx=\'45\' cy=\'15\' r=\'1.1\' fill=\'%23a5b4fc\' fill-opacity=\'0.5\'/%3E%3Ccircle cx=\'55\' cy=\'85\' r=\'1.4\' fill=\'%23a5b4fc\' fill-opacity=\'0.5\'/%3E%3C/svg%3E")',
                'mystic-gradient': 'linear-gradient(135deg, rgba(76, 29, 149, 0.05) 0%, rgba(124, 58, 237, 0.1) 50%, rgba(139, 92, 246, 0.05) 100%)',
			},
			backgroundSize: {
				'grid-lg': '20px 20px',
				'grid-md': '15px 15px',
				'grid-sm': '10px 10px',
                'pattern-sm': '100px 100px',
                'pattern-md': '200px 200px',
                'pattern-lg': '400px 400px',
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
        'fadeIn': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'fadeInLeft': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        'fadeInRight': {
          '0%': {
            opacity: '0',
            transform: 'translateX(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          }
        },
        'pulse': {
          '0%, 100%': {
            opacity: '1'
          },
          '50%': {
            opacity: '0.7'
          }
        },
        'pulse-soft': {
          '0%, 100%': {
            textShadow: '0 0 8px rgba(129, 140, 248, 0.5), 0 0 15px rgba(79, 70, 229, 0.3)'
          },
          '50%': {
            textShadow: '0 0 12px rgba(129, 140, 248, 0.7), 0 0 20px rgba(79, 70, 229, 0.5)'
          }
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0)'
          },
          '50%': {
            transform: 'translateY(-10px)'
          }
        },
        'glow': {
          '0%, 100%': {
            textShadow: '0 0 4px rgba(79, 70, 229, 0.4), 0 0 10px rgba(129, 140, 248, 0.3)'
          },
          '50%': {
            textShadow: '0 0 8px rgba(79, 70, 229, 0.6), 0 0 15px rgba(129, 140, 248, 0.5)'
          }
        }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-left': 'fadeInLeft 0.6s ease-out forwards',
        'fade-in-right': 'fadeInRight 0.6s ease-out forwards',
        'pulse-slow': 'pulse 3s infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
