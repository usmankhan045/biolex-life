#!/usr/bin/env node
// READ-ONLY diagnostic: find internal links in published post content that point
// to slugs which are not live (404). Also reports whether each broken /blog
// target exists in the content-queue (i.e. is merely scheduled, not yet published).
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = join(ROOT, "content-queue");
const SITE_ID = (process.env.SITE_ID || "5a5babff-6213-4f05-b8cb-986aaa2d0b80").trim();
const BASE = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function q(path) {
  const r = await fetch(`${BASE}/rest/v1/${path}`, { headers: H });
  if (!r.ok) throw new Error(`${path} -> ${r.status} ${await r.text()}`);
  return r.json();
}

const posts = await q(`posts?site_id=eq.${SITE_ID}&status=eq.published&select=slug,title,content,category_id`);
const printables = await q(`printables?site_id=eq.${SITE_ID}&select=slug`);
const categories = await q(`categories?site_id=eq.${SITE_ID}&select=slug`);

const livePosts = new Set(posts.map((p) => p.slug));
const livePrintables = new Set(printables.map((p) => p.slug));
const liveCats = new Set(categories.map((c) => c.slug));

// What slugs exist in the content queue (scheduled, may not be published yet)
let queued = new Set();
try {
  const files = await readdir(join(QUEUE, "articles"));
  queued = new Set(files.filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")));
} catch {}

const linkRe = /\]\((\/(?:blog|free-printables|category)\/[a-z0-9-]+)\)/gi;
let totalLinks = 0;
const broken = [];
for (const p of posts) {
  const seen = new Set();
  for (const m of (p.content || "").matchAll(linkRe)) {
    const href = m[1];
    if (seen.has(href)) continue;
    seen.add(href);
    totalLinks++;
    const [, kind, slug] = href.match(/^\/(blog|free-printables|category)\/([a-z0-9-]+)$/);
    const live =
      kind === "blog" ? livePosts.has(slug)
      : kind === "free-printables" ? livePrintables.has(slug)
      : liveCats.has(slug);
    if (!live) broken.push({ from: p.slug, href, kind, slug, inQueue: queued.has(slug) });
  }
}

console.log(`Published posts: ${posts.length} | live printables: ${livePrintables.size} | categories: ${liveCats.size}`);
console.log(`Total internal links: ${totalLinks} | BROKEN: ${broken.length}\n`);
const byKind = broken.reduce((a, b) => ((a[b.kind] = (a[b.kind] || 0) + 1), a), {});
console.log("Broken by kind:", byKind);
console.log(`Broken /blog targets that DO exist in content-queue (schedulable): ${broken.filter((b) => b.kind === "blog" && b.inQueue).length}`);
console.log(`Broken /blog targets NOT in queue (must remap): ${broken.filter((b) => b.kind === "blog" && !b.inQueue).length}\n`);
console.log("Sample (first 25):");
for (const b of broken.slice(0, 25)) console.log(`  ${b.from}  ->  ${b.href}  ${b.inQueue ? "[in-queue]" : "[NOT-in-queue]"}`);

// posts with < 2 live internal /blog links (fails the >=2 internal link rule)
const liveBlogLinksPerPost = {};
for (const p of posts) {
  const seen = new Set();
  let n = 0;
  for (const m of (p.content || "").matchAll(linkRe)) {
    const href = m[1];
    if (seen.has(href)) continue; seen.add(href);
    const mm = href.match(/^\/blog\/([a-z0-9-]+)$/);
    if (mm && livePosts.has(mm[1]) && mm[1] !== p.slug) n++;
  }
  liveBlogLinksPerPost[p.slug] = n;
}
const weak = Object.entries(liveBlogLinksPerPost).filter(([, n]) => n < 2);
console.log(`\nPosts with < 2 live internal blog links: ${weak.length}/${posts.length}`);
for (const [s, n] of weak) console.log(`  ${s}: ${n}`);
