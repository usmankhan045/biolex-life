#!/usr/bin/env node
// Lints the GEO answer-block rule from CLAUDE.md: each H2 section body should be
// a self-contained answer of ~134-167 words so AI Overviews / Perplexity can
// lift it as a single citable passage. Sections that run long tend to bundle
// several sub-claims and stop extracting cleanly.
//
// Usage:
//   node scripts/lint-answer-blocks.mjs              # summary + worst offenders
//   node scripts/lint-answer-blocks.mjs --all        # every offending section
//   node scripts/lint-answer-blocks.mjs --slug=<s>   # one post
//   node scripts/lint-answer-blocks.mjs --ceiling=180
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// Exits 1 when any section exceeds the ceiling, so it can gate a publish step.

const SITE_ID = (
  process.env.SITE_ID || "5a5babff-6213-4f05-b8cb-986aaa2d0b80"
).trim();
const SB = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const SK = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : fallback;
};
const FLOOR = Number(flag("floor", 134));
const CEILING = Number(flag("ceiling", 167));
const ONLY_SLUG = flag("slug", null);
const SHOW_ALL = args.includes("--all");

if (!SB || !SK) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in the environment."
  );
  process.exit(2);
}

const res = await fetch(
  `${SB}/rest/v1/posts?site_id=eq.${SITE_ID}&status=eq.published&select=slug,title,content` +
    (ONLY_SLUG ? `&slug=eq.${ONLY_SLUG}` : ""),
  { headers: { apikey: SK, Authorization: `Bearer ${SK}` } }
);
if (!res.ok) {
  console.error(`Supabase query failed: ${res.status}`);
  process.exit(2);
}
const posts = await res.json();

// Strip the furniture that is not part of the prose answer: the printable CTA
// shortcode, markdown tables, and link syntax (keep the anchor text).
function proseWords(body) {
  const cleaned = body
    .replace(/\{\{printable:[^}]*\}\}/g, " ")
    .replace(/^\s*\|.*\|\s*$/gm, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#*_`>]/g, " ");
  return cleaned.trim().split(/\s+/).filter(Boolean).length;
}

const offenders = [];
let sections = 0;
let inBand = 0;

for (const post of posts) {
  if (!post.content) continue;
  // Split on H2 boundaries; the first chunk is the intro, not an answer block.
  const chunks = post.content.split(/\n## /);
  const bodies = chunks.slice(1);
  bodies.forEach((chunk, i) => {
    const nl = chunk.indexOf("\n");
    const heading = (nl === -1 ? chunk : chunk.slice(0, nl)).trim();
    const body = nl === -1 ? "" : chunk.slice(nl + 1);
    const words = proseWords(body);
    sections++;
    if (words >= FLOOR && words <= CEILING) inBand++;
    if (words > CEILING || words < FLOOR) {
      offenders.push({
        slug: post.slug,
        heading,
        words,
        index: i + 1,
        of: bodies.length,
        over: words > CEILING,
      });
    }
  });
}

const over = offenders.filter((o) => o.over);
const under = offenders.filter((o) => !o.over);
const pct = sections ? Math.round((inBand / sections) * 100) : 0;

console.log(
  `\nAnswer-block lint  (target ${FLOOR}-${CEILING} words, prose only)\n` +
    `  posts:     ${posts.length}\n` +
    `  sections:  ${sections}\n` +
    `  in band:   ${inBand} (${pct}%)\n` +
    `  over:      ${over.length}\n` +
    `  under:     ${under.length}\n`
);

const show = SHOW_ALL ? offenders : offenders.sort((a, b) => b.words - a.words).slice(0, 20);
if (show.length) {
  console.log(SHOW_ALL ? "All offending sections:" : "Worst 20 sections:");
  for (const o of show) {
    console.log(
      `  ${String(o.words).padStart(4)}w  ${o.slug}  [${o.index}/${o.of}]  ${o.heading}`
    );
  }
  console.log("");
}

process.exit(over.length ? 1 : 0);
