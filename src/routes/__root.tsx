import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { AppShell } from "#/components/AppShell";
import { NotFound } from "#/components/NotFound";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	notFoundComponent: NotFound,
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "typefasterjoel | senior design engineer" },
			{
				name: "description",
				content:
					"Joel is a UX/UI designer and senior design engineer. A short journey through the work: design and build, interfaces that mean something.",
			},
			{ name: "theme-color", content: "#07080b" },
			{ property: "og:title", content: "typefasterjoel | senior design engineer" },
			{
				property: "og:description",
				content: "A short journey through the work of Joel, senior design engineer.",
			},
			{ property: "og:type", content: "website" },
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.ico" },
			{
				rel: "preload",
				href: "/fonts/space-grotesk-600.woff2",
				as: "font",
				type: "font/woff2",
				crossOrigin: "anonymous",
			},
			{
				rel: "preload",
				href: "/fonts/space-grotesk-400.woff2",
				as: "font",
				type: "font/woff2",
				crossOrigin: "anonymous",
			},
		],
	}),
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* No-JS safety: the preloader can never hide without JS, so reveal content. */}
				<noscript>
					<style>{".preloader{display:none!important}"}</style>
				</noscript>
				<HeadContent />
			</head>
			<body className="tfj">
				<AppShell>{children}</AppShell>
				<TanStackDevtools
					config={{ position: "bottom-right" }}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
