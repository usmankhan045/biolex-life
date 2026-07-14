import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site.config";
import { getPageBySlug } from "@/lib/queries";
import { Container, Tag, SectionDivider, Card } from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { aboutPageSchema } from "@/lib/schema";
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
  `${siteConfig.name} was built to make helpful, practical information easy to find and easy to use. Clear guides and free tools you can put to work the same day, without the fluff.`;

export default async function AboutPage() {
  let intro = DEFAULT_INTRO;
  try {
    const page = await getPageBySlug("about");
    if (page?.content) intro = page.content;
  } catch {}

  return (
    <main className="flex-1">
      <JsonLd data={[aboutPageSchema()]} />

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-background pt-10 pb-10"
        aria-labelledby="about-hero-heading"
      >
        <Container width="narrow">
          <Tag variant="primary" className="mb-5">About</Tag>
          <h1
            id="about-hero-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-text leading-tight mb-5"
          >
            Practical help,
            <br className="hidden sm:block" />
            made simple.
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
                Hi, I&rsquo;m {siteConfig.author.name} &mdash; founder of {siteConfig.name}.
              </p>

              <p className="text-sm sm:text-base">
                {siteConfig.name} started with a simple frustration: most advice online is
                written for people who already know the basics. It skips past the
                questions beginners actually have, buries the useful parts under filler,
                and assumes you have hours to figure it all out on your own.
              </p>

              <p className="text-sm sm:text-base">
                So I built the site I wished existed. I research what actually works,
                test it, and turn it into clear guides and free tools you can use the
                same day. Every guide is edited to be genuinely useful for someone
                starting from scratch, not just impressive to skim.
              </p>

              <p className="text-sm sm:text-base">
                What we publish isn&rsquo;t the watered-down, surface-level version.
                It&rsquo;s the practical version, the concrete steps that help people
                understand a topic, make a decision, and feel confident doing it, often
                for the first time.
              </p>

              <p className="text-sm sm:text-base">
                Nothing here is a substitute for personalized professional advice. This
                is the honest, tested work of figuring things out &mdash; shared freely,
                so the path is a little easier for you. That&rsquo;s the entire point of
                this site.
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

      {/* ── What you'll find here ──────────────────────────────────────────── */}
      <section className="py-12 sm:py-14" aria-labelledby="content-heading">
        <Container width="narrow">
          <SectionDivider variant="titled" label="What you'll find here" spacing="sm" />
          <h2
            id="content-heading"
            className="font-display text-3xl font-bold text-text mt-8 mb-8"
          >
            Practical tools. Honest guides.
          </h2>

          <ul className="space-y-7">
            {([
              {
                title: "Guides written for real situations",
                body: "Not generic advice. Every guide is written with a specific reader in mind, whether you're a complete beginner or picking things back up after a break.",
              },
              {
                title: "Free printables and worksheets",
                body: "Templates, checklists, trackers, and planners. Designed to be printed and filled in by hand, because sometimes that's what actually works.",
              },
              {
                title: "Straight talk, no filler",
                body: "No hype. No padding. We talk about the real tradeoffs, the common questions, and the practical steps that get you from confused to confident.",
              },
              {
                title: "Simple systems, not perfect ones",
                body: "A routine you'll actually stick to beats a perfect plan you abandon in week two. We focus on systems that work in a messy, real life.",
              },
              {
                title: "No judgment, ever",
                body: "Wherever you're starting from, you belong here. We don't shame, we don't lecture. We just help.",
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
          <div className="border border-black/[0.08] rounded-xl bg-white p-5">
            <p className="text-xs text-muted leading-relaxed">
              <span className="font-medium text-text">Disclaimer: </span>
              The content on {siteConfig.name} is for general educational and informational
              purposes only. It is not professional advice. Always consult a qualified
              professional before making important decisions.{" "}
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
