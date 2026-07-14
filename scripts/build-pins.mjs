#!/usr/bin/env node
// Rebuilds docs/pinterest-pins.md from docs/pins/_intro.md + every docs/pins/<slug>.md
// fragment (one block of 3 pins per post). Fragments are written by the content
// fan-out; this concatenates them in publish_order (from the manifest), falling
// back to alphabetical for any not in the order list.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PINS = join(ROOT, "docs", "pins");

async function main(){
  const intro = await readFile(join(PINS, "_intro.md"), "utf8");
  let order = [];
  try { order = JSON.parse(await readFile(join(ROOT,"content-queue","manifest.json"),"utf8")).publish_order; } catch {}

  const frags = (await readdir(PINS)).filter(f=>f.endsWith(".md") && f!=="_intro.md").map(f=>f.replace(/\.md$/,""));
  const ordered = [...order.filter(s=>frags.includes(s)), ...frags.filter(s=>!order.includes(s)).sort()];

  const blocks = [];
  for (const slug of ordered) blocks.push((await readFile(join(PINS, `${slug}.md`),"utf8")).trim());

  const out = intro.trimEnd() + "\n\n# PINS\n\n" + blocks.join("\n\n---\n\n") + "\n";
  await writeFile(join(ROOT,"docs","pinterest-pins.md"), out);
  console.log(`Rebuilt docs/pinterest-pins.md from ${blocks.length} post fragments`);
}
main().catch((e)=>{ console.error(e); process.exit(1); });
