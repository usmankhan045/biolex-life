import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getPublishedPosts, getPublishedPostCount } from "@/lib/queries";
import {
  Container,
  Tag,
  Card,
  CardTitle,
  CardBody,
  SectionDivider,
} from "@/components/ui";
import { JsonLd } from "@/components/JsonLd";
import { blogSchema, breadcrumbSchema, itemListSchema } from "@/lib/schema";
import { ogImages, twitterImages } from "@/lib/metadata";
import { cn } from "@/lib/utils";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const BLOG_DESCRIPTION =
  "Practical printable guides: how to print wall art sharp, frame it, use planners and organizers, and get the most from every free download.";

// Metadata must be generated per request, not exported statically: a static
// object cannot vary by searchParams, so every `?page=N` variant would inherit
// the page-1 canonical and Google would discount the whole pagination chain
// (and with it the only crawl path to posts past each category's cap).
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { page: pageParam, q: qParam } = await searchParams;
  const search = (typeof qParam === "string" ? qParam : "").trim();
  const currentPage = Math.max(
    1,
    parseInt(typeof pageParam === "string" ? pageParam : "1", 10) || 1
  );

  // Search results are a user-specific view, not a landing page: keep them out
  // of the index but let crawlers follow through to the posts themselves.
  if (search) {
    return {
      title: `Search: ${search}`,
      description: BLOG_DESCRIPTION,
      robots: { index: false, follow: true },
      alternates: { canonical: "/blog" },
    };
  }

  // Page 2+ canonicalizes to itself so its links keep their discovery value.
  const canonical = currentPage > 1 ? `/blog?page=${currentPage}` : "/blog";
  const title = currentPage > 1 ? `Blog, page ${currentPage}` : "Blog";

  return {
    title,
    description: BLOG_DESCRIPTION,
    alternates: { canonical },
    openGraph: {
      title,
      description: BLOG_DESCRIPTION,
      url: canonical,
      type: "website",
      images: ogImages(),
    },
    twitter: twitterImages(),
  };
}

export const revalidate = 3600;

const POSTS_PER_PAGE = 12;

