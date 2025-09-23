import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    base: "./",
    plugins: [react()],
    server: {
        port: 8080,
        proxy: {
            "/api/translate": {
                target: "https://deeplx.vercel.app",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ""),
                configure: (proxy, options) => {
                    proxy.on("proxyReq", (proxyReq, req, res) => {
                        // Ensure the request method and headers are properly set
                        if (req.method === "POST") {
                            proxyReq.setHeader(
                                "Content-Type",
                                "application/json"
                            );
                        }
                    });
                },
            },
        },
    },
});

