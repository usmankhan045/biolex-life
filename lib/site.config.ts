export const siteConfig = {
  slug: "biolex",
  // Canonical host. MUST match the host the deployment actually serves with a
  // 200 (Vercel redirects the apex → www), so canonical tags, sitemap <loc>,
  // og:url and robots Host/Sitemap all agree with production.
  domain: "www.biolexlife.com",
  // Known site_id for this tenant. Used as a resilient fallback if the runtime
  // `sites` table lookup is unavailable (e.g. build-time prerender). See
  // getCurrentSiteId() in lib/supabase.ts.
  //
  // Set to the real UUID returned when the site's `sites` row was seeded.
  siteId: "5a5babff-6213-4f05-b8cb-986aaa2d0b80",
  name: "Biolex",
  tagline: "Print it. Frame it. Done.",
  niche: "Free printables for the home",

  // ── AUTHORSHIP / E-E-A-T ─────────────────────────────────────────────────
  // A named, real person behind the content, required for trust and
  // AI-citation entity resolution. Surfaced as a byline on posts, an author bio
  // on the About page, and Person schema (author/publisher) in JSON-LD.
  author: {
    name: "Muhammad Usman",
    slug: "muhammad-usman",
    role: "Founder & Editor",
    // Author headshot (public/author.svg is a neutral placeholder). Replace with
    // a real photo (e.g. public/author.jpg) before launch and update this path.
    photo: "/author.svg",
    // Real external profiles for the author, drives Person `sameAs` (a strong
    // AI-citation / entity-resolution signal). Add real profiles here.
    sameAs: [
      "https://www.linkedin.com/in/muhammadusman80/",
    ] as readonly string[],
    // Relative URL to the author's on-site profile page (author archive).
    url: "/author/muhammad-usman",
    shortBio:
      "Muhammad Usman designs and print-tests every printable in the Biolex library, from wall art to weekly meal planners, so each one prints clean on a home printer.",
    longBio:
      "Muhammad Usman started Biolex after years of hunting for printables that actually looked good on the wall and lined up correctly on the page. Everything here is designed in-house, print-tested on plain letter paper, and paired with a short guide on how to frame it, style it, or fill it in. No stock photos, no filler, just files you can download and print today.",
  },

  // ── FEATURE FLAGS ────────────────────────────────────────────────────────
  // Toggle whole capabilities per site. Flip `printables` to false for a
  // blog-only site: the /free-printables routes 404, and its nav item, footer
  // link, homepage CTAs, and sitemap entries all disappear automatically.
  features: {
    printables: true,
  },

  // ── CONTACT + LEGAL IDENTITY ─────────────────────────────────────────────
  // Surfaced in the legal pages, footer, and about page. Set these per site so
  // the boilerplate legal copy carries the right brand, domain, and emails.
  contact: {
    email: "hello@biolexlife.com",       // general / terms contact
    privacyEmail: "privacy@biolexlife.com", // privacy + data requests
  },
  legal: {
    lastUpdated: "July 14, 2026", // shown at the top of each legal page
    // One-line disclaimer in the footer bottom bar. Swap for your niche.
    disclaimer:
      "Biolex printables are free for personal, non-commercial use. Print as many copies as you need.",
  },
  brand: {
    monogram: "BL",   // 2-letter mark used in avatar / quote blocks
    foundedYear: 2026, // used in the footer copyright line
  },

  theme: {
    colors: {
      primary:    "#5B34E0", // grape violet, nav, buttons, primary accents
      accent:     "#C9F24E", // electric lime, highlights (dark text on top)
      background: "#FCFBF7", // warm paper cream, page background
      text:       "#191720", // near-black ink, body text
      muted:      "#5A5763", // dim slate, secondary text, rules
      success:    "#3F9D6C", // green, positive states
    },
    fonts: {
      // Any font swapped here must also be wired up in lib/fonts.ts (FONT_MAP).
      display: "Bricolage Grotesque", // bold expressive grotesque headings
      body:    "Hanken Grotesk",      // clean, warm humanist sans body
      mono:    "Geist Mono",          // numbers, stamps, tags
    },
    radius: "0.9rem",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Free Printables", href: "/free-printables" },
    { label: "About", href: "/about" },
  ],

  footerLinks: [
    { label: "About", href: "/about" },
    { label: "Editorial Policy", href: "/editorial-policy" },
    { label: "Affiliate Disclosure", href: "/affiliate-disclosure" },
    { label: "Contact", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Disclaimer", href: "/disclaimer" },
    { label: "Terms of Use", href: "/terms-of-use" },
  ],

  // Social profile URLs, add the ones this site actually has, e.g.
  // { pinterest: "https://pinterest.com/yourhandle" }.
  social: {} as Record<string, string>,

  // Reader testimonials, shown on the homepage when non-empty. IMPORTANT: only
  // add REAL quotes here. Fabricated reviews mislead visitors and violate
  // Google's guidelines. Format: { quote, name, context }.
  testimonials: [
    // { quote: "…", name: "Jess", context: "…" },
  ] as ReadonlyArray<{ quote: string; name: string; context: string }>,

  // AUDIENCE SEGMENTS, drives hub pages via a single dynamic route.
  // Adding an entry here adds a `/<segment-slug>` hub page automatically; the
  // copy for each lives in content/segment-intros.ts. Leave empty to remove the
  // hub pages entirely.
  audienceSegments: [] as ReadonlyArray<{
    slug: string;
    label: string;
    tag: string;
    headline: string;
    tone: string;
    startHereLabel: string;
  }>,
} as const;

export type SiteConfig = typeof siteConfig;
export type AudienceSegment = SiteConfig["audienceSegments"][number];

/**
 * Nav links with feature-flagged items removed. When `features.printables` is
 * false, the "/free-printables" entry is dropped so the flag is the single
 * source of truth, components should render from this, not `siteConfig.nav`.
 */
export const navLinks: ReadonlyArray<{ label: string; href: string }> =
  siteConfig.features.printables
    ? siteConfig.nav
    : siteConfig.nav.filter((link) => link.href !== "/free-printables");
