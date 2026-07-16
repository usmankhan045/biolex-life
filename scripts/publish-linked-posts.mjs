#!/usr/bin/env node
// Publishes the queued posts that CURRENTLY-published posts link to (the broken
// internal-link targets), regardless of their scheduled date, so those links
// resolve to real articles. Reuses the same insert + printable-upsert logic as
// publish-due-posts.mjs. Idempotent (merge-duplicates). DRY_RUN=1 to preview.
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = join(ROOT, "content-queue");
const SITE_ID = (process.env.SITE_ID || "5a5babff-6213-4f05-b8cb-986aaa2d0b80").trim();
const BASE = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const DRY_RUN = process.env.DRY_RUN === "1";
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const nowISO = new Date().toISOString();

const CATEGORY_ID = {
  "printable-wall-art": "c0e54091-081b-4926-bde8-afdf699b54b6",
  "coloring-pages":     "d23442e1-d88d-4a4a-8a72-2327d68d0f1b",
  "home-organization":  "f4db9438-91e6-40c7-8e71-44d54c18950d",
  "kids-printables":    "41d043b4-a2c5-448b-af8a-3700b8f457ea",
  "meal-planning":      "3f7ec84c-c166-4c8a-9f77-7f9c92758092",
  "printables":         "f4db9438-91e6-40c7-8e71-44d54c18950d",
};
const REQUIRED = ["slug","title","excerpt","quick_answer","content","seo_title","seo_description","faq_items","category"];

async function q(path) {
  const r = await fetch(`${BASE}/rest/v1/${path}`, { headers: H });
  if (!r.ok) throw new Error(`${path} -> ${r.status} ${await r.text()}`);
  return r.json();
}

const posts = await q(`posts?site_id=eq.${SITE_ID}&status=eq.published&select=slug,content`);
const existing = new Set(posts.map((p) => p.slug));
const existingPrintables = new Set((await q(`printables?site_id=eq.${SITE_ID}&select=slug`)).map((p) => p.slug));
const schedule = JSON.parse(await readFile(join(QUEUE, "schedule.json"), "utf8"));
let printables = {};
try { printables = JSON.parse(await readFile(join(QUEUE, "printables.json"), "utf8")); } catch {}
const queuedFiles = new Set((await readdir(join(QUEUE, "articles"))).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, "")));

// Targets = /blog/<slug> links in live posts whose slug is queued but not published.
const linkRe = /\]\((\/blog\/[a-z0-9-]+)\)/gi;
const targets = new Set();
for (const p of posts) {
  for (const m of (p.content || "").matchAll(linkRe)) {
    const slug = m[1].replace("/blog/", "");
    if (!existing.has(slug) && queuedFiles.has(slug)) targets.add(slug);
  }
}
const list = [...targets].sort();
console.log(`Link targets to publish: ${list.length}${DRY_RUN ? " [DRY RUN]" : ""}`);

async function ensurePrintable(pslug) {
  if (!pslug || existingPrintables.has(pslug) || !printables[pslug]) return;
  const p = printables[pslug];
  const prow = { site_id: SITE_ID, slug: pslug, title: p.title, description: p.description,
    file_url: p.file_url, thumbnail_url: p.thumbnail_url ?? null,
    category_id: CATEGORY_ID[p.category] || CATEGORY_ID.printables, orientation: p.orientation || "portrait" };
  if (DRY_RUN) { console.log(`  would create printable ${pslug}`); existingPrintables.add(pslug); return; }
  const r = await fetch(`${BASE}/rest/v1/printables?on_conflict=site_id,slug`, {
    method: "POST", headers: { ...H, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify([prow]) });
  if (r.ok) { console.log(`  + printable ${pslug}`); existingPrintables.add(pslug); }
  else console.error(`  printable ${pslug} failed: ${r.status} ${(await r.text()).slice(0,150)}`);
}

let published = 0; const errors = [];
for (const slug of list) {
  let a;
  try { a = JSON.parse(await readFile(join(QUEUE, "articles", `${slug}.json`), "utf8")); }
  catch (e) { errors.push([slug, `read: ${e.message}`]); continue; }
  const miss = REQUIRED.filter((k) => !a[k]);
  if (miss.length) { errors.push([slug, `missing ${miss}`]); continue; }
  const catId = CATEGORY_ID[a.category];
  if (!catId) { errors.push([slug, `unknown category ${a.category}`]); continue; }
  const sched = schedule[slug];
  const publishedAt = sched && Date.parse(sched) <= Date.now() ? sched : nowISO;
  const row = { site_id: SITE_ID, slug, title: a.title, excerpt: a.excerpt, content: a.content,
    quick_answer: a.quick_answer, category_id: catId,
    audience_tags: Array.isArray(a.audience_tags) ? a.audience_tags : [], status: "published",
    seo_title: a.seo_title, seo_description: a.seo_description,
    faq_items: (a.faq_items || []).map((x) => ({ question: x.question || "", answer: x.answer || "" })),
    featured_image_url: a.featured_image_url ?? null, published_at: publishedAt };
  if (DRY_RUN) { console.log(`would publish ${slug} (${publishedAt})`); await ensurePrintable(a.printable); for (const px of (a.printable_extra||[])) await ensurePrintable(px); published++; continue; }
  const res = await fetch(`${BASE}/rest/v1/posts?on_conflict=site_id,slug`, {
    method: "POST", headers: { ...H, "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify([row]) });
  if (!res.ok) { errors.push([slug, `${res.status} ${(await res.text()).slice(0,200)}`]); continue; }
  console.log(`published ${slug} (${publishedAt})`);
  await ensurePrintable(a.printable);
  for (const px of (a.printable_extra||[])) await ensurePrintable(px);
  published++;
}
console.log(`\nDONE: ${published} published${DRY_RUN ? " (dry run)" : ""}`);
if (errors.length) { console.error("ERRORS:"); for (const [s,m] of errors) console.error(`  ${s} -> ${m}`); process.exit(1); }
