#!/usr/bin/env node
// Removes the bulk-insert footprint: the posts published together share one
// identical published_at (millisecond-identical), which reads as a script dump.
// This spreads those posts across an organic window (default ~12 days ending
// today) with varied daytime hours, deterministically by sorted slug. DRY_RUN=1
// to preview. Only touches posts that carry the exact bulk timestamp.
import { fileURLToPath } from "node:url";

const SITE_ID = (process.env.SITE_ID || "5a5babff-6213-4f05-b8cb-986aaa2d0b80").trim();
const BASE = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const DRY_RUN = process.env.DRY_RUN === "1";
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };

// The millisecond-identical stamp created by the bulk publish. Override via env.
const BULK_STAMP = process.env.BULK_STAMP || "2026-07-16T11:40:57.817+00:00";
// Spread window: end today, go back this many days.
const WINDOW_DAYS = Number(process.env.WINDOW_DAYS || 12);
const END = Date.parse(process.env.END_DATE || "2026-07-16T09:00:00Z");
const DAY = 86400000;

async function q(path) {
  const r = await fetch(`${BASE}/rest/v1/${path}`, { headers: H });
  if (!r.ok) throw new Error(`${path} -> ${r.status} ${await r.text()}`);
  return r.json();
}

const posts = await q(`posts?site_id=eq.${SITE_ID}&published_at=eq.${encodeURIComponent(BULK_STAMP)}&select=id,slug,updated_at&order=slug.asc`);
console.log(`Posts on the bulk stamp ${BULK_STAMP}: ${posts.length}${DRY_RUN ? " [DRY RUN]" : ""}\n`);
if (posts.length === 0) { console.log("Nothing to stagger."); process.exit(0); }

// Deterministic spread: distribute across the window, varied hour/minute by index.
const n = posts.length;
let done = 0;
for (let i = 0; i < n; i++) {
  const p = posts[i];
  // Oldest first: earliest slug gets the oldest date.
  const dayOffset = Math.round((WINDOW_DAYS - 1) * (1 - i / Math.max(1, n - 1)));
  const hour = 8 + ((i * 3) % 10);          // 08:00-17:00
  const minute = (i * 17) % 60;
  const d = new Date(END - dayOffset * DAY);
  d.setUTCHours(hour, minute, (i * 7) % 60, 0);
  const iso = d.toISOString();
  console.log(`${p.slug.padEnd(48)} -> ${iso}`);
  if (DRY_RUN) { done++; continue; }
  const res = await fetch(`${BASE}/rest/v1/posts?id=eq.${p.id}`, {
    method: "PATCH",
    headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ published_at: iso }),
  });
  if (!res.ok) { console.error(`  FAILED ${p.slug}: ${res.status} ${(await res.text()).slice(0,150)}`); process.exit(1); }
  done++;
}
console.log(`\n${DRY_RUN ? "[DRY RUN] " : ""}Staggered ${done} posts across ${WINDOW_DAYS} days.`);
