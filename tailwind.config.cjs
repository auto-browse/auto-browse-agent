/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{ts,tsx,html}"],
	theme: {
		extend: {
			colors: {
				border: {
					DEFAULT: "hsl(var(--border))"
				},
				background: {
					DEFAULT: "hsl(var(--background))"
				},
				foreground: {
					DEFAULT: "hsl(var(--foreground))"
				},
				primary: {
					DEFAULT: "hsl(var(--primary))",
					foreground: "hsl(var(--primary-foreground))"
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))"
				}
			},
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)"
			}
		}
	},
	plugins: [require("tailwindcss-animate")]
};
