#!/usr/bin/env node
// Regenerates public/llms.txt and public/llms-full.txt from the live DB.
//
// The hand-written llms.txt listed only hub pages, so a model reading it learned
// the site had five pillars and nothing about the 200+ guides that actually
// exist. This indexes the real corpus:
//
//   llms.txt       hub pages + the top N posts/printables per category
//   llms-full.txt  every published post as "title, quick answer, url"
//
// The preamble/licensing prose is preserved verbatim from the existing file, so
// editorial copy stays hand-owned and only the indexes are generated.
//
// Usage: node scripts/build-llms-txt.mjs [--per-category=12]
// Env:   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import fs from "node:fs";
import path from "node:path";
import { deDash } from "./lib-dedash.mjs";

const SITE_ID = (
  process.env.SITE_ID || "5a5babff-6213-4f05-b8cb-986aaa2d0b80"
).trim();
const SB = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const SK = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const BASE = "https://www.biolexlife.com";
const ROOT = path.resolve(import.meta.dirname, "..");

const perCatArg = process.argv.find((a) => a.startsWith("--per-category="));
const PER_CATEGORY = perCatArg ? Number(perCatArg.split("=")[1]) : 12;

if (!SB || !SK) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(2);
}
const H = { apikey: SK, Authorization: `Bearer ${SK}` };
const q = async (p) => {
  const r = await fetch(`${SB}/rest/v1/${p}`, { headers: H });
  if (!r.ok) throw new Error(`${p} -> ${r.status}`);
  return r.json();
};

const [posts, printables, categories] = await Promise.all([
  q(
    `posts?site_id=eq.${SITE_ID}&status=eq.published&select=slug,title,quick_answer,published_at,categories(slug,name)&order=published_at.desc`
  ),
  q(
    `printables?site_id=eq.${SITE_ID}&select=slug,title,description,categories(slug,name)&order=created_at.desc`
  ),
  q(`categories?site_id=eq.${SITE_ID}&select=slug,name,description`),
]);

// Keep everything above "## Blog" from the existing file: that is hand-written
// positioning copy, not generated index content.
const existing = fs.readFileSync(path.join(ROOT, "public/llms.txt"), "utf8");
const preamble = existing.split("\n## Blog")[0].trimEnd();
// Keep the trailing hand-written sections too (About, Usage & Licensing).
const aboutIdx = existing.indexOf("\n## About");
const tail = aboutIdx === -1 ? "" : existing.slice(aboutIdx).trimEnd();

const oneLine = (s) =>
  deDash(String(s || "").replace(/\s+/g, " ").trim());
const clip = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "...");

const byCat = new Map(categories.map((c) => [c.slug, []]));
for (const p of posts) {
  const k = p.categories?.slug;
  if (k && byCat.has(k)) byCat.get(k).push(p);
}
const prByCat = new Map(categories.map((c) => [c.slug, []]));
for (const p of printables) {
  const k = p.categories?.slug;
  if (k && prByCat.has(k)) prByCat.get(k).push(p);
}

let out = preamble + "\n";

out += `\n## Blog\n\n`;
out += `${posts.length} published guides. Full archive: [All Posts](/blog)\n`;
for (const c of categories) {
  const list = byCat.get(c.slug) ?? [];
  if (!list.length) continue;
  out += `\n### ${c.name} (${list.length} guides)\n\n`;
  out += `Category index: [/category/${c.slug}](/category/${c.slug})\n\n`;
  for (const p of list.slice(0, PER_CATEGORY)) {
    const summary = clip(oneLine(p.quick_answer), 170);
    out += `- [${oneLine(p.title)}](/blog/${p.slug}): ${summary}\n`;
  }
  if (list.length > PER_CATEGORY) {
    out += `- ...and ${list.length - PER_CATEGORY} more in [${c.name}](/category/${c.slug})\n`;
  }
}

out += `\n## Free Printables\n\n`;
out += `${printables.length} downloadable PDFs, all US Letter (8.5" x 11"), free, no sign-up. Full library: [Free Printables](/free-printables)\n`;
for (const c of categories) {
  const list = prByCat.get(c.slug) ?? [];
  if (!list.length) continue;
  out += `\n### ${c.name} printables (${list.length})\n\n`;
  for (const p of list.slice(0, PER_CATEGORY)) {
    const summary = clip(oneLine(p.description), 150);
    out += `- [${oneLine(p.title)}](/free-printables/${p.slug}): ${summary}\n`;
  }
  if (list.length > PER_CATEGORY) {
    out += `- ...and ${list.length - PER_CATEGORY} more\n`;
  }
}

if (tail) out += `\n${tail}\n`;
out = out.replace(/\n{3,}/g, "\n\n");
fs.writeFileSync(path.join(ROOT, "public/llms.txt"), out);

// llms-full.txt: the whole corpus as quotable answer capsules.
let full = `# Biolex, full content index\n\n`;
full += `> Every published guide on ${BASE} as "title, quick answer, url".\n`;
full += `> ${posts.length} guides and ${printables.length} free printable PDFs.\n`;
full += `> Attribution required when citing: Biolex (${BASE}). License: ${BASE}/rsl.xml\n\n`;
for (const c of categories) {
  const list = byCat.get(c.slug) ?? [];
  if (!list.length) continue;
  full += `\n## ${c.name}\n\n`;
  for (const p of list) {
    full += `### ${oneLine(p.title)}\n`;
    full += `${BASE}/blog/${p.slug}\n`;
    if (p.quick_answer) full += `${oneLine(p.quick_answer)}\n`;
    full += `\n`;
  }
}
full += `\n## Free printables\n\n`;
for (const p of printables) {
  full += `### ${oneLine(p.title)}\n${BASE}/free-printables/${p.slug}\n`;
  if (p.description) full += `${oneLine(p.description)}\n`;
  full += `\n`;
}
fs.writeFileSync(path.join(ROOT, "public/llms-full.txt"), full);

const kb = (s) => (s.length / 1024).toFixed(1);
console.log(
  `llms.txt      ${posts.length} posts, ${printables.length} printables indexed (${kb(out)} KB)\n` +
    `llms-full.txt full corpus (${kb(full)} KB)`
);
