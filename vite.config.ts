import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
    plugins: [vue()],
    optimizeDeps: {
        include: ["three", "@tresjs/core", "@tresjs/cientos"],
    },
});
