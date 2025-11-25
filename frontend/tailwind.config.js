/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],

  theme: {
    container: {
      center: true,
      padding: "1rem",
    },

    extend: {
      colors: {
        primary: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          500: "#6366f1",   // اللون الأساسي
          600: "#4f46e5",
          700: "#4338ca",
          900: "#312e81"
        },

        accent: {
          100: "#f3e8ff",
          300: "#d8b4fe",
          500: "#a855f7",
          600: "#9333ea"
        },

        neutral: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          400: "#94a3b8",
          600: "#475569",
          700: "#334155",
          900: "#0f172a"
        },

        success: "#16a34a",
        warning: "#f59e0b",
        danger:  "#ef4444",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        arabic: ["Cairo", "Noto Sans Arabic", "sans-serif"]
      },

      boxShadow: {
        card: "0 4px 20px rgba(0,0,0,0.05)",
        soft: "0 1px 3px rgba(0,0,0,0.08)"
      },

      borderRadius: {
        xl: "14px",
      },

      spacing: {
        18: "4.5rem",
        22: "5.5rem"
      },

      animation: {
        fadeIn: "fadeIn 0.25s ease-out",
        scaleIn: "scaleIn 0.25s ease-out"
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 }
        },
        scaleIn: {
          "0%": { transform: "scale(0.92)", opacity: 0 },
          "100%": { transform: "scale(1)", opacity: 1 }
        },
      }
    }
  },

  plugins: []
};
