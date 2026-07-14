import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site.config";
import { Container, Tag, SectionDivider } from "@/components/ui";
import { ogImages, twitterImages } from "@/lib/metadata";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: `How ${siteConfig.name} uses affiliate links, and our promise that recommendations are never influenced by commissions.`,
  alternates: { canonical: "/affiliate-disclosure" },
  openGraph: { url: "/affiliate-disclosure", type: "website", images: ogImages() },
  twitter: twitterImages(),
};

export default function AffiliateDisclosurePage() {
  return (
    <main className="flex-1">
      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-background pt-10 pb-10"
        aria-labelledby="affiliate-heading"
      >
        <Container width="narrow">
          <Tag variant="primary" className="mb-5">Affiliate Disclosure</Tag>
          <h1
            id="affiliate-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-text leading-tight mb-5"
          >
            How we make money, and how we don&rsquo;t.
          </h1>
          <p className="text-lg text-muted leading-relaxed">
            {siteConfig.name} is free to read, and we keep it that way partly
            through affiliate partnerships. Here&rsquo;s exactly what that means,
            in plain language. This page is a boilerplate starting point, not
            legal advice, adapt it for your own site.
          </p>
        </Container>
      </section>

      {/* ── Body ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-14" aria-label="Affiliate disclosure details">
        <Container width="narrow">
          <div className="space-y-6 text-text/85 leading-relaxed text-sm sm:text-base">
            <p>
              Some of our guides contain <span className="font-medium text-text">affiliate links</span>.
              If you click one and sign up for or buy a product, we may earn a small
              commission, <span className="font-medium text-text">at no extra cost to you</span>.
              You never pay more for using our link.
            </p>
            <p>
              We only mention tools, products, and services we believe are genuinely
              useful for the people this site is built for. Some of these are offered
              through third-party affiliate or associate programs, and we may earn a
              commission when you sign up or make a qualifying purchase through our
              links.
            </p>
            <p className="font-medium text-text">
              A commission never changes our recommendation.
            </p>
            <p>
              We do not accept payment to feature a product, and we don&rsquo;t
              recommend anything we wouldn&rsquo;t suggest to a friend. If a free
              option works just as well, we&rsquo;ll tell you, our free
              resources exist precisely so you never <em>have</em> to buy anything
              to get value from this site.
            </p>
            <p>
              This disclosure is provided in good faith and in line with the U.S.
              Federal Trade Commission&rsquo;s guidance on endorsements. Questions?{" "}
              <Link href="/contact" className="text-primary font-medium hover:underline underline-offset-4">
                Get in touch
              </Link>
              .
            </p>
          </div>

          <div className="mt-10">
            <SectionDivider spacing="sm" />
            <p className="text-sm text-muted mt-6">
              See also our{" "}
              <Link href="/disclaimer" className="text-primary font-medium hover:underline underline-offset-4">
                full disclaimer
              </Link>{" "}
              and{" "}
              <Link href="/editorial-policy" className="text-primary font-medium hover:underline underline-offset-4">
                editorial policy
              </Link>
              .
            </p>
          </div>
        </Container>
      </section>
    </main>
  );
}
