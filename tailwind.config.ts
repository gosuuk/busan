import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#191f28",
        harbor: "#3182f6",
        coral: "#f04452",
        paper: "#f4f8ff",
      },
    },
  },
  plugins: [],
};

export default config;
