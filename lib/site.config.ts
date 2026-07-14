export const siteConfig = {
  slug: "my-site",
  // Canonical host. MUST match the host the deployment actually serves with a
  // 200 (Vercel redirects the apex → www), so canonical tags, sitemap <loc>,
  // og:url and robots Host/Sitemap all agree with production.
  domain: "www.example.com",
  // Known site_id for this tenant. Used as a resilient fallback if the runtime
  // `sites` table lookup is unavailable (e.g. build-time prerender). See
  // getCurrentSiteId() in lib/supabase.ts.
  //
  // PLACEHOLDER — set this to the real UUID you get back when you seed the
  // site's `sites` row in Supabase (see docs/NEW_SITE_GUIDE.md).
  siteId: "00000000-0000-0000-0000-000000000000",
  name: "My Site",
  tagline: "A short, memorable tagline goes here",
  niche: "Your niche or topic",

  // ── AUTHORSHIP / E-E-A-T ─────────────────────────────────────────────────
  // A named, real person behind the content — required for trust and
  // AI-citation entity resolution. Surfaced as a byline on posts, an author bio
  // on the About page, and Person schema (author/publisher) in JSON-LD.
  author: {
    name: "Author Name",
    slug: "author-name",
    role: "Founder & Editor",
    // Author headshot (public/author.svg is a neutral placeholder). Replace with
    // a real photo (e.g. public/author.jpg) before launch and update this path.
    photo: "/author.svg",
    // Real external profiles for the author — drives Person `sameAs` (a strong
    // AI-citation / entity-resolution signal). Add real profiles here.
    sameAs: [] as readonly string[],
    // Relative URL to the author's on-site profile page (author archive).
    url: "/author/author-name",
    shortBio:
      "One or two sentences introducing the author and why they started this site.",
    longBio:
      "A longer author bio for the About page and Person schema. Describe the author's background, why the site exists, and who it is for.",
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
    email: "contact@example.com",       // general / terms contact
    privacyEmail: "privacy@example.com", // privacy + data requests
  },
  legal: {
    lastUpdated: "July 14, 2026", // shown at the top of each legal page
    // One-line disclaimer in the footer bottom bar. Swap for your niche.
    disclaimer:
      "This site is for general informational purposes only.",
  },
  brand: {
    monogram: "MS",   // 2-letter mark used in avatar / quote blocks
    foundedYear: 2026, // used in the footer copyright line
  },

  theme: {
    colors: {
      primary:    "#2F4858", // deep slate — nav, buttons, primary accents
      accent:     "#E08A3C", // warm amber — highlights
      background: "#FAFAF8", // near-white page background
      text:       "#1A1F24", // near-black body text
      muted:      "#6B7680", // secondary text, rules
      success:    "#3F9D6C", // positive states
    },
    fonts: {
      // Any font swapped here must also be wired up in lib/fonts.ts (FONT_MAP).
      display: "Fraunces",      // warm-editorial variable serif
      body:    "Public Sans",   // legible, neutral sans
      mono:    "IBM Plex Mono", // numbers, stamps, tags
    },
    radius: "0.75rem",
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

  // Social profile URLs — add the ones this site actually has, e.g.
  // { pinterest: "https://pinterest.com/yourhandle" }.
  social: {} as Record<string, string>,

  // Reader testimonials — shown on the homepage when non-empty. IMPORTANT: only
  // add REAL quotes here. Fabricated reviews mislead visitors and violate
  // Google's guidelines. Format: { quote, name, context }.
  testimonials: [
    // { quote: "…", name: "Jess", context: "…" },
  ] as ReadonlyArray<{ quote: string; name: string; context: string }>,

  // AUDIENCE SEGMENTS — drives hub pages via a single dynamic route.
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
 * source of truth — components should render from this, not `siteConfig.nav`.
 */
export const navLinks: ReadonlyArray<{ label: string; href: string }> =
  siteConfig.features.printables
    ? siteConfig.nav
    : siteConfig.nav.filter((link) => link.href !== "/free-printables");
