import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { AppShell } from "#/components/AppShell";
import { NotFound } from "#/components/NotFound";
import appCss from "../styles.css?url";

// ponytail: OG images must be absolute URLs; set VITE_SITE_URL if the domain differs.
const SITE_URL = import.meta.env.VITE_SITE_URL ?? "https://typefasterjoel.com";
const OG_IMAGE = `${SITE_URL}/brand/social-banner.png`;
const OG_ALT = "typefasterjoel: a keyboard-typewriter mark over an isometric workspace illustration";

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
			{ property: "og:site_name", content: "typefasterjoel" },
			{ property: "og:url", content: SITE_URL },
			{ property: "og:image", content: OG_IMAGE },
			{ property: "og:image:width", content: "1200" },
			{ property: "og:image:height", content: "630" },
			{ property: "og:image:alt", content: OG_ALT },
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:title", content: "typefasterjoel | senior design engineer" },
			{
				name: "twitter:description",
				content: "A short journey through the work of Joel, senior design engineer.",
			},
			{ name: "twitter:image", content: OG_IMAGE },
			{ name: "twitter:image:alt", content: OG_ALT },
		],
		links: [
			{ rel: "canonical", href: SITE_URL },
			{ rel: "stylesheet", href: appCss },
			{ rel: "icon", href: "/favicon.ico", sizes: "32x32" },
			{
				rel: "icon",
				href: "/favicon-light.png",
				type: "image/png",
				media: "(prefers-color-scheme: light)",
			},
			{
				rel: "icon",
				href: "/favicon-dark.png",
				type: "image/png",
				media: "(prefers-color-scheme: dark)",
			},
			{ rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
			{ rel: "manifest", href: "/manifest.json" },
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