export default async function BlogIndexPage({ searchParams }: Props) {
  const { page: pageParam, q: qParam } = await searchParams;
  const search = (typeof qParam === "string" ? qParam : "").trim();
  const currentPage = Math.max(
    1,
    parseInt(typeof pageParam === "string" ? pageParam : "1", 10) || 1
  );
  const offset = (currentPage - 1) * POSTS_PER_PAGE;

  let posts: Awaited<ReturnType<typeof getPublishedPosts>> = [];
  let total = 0;
  try {
    if (search) {
      // Search mode: return matches (no pagination), skip the count query.
      posts = await getPublishedPosts({ search, limit: 50 });
      total = posts.length;
    } else {
      [posts, total] = await Promise.all([
        getPublishedPosts({ limit: POSTS_PER_PAGE, offset }),
        getPublishedPostCount(),
      ]);
    }
  } catch {
    // DB not yet configured, show empty state
  }

  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const canonicalPath = currentPage > 1 ? `/blog?page=${currentPage}` : "/blog";

  return (
    <main className="flex-1">
      <JsonLd data={[
        blogSchema(),
        breadcrumbSchema([
          { name: "Home", slug: "/" },
          { name: "Blog", slug: "/blog" },
        ]),
        // Declare what this page actually indexes, with positions continuing
        // across pages so pagination reads as one ordered list.
        ...(posts.length
          ? [
              itemListSchema({
                id: search ? "/blog" : canonicalPath,
                startPosition: search ? 1 : offset + 1,
                items: posts.map((p) => ({
                  url: `/blog/${p.slug}`,
                  name: p.title,
                })),
              }),
            ]
          : []),
      ]} />
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <section
        className="bg-gradient-to-b from-primary/[0.07] via-primary/[0.03] to-background pt-10 pb-10"
        aria-labelledby="blog-heading"
      >
        <Container>
          <Tag variant="primary" className="mb-5">
            Blog
          </Tag>
          <h1
            id="blog-heading"
            className="font-display text-4xl sm:text-5xl font-bold text-text leading-tight mb-5"
          >
            Practical guides.
            <br className="hidden sm:block" />
            No filler.
          </h1>
          <p className="text-lg text-muted leading-relaxed max-w-xl mb-6">
            Printing tips, framing and styling guides, and how-to walkthroughs
            for every free printable, written for real home printers, not ideal
            studio setups.
          </p>

          {/* Search, makes the WebSite SearchAction schema functional */}
          <form action="/blog" method="get" role="search" className="flex gap-2 max-w-md">
            <label htmlFor="blog-search" className="sr-only">Search guides</label>
            <input
              id="blog-search"
              type="search"
              name="q"
              defaultValue={search}
              placeholder="Search guides…"
              className="w-full min-w-0 rounded-lg text-sm h-11 px-3.5 bg-white border border-black/15 text-text placeholder:text-muted/60 focus:outline-2 focus:outline-offset-0 focus:outline-primary"
            />
            <button
              type="submit"
              className="shrink-0 h-11 px-5 rounded-lg bg-primary text-white font-medium text-sm hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Search
            </button>
          </form>
        </Container>
      </section>

      {/* ── Post grid ──────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-14">
        <Container>
          {search && (
            <p className="text-sm text-muted mb-6">
              {posts.length > 0
                ? `${posts.length} ${posts.length === 1 ? "result" : "results"} for `
                : "No results for "}
              <span className="font-medium text-text">&ldquo;{search}&rdquo;</span>
              {" · "}
              <Link href="/blog" className="text-primary hover:underline underline-offset-4">
                Clear search
              </Link>
            </p>
          )}
          {posts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-display text-xl font-semibold text-text mb-2">
                {search ? "No matching guides" : "No posts yet"}
              </p>
              <p className="text-muted text-sm">
                {search
                  ? "Try a different search term, or browse all guides."
                  : "Content is coming soon. Check back shortly."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className="group block h-full focus-visible:outline-none"
                  >
                    <Card
                      className={cn(
                        "h-full flex flex-col overflow-hidden",
                        "transition duration-200",
                        "group-hover:shadow-md group-hover:-translate-y-0.5",
                        "group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2"
                      )}
                    >
                      {post.featured_image_url && (
                        <div className="relative -mt-6 -mx-6 mb-4 aspect-[16/9] overflow-hidden bg-primary/[0.05]">
                          <Image
                            src={post.featured_image_url}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      {post.categories && (
                        <Tag variant="default" className="mb-3 self-start">
                          {post.categories.name}
                        </Tag>
                      )}
                      <CardTitle
                        as="h2"
                        className="text-base leading-snug mb-2 line-clamp-3 group-hover:text-primary transition-colors"
                      >
                        {post.title}
                      </CardTitle>
                      {post.excerpt && (
                        <CardBody className="flex-1 line-clamp-3 text-sm">
                          {post.excerpt}
                        </CardBody>
                      )}
                      {post.published_at && (
                        <p className="mt-4 text-xs font-mono text-muted/60 uppercase tracking-wide">
                          {new Date(post.published_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                      )}
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {!search && totalPages > 1 && (
                <>
                  <SectionDivider spacing="md" />
                  <div className="flex items-center justify-between">
                    {hasPrev ? (
                      <Link
                        href={`/blog?page=${currentPage - 1}`}
                        className="text-sm font-medium text-primary hover:underline underline-offset-4"
                      >
                        ← Previous
                      </Link>
                    ) : (
                      <span />
                    )}
                    <p className="text-xs font-mono text-muted uppercase tracking-wide text-center">
                      Page {currentPage} of {totalPages}
                      <span className="mx-1.5 text-muted/40" aria-hidden>·</span>
                      {total} {total === 1 ? "post" : "posts"}
                    </p>
                    {hasNext ? (
                      <Link
                        href={`/blog?page=${currentPage + 1}`}
                        className="text-sm font-medium text-primary hover:underline underline-offset-4"
                      >
                        Next →
                      </Link>
                    ) : (
                      <span />
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </Container>
      </section>
    </main>
  );
}
