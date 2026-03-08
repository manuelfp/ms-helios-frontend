import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [
			{
				find: /^@\/(.+)/,
				replacement: path.join(process.cwd(), "src/$1"),
			},
		],
	},
	server: {
		port: 3000,
		proxy: {
			"/neo4j": {
				target: "https://ms-backend-neo4j-308372338732.us-central1.run.app",
				changeOrigin: true,
			},
			"/status": {
				target: "https://ms-backend-neo4j-308372338732.us-central1.run.app",
				changeOrigin: true,
			},
		},
	},
	preview: {
		port: 3000,
	},
});
