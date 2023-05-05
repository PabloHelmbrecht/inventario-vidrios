import { type Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    minHeight: {
      "0": "0",
      "64": "16rem",
      "102": "26rem",
      full: "100%",
      screen: "100vh",
    },
    extend: {},
  },
  plugins: [],
} satisfies Config;
