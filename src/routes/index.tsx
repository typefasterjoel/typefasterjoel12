import { createFileRoute } from "@tanstack/react-router";
import { SectionMarker } from "#/components/SectionMarker";
import { About } from "#/components/home/About";
import { Career } from "#/components/home/Career";
import { Contact } from "#/components/home/Contact";
import { Hero } from "#/components/home/Hero";
import { Path } from "#/components/home/Path";
import { Work } from "#/components/home/Work";

export const Route = createFileRoute("/")({
	component: Home,
	head: () => ({
		meta: [{ title: "typefasterjoel | senior design engineer" }],
	}),
});

function Home() {
	return (
		<>
			<SectionMarker />
			<Hero />
			<Path />
			<Work />
			<About />
			<Career />
			<Contact />
		</>
	);
}
