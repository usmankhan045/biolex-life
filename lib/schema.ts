import { siteConfig } from "./site.config";
import type { Post, FaqItem } from "./queries";

const BASE_URL = `https://${siteConfig.domain}`;

// Stable @id anchors so Google/LLMs can merge these into single entities
// across every page instead of re-declaring them inline each time.
const ORG_ID = `${BASE_URL}/#organization`;
const PERSON_ID = `${BASE_URL}/about#person`;
const LOGO_URL = `${BASE_URL}/logo.png`;
const OG_DEFAULT = `${BASE_URL}/og-default.jpg`;

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: siteConfig.name,
    url: BASE_URL,
    description: siteConfig.tagline,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/blog?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: siteConfig.name,
    alternateName: "Spend Wise Cents",
    url: BASE_URL,
    description: siteConfig.niche,
    slogan: siteConfig.tagline,
    foundingDate: String(siteConfig.brand.foundedYear),
    logo: {
      "@type": "ImageObject",
      url: LOGO_URL,
      width: 512,
      height: 512,
    },
    image: OG_DEFAULT,
    founder: { "@id": PERSON_ID },
    email: siteConfig.contact.email,
    knowsAbout: [
      "Personal finance",
      "Budgeting",
      "Debt payoff",
      "Saving money",
      "Frugal living",
      "Paycheck-to-paycheck budgeting",
    ],
    areaServed: { "@type": "Country", name: "United States" },
    audience: {
      "@type": "Audience",
      audienceType: "People managing money on a real, often tight, budget",
    },
    publishingPrinciples: `${BASE_URL}/editorial-policy`,
    sameAs: [siteConfig.social.pinterest],
  };
}

/** The named human behind the site — E-E-A-T anchor for YMYL money content. */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: siteConfig.author.name,
    url: `${BASE_URL}${siteConfig.author.url}`,
    image: `${BASE_URL}${siteConfig.author.photo}`,
    jobTitle: siteConfig.author.role,
    description: siteConfig.author.shortBio,
    worksFor: { "@id": ORG_ID },
    knowsAbout: [
      "Personal finance",
      "Budgeting",
      "Debt payoff",
      "Saving money",
      "Paycheck-to-paycheck budgeting",
    ],
    ...(siteConfig.author.sameAs.length > 0 && {
      sameAs: [...siteConfig.author.sameAs],
    }),
  };
}

export function articleSchema(post: Post) {
  const url = `${BASE_URL}/blog/${post.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
    url,
    // Always emit an ABSOLUTE image URL — fall back to the branded OG default
    // when a post has no featured image (Discover/rich-result eligibility).
    image: post.featured_image_url
      ? post.featured_image_url.startsWith("http")
        ? post.featured_image_url
        : `${BASE_URL}${post.featured_image_url}`
      : OG_DEFAULT,
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at,
    author: { "@id": PERSON_ID },
    publisher: { "@id": ORG_ID },
    // Reference the WebSite node (defined on every page) rather than the Blog
    // node (only defined on /blog) so the on-page graph has no dangling @id.
    isPartOf: { "@id": `${BASE_URL}/#website` },
    inLanguage: "en-US",
    // Voice/AI extraction: point speakable at the H1 and the Quick Answer block.
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["#post-title", ".swc-quick-answer"],
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export function faqSchema(faqItems: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

/** Blog listing entity for /blog. */
export function blogSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${BASE_URL}/blog#blog`,
    name: `${siteConfig.name} Blog`,
    url: `${BASE_URL}/blog`,
    description:
      "Practical budgeting guides, honest money advice, and real-life strategies for every financial situation.",
    publisher: { "@id": ORG_ID },
    inLanguage: "en-US",
  };
}

/** AboutPage entity for /about, pointing at the Organization + its founder. */
export function aboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${BASE_URL}/about#aboutpage`,
    url: `${BASE_URL}/about`,
    name: `About ${siteConfig.name}`,
    description: `The story behind ${siteConfig.name}: who we are, who this site is for, and why we built it.`,
    mainEntity: { "@id": ORG_ID },
  };
}

/** Topical collection entity for audience hub pages. */
export function collectionPageSchema(params: {
  name: string;
  description: string;
  slug: string;
}) {
  const url = `${BASE_URL}/${params.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collectionpage`,
    url,
    name: params.name,
    description: params.description,
    isPartOf: { "@id": `${BASE_URL}/#website` },
    about: { "@id": ORG_ID },
  };
}

export function digitalDocumentSchema(printable: {
  slug: string;
  title: string;
  description: string | null;
  file_url?: string | null;
  thumbnail_url?: string | null;
}) {
  const url = `${BASE_URL}/free-printables/${printable.slug}`;
  const absolutize = (u: string) => (u.startsWith("http") ? u : `${BASE_URL}${u}`);
  const fileUrl = printable.file_url ? absolutize(printable.file_url) : undefined;
  const thumbUrl = printable.thumbnail_url ? absolutize(printable.thumbnail_url) : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "DigitalDocument",
    name: printable.title,
    ...(printable.description && { description: printable.description }),
    url,
    isAccessibleForFree: true,
    ...(fileUrl && { contentUrl: fileUrl, encodingFormat: "application/pdf" }),
    ...(thumbUrl && { thumbnailUrl: thumbUrl }),
    publisher: { "@id": ORG_ID },
  };
}

/** ContactPage entity for /contact. */
export function contactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${BASE_URL}/contact#contactpage`,
    url: `${BASE_URL}/contact`,
    name: `Contact ${siteConfig.name}`,
    description: `Get in touch with ${siteConfig.name}. Questions, feedback, topic ideas, or collaboration.`,
    isPartOf: { "@id": `${BASE_URL}/#website` },
    about: { "@id": ORG_ID },
  };
}

/** ProfilePage entity for the author archive page — E-E-A-T authority signal. */
export function profilePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${BASE_URL}${siteConfig.author.url}#profilepage`,
    url: `${BASE_URL}${siteConfig.author.url}`,
    name: `${siteConfig.author.name} — ${siteConfig.author.role}, ${siteConfig.name}`,
    description: siteConfig.author.shortBio,
    mainEntity: { "@id": PERSON_ID },
    isPartOf: { "@id": `${BASE_URL}/#website` },
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; slug: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.slug}`,
    })),
  };
}
