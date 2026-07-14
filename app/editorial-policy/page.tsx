import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site.config";
import { Container, Tag, SectionDivider } from "@/components/ui";
import { ogImages, twitterImages } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description: `How ${siteConfig.name} researches, sources, fact-checks, and updates its budgeting guides — and the limits of what we publish.`,
  alternates: { canonical: "/editorial-policy" },
  openGraph: { url: "/editorial-policy", type: "website", images: ogImages() },
  twitter: twitterImages(),
};

const PRINCIPLES: { title: string; body: string }[] = [
  {
    title: "We test advice against real, constrained budgets",
    body: "Every guide is written and edited against tight, real-world numbers — not aspirational scenarios with money left over. If a strategy only works when you already have margin, we say so.",
  },
  {
    title: "We cite primary sources for data",
    body: "Statistics and dollar figures are sourced from primary references where possible — the Federal Reserve, the Bureau of Labor Statistics, the USDA, and official government assistance programs — and linked inline so you can verify them yourself.",
  },
  {
    title: "We separate fact from experience and opinion",
    body: "Where a claim is based on our own experience rather than a study, we frame it that way. We do not present estimates or opinions as if they were researched statistics.",
  },
  {
    title: "We keep guides current",
    body: "Money data changes — grocery prices, benefit thresholds, survey figures. We review evergreen guides on a recurring basis and update the numbers when they change. Substantive updates are reflected in each article's “Updated” date.",
  },
  {
    title: "We correct mistakes openly",
    body: "If we get something wrong, we fix it. You can flag an error any time via the contact page and we will review it.",
  },
];

export default function EditorialPolicyPage() {
  return (
    <main className="flex-1">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-background pt-10 pb-10"
        aria-labelledby="editorial-heading"
      >
        <Container width="narrow">
          <Tag variant="primary" className="mb-5">Editorial Policy</Tag>
          <h1
            id="editorial-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-text leading-tight mb-5"
          >
            How we research and fact-check.
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            {siteConfig.name} publishes money guides for people managing real,
            often tight, budgets. Because this is your money, here is exactly how
            we research, source, and maintain what we publish.
          </p>
        </Container>
      </section>

      {/* ── Principles ─────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-14" aria-label="Editorial principles">
        <Container width="narrow">
          <ul className="space-y-7">
            {PRINCIPLES.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span
                  className="shrink-0 mt-1.5 w-5 h-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center"
                  aria-hidden
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary block" />
                </span>
                <div>
                  <p className="font-medium text-text mb-1">{p.title}</p>
                  <p className="text-muted text-sm leading-relaxed">{p.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── Who writes this + not-advice note ──────────────────────────────── */}
      <section className="py-12 bg-primary/[0.03]" aria-label="Authorship and disclaimer">
        <Container width="narrow">
          <SectionDivider variant="titled" label="Who writes this" spacing="sm" />
          <p className="mt-8 text-text/85 leading-relaxed text-sm sm:text-base">
            Guides are written and edited by{" "}
            <Link href={siteConfig.author.url} className="text-primary font-medium hover:underline underline-offset-4">
              {siteConfig.author.name}
            </Link>
            , {siteConfig.author.role.toLowerCase()} of {siteConfig.name}. We are
            not licensed financial advisors, and nothing here is a substitute for
            personalized advice. The content is educational. For guidance specific
            to your situation, please consult a qualified professional — see our{" "}
            <Link href="/disclaimer" className="text-primary font-medium hover:underline underline-offset-4">
              full disclaimer
            </Link>
            .
          </p>
        </Container>
      </section>
    </main>
  );
}
