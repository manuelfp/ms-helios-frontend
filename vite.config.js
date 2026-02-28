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
	},
	preview: {
		port: 3000,
	},
});
