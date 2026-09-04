import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts, getCategoriesWithPostCounts, type Post } from "@/lib/queries";
import {
  Button,
  Card, CardTitle, CardBody,
  Tag,
  SectionDivider,
  Container,
  PrintableCallout,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/lib/site.config";
import { Testimonials } from "@/components/Testimonials";
import { ogImages, twitterImages } from "@/lib/metadata";

// ISR: regenerate at runtime so real posts/categories from Supabase render even
// when the build environment lacks DB access (otherwise the page freezes on the
// placeholder content shipped at build time, and every card links to /blog).
export const revalidate = 3600;

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name}: Free Printables for Your Home`,
  },
  description:
    "Free printable wall art, coloring pages, and home organisation printables. Instant downloads, no sign-up required, print it, frame it, done.",
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    type: "website",
    title: `${siteConfig.name}: Free Printables for Your Home`,
    description:
      "Free printable wall art, coloring pages, planners, and organisation printables. Instant downloads, no sign-up required.",
    images: ogImages(),
  },
  twitter: twitterImages(),
};

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder posts, shown when the DB is not yet configured or has no content.
// Every title carries the word "printable" (the master-plan rule: printable is
// the business, not a modifier). Replace with real content via Supabase.
// ─────────────────────────────────────────────────────────────────────────────
const PLACEHOLDER_POSTS: Post[] = [
  {
    id: "ph-1",
    slug: "printable-wall-art-for-bedroom",
    title: "Printable Wall Art for the Bedroom: 12 Sets to Frame Tonight",
    excerpt:
      "Twelve free printable wall art sets sized for standard frames, plus how to print them sharp and hang a balanced pair above the bed.",
    content: null, quick_answer: null, featured_image_url: null,
    category_id: null, status: "published",
    seo_title: null, seo_description: null, faq_items: [],
    audience_tags: [],
    published_at: "2026-07-01T00:00:00Z",
    created_at: "2026-07-01T00:00:00Z",
    updated_at: "2026-07-01T00:00:00Z",
    categories: { slug: "printable-wall-art", name: "Printable Wall Art" },
  },
  {
    id: "ph-2",
    slug: "printable-animal-coloring-pages",
    title: "Free Animal Coloring Pages: 30 Printable Sheets for Kids & Adults",
    excerpt:
      "Thirty original animal coloring pages to download and print, from simple shapes for toddlers to detailed line art for grown-ups.",
    content: null, quick_answer: null, featured_image_url: null,
    category_id: null, status: "published",
    seo_title: null, seo_description: null, faq_items: [],
    audience_tags: [],
    published_at: "2026-07-04T00:00:00Z",
    created_at: "2026-07-04T00:00:00Z",
    updated_at: "2026-07-04T00:00:00Z",
    categories: { slug: "coloring-pages", name: "Coloring Pages" },
  },
  {
    id: "ph-3",
    slug: "bathroom-organization-printables",
    title: "Bathroom Organization Printables: Labels, Zone Map & Checklist",
    excerpt:
      "A printable label set, a zone map, and a restock checklist to sort every drawer and cabinet, with a step-by-step on where each zone goes.",
    content: null, quick_answer: null, featured_image_url: null,
    category_id: null, status: "published",
    seo_title: null, seo_description: null, faq_items: [],
    audience_tags: [],
    published_at: "2026-07-08T00:00:00Z",
    created_at: "2026-07-08T00:00:00Z",
    updated_at: "2026-07-08T00:00:00Z",
    categories: { slug: "home-organization", name: "Home Organization" },
  },
  {
    id: "ph-4",
    slug: "preschool-activities-printable",
    title: "Preschool Activities Printable: A Week of At-Home Worksheets",
    excerpt:
      "Five days of printable preschool worksheets, letters, counting, and fine-motor practice, with a simple daily plan any parent can follow.",
    content: null, quick_answer: null, featured_image_url: null,
    category_id: null, status: "published",
    seo_title: null, seo_description: null, faq_items: [],
    audience_tags: [],
    published_at: "2026-07-11T00:00:00Z",
    created_at: "2026-07-11T00:00:00Z",
    updated_at: "2026-07-11T00:00:00Z",
    categories: { slug: "kids-printables", name: "Kids & Preschool" },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// § Hero artifact, the signature "bold daylight" panel.
//
// A grape panel with a lime blob and a stack of check chips, one per pillar of
// the library. It answers the first-time visitor's question at a glance: what
// is on the shelves, and that it's all free.
// ─────────────────────────────────────────────────────────────────────────────
const PILLAR_CHIPS: string[] = [
  "Wall art, by room & style",
  "Coloring pages, animals & mandalas",
  "Home organization, labels & schedules",
  "Kids & preschool worksheets",
  "Meal planning & grocery lists",
];

function LibraryPanel() {
  return (
    <div className="relative overflow-hidden rounded-[26px] bg-primary text-white p-8 sm:p-9 hard-ink">
      {/* Lime blob, top-right */}
      <div
        aria-hidden
        className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-accent"
      />

      <p className="relative stamp text-white/70 mb-4">The Biolex library</p>
      <h2 className="relative font-display text-2xl sm:text-[1.7rem] font-extrabold leading-[1.08]">
        Five shelves.
        <br />
        One printer.
        <br />
        Everything free.
      </h2>

      <ul className="relative mt-7 flex flex-col gap-2.5">
        {PILLAR_CHIPS.map((chip) => (
          <li
            key={chip}
            className="inline-flex items-center gap-2.5 w-fit rounded-xl bg-white/[0.14] border border-white/25 px-3 py-2 text-sm font-medium"
          >
            <span
              aria-hidden
              className="grid place-items-center w-4 h-4 rounded-full bg-accent text-primary text-[11px] font-bold shrink-0"
            >
              ✓
            </span>
            {chip}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// § "What you get", three plain-language promises, with simple line icons.
//   This is the first-sight clarity layer, directly under the hero.
// ─────────────────────────────────────────────────────────────────────────────
const VALUE_PROPS: { icon: "guide" | "printable" | "note"; title: string; body: string }[] = [
  {
    icon: "printable",
    title: "Instant download, no sign-up",
    body: "Every file is free. Open the post, download the PDF, and print at home, no account, no email wall, no catch.",
  },
  {
    icon: "note",
    title: "Print-tested on letter paper",
    body: "Sized for US Letter to line up right the first time. Each printable comes with a short guide on how to print and frame it.",
  },
  {
    icon: "guide",
    title: "Original art, always",
    body: "Wall art, coloring pages, and planners we design in-house. No stock photos, no AI art, no copyrighted characters.",
  },
];

function ValueIcon({ name }: { name: "guide" | "printable" | "note" }) {
  const common = {
    width: 22, height: 22, viewBox: "0 0 24 24", fill: "none",
    stroke: "currentColor", strokeWidth: 1.6,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "guide") {
    return (
      <svg {...common}>
        <path d="M5 4h11l3 3v13H5z" />
        <path d="M8 9h8M8 12.5h8M8 16h5" />
      </svg>
    );
  }
  if (name === "printable") {
    return (
      <svg {...common}>
        <path d="M12 4v9m0 0 3.2-3.2M12 13l-3.2-3.2" />
        <path d="M5 16v3h14v-3" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components (page-local, not exported)
// ─────────────────────────────────────────────────────────────────────────────

function CategoryCard({
  category,
}: {
  category: { slug: string; name: string; description: string | null; postCount: number };
}) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group block focus-visible:outline-none"
      aria-label={`Browse ${category.name} printables`}
    >
      <Card
        variant="plain"
        className={cn(
          "h-full flex flex-col gap-2",
          "transition duration-200",
          "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0_var(--color-primary)] group-hover:border-primary",
          "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
        )}
      >
        <Tag variant="primary" className="self-start">{category.name}</Tag>
        {category.description && (
          <p className="text-[0.95rem] text-text font-medium leading-snug mt-0.5">
            {category.description}
          </p>
        )}
        <p className="mt-auto pt-3 text-xs font-mono text-primary/70 font-medium tracking-wide uppercase">
          {category.postCount} {category.postCount === 1 ? "printable set" : "printable sets"} →
        </p>
      </Card>
    </Link>
  );
}

function PostCard({ post }: { post: Post }) {
  const isPlaceholder = post.id.startsWith("ph-");
  const href = isPlaceholder ? "/blog" : post.slug.startsWith("#") ? post.slug : `/blog/${post.slug}`;
  return (
    <Link href={href} className="group block h-full focus-visible:outline-none">
      <Card
        className={cn(
          "h-full flex flex-col",
          "transition duration-200",
          "group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[6px_6px_0_var(--color-primary)]",
          "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
        )}
      >
        {/* Category stamp */}
        {post.categories && (
          <Tag variant="default" className="mb-3 self-start">
            {post.categories.name}
          </Tag>
        )}

        {/* Title */}
        <CardTitle
          as="h3"
          className="text-base leading-snug mb-2 line-clamp-3 group-hover:text-primary transition-colors"
        >
          {post.title}
        </CardTitle>

        {/* Excerpt */}
        {post.excerpt && (
          <CardBody className="flex-1 line-clamp-3 text-sm">
            {post.excerpt}
          </CardBody>
        )}

        {/* Read link */}
        <p className="mt-4 text-xs font-mono text-primary font-medium tracking-wide uppercase">
          Read &amp; download →
        </p>
      </Card>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  // Fetch posts; falls back to placeholder content if the DB is not yet configured.
  let posts: Post[] = [];
  try {
    posts = await getPublishedPosts({ limit: 4 });
  } catch {
    // Supabase not configured or site not yet seeded; use placeholder posts.
  }
  // Never ship fabricated post cards to production: the placeholder set is a
  // dev-only demo aid. In production with an empty DB we render a real empty
  // state instead, so crawlers/AI never index posts that don't exist.
  const isProd = process.env.NODE_ENV === "production";
  const displayPosts = posts.length > 0 ? posts : isProd ? [] : PLACEHOLDER_POSTS;

  // Categories for the "Browse by category" section. Empty if DB unconfigured.
  let categories: Array<{
    slug: string;
    name: string;
    description: string | null;
    postCount: number;
  }> = [];
  try {
    categories = await getCategoriesWithPostCounts();
  } catch {
    // DB not configured; hide the category section.
  }

  return (
    <main className="flex-1">

      {/* ══════════════════════════════════════════════════════════════════
          § HERO, the page's thesis.
          A first-time visitor learns three things instantly: what this is
          (a free printables library), what's on it (five pillars), and what
          to do next (browse printables / read the guides).
      ══════════════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-gradient-to-b from-primary/[0.06] via-primary/[0.02] to-background"
        aria-labelledby="hero-heading"
      >
        <Container className="pt-10 pb-14 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
          <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-10 lg:gap-14 items-center">

            {/* Left, the promise */}
            <div className="min-w-0 max-w-xl">
              <p className="stamp text-primary mb-5 flex items-center gap-2.5">
                <span className="h-2 w-6 rounded-full bg-accent" aria-hidden />
                Free printables for your home
              </p>

              <h1
                id="hero-heading"
                className="font-display text-[2.6rem] sm:text-6xl lg:text-[4rem] font-extrabold text-text leading-[0.98] tracking-tight text-balance"
              >
                Wall art, coloring pages &amp; planners you can{" "}
                <span className="lime-mark">print today</span>.
              </h1>

              <p className="mt-6 text-lg sm:text-xl text-muted leading-relaxed max-w-lg">
                {siteConfig.name} is a free library of printables for the home, 
                download the PDF, print it at home, frame it or fill it in. No
                sign-up, no paywall, no catch.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {siteConfig.features.printables && (
                  <Button size="lg">
                    <Link href="/free-printables" className="contents">
                      Browse free printables
                    </Link>
                  </Button>
                )}
                <Button variant="outline" size="lg">
                  <Link href="/blog" className="contents">
                    Read the guides
                  </Link>
                </Button>
              </div>

              <p className="mt-7 stamp text-muted/80 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Instant download</span>
                <span className="text-muted/40" aria-hidden>·</span>
                <span>No sign-up</span>
                <span className="text-muted/40" aria-hidden>·</span>
                <span>Always free</span>
              </p>
            </div>

            {/* Right, the artifact */}
            <div className="min-w-0 w-full">
              <LibraryPanel />
            </div>
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § WHAT YOU GET, first-sight clarity, three plain promises.
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-14 sm:py-16 border-y-2 border-black/[0.08]" aria-label="What you get here">
        <Container>
          <div className="grid gap-6 sm:grid-cols-3">
            {VALUE_PROPS.map((vp) => (
              <div key={vp.title} className="flex flex-col">
                <span
                  className="w-11 h-11 rounded-xl bg-primary/[0.08] text-primary flex items-center justify-center mb-4"
                  aria-hidden
                >
                  <ValueIcon name={vp.icon} />
                </span>
                <h2 className="font-display text-lg font-bold text-text mb-1.5">
                  {vp.title}
                </h2>
                <p className="text-sm text-muted leading-relaxed">{vp.body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § BROWSE BY CATEGORY, driven from the published categories.
          Each card links to its /category/[slug] archive; empty categories
          are hidden. Renders nothing if the DB is unconfigured.
      ══════════════════════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section className="py-12 sm:py-16" aria-labelledby="categories-heading">
          <Container>
            <SectionDivider variant="titled" label="Browse by category" spacing="sm" />

            <div className="mt-10">
              <h2
                id="categories-heading"
                className="font-display text-3xl sm:text-4xl font-extrabold text-text mb-3"
              >
                Pick a shelf.
              </h2>
              <p className="text-muted text-lg max-w-xl mb-10">
                Every printable is filed by pillar. Choose a category to see all
                of its download sets and how-to guides in one place.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <CategoryCard key={category.slug} category={category} />
                ))}
              </div>

              <div className="mt-8 text-center">
                <Link
                  href="/blog"
                  className="text-sm text-primary font-semibold hover:underline underline-offset-4"
                >
                  Browse all printables →
                </Link>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          § LATEST FROM THE BLOG
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 bg-primary/[0.03]" aria-labelledby="posts-heading">
        <Container>
          <div className="flex items-baseline justify-between gap-4 mb-10 flex-wrap">
            <div>
              <h2
                id="posts-heading"
                className="font-display text-3xl sm:text-4xl font-extrabold text-text"
              >
                Fresh off the printer
              </h2>
              <p className="text-muted mt-2">
                New printable sets and the guides that go with them.
              </p>
            </div>
            <Link
              href="/blog"
              className="text-sm text-primary font-semibold hover:underline underline-offset-4 shrink-0"
            >
              View all →
            </Link>
          </div>

          {displayPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            // Production with an empty DB: a genuine empty state, never fake cards.
            <p className="py-8 text-center text-muted">
              New printable guides are publishing soon.{" "}
              <Link href="/free-printables" className="text-primary font-medium hover:underline underline-offset-4">
                Browse the printables
              </Link>{" "}
              in the meantime.
            </p>
          )}

          {/* Dev-only marker so a blank DB is obvious locally; never ships to prod. */}
          {posts.length === 0 && !isProd && (
            <p className="mt-6 text-center text-xs font-mono text-muted/50 uppercase tracking-widest">
              Showing placeholder content. Connect Supabase to display real posts
            </p>
          )}
        </Container>
      </section>

      {/* ══════════════════════════════════════════════════════════════════
          § FREE PRINTABLE CALLOUT
      ══════════════════════════════════════════════════════════════════ */}
      {siteConfig.features.printables && (
        <section className="py-12 sm:py-16" aria-label="Free printable">
          <Container width="narrow">
            <PrintableCallout
              title="Free Starter Set: Printable Weekly Planner + Grocery List"
              description="A one-page weekly planner and a matching grocery list, sized for US Letter. Download the PDF, print it, and plan your week in ten minutes. Free, no sign-up."
              href="/free-printables"
              badge="Free Printable"
            />
          </Container>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          § TESTIMONIALS, renders only when real reader quotes are configured.
      ══════════════════════════════════════════════════════════════════ */}
      <Testimonials />

      {/* ══════════════════════════════════════════════════════════════════
          § ABOUT TEASER
      ══════════════════════════════════════════════════════════════════ */}
      <section className="py-12 sm:py-16 bg-primary/[0.03]" aria-labelledby="about-heading">
        <Container width="narrow">
          <SectionDivider variant="titled" label="About" spacing="sm" />

          <div className="mt-10 text-center">
            <div className="w-16 h-16 rounded-full border-2 border-primary/20 mx-auto mb-6 overflow-hidden relative">
              <Image
                src={siteConfig.author.photo}
                alt={`${siteConfig.author.name}, ${siteConfig.author.role} of ${siteConfig.name}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </div>

            <blockquote className="font-display text-xl sm:text-2xl font-bold text-text leading-relaxed mb-6 max-w-lg mx-auto">
              &ldquo;I was tired of printables that looked great on screen and
              fell apart on paper. So I design every one here, print-test it, and
              give it away free.&rdquo;
            </blockquote>

            <p
              id="about-heading"
              className="font-mono text-xs uppercase tracking-widest text-muted mb-8"
            >
              {siteConfig.author.name}, {siteConfig.author.role}
            </p>

            <Button variant="outline">
              <Link href="/about" className="contents">
                Read our story →
              </Link>
            </Button>
          </div>
        </Container>
      </section>

    </main>
  );
}
