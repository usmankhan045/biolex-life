import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site.config";
import { getPageBySlug } from "@/lib/queries";
import { Container, Tag, SectionDivider, Card } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { aboutPageSchema, breadcrumbSchema } from "@/lib/schema";
import { ogImages, twitterImages } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "About",
  description: `The story behind ${siteConfig.name}: who we are, who this site is for, and why we built it.`,
  alternates: { canonical: "/about" },
  openGraph: { url: "/about", type: "website", images: ogImages() },
  twitter: twitterImages(),
};

export const revalidate = 3600;

const DEFAULT_INTRO =
  `${siteConfig.name} is a free library of printables for the home, wall art, coloring pages, and organising systems you can download and print today. Every file is designed in-house, print-tested on plain letter paper, and free to use.`;

export default async function AboutPage() {
  let intro = DEFAULT_INTRO;
  try {
    const page = await getPageBySlug("about");
    if (page?.content) intro = page.content;
  } catch {}

  return (
    <main className="flex-1">
      <JsonLd
        data={[
          aboutPageSchema(),
          breadcrumbSchema([
            { name: "Home", slug: "/" },
            { name: "About", slug: "/about" },
          ]),
        ]}
      />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-background pt-10 pb-10"
        aria-labelledby="about-hero-heading"
      >
        <Container width="narrow">
          <Tag variant="primary" className="mb-5">About</Tag>
          <h1
            id="about-hero-heading"
            className="font-display text-4xl sm:text-5xl font-extrabold text-text leading-[1.02] mb-5"
          >
            Print it. Frame it.
            <br className="hidden sm:block" />
            {" "}Done.
          </h1>
          <p className="text-lg text-muted leading-relaxed">{intro}</p>
        </Container>
      </section>

      {/* ── Our story ──────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-14" aria-labelledby="founder-heading">
        <Container width="narrow">
          <SectionDivider variant="titled" label="Our story" spacing="sm" />

          <div className="mt-10 flex flex-col sm:flex-row gap-8 items-start">
            <div className="shrink-0 w-24 h-24 rounded-full border-2 border-primary/20 overflow-hidden relative">
              <Image
                src={siteConfig.author.photo}
                alt={`${siteConfig.author.name}, ${siteConfig.author.role} of ${siteConfig.name}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>

            <div className="space-y-4 text-text/85 leading-relaxed">
              <p
                id="founder-heading"
                className="font-display text-xl font-semibold text-text"
              >
                Hi, I&rsquo;m {siteConfig.author.name}, founder of {siteConfig.name}.
              </p>

              <p className="text-sm sm:text-base">
                {siteConfig.name} started with a simple frustration: most free
                printables look great on screen and fall apart on paper. The art
                is blurry, the margins are cut off, the planner doesn&rsquo;t fit
                a standard frame, and half of them quietly reuse someone
                else&rsquo;s copyrighted characters.
              </p>

              <p className="text-sm sm:text-base">
                So I built the library I wished existed. Every printable here is
                designed in-house, original wall art, coloring pages,
                planners, labels, and worksheets, then print-tested on plain
                US Letter paper before it goes up. No stock photos, no AI art, no
                branded characters.
              </p>

              <p className="text-sm sm:text-base">
                And nothing is a bare download page. Each printable sits inside a
                real guide: how to print it sharp, what frame to buy, how to style
                it, or how to actually use the system. That&rsquo;s the part the AI
                slop flooding this space skips, and the reason people come
                back.
              </p>

              <p className="text-sm sm:text-base">
                Everything is free for personal use. Download it, print as many
                copies as you like, and put it on your wall or your fridge.
                That&rsquo;s the entire point of this site.
              </p>

              <p className="font-medium text-text">
                {siteConfig.author.name}
                <span className="text-muted font-normal"> &middot; {siteConfig.author.role}, {siteConfig.name}</span>
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* ── Who this is for ────────────────────────────────────────────────── */}
      {siteConfig.audienceSegments.length > 0 && (
        <section
          className="py-12 sm:py-14 bg-primary/[0.03]"
          aria-labelledby="audience-heading"
        >
          <Container>
            <SectionDivider variant="titled" label="Who this is for" spacing="sm" />
            <h2
              id="audience-heading"
              className="font-display text-3xl sm:text-4xl font-bold text-text mt-8 mb-3"
            >
              You&rsquo;re in the right place if&hellip;
            </h2>
            <p className="text-muted mb-10 max-w-lg">
              Every section of this site is built around a specific situation. Find yours
              and you&rsquo;ll find guides written exactly for where you are.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {siteConfig.audienceSegments.map((segment) => (
                <Link
                  key={segment.slug}
                  href={`/${segment.slug}`}
                  className="group block focus-visible:outline-none"
                  aria-label={segment.startHereLabel}
                >
                  <Card
                    className="h-full flex flex-col gap-2 transition duration-200 group-hover:shadow-md group-hover:-translate-y-0.5 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
                  >
                    <Tag variant="primary" className="self-start">{segment.label}</Tag>
                    <p className="text-sm text-text font-medium leading-snug mt-0.5">
                      {segment.startHereLabel}
                    </p>
                    <p className="mt-auto pt-3 text-xs font-mono text-primary/70 font-medium tracking-wide uppercase">
                      Start here →
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── What you'll find here ──────────────────────────────────────────── */}
      <section className="py-12 sm:py-14" aria-labelledby="content-heading">
        <Container width="narrow">
          <SectionDivider variant="titled" label="What you'll find here" spacing="sm" />
          <h2
            id="content-heading"
            className="font-display text-3xl font-extrabold text-text mt-8 mb-8"
          >
            Five shelves, one printer.
          </h2>

          <ul className="space-y-7">
            {([
              {
                title: "Printable wall art",
                body: "Original art for every room and style, bedroom, nursery, kitchen, boho, minimalist, sized for standard frames, with a guide on printing and hanging it.",
              },
              {
                title: "Coloring pages",
                body: "Animals, mandalas, florals, and seasonal sheets for kids and adults. All original line art you can print by the sheet or the set.",
              },
              {
                title: "Home organization printables",
                body: "Labels, cleaning schedules, zone maps, and checklists to sort every room, never a bare listicle, always a real system you can print.",
              },
              {
                title: "Kids & preschool worksheets",
                body: "Activity sheets, worksheets, chore charts, and classroom printables built for parents and teachers, not for a craft-supply haul.",
              },
              {
                title: "Meal planning & grocery printables",
                body: "Weekly meal planners, grocery lists, and freezer templates. Planning tools you fill in, no recipes, no food photos, just structure.",
              },
            ] as const).map((item) => (
              <li key={item.title} className="flex gap-4">
                <span
                  className="shrink-0 mt-1.5 w-5 h-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center"
                  aria-hidden
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary block" />
                </span>
                <div>
                  <p className="font-medium text-text mb-1">{item.title}</p>
                  <p className="text-muted text-sm leading-relaxed">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── Disclaimer ─────────────────────────────────────────────────────── */}
      <section className="py-12 bg-primary/[0.03]" aria-label="Disclaimer">
        <Container width="narrow">
          <div className="border-2 border-black/[0.08] rounded-xl bg-white p-5">
            <p className="text-xs text-muted leading-relaxed">
              <span className="font-medium text-text">Disclaimer: </span>
              {siteConfig.name}{" "}printables are free for personal, non-commercial use
              only. Please don&rsquo;t resell or redistribute the files. Any product
              or tool we mention may be an affiliate link.{" "}
              <Link
                href="/disclaimer"
                className="text-primary underline underline-offset-3 hover:opacity-80"
              >
                Read our full disclaimer →
              </Link>
            </p>
          </div>
        </Container>
      </section>

    </main>
  );
}
