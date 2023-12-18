import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import flowbite from "flowbite/plugin";

export default {
  content: ["./src/**/*.tsx", "./node_modules/flowbite-react/lib/**/*.js"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [flowbite],
} satisfies Config;
