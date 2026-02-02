/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "navy": "#0f172a",
        "light-grey": "#f1f5f9",
        "slate-50": "#f8fafc",
        "primary-navy": "#0f172a",
        "accent-blue": "#1D4ED8",
        "border-soft": "#E5E7EB",
        "bg-pure": "#FFFFFF",
        "border-light": "#f1f5f9",
        "soft-gray": "#f8fafc",
      },
      fontFamily: {
        "sans": ["Inter", "sans-serif"]
      },
    },
  },
  plugins: [],
}
