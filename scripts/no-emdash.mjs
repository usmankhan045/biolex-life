import { readFile, writeFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { deDash, cleanValue } from "./lib-dedash.mjs";

const globs = [
  ["content-queue/articles", ".json"],
  ["content-queue/drafts", ".meta.json"],
  ["content-queue/drafts", ".body.md"],
  ["docs/pins", ".md"],
  ["public/printables", ".html"],
  ["public/printables", ".meta.json"],
];
const singles = [
  "content-queue/printables.json","content-queue/manifest.json",
  "docs/pinterest-pins.md","docs/content-bank-plan.md",
  ".claude/commands/create-printable.md",".claude/commands/write-post.md",
  "scripts/coloring/gen_art.py","scripts/coloring/gen_seasonal_art.py","scripts/coloring/gen_wallart.py",
];

const count = (s) => (s.match(/[–—]/g) || []).length;

async function cleanFile(path) {
  const raw = await readFile(path, "utf8");
  const before = count(raw);
  if (!before) return { path, before: 0, changed: false };
  let out;
  if (path.endsWith(".json")) out = JSON.stringify(cleanValue(JSON.parse(raw)), null, 2) + "\n";
  else out = deDash(raw);
  await writeFile(path, out);
  return { path, before, after: count(out), changed: true, html: path.endsWith(".html") };
}

const targets = [];
for (const [dir, ext] of globs) {
  for (const f of await readdir(dir)) if (f.endsWith(ext)) targets.push(join(dir, f));
}
targets.push(...singles);

let totalBefore = 0, files = 0; const htmlChanged = [];
for (const t of targets) {
  try {
    const r = await cleanFile(t);
    if (r.changed) { totalBefore += r.before; files++; if (r.html) htmlChanged.push(r.path); }
  } catch (e) { console.error("skip", t, e.message); }
}
console.log(`Removed ${totalBefore} em/en dashes across ${files} files`);
console.log(`HTML printables changed (need re-render): ${htmlChanged.length}`);
