/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Nunito"', 'sans-serif'],
      },
      colors: {
        primary: "#EFA852",        // Green used in buttons/badges
        secondary: "#f1f5f9",      // Light gray bg
        accent: "#334155",         // Dark gray (sidebar text, etc.)
        card: "#ffffff",           // White card background
        muted: "#64748b",          // Gray for text
        danger: "#ef4444",         // Red (trash icon)
        border: "#e5e7eb",         // Border gray
        primaryOpacity: "rgba(239, 168, 82, 0.1)"
      },
      boxShadow: {
        card: "0 4px 12px rgba(0, 0, 0, 0.06)", // subtle shadow for cards
        input: "0 1px 3px rgba(0, 0, 0, 0.1)"
      },
      borderRadius: {
        md: "0.75rem",   // For card rounding
        xl: "1.25rem",
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
        '5xl': '3rem',
      },
    },
  },
  plugins: [],
}
