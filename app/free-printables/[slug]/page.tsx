import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  getPrintables,
  getPrintableBySlug,
  getPublishedPosts,
  type Printable,
  type Post,
} from "@/lib/queries";
import { siteConfig } from "@/lib/site.config";
import {
  Container,
  Tag,
  Card,
  CardTitle,
  CardBody,
  SectionDivider,
} from "@/components/ui";
import { PrintableIframePreview } from "@/components/PrintableIframePreview";
import { JsonLd } from "@/components/JsonLd";
import {
  digitalDocumentSchema,
  productOfferSchema,
  breadcrumbSchema,
} from "@/lib/schema";
import { ogImages } from "@/lib/metadata";
import { cn } from "@/lib/utils";

// Explicit printable→article pairings where slug-keyword matching picks the
// wrong companion (the ideal companion is the guide that embeds the printable).
// Add entries as "<printable-slug>": "<post-slug>" when auto-matching misses.
const COMPANION_OVERRIDES: Record<string, string> = {};

// Stable per-slug offset so the "related" backfill varies across pages instead
// of every page falling back to the same few printables.
function hashSlug(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  if (!siteConfig.features.printables) return [];
  try {
    const printables = await getPrintables();
    return printables.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const printable = await getPrintableBySlug(slug);
    if (!printable) return {};

    const title = printable.title;
    const description =
      printable.description ??
      `Free printable from ${siteConfig.name}, download instantly.`;

    // Keep the portrait preview as the OG image (ideal for Pinterest, the
    // primary channel); fall back to the branded landscape default otherwise.
    const images = printable.thumbnail_url
      ? [{ url: printable.thumbnail_url, width: 600, height: 800, alt: title, type: "image/png" }]
      : ogImages(undefined, title);
    return {
      title,
      description,
      alternates: { canonical: `/free-printables/${slug}` },
      openGraph: {
        title,
        description,
        url: `/free-printables/${slug}`,
        type: "website",
        images,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [printable.thumbnail_url ?? "/og-default.jpg"],
      },
    };
  } catch {
    return {};
  }
}

// ── Thumbnail placeholder, matches grid page motif ───────────────────────────

function PrintableThumbnailPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "w-full h-full flex flex-col justify-center items-center gap-[6px] px-10 py-12",
        className
      )}
      aria-hidden
    >
      <span className="block h-[3px] bg-primary/25 rounded-full w-3/5 mb-3" />
      {[1, 0.85, 0.95, 0.6, 1, 0.75, 0.9, 1, 0.55, 0.8, 1, 0.7].map((w, i) => (
        <span
          key={i}
          className="block h-px bg-muted/20 rounded-full"
          style={{ width: `${w * 100}%` }}
        />
      ))}
    </div>
  );
}

// ── Related printable card ────────────────────────────────────────────────────

