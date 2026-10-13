import type { CaseFigure, CaseLink } from "#/data/projects";

export type SideQuest = {
  slug: string;
  title: string;
  /** 1-3 sentences — shown truncated on the card, in full in the modal */
  blurb: string;
  tags?: string[];
  year?: string;
  /** reuses CaseFigure — src/alt/width/height, same shape as case-study figures */
  thumbnail: CaseFigure;
  /** repo/demo/etc — reuses CaseLink so LinkChip's icon-by-kind logic is shared */
  links: CaseLink[];
  /** same gating convention as Project — hidden everywhere until real content lands */
  draft?: boolean;
};

const allSideQuests: SideQuest[] = [
  // ── Prototype Forge (draft) ──────────────────────────────────────────
  // TODO(joel): pick a real name for the hackathon TUI project, write the
  // real blurb/links, and drop a real screenshot into
  // /public/work/prototype-forge/thumb.svg, then flip `draft` off.
  {
    slug: "prototype-forge",
    title: "Prototype Forge",
    draft: true,
    blurb: "TODO(joel): 1-3 sentences on the hackathon TUI project.",
    tags: ["TODO(joel)"],
    thumbnail: {
      src: "/work/prototype-forge/thumb.svg",
      alt: "TODO(joel): describe the screenshot",
      width: 800,
      height: 500,
    },
    links: [
      { label: "TODO(joel)", href: "https://github.com/TODO", kind: "repo" },
    ],
  },
  // ── Yumu ──────────────────────────────────────────────────────────────
  {
    slug: "yumu",
    title: "Yumu",
    draft: false,
    blurb:
      "YouTube Music, wrapped in Electron, with the two things it's missing: a dedicated audio output so it can run through a mixer instead of system volume, and a live Discord Rich Presence for whatever's playing. Open source.",
    tags: ["Open source", "Electron", "Audio routing", "Discord RPC"],
    thumbnail: {
      src: "/work/yumu/thumb.png",
      alt: "Yumu's settings panel, showing a dedicated audio output device selected and Discord Rich Presence enabled",
      width: 1280,
      height: 720,
    },
    links: [
      {
        label: "Github",
        href: "https://github.com/typefasterjoel/yumu",
        kind: "repo",
      },
    ],
  },
  // ── Gamer's Hive TV ───────────────────────────────────────────────────
  {
    slug: "gamers-hive-tv",
    title: "Gamer's Hive TV",
    draft: false,
    year: "2024",
    blurb:
      "A curated directory of inclusive Twitch streamers, built to put them in front of more people and to teach me Next.js and Payload CMS. I subscribed to Twitch's API hooks so the site knows the moment someone on the list goes live. That updates the database, shows them on the homepage, and triggers a bot to post in Discord.",
    tags: ["Next.js", "Payload CMS", "Discord bot", "Twitch"],
    thumbnail: {
      src: "/work/gamershive-tv/thumb.webp",
      alt: "Gamer's Hive TV homepage — a dark hero reading Inclusive Streamers and Content Creators on Twitch, above a row of live streamer cards",
      width: 1920,
      height: 1080,
    },
    links: [
      {
        label: "gamershive.tv",
        href: "https://gamershive.tv",
        kind: "site",
      },
    ],
  },
];

/** Published side quests only — drafts never reach the UI. */
export const sideQuests: SideQuest[] = allSideQuests.filter((q) => !q.draft);
