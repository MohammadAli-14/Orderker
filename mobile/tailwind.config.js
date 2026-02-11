/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5E2D87", // Deep Purple
          light: "#7A4AA3",   // Lighter shade
          dark: "#4A226A",    // Darker shade
        },
        background: {
          DEFAULT: "#F9FAFB", // Light Gray Background
          dark: "#121212",    // Dark Mode Background
        },
        surface: {
          DEFAULT: "#FFFFFF", // White Surface
          dark: "#1E1E1E",    // Dark Surface
        },
        text: {
          primary: "#1F2937",   // Gray 800
          secondary: "#6B7280", // Gray 500
          tertiary: "#9CA3AF",  // Light Gray
          inverse: "#FFFFFF",   // White text
        },
        border: {
          DEFAULT: "#E5E7EB", // Gray 200
          dark: "#3F3F46",    // Zinc 700
        },
        accent: {
          red: "#EF4444",
          yellow: "#F59E0B",
          green: "#10B981",
        },
      },
      borderRadius: {
        DEFAULT: "12px",
        xl: "16px",
        "2xl": "24px",
        "3xl": "32px",
      },
      fontFamily: {
        sans: ["PlusJakartaSans_400Regular", "system-ui", "sans-serif"],
        medium: ["PlusJakartaSans_500Medium", "system-ui", "sans-serif"],
        bold: ["PlusJakartaSans_700Bold", "system-ui", "sans-serif"],
        extrabold: ["PlusJakartaSans_800ExtraBold", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
