import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        marquee: "marquee 5s ease-in infinite",
      },
      keyframes: {
        marquee: {
          "100%": { transform: "translateX(-80%)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
