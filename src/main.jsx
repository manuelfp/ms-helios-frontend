import { StrictMode } from "react";

import { createRoot } from "react-dom/client";
import { Outlet, RouterProvider, ScrollRestoration, createBrowserRouter } from "react-router-dom";

import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter/800.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";

import { Root } from "./root";
import { routes } from "./routes";
import "./styles/global.css";

const router = createBrowserRouter([
	{
		path: "/",
		element: (
			<Root>
				<ScrollRestoration />
				<Outlet />
			</Root>
		),
		children: [...routes],
	},
]);

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>
);
