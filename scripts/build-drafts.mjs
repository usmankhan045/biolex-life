#!/usr/bin/env node
// Merges agent-written drafts into publishable article JSON for the drip queue.
// Each post is authored as TWO files (robust for parallel LLM writers):
//   content-queue/drafts/<slug>.meta.json  — metadata (no big content blob)
//   content-queue/drafts/<slug>.body.md    — the markdown body (with {{printable:}} + links)
// This script combines them into content-queue/articles/<slug>.json.
//
//   node scripts/build-drafts.mjs           # build all drafts
//   node scripts/build-drafts.mjs <slug>    # build one
//
// meta.json shape:
//   { title, excerpt, quick_answer, seo_title, seo_description,
//     audience_tags:[], category, printable, cover:{eyebrow,badge},
//     faq_items:[{question,answer}] }

import { readFile, readdir, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { cleanValue } from "./lib-dedash.mjs";
import { cleanBrand } from "./lib-brand.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRAFTS = join(ROOT, "content-queue", "drafts");
const ARTICLES = join(ROOT, "content-queue", "articles");

const REQUIRED = ["title","excerpt","quick_answer","seo_title","seo_description","category","printable","faq_items"];

async function buildOne(slug) {
  const meta = JSON.parse(await readFile(join(DRAFTS, `${slug}.meta.json`), "utf8"));
  const body = (await readFile(join(DRAFTS, `${slug}.body.md`), "utf8")).trim();

  const miss = REQUIRED.filter((k) => meta[k] == null || (Array.isArray(meta[k]) && !meta[k].length && k==="faq_items"));
  if (miss.length) throw new Error(`${slug}: missing ${miss.join(", ")}`);
  if (!body.includes(`{{printable:${meta.printable}}}`)) throw new Error(`${slug}: body missing {{printable:${meta.printable}}}`);
  const wc = body.split(/\s+/).length;
  if (wc < 900) throw new Error(`${slug}: body too short (${wc} words)`);

  const article = {
    slug,
    title: meta.title,
    excerpt: meta.excerpt,
    quick_answer: meta.quick_answer,
    content: body,
    seo_title: meta.seo_title,
    seo_description: meta.seo_description,
    audience_tags: Array.isArray(meta.audience_tags) ? meta.audience_tags : [],
    category: meta.category,
    featured_image_url: `/covers/${slug}.png`,
    printable: meta.printable,
    printable_extra: meta.printable_extra || undefined,
    cover: meta.cover || undefined,
    faq_items: meta.faq_items.map((f) => ({ question: f.question, answer: f.answer })),
  };
  await mkdir(ARTICLES, { recursive: true });
  // House rules: never ship em/en dashes (an AI tell), and always use the
  // current brand (Biolex). Both are auto-corrected on build.
  await writeFile(join(ARTICLES, `${slug}.json`), JSON.stringify(cleanBrand(cleanValue(article)), null, 2) + "\n");
  return { slug, words: wc, faqs: article.faq_items.length };
}

async function main() {
  const one = process.argv[2];
  let slugs;
  if (one) slugs = [one];
  else slugs = [...new Set((await readdir(DRAFTS)).filter((f)=>f.endsWith(".meta.json")).map((f)=>f.replace(/\.meta\.json$/,"")))];

  const ok = [], err = [];
  for (const slug of slugs) {
    try { ok.push(await buildOne(slug)); }
    catch (e) { err.push([slug, e.message]); }
  }
  for (const r of ok) console.log(`✓ ${r.slug} (${r.words}w, ${r.faqs} FAQ)`);
  if (err.length) { console.error("\nERRORS:"); for (const [s,m] of err) console.error(`  ✗ ${s}: ${m}`); }
  console.log(`\nBuilt ${ok.length}/${slugs.length} articles`);
  if (err.length) process.exit(1);
}
main().catch((e)=>{ console.error(e); process.exit(1); });
