#!/usr/bin/env node
// Builds docs/pinterest-pins.md as a plain day-by-day UPLOAD SCHEDULE, nothing else.
// Each day shows the 6 pins to post that day (mixed across posts), with the pin's
// board, title, description, alt text, image prompt, and link.
//
// Rule: 6 pins/day from 6 different articles; each article's 3 pins post 2 days
// apart (A on day d, B on d+2, C on d+4); order follows the article publish order
// so a pin never precedes its article. Source pins: docs/pins/<slug>.md.
//
//   node scripts/build-pins.mjs                # dates start today
//   node scripts/build-pins.mjs 2026-08-01     # dates start on your go-live date

import { readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

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
      board: field(b, "Board"),
      title: field(b, "Title"),
      description: field(b, "Description"),
      alt: field(b, "Alt text"),
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

async function main() {
  const manifest = JSON.parse(await readFile(join(ROOT, "content-queue", "manifest.json"), "utf8"));
  const order = manifest.publish_order;
  const have = new Set((await readdir(PINS)).filter((f) => f.endsWith(".md") && f !== "_intro.md").map((f) => f.replace(/\.md$/, "")));
  const ordered = [...order.filter((s) => have.has(s)), ...[...have].filter((s) => !order.includes(s)).sort()];

  const rows = [];
  for (let gi = 0; gi < ordered.length; gi++) {
    const slug = ordered[gi];
    const pins = parsePins(await readFile(join(PINS, `${slug}.md`), "utf8"));
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
      out += `- Board: ${r.board}\n`;
      out += `- Title: ${r.title}\n`;
      out += `- Description: ${r.description}\n`;
      out += `- Alt text: ${r.alt}\n`;
      out += `- Image prompt: ${r.prompt}\n`;
      out += `- Link: /blog/${r.slug}\n\n`;
    });
  }
  await writeFile(join(ROOT, "docs", "pinterest-pins.md"), out);
  console.log(`Wrote docs/pinterest-pins.md: ${days.length} days, ${rows.length} pins, starting ${dateStr(1)}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
