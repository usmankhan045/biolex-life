#!/usr/bin/env node
// Publishes scheduled blog posts that are "due" (scheduled time has passed) and
// not already in the database. Idempotent: safe to run repeatedly (the DB is the
// source of truth for what's already published). Driven by a GitHub Actions cron.
//
// Env:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (required — GitHub repo secrets)
//   DRY_RUN=1        optional — log what would publish, insert nothing
//   MAX_PER_RUN=12   optional — safety cap on inserts per run (default 12)
//
// Content queue (committed to the repo):
//   content-queue/schedule.json          { "<slug>": "2026-07-14T13:00:00Z", ... }
//   content-queue/articles/<slug>.json   { slug,title,excerpt,quick_answer,content,
//                                          seo_title,seo_description,audience_tags,
//                                          faq_items,category }

import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = join(ROOT, "content-queue");

// The tenant this publisher writes to. Set SITE_ID via env, or replace the
// placeholder default below with this site's real UUID (from the `sites` table).
const SITE_ID = (process.env.SITE_ID || "00000000-0000-0000-0000-000000000000").trim();

// Map each category slug used in the content queue to this site's category
// UUID (from the `categories` table). Provide it as a JSON object in the
// CATEGORY_ID env var, or hardcode your site's mapping here.
//   e.g. CATEGORY_ID='{"category-one":"<uuid>","category-two":"<uuid>"}'
const CATEGORY_ID = JSON.parse(process.env.CATEGORY_ID || "{}");

// Normalize the URL defensively: trim whitespace/newlines, add https:// if the
// scheme was omitted, and strip any trailing slash. A malformed SUPABASE_URL
// secret (missing scheme is the classic one) otherwise throws "Invalid URL".
function normalizeUrl(raw) {
  let u = (raw || "").trim().replace(/\/+$/, "");
  if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
  return u;
}
const BASE = normalizeUrl(process.env.SUPABASE_URL);
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const DRY_RUN = process.env.DRY_RUN === "1";
const MAX_PER_RUN = Number(process.env.MAX_PER_RUN || 12);

if (!BASE || !KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
try { new URL(BASE); } catch {
  console.error(`SUPABASE_URL is not a valid URL after normalization: "${BASE}". ` +
    `It should look like https://<project-ref>.supabase.co`);
  process.exit(1);
}

const REQUIRED = ["slug","title","excerpt","quick_answer","content","seo_title","seo_description","faq_items","category"];

async function main() {
  const schedule = JSON.parse(await readFile(join(QUEUE, "schedule.json"), "utf8"));
  const now = Date.now();

  // slugs already in the DB (any status) — never re-insert
  const existingRes = await fetch(
    `${BASE}/rest/v1/posts?site_id=eq.${SITE_ID}&select=slug`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
  );
  if (!existingRes.ok) throw new Error(`fetch existing failed: ${existingRes.status} ${await existingRes.text()}`);
  const existing = new Set((await existingRes.json()).map((r) => r.slug));

  // Printable library manifest (new printables that don't exist in the DB yet).
  // Each post's printable is upserted when that post first publishes, so the
  // free-printables pages appear in lockstep with the posts that link them.
  let printables = {};
  try { printables = JSON.parse(await readFile(join(QUEUE, "printables.json"), "utf8")); } catch { /* none */ }
  const pRes = await fetch(
    `${BASE}/rest/v1/printables?site_id=eq.${SITE_ID}&select=slug`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
  );
  const existingPrintables = new Set(pRes.ok ? (await pRes.json()).map((r) => r.slug) : []);

  async function ensurePrintable(pslug) {
    if (!pslug || existingPrintables.has(pslug) || !printables[pslug]) return;
    const p = printables[pslug];
    const prow = {
      site_id: SITE_ID, slug: pslug, title: p.title, description: p.description,
      file_url: p.file_url, thumbnail_url: p.thumbnail_url ?? null,
      category_id: CATEGORY_ID.printables, orientation: p.orientation || "portrait",
    };
    if (DRY_RUN) { console.log(`  would create printable ${pslug}`); existingPrintables.add(pslug); return; }
    const r = await fetch(`${BASE}/rest/v1/printables?on_conflict=site_id,slug`, {
      method: "POST",
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json",
                 Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([prow]),
    });
    if (r.ok) { console.log(`  created printable ${pslug}`); existingPrintables.add(pslug); }
    else console.error(`  printable ${pslug} failed: ${r.status} ${(await r.text()).slice(0, 150)}`);
  }

  const files = (await readdir(join(QUEUE, "articles"))).filter((f) => f.endsWith(".json"));
  const due = [];
  for (const f of files) {
    const slug = f.replace(/\.json$/, "");
    const when = schedule[slug];
    if (!when) { console.log(`skip ${slug}: not in schedule`); continue; }
    if (Date.parse(when) > now) continue;          // not due yet
    if (existing.has(slug)) continue;              // already published
    due.push({ slug, when });
  }
  due.sort((a, b) => Date.parse(a.when) - Date.parse(b.when));

  console.log(`${due.length} due & unpublished (cap ${MAX_PER_RUN})${DRY_RUN ? " [DRY RUN]" : ""}`);
  let published = 0;
  const errors = [];

  for (const { slug, when } of due.slice(0, MAX_PER_RUN)) {
    let a;
    try {
      a = JSON.parse(await readFile(join(QUEUE, "articles", `${slug}.json`), "utf8"));
    } catch (e) { errors.push([slug, `read: ${e.message}`]); continue; }

    const miss = REQUIRED.filter((k) => !a[k]);
    if (miss.length) { errors.push([slug, `missing ${miss}`]); continue; }
    const catId = CATEGORY_ID[a.category];
    if (!catId) { errors.push([slug, `unknown category ${a.category}`]); continue; }

    const row = {
      site_id: SITE_ID,
      slug,
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      quick_answer: a.quick_answer,
      category_id: catId,
      audience_tags: Array.isArray(a.audience_tags) ? a.audience_tags : [],
      status: "published",
      seo_title: a.seo_title,
      seo_description: a.seo_description,
      faq_items: (a.faq_items || []).map((x) => ({ question: x.question || "", answer: x.answer || "" })),
      featured_image_url: a.featured_image_url ?? null,
      published_at: when,
    };

    if (DRY_RUN) { console.log(`would publish ${slug} (${when})`); await ensurePrintable(a.printable); published++; continue; }

    const res = await fetch(`${BASE}/rest/v1/posts?on_conflict=site_id,slug`, {
      method: "POST",
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([row]),
    });
    if (!res.ok) { errors.push([slug, `${res.status} ${(await res.text()).slice(0, 200)}`]); continue; }
    console.log(`published ${slug} (${when})`);
    await ensurePrintable(a.printable);
    published++;
  }

  console.log(`\nDONE: published ${published}${DRY_RUN ? " (dry run)" : ""}`);
  if (errors.length) {
    console.error("ERRORS:");
    for (const [s, m] of errors) console.error(`  ${s} -> ${m}`);
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
