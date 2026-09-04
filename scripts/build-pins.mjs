#!/usr/bin/env node
// Builds the day-by-day Pinterest UPLOAD SCHEDULE(s) from the pin fragments in
// docs/pins/<slug>.md. Splits by phase into SEPARATE files:
//   docs/pinterest-pins.md         — Phase 1 + seasonal posts
//   docs/pinterest-pins-phase2.md  — Phase 2 posts (Wall Art + Coloring), own Day 1
//
// Each file: 6 pins/day from 6 different posts, each post's 3 pins 2 days apart,
// in publish order so a pin never precedes its article. Each day lists its pins
// with board, title, description, alt text, image prompt, and link.
//
//   node scripts/build-pins.mjs                # dates start today
//   node scripts/build-pins.mjs 2026-08-01     # dates start on your go-live date

import { readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { deBrand } from "./lib-brand.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PINS = join(ROOT, "docs", "pins");
const startArg = process.argv[2] || new Date().toISOString().slice(0, 10);

function parsePins(md) {
  const parts = md.split(/\*\*Pin\s+([ABC])/);
  const out = {};
  const field = (b, name) => (b.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*(.+)`)) || [])[1]?.trim() || "";
  for (let i = 1; i < parts.length; i += 2) {
    const b = parts[i + 1] || "";
    out[parts[i]] = {
      board: field(b, "Board"), title: field(b, "Title"),
      description: field(b, "Description"), alt: field(b, "Alt text"),
      prompt: (b.match(/\*\*Image prompt:\*\*\s*`([\s\S]*?)`/) || [])[1]?.trim() || "",
    };
  }
  return out;
}
function dayFor(gi, variant) {
  const batch = Math.floor(gi / 6), slot = (gi % 6) + 1;
  const pair = Math.floor(batch / 2), second = batch % 2;
  return { day: pair * 6 + ({ A: 1, B: 3, C: 5 }[variant] + second), slot };
}
function dateStr(day) {
  const d = new Date(`${startArg}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + (day - 1));
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getUTCDay()];
  return `${d.toISOString().slice(0, 10)} (${wd})`;
}

async function buildFile(order, have, outFile, label, siteUrl) {
  const ordered = order.filter((s) => have.has(s));
  const rows = [];
  for (let gi = 0; gi < ordered.length; gi++) {
    const slug = ordered[gi];
    const pins = parsePins(deBrand(await readFile(join(PINS, `${slug}.md`), "utf8")));
    for (const v of ["A", "B", "C"]) {
      if (!pins[v]) continue;
      const { day, slot } = dayFor(gi, v);
      rows.push({ day, slot, slug, v, ...pins[v] });
    }
  }
  rows.sort((a, b) => a.day - b.day || a.slot - b.slot || a.v.localeCompare(b.v));
  const days = [...new Set(rows.map((r) => r.day))].sort((a, b) => a - b);
  let out = "";
  for (const day of days) {
    out += `## ${dateStr(day)}\n\n`;
    rows.filter((r) => r.day === day).forEach((r, i) => {
      out += `**Pin ${i + 1} · ${r.slug} (Pin ${r.v})**\n`;
      out += `- Board: ${r.board}\n- Title: ${r.title}\n- Description: ${r.description}\n`;
      out += `- Alt text: ${r.alt}\n- Image prompt: ${r.prompt}\n- Link: ${siteUrl}/blog/${r.slug}\n\n`;
    });
  }
  await writeFile(join(ROOT, "docs", outFile), out);
  console.log(`${label}: ${outFile} — ${days.length} days, ${rows.length} pins (${ordered.length} posts)`);
}

async function main() {
  const manifest = JSON.parse(await readFile(join(ROOT, "content-queue", "manifest.json"), "utf8"));
  const phaseOf = Object.fromEntries(manifest.posts.map((p) => [p.slug, p.phase || 1]));
  const have = new Set((await readdir(PINS)).filter((f) => f.endsWith(".md") && f !== "_intro.md").map((f) => f.replace(/\.md$/, "")));

  // Full site URL for pin links, read from lib/site.config.ts (single source of truth).
  const cfg = await readFile(join(ROOT, "lib", "site.config.ts"), "utf8");
  const domain = (cfg.match(/domain:\s*["']([^"']+)["']/) || [])[1] || "www.biolexlife.com";
  const siteUrl = `https://${domain.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;

  // Phase 1 + seasonal = publish_order minus any phase-2 slugs
  const p2set = new Set(manifest.publish_order_p2 || []);
  const p1order = manifest.publish_order.filter((s) => !p2set.has(s) && phaseOf[s] !== 2);
  await buildFile(p1order, have, "pinterest-pins.md", "Phase 1 + seasonal", siteUrl);

  // Phase 2 in its own file, its own Day 1
  if ((manifest.publish_order_p2 || []).length) {
    await buildFile(manifest.publish_order_p2, have, "pinterest-pins-phase2.md", "Phase 2", siteUrl);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
