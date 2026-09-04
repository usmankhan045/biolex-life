#!/usr/bin/env node
// Repairs internal linking across the draft bodies:
//   1. Rewrites link targets pointing at slugs that no longer exist.
//   2. Gives every orphan post inbound links from topically close posts.
// Similarity is slug-token overlap with a high floor, so a link is only added
// when the two posts genuinely share a subject. Sentence templates rotate and
// are seeded per pair, so no two insertions read alike.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRAFTS = join(ROOT, "content-queue", "drafts");
const STOP = new Set(["printable","printables","free","for","the","and","to","a","of","with","your","ideas","at","home","how"]);
const MIN_SCORE = 0.5;   // only link genuinely related posts
const MAX_OUT = 4;       // keep donors from becoming link farms

const tokens = (slug) => new Set(slug.split("-").filter((t) => t && !STOP.has(t)));
const score = (a, b) => {
  const [x, y] = [tokens(a), tokens(b)];
  if (!x.size || !y.size) return 0;
  let hit = 0;
  for (const t of x) if (y.has(t)) hit++;
  return hit / Math.min(x.size, y.size);
};
const label = (slug) => slug.replace(/-printable$/, "").replace(/-/g, " ");

// Varied phrasings so the inserted sentences never read as a template.
const PHRASES = [
  (l, s) => `If you want to go deeper on that, our [${l}](/blog/${s}) guide covers it step by step.`,
  (l, s) => `We walk through this in more detail in [${l}](/blog/${s}).`,
  (l, s) => `There is a full breakdown of this in our [${l}](/blog/${s}) post.`,
  (l, s) => `For the longer version, see [${l}](/blog/${s}).`,
  (l, s) => `Our [${l}](/blog/${s}) guide picks up where this leaves off.`,
  (l, s) => `You will find more on this in [${l}](/blog/${s}).`,
  (l, s) => `This pairs well with our [${l}](/blog/${s}) guide.`,
  (l, s) => `We cover the details over in [${l}](/blog/${s}).`,
];
// Deterministic per donor+orphan pair so reruns stay stable.
const pick = (a, b) => {
  let h = 0;
  for (const ch of a + b) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PHRASES[h % PHRASES.length];
};

const files = (await readdir(DRAFTS)).filter((f) => f.endsWith(".body.md"));
const slugs = files.map((f) => f.replace(/\.body\.md$/, ""));
const slugSet = new Set(slugs);
const bodies = new Map();
for (const f of files) bodies.set(f.replace(/\.body\.md$/, ""), await readFile(join(DRAFTS, f), "utf8"));

// --- 1. repair broken targets ---
let repaired = 0;
for (const [slug, body] of bodies) {
  const fixed = body.replace(/\]\(\/blog\/([^)]+)\)/g, (m, target) => {
    if (slugSet.has(target)) return m;
    let best = null, bestScore = 0;
    for (const s of slugs) {
      const sc = score(target, s);
      if (sc > bestScore) { bestScore = sc; best = s; }
    }
    if (best && bestScore >= MIN_SCORE) { repaired++; return `](/blog/${best})`; }
    return m;
  });
  if (fixed !== body) bodies.set(slug, fixed);
}

// --- 2. inbound links for orphans ---
const inbound = new Map(slugs.map((s) => [s, 0]));
for (const body of bodies.values())
  for (const m of body.matchAll(/\]\(\/blog\/([^)]+)\)/g))
    if (inbound.has(m[1])) inbound.set(m[1], inbound.get(m[1]) + 1);

const orphans = slugs.filter((s) => inbound.get(s) === 0);
let added = 0;
const unmatched = [];

for (const orphan of orphans) {
  const donors = slugs
    .filter((s) => s !== orphan)
    .map((s) => ({ s, sc: score(orphan, s) }))
    .filter((d) => d.sc >= MIN_SCORE)
    .sort((a, b) => b.sc - a.sc);

  let placed = 0;
  for (const { s } of donors) {
    if (placed >= 2) break;
    const body = bodies.get(s);
    if (body.includes(`/blog/${orphan}`)) continue;
    if ([...body.matchAll(/\]\(\/blog\//g)].length >= MAX_OUT) continue;

    const paras = body.split("\n\n");
    let idx = -1;
    for (let i = paras.length - 1; i >= 0; i--) {
      if (!paras[i].startsWith("#") && paras[i].trim().length > 200) { idx = i; break; }
    }
    if (idx === -1) continue;

    paras[idx] = paras[idx].trimEnd() + " " + pick(s, orphan)(label(orphan), orphan);
    bodies.set(s, paras.join("\n\n"));
    placed++; added++;
  }
  if (placed === 0) unmatched.push(orphan);
}

for (const [slug, body] of bodies) await writeFile(join(DRAFTS, `${slug}.body.md`), body);
console.log(`repaired ${repaired} broken targets`);
console.log(`added ${added} inbound links; ${unmatched.length} orphans had no close match`);
if (unmatched.length) console.log("  " + unmatched.join("\n  "));
