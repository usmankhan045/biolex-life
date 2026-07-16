#!/usr/bin/env node
// Rewrites any still-broken internal /blog/<slug> links in published posts to the
// best LIVE post: same category first, ranked by slug-token overlap; falls back to
// the source post's category archive page. Guarantees zero broken internal links.
// DRY_RUN=1 to preview the remaps without writing.
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const SITE_ID = (process.env.SITE_ID || "5a5babff-6213-4f05-b8cb-986aaa2d0b80").trim();
const BASE = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const DRY_RUN = process.env.DRY_RUN === "1";
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

async function q(path) {
  const r = await fetch(`${BASE}/rest/v1/${path}`, { headers: H });
  if (!r.ok) throw new Error(`${path} -> ${r.status} ${await r.text()}`);
  return r.json();
}

const posts = await q(`posts?site_id=eq.${SITE_ID}&status=eq.published&select=id,slug,content,category_id`);
const cats = await q(`categories?site_id=eq.${SITE_ID}&select=id,slug`);
const catSlugById = Object.fromEntries(cats.map((c) => [c.id, c.slug]));
const live = new Set(posts.map((p) => p.slug));

const STOP = new Set(["printable","printables","pages","page","for","the","and","a","to","of","ideas","tips","guide","free","your","how","best"]);
const toks = (s) => new Set(s.split("-").filter((t) => t && !STOP.has(t)));
const overlap = (a, b) => { const A = toks(a), B = toks(b); let n = 0; for (const t of A) if (B.has(t)) n++; return n; };

function bestReplacement(brokenSlug, srcPost) {
  let best = null, bestScore = -1;
  for (const c of posts) {
    if (c.slug === srcPost.slug) continue;
    let score = overlap(brokenSlug, c.slug);
    if (c.category_id && c.category_id === srcPost.category_id) score += 0.5; // prefer same category
    if (score > bestScore) { bestScore = score; best = c; }
  }
  // Require at least one shared meaningful token; else fall back to category page.
  if (best && bestScore >= 1) return `/blog/${best.slug}`;
  const catSlug = catSlugById[srcPost.category_id];
  return catSlug ? `/category/${catSlug}` : "/blog";
}

const linkRe = /\/blog\/[a-z0-9-]+/g;
let changedPosts = 0, changedLinks = 0;
for (const p of posts) {
  let content = p.content || "";
  const replacements = [];
  content = content.replace(linkRe, (href) => {
    const slug = href.replace("/blog/", "");
    if (live.has(slug)) return href;                 // already valid
    const repl = bestReplacement(slug, p);
    replacements.push([href, repl]);
    return repl;
  });
  if (replacements.length === 0) continue;
  changedPosts++; changedLinks += replacements.length;
  console.log(`\n${p.slug}:`);
  for (const [from, to] of replacements) console.log(`  ${from}  ->  ${to}`);
  if (DRY_RUN) continue;
  const res = await fetch(`${BASE}/rest/v1/posts?id=eq.${p.id}`, {
    method: "PATCH",
    headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) { console.error(`  UPDATE FAILED ${p.slug}: ${res.status} ${(await res.text()).slice(0,150)}`); process.exit(1); }
}
console.log(`\n${DRY_RUN ? "[DRY RUN] " : ""}Remapped ${changedLinks} links across ${changedPosts} posts.`);
