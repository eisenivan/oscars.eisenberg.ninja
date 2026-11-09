/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
	darkMode: 'class',
	content: ['./src-svelte/**/*.{svelte,js,ts,html}'],
	theme: {
		extend: {
			colors: {
				bg: token('bg'),
				surface: token('surface'),
				'surface-2': token('surface-2'),
				line: token('line'),
				fg: token('fg'),
				muted: token('fg-muted'),
				gold: token('gold'),
				'gold-fill': token('gold-fill'),
				'on-gold': token('on-gold'),
				success: token('success'),
				danger: token('danger'),
				info: token('info')
			},
			fontFamily: {
				display: ['"Fraunces Variable"', 'Georgia', 'serif'],
				sans: [
					'"Inter Variable"',
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
					'Roboto',
					'sans-serif'
				]
			},
			borderRadius: {
				sm: '8px',
				md: '14px',
				lg: '20px'
			},
			boxShadow: {
				card: '0 1px 2px rgb(0 0 0 / 0.06), 0 4px 16px rgb(0 0 0 / 0.04)',
				lift: '0 2px 4px rgb(0 0 0 / 0.08), 0 12px 32px rgb(0 0 0 / 0.10)',
				sheet: '0 -8px 40px rgb(0 0 0 / 0.25)'
			},
			spacing: {
				tabbar: '64px'
			},
			keyframes: {
				shimmer: {
					'0%': { backgroundPosition: '-400px 0' },
					'100%': { backgroundPosition: '400px 0' }
				},
				pulseDot: {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '.45', transform: 'scale(.8)' }
				}
			},
			animation: {
				shimmer: 'shimmer 1.4s linear infinite',
				'pulse-dot': 'pulseDot 1.6s ease-in-out infinite'
			}
		}
	},
	plugins: []
};
