import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lama: {
          primary: "#8fa18d",
          background: "#f6f1e7",
          text: "#37413d",
          border: "#d8cfbd",
          surface: "#fffdf8",
          muted: "#6f786f"
        }
      },
      boxShadow: {
        panel: "0 18px 45px rgba(55, 65, 61, 0.08)",
        soft: "0 10px 28px rgba(55, 65, 61, 0.07)"
      }
    },
  },
  plugins: [],
};

export default config;
