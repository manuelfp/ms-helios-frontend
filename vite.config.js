import path from "path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [
			{
				find: /^@\/(.+)/,
				replacement: path.join(__dirname, "src/$1"),
			},
		],
	},
	server: {
		port: 3000,
		proxy: {
			"/bigquery": {
				target: "http://localhost:4001",
				changeOrigin: true,
			},
			"/neo4j": {
				target: "http://localhost:4000",
				changeOrigin: true,
			},
			"/status": {
				target: "http://localhost:4000",
				changeOrigin: true,
			},
		},
	},
	preview: {
		port: 3000,
	},
});
