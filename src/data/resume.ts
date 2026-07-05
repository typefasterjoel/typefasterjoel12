/**
 * Joel's chosen experience number (brief §1) — used verbatim everywhere the
 * site states years of experience. Change it here, nowhere else.
 */
export const EXPERIENCE_LABEL = "15+"

export type ResumeRole = {
	company: string
	suffix?: string
	title: string
	location: string
	start: string
	end: string
	bullets: string[]
}

export type SkillGroup = {
	label: string
	items: string[]
}

export const roles: ResumeRole[] = [
	{
		company: "Buildout",
		suffix: "fka ProspectNow",
		title: "Senior Design Engineer",
		location: "Remote",
		start: "Jan 2020",
		end: "Present",
		bullets: [
			"First role of its kind at Buildout, created to bridge the gap between design and engineering org-wide",
			"Founded Blueprint, Buildout's design system: 50+ React components and configurable SCSS theming; adopted across all 4 Buildout products",
			"Built Blueprint's documentation site from scratch using Fumadocs on React Router 7; architected a private npm registry for in-house versioning and distribution",
			"Led new product initiative post-acquisition; drove design and front-end from concept through launch",
		],
	},
	{
		company: "Linux Academy",
		title: "Director of Product (UI/UX)",
		location: "Keller, TX",
		start: "Feb 2017",
		end: "Jan 2020",
		bullets: [
			"Directed product strategy for 2 apps and 10+ features; produced prototypes and mockups for all major initiatives",
			"Led a 500+ student UX research survey; findings directly shaped the platform roadmap and feature prioritization",
			"Managed 5 direct reports (2 designers, 1 illustrator, 2 project managers); built the team from scratch and established cross-team communication processes achieving 98% satisfaction",
		],
	},
	{
		company: "ProspectNow",
		suffix: "Freelance",
		title: "Product Designer & UI Engineer",
		location: "Remote",
		start: "Sept 2016",
		end: "Feb 2017",
		bullets: [
			"Rebuilt the platform in React + Redux, modernizing performance and codebase maintainability",
			"Overhauled UX strategy end-to-end; set up JIRA and led agile sprints for the full UI redesign initiative",
		],
	},
	{
		company: "BCBH Technologies",
		title: "Consultant (UI/UX/Dev)",
		location: "Remote",
		start: "Jun 2015",
		end: "Jul 2016",
		bullets: [
			"Advised on A/B testing, conversion design, and UX research best practices",
			"Hired and onboarded the company's inaugural designer and developer; built the foundational design and engineering team",
		],
	},
	{
		company: "Ascentus",
		title: "Production Director (UI/UX/Dev)",
		location: "Orlando, FL",
		start: "Jan 2013",
		end: "Mar 2016",
		bullets: [
			"Managed 5 direct reports (2 designers, 3 developers); oversaw full team lifecycle: hiring, onboarding, and performance",
			"Led design and development of MesotheliomaGuide.com, sold for $3M+",
			"Drove a 30% conversion rate increase via A/B testing, generating $400K–$750K in additional annual revenue",
		],
	},
	{
		company: "Lightmaker",
		title: "Lead Front-End Engineer",
		location: "Orlando, FL",
		start: "Oct 2009",
		end: "Jan 2013",
		bullets: [
			"Shipped 20+ web products; established front-end coding standards for the engineering team",
			"Designed and built the Virtual Press Junket UI for 30+ unique clients; led UX research with 50+ participants",
		],
	},
	{
		company: "Southern Technical College",
		title: "Adjunct Instructor",
		location: "Brandon, FL",
		start: "Mar 2009",
		end: "Jun 2009",
		bullets: [
			"Developed curriculum and taught \"Introduction to Web Design & Development\" to 20 students",
		],
	},
]

export const skills: SkillGroup[] = [
	{
		label: "Design",
		items: [
			"Figma",
			"Adobe Creative Suite",
			"Design Systems",
			"UX Research",
			"Prototyping",
			"A/B Testing",
		],
	},
	{
		label: "Engineering",
		items: [
			"React · Redux",
			"TypeScript",
			"HTML · CSS · JS",
			"Next.js",
			"PHP · Laravel",
			"WordPress · WP REST API",
		],
	},
	{
		label: "Leadership",
		items: [
			"Team Building",
			"Agile · JIRA",
			"Cross-team Collab",
			"KPI Setting",
		],
	},
]

export function getRecentRoles(n = 3): ResumeRole[] {
	return roles.slice(0, n)
}