function RelatedPrintableCard({ printable }: { printable: Printable }) {
  return (
    <Link
      href={`/free-printables/${printable.slug}`}
      className="group block focus-visible:outline-none"
    >
      <article
        className={cn(
          "bg-white rounded-xl border border-black/[0.07] shadow-sm overflow-hidden",
          "flex gap-4 p-4 items-center",
          "transition duration-200",
          "group-hover:shadow-md group-hover:-translate-y-0.5",
          "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary"
        )}
      >
        {/* Mini thumbnail */}
        <div className="relative shrink-0 w-14 h-[4.5rem] rounded-lg bg-primary/[0.04] border border-black/[0.06] overflow-hidden">
          {printable.thumbnail_url ? (
            <Image
              src={printable.thumbnail_url}
              alt={`Preview of ${printable.title}`}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <PrintableThumbnailPlaceholder />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <CardTitle
            as="h3"
            className="text-sm leading-snug mb-0.5 line-clamp-2 group-hover:text-primary transition-colors"
          >
            {printable.title}
          </CardTitle>
          <p className="text-xs font-mono text-primary/70 font-medium tracking-wide uppercase mt-2">
            Free →
          </p>
        </div>
      </article>
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function PrintableDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  if (!siteConfig.features.printables) notFound();

  const { slug } = await params;

  let printable: Printable | null = null;
  try {
    printable = await getPrintableBySlug(slug);
  } catch {
    notFound();
  }
  if (!printable) notFound();

  // Related printables, same category first. Taking the first 3 of the global
  // list made every one of these pages recommend the same 3 files, so ~270
  // internal links all pointed at 3 arbitrary printables and left the rest with
  // only the listing page linking to them.
  let related: Printable[] = [];
  try {
    const categoryId = printable.category_id;
    const sameCategory = categoryId
      ? (await getPrintables(categoryId)).filter((p) => p.slug !== slug)
      : [];
    related = sameCategory.slice(0, 3);
    if (related.length < 3) {
      // Backfill from the wider library, offset by this printable's position so
      // the filler differs page to page instead of repeating the same 3 items.
      const all = await getPrintables();
      const pool = all.filter(
        (p) => p.slug !== slug && !related.some((r) => r.slug === p.slug)
      );
      const start = pool.length
        ? Math.abs(hashSlug(slug)) % pool.length
        : 0;
      const rotated = [...pool.slice(start), ...pool.slice(0, start)];
      related = [...related, ...rotated].slice(0, 3);
    }
  } catch {
    // non-critical
  }

  // Companion article, cross-link the printable back into the blog content
  // pillar. Printables live in the post-less "printables" category, so match by
  // slug keyword first (e.g. "starter-template" → the "getting started" guide),
  // then fall back to the most recent guide so the cross-link always renders.
  let companion: Post | null = null;
  try {
    const recent = await getPublishedPosts({ limit: 50 });
    const stem = slug.replace(/-(printable|tracker|template|worksheet|planner)$/g, "");
    const norm = (s: string) => s.replace(/^free-/, "");
    const override = COMPANION_OVERRIDES[slug];
    companion =
      (override ? recent.find((p) => p.slug === override) : undefined) ??
      recent.find(
        (p) => norm(p.slug).includes(stem) || stem.includes(norm(p.slug))
      ) ??
      (printable.categories
        ? recent.find((p) => p.categories?.slug === printable.categories!.slug)
        : undefined) ??
      // Last resort: rotate by slug rather than always taking the newest post,
      // which made most printables point at the same single article.
      (recent.length
        ? recent[Math.abs(hashSlug(slug)) % recent.length]
        : null);
  } catch {
    // non-critical
  }

  const schemas = [
    digitalDocumentSchema(printable),
    // Product + price 0.00 Offer alongside the DigitalDocument: the document
    // node describes the file, the product node carries the free-download
    // offer signal that search engines actually surface.
    productOfferSchema(printable),
    breadcrumbSchema([
      { name: "Home", slug: "/" },
      { name: "Free Printables", slug: "/free-printables" },
      { name: printable.title, slug: `/free-printables/${printable.slug}` },
    ]),
  ];

  return (
    <main className="flex-1">
      <JsonLd data={schemas} />

      {/* ── Header / hero ──────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-accent/[0.06] via-accent/[0.02] to-background pt-10 pb-10"
        aria-labelledby="printable-title"
      >
        <Container>
          {/* Breadcrumb nav */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs font-mono text-muted/60 uppercase tracking-wide flex-wrap">
              <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li aria-hidden>/</li>
              <li><Link href="/free-printables" className="hover:text-primary transition-colors">Free Printables</Link></li>
              <li aria-hidden>/</li>
              <li className="text-muted" aria-current="page">{printable.title}</li>
            </ol>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 lg:gap-16 items-start">

            {/* ── Left: printable preview ─────────────────────────────────── */}
            <div className="relative rounded-2xl bg-white border border-black/[0.08] shadow-sm overflow-hidden">
              {/* Live iframe preview when an HTML source exists */}
              {printable.file_url?.endsWith(".pdf") ? (
                <PrintableIframePreview
                  slug={printable.slug}
                  title={printable.title}
                  orientation={printable.orientation ?? "portrait"}
                />
              ) : printable.thumbnail_url ? (
                <div className="relative aspect-[3/4]">
                  <Image
                    src={printable.thumbnail_url}
                    alt={`Preview of ${printable.title}`}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 380px, 100vw"
                    priority
                  />
                </div>
              ) : (
                <div className="aspect-[3/4]">
                  <PrintableThumbnailPlaceholder />
                </div>
              )}

              {/* "Free" badge */}
              <span
                className={cn(
                  "absolute top-4 right-4",
                  "font-mono text-[0.65rem] font-semibold tracking-[0.12em] uppercase",
                  "bg-accent text-white px-2.5 py-1.5 rounded-lg shadow-sm"
                )}
              >
                Free
              </span>
            </div>

            {/* ── Right: details + gate ───────────────────────────────────── */}
            <div className="flex flex-col gap-6 lg:pt-2">
              {/* Category + tags */}
              <div className="flex flex-wrap gap-2">
                {printable.categories && (
                  <Link href={`/category/${printable.categories.slug}`}>
                    <Tag variant="accent">{printable.categories.name}</Tag>
                  </Link>
                )}
                <Tag variant="default">Printable</Tag>
              </div>

              {/* Title */}
              <h1
                id="printable-title"
                className="font-display text-3xl sm:text-4xl font-bold text-text leading-tight"
              >
                {printable.title}
              </h1>

              {/* Description */}
              {printable.description && (
                <p className="text-lg text-muted leading-relaxed">
                  {printable.description}
                </p>
              )}

              {/* Value props */}
              <ul className="flex flex-col gap-2 text-sm text-text/80">
                {[
                  "Free to download and print",
                  "No purchase or credit card required",
                  // Concrete, checkable specs beat vague reassurance: every PDF
                  // in the library is US Letter at 100% scale.
                  `US Letter, 8.5 x 11 in, ${
                    printable.orientation === "landscape"
                      ? "landscape"
                      : "portrait"
                  }`,
                  "Print at 100% scale (not Fit to Page) for true sizing",
                ].map((point) => (
                  <li key={point} className="flex items-start gap-2">
                    <span className="shrink-0 text-success font-bold text-xs mt-0.5">✓</span>
                    {point}
                  </li>
                ))}
              </ul>

              {/* Direct download */}
              <div className={cn(
                "rounded-2xl border-2 border-dashed border-accent/50",
                "bg-accent/[0.04] p-6 sm:p-7"
              )}>
                <p className="font-mono text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-accent mb-2">
                  Free download
                </p>
                <p className="font-display text-lg font-semibold text-text mb-1">
                  Yours instantly, no sign-up needed
                </p>
                <p className="text-sm text-muted mb-5 leading-relaxed">
                  Click below to download your free printable PDF. Print at home on standard letter paper (8.5&quot; &times; 11&quot;).
                </p>

                {printable.file_url ? (
                  <a
                    href={printable.file_url}
                    download
                    aria-label={`Download ${printable.title}`}
                    className={cn(
                      "flex items-center justify-center gap-2 w-full",
                      "bg-success text-white rounded-xl",
                      "h-12 font-medium text-sm",
                      "transition-opacity duration-150 hover:opacity-90 active:opacity-80",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-success"
                    )}
                  >
                    <span aria-hidden>↓</span>
                    Download Free PDF
                  </a>
                ) : (
                  <p className="text-sm text-muted border border-black/[0.07] rounded-xl px-4 py-3 leading-relaxed">
                    This printable is coming soon. Check back shortly.
                  </p>
                )}
              </div>

              {/* Companion guide, cross-link into the blog content pillar */}
              {companion && (
                <Link
                  href={`/blog/${companion.slug}`}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-3",
                    "transition-colors duration-150 hover:bg-primary/[0.06]",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  )}
                >
                  <span aria-hidden className="text-primary text-lg leading-none">📖</span>
                  <span className="min-w-0">
                    <span className="block text-[0.65rem] font-mono uppercase tracking-wide text-primary/70">
                      Read the guide
                    </span>
                    <span className="block text-sm font-medium text-text leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {companion.title}
                    </span>
                  </span>
                </Link>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* ── How to use ─────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16">
        <Container width="narrow">
          <SectionDivider variant="titled" label="How to use it" spacing="sm" />
          <h2 className="font-display text-2xl font-bold text-text mt-8 mb-5">
            Getting started in 3 steps
          </h2>
          <ol className="flex flex-col gap-5">
            {[
              { step: "1", text: "Click the download button above, no email required." },
              { step: "2", text: "Print it at home or at a local print shop. Standard letter size (8.5\" × 11\") works perfectly." },
              { step: "3", text: "Fill it in with a pen or pencil. There's something about writing it by hand that makes the numbers feel real." },
            ].map(({ step, text }) => (
              <li key={step} className="flex items-start gap-4">
                <span
                  className={cn(
                    "shrink-0 w-8 h-8 rounded-full",
                    "bg-primary text-white font-mono text-sm font-semibold",
                    "flex items-center justify-center mt-0.5"
                  )}
                  aria-hidden
                >
                  {step}
                </span>
                <p className="text-text/85 leading-relaxed pt-1">{text}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ── Related printables ─────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section
          className="py-14 sm:py-16 bg-primary/[0.03]"
          aria-labelledby="related-heading"
        >
          <Container>
            <div className="flex items-baseline justify-between gap-4 mb-8 flex-wrap">
              <h2
                id="related-heading"
                className="font-display text-2xl font-bold text-text"
              >
                More free printables
              </h2>
              <Link
                href="/free-printables"
                className="text-sm text-primary font-medium hover:underline underline-offset-4 shrink-0"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map((p) => (
                <RelatedPrintableCard key={p.id} printable={p} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* ── Audience hub links ─────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 border-t border-black/[0.05]">
        <Container width="narrow">
          <p className="text-sm text-muted text-center mb-6">
            Looking for guides tailored to your situation?
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {siteConfig.audienceSegments.map((seg) => (
              <Link
                key={seg.slug}
                href={`/${seg.slug}`}
                className={cn(
                  "inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium",
                  "border border-primary/20 text-primary bg-white",
                  "transition-colors duration-150 hover:bg-primary hover:text-white hover:border-primary",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                )}
              >
                {seg.label}
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
