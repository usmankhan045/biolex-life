#!/usr/bin/env node
// Adds one contextual outbound citation to posts that make a checkable factual
// claim. The corpus previously had zero outbound links anywhere in body copy,
// which reads as a trust gap (and suppresses AI-search citability, since answer
// engines favour pages that model sourcing themselves).
//
// Rules this script holds to:
//   - Only ONE citation per post, placed on a claim the post already makes.
//     We never invent a claim in order to hang a link on it.
//   - Only sources that were manually fetched and verified as relevant.
//   - Never link the same target from a heading, and never inside a table row,
//     a {{printable:}} shortcode line, or an existing markdown link.
//   - No em/en dashes (house rule).
//
// Usage:
//   node scripts/add-outbound-citations.mjs --dry     # report only, no writes
//   node scripts/add-outbound-citations.mjs           # apply
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

const SITE_ID = (
  process.env.SITE_ID || "5a5babff-6213-4f05-b8cb-986aaa2d0b80"
).trim();
const SB = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const SK = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const DRY = process.argv.includes("--dry");

if (!SB || !SK) {
  console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(2);
}

const H = {
  apikey: SK,
  Authorization: `Bearer ${SK}`,
  "Content-Type": "application/json",
};

// Verified sources. Each was fetched and confirmed to actually cover the claim
// it is attached to before being added here.
//
//  - papersizes.org/paper-weights: explains lb basis weight vs gsm, and lists
//    60/65/80/90/100lb cover stock. Matches our cardstock guidance.
//  - cdc.gov act-early milestones: official US developmental milestones,
//    lists "holds crayon or pencil between fingers and thumb" at age 4.
//    Matches our fine-motor claims.
const SOURCES = {
  paperWeight: {
    url: "https://www.papersizes.org/paper-weights.htm",
    anchor: "paper weight guide",
  },
  fineMotor: {
    url: "https://www.cdc.gov/act-early/milestones/4-years.html",
    anchor: "CDC developmental milestones",
  },
};

const res = await fetch(
  `${SB}/rest/v1/posts?site_id=eq.${SITE_ID}&status=eq.published&select=id,slug,content`,
  { headers: H }
);
if (!res.ok) {
  console.error(`Query failed: ${res.status}`);
  process.exit(2);
}
const posts = await res.json();

// A line is safe to edit if it is body prose: not a heading, not a table row,
// not a shortcode, not a list item we might mangle, and not already linked out.
function isProseLine(line) {
  const t = line.trim();
  if (!t) return false;
  if (t.startsWith("#")) return false;
  if (t.startsWith("|")) return false;
  if (t.startsWith("{{")) return false;
  if (t.startsWith(">")) return false;
  if (/^\d+\.\s/.test(t)) return false;
  if (/^[-*]\s/.test(t)) return false;
  if (/\]\(http/.test(t)) return false;
  return true;
}

// Link the first plain-text occurrence of `phrase` on a prose line, skipping
// any occurrence that already sits inside a markdown link.
function linkPhrase(content, phrase, source) {
  const lines = content.split("\n");
  const re = new RegExp(`\\b(${phrase})\\b`, "i");
  for (let i = 0; i < lines.length; i++) {
    if (!isProseLine(lines[i])) continue;
    const m = lines[i].match(re);
    if (!m) continue;
    // Don't nest inside an existing link on this line.
    const idx = m.index;
    const before = lines[i].slice(0, idx);
    if ((before.match(/\[/g) || []).length > (before.match(/\]/g) || []).length)
      continue;
    lines[i] =
      lines[i].slice(0, idx) +
      `[${m[1]}](${source.url})` +
      lines[i].slice(idx + m[1].length);
    return { content: lines.join("\n"), line: i, matched: m[1] };
  }
  return null;
}

const updates = [];
const skipped = [];

for (const post of posts) {
  const c = post.content || "";
  // Already cites something outbound, leave it alone.
  if (/\]\(https?:\/\//.test(c)) {
    skipped.push({ slug: post.slug, why: "already has an outbound link" });
    continue;
  }

  let applied = null;

  // Fine-motor claims are the strongest candidate: a developmental claim about
  // children genuinely warrants an authoritative source.
  if (/\bfine motor\b|\bmotor skills\b/i.test(c)) {
    applied =
      linkPhrase(c, "fine motor skills", SOURCES.fineMotor) ??
      linkPhrase(c, "fine motor", SOURCES.fineMotor) ??
      linkPhrase(c, "motor skills", SOURCES.fineMotor);
    if (applied) applied.source = "fineMotor";
  }

  // Otherwise, cite the paper-weight spec where the post already names one.
  if (!applied && /\b\d+\s?lb\b/i.test(c)) {
    applied =
      linkPhrase(c, "cardstock", SOURCES.paperWeight) ??
      linkPhrase(c, "card stock", SOURCES.paperWeight) ??
      linkPhrase(c, "heavier stock", SOURCES.paperWeight) ??
      linkPhrase(c, "matte cardstock", SOURCES.paperWeight);
    if (applied) applied.source = "paperWeight";
  }

  if (!applied) {
    skipped.push({ slug: post.slug, why: "no checkable claim to cite" });
    continue;
  }
  updates.push({
    id: post.id,
    slug: post.slug,
    content: applied.content,
    source: applied.source,
    matched: applied.matched,
  });
}

console.log(
  `\nOutbound citations\n  posts:   ${posts.length}\n  to add:  ${updates.length}\n  skipped: ${skipped.length}\n`
);
const bySource = {};
for (const u of updates) bySource[u.source] = (bySource[u.source] || 0) + 1;
console.log("  by source:", bySource, "\n");

if (DRY) {
  for (const u of updates.slice(0, 12))
    console.log(`  ${u.slug}  ->  ${u.source} on "${u.matched}"`);
  console.log("\n(dry run, nothing written)\n");
  process.exit(0);
}

let ok = 0;
for (const u of updates) {
  const r = await fetch(`${SB}/rest/v1/posts?id=eq.${u.id}`, {
    method: "PATCH",
    headers: { ...H, Prefer: "return=minimal" },
    body: JSON.stringify({ content: u.content }),
  });
  if (r.ok) ok++;
  else console.error(`  FAILED ${u.slug}: ${r.status} ${await r.text()}`);
}
console.log(`\nUpdated ${ok}/${updates.length} posts.\n`);
