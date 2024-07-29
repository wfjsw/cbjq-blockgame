import type { Config } from "tailwindcss";
import resolveConfig from "tailwindcss/resolveConfig";
import defaultConfig from "tailwindcss/defaultConfig";

const resolvedDefaultConfig = resolveConfig(defaultConfig);

export default {
    content: ["./src/**/*.vue", "./src/**/*.ts"],
} satisfies Config;
