/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // It's better to remove these custom colors unless you have a specific reason,
      // as they can override daisyUI's theme colors.
      // colors: {
      //   background: "var(--background)",
      //   foreground: "var(--foreground)",
      // },
    },
  },
  
  // 1. Make sure daisyui is required here
  plugins: [require("daisyui")],

  // 2. Configure daisyUI to include BOTH themes
  daisyui: {
    themes: ["light", "dark"], // Add "light" so it knows both exist
  },

  // 3. REMOVE the darkMode: "class" line entirely
};