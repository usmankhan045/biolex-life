# Multi-Site Content Template

A reusable, multi-tenant blog + printables starter built with
[Next.js](https://nextjs.org) (App Router). One shared Supabase database and
admin API power many independent sites; each site supplies its own theme,
identity, and content.

**Stack:** Next.js 16 · Tailwind CSS 4 · Supabase (PostgreSQL) · WeasyPrint
(HTML → PDF for printable downloads).

> **Building a new site from this template?** This repo is a multi-site
> template (shared Supabase DB + admin API; per-site theme, content, and a
> `features.printables` toggle for blog-only vs. blog+printables sites). See
> **[docs/NEW_SITE_GUIDE.md](docs/NEW_SITE_GUIDE.md)** for the full spin-up
> runbook, and `docs/templates/new-site-seed.sql` for the DB seed.

## What's in the box

- **Blog engine**, posts, categories, audience-segment hub pages, FAQ schema,
 and answer-first content fields (`quick_answer`, `faq_items`).
- **Optional printables**, WeasyPrint-generated PDF worksheets, gated behind a
 per-site `features.printables` flag.
- **Admin API**, bearer-token CRUD for posts, pages, categories, printables,
 media uploads, and subscribers across every site. See
 [docs/admin-api.md](docs/admin-api.md).
- **Per-site config**, brand, theme, nav, and audience segments all live in
 `lib/site.config.ts`; nothing site-specific is hardcoded in components.
- **SEO / AEO / GEO**, metadata, JSON-LD, sitemap, robots, and `llms.txt`
 wired up out of the box. See [docs/seo-aeo-geo-checklist.md](docs/seo-aeo-geo-checklist.md).

## Getting Started

First, copy `.env.local.example` to `.env.local` and fill in the Supabase and
admin credentials. Then run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Key docs

- [docs/NEW_SITE_GUIDE.md](docs/NEW_SITE_GUIDE.md), spin up a new site from this template.
- [docs/admin-api.md](docs/admin-api.md), admin API reference.
- [docs/content-guidelines.md](docs/content-guidelines.md), content and writing standards.
- [docs/seo-aeo-geo-checklist.md](docs/seo-aeo-geo-checklist.md), SEO/AEO/GEO checklist.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
