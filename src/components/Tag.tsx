export function Tag({
	children,
	accent,
	dot,
	className,
}: {
	children: React.ReactNode;
	accent?: boolean;
	dot?: boolean;
	className?: string;
}) {
	return (
		<span
			className={["tag", accent && "tag-accent", dot && "tag-dot", className]
				.filter(Boolean)
				.join(" ")}
		>
			{children}
		</span>
	);
}

/** Pulsing "available for work" indicator. */
export function Status({ children }: { children: React.ReactNode }) {
	return (
		<span className="status">
			<span className="led" aria-hidden="true" />
			{children}
		</span>
	);
}
