import { ArrowRight } from "lucide-react";

type Variant = "primary" | "ink" | "ghost" | "outline" | "quiet";
type Size = "sm" | "md" | "lg";

/** Compose design-system button classes — reuse on <button>, <a>, or <Link>. */
export function btnClass(opts?: {
	variant?: Variant;
	size?: Size;
	pill?: boolean;
	className?: string;
}): string {
	const { variant = "primary", size = "md", pill, className } = opts ?? {};
	return [
		"btn",
		`btn-${variant}`,
		size !== "md" && `btn-${size}`,
		pill && "btn-pill",
		className,
	]
		.filter(Boolean)
		.join(" ");
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: Variant;
	size?: Size;
	pill?: boolean;
	/** append an animated → that nudges on hover */
	arrow?: boolean;
};

export function Button({
	variant,
	size,
	pill,
	arrow,
	className,
	children,
	...props
}: ButtonProps) {
	return (
		<button
			type="button"
			className={btnClass({ variant, size, pill, className })}
			{...props}
		>
			{children}
			{arrow && (
				<span className="arrow" aria-hidden="true">
					<ArrowRight size={16} />
				</span>
			)}
		</button>
	);
}
