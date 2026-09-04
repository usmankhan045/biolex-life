#!/usr/bin/env node
// Attaches the newly generated art printables to the posts they belong with.
// A post gets a printable when its slug matches the art's category rules below;
// each post gains at most one extra {{printable:}} block, appended after the
// last substantial paragraph so it reads as part of the article.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DRAFTS = join(ROOT, "content-queue", "drafts");

// category -> { match: slug test, pool: printable slugs }
const RULES = [
  { name: "boho",      test: (s) => /boho|arch/.test(s) && /wall-art|decor|print/.test(s),
    pool: [1,2,3,4,5,6].map((n) => `boho-0${n}-wall-art`) },
  { name: "botanical", test: (s) => /botanical|floral|flower|plant|leaf|greenery|earthy|neutral/.test(s) && /wall-art|decor|print/.test(s),
    pool: [1,2,3,4,5,6,7,8].map((n) => `botanical-0${n}-wall-art`) },
  { name: "black-white", test: (s) => /black-and-white|minimalist|line-art|scandinavian|monochrome|abstract/.test(s) && /wall-art|decor|print/.test(s),
    pool: [1,2,3,4,5,6,7,8].map((n) => `black-white-0${n}-wall-art`) },
  { name: "celestial", test: (s) => /celestial|moon|sun|star|mid-century|retro|sunset|rainbow/.test(s) && /wall-art|decor|print/.test(s),
    pool: [1,2,3,4,5,6,7,8].map((n) => `celestial-0${n}-wall-art`) },
  { name: "nursery",   test: (s) => /nursery|kids-room|baby|children/.test(s) && /wall-art|decor|print|quote/.test(s),
    pool: [1,2,3,4,5,6].map((n) => `nursery-0${n}-wall-art`) },
  { name: "coloring",  test: (s) => /coloring/.test(s),
    pool: ["coloring-floral-mandala","coloring-botanical-wreath","coloring-butterfly","coloring-zentangle",
           "coloring-animal-mandala","coloring-geometric","coloring-flower-bouquet","coloring-owl",
           "coloring-daisy","coloring-christmas-mandala","coloring-snowflake","coloring-pumpkin"] },
];

// Slug-specific art for the quote prints, which are one-to-one.
const EXACT = {
  "gather-printable-wall-art": "gather-wall-art",
  "let-it-be-printable-wall-art": "let-it-be-wall-art",
  "word-of-the-year-printable": "word-of-the-year-wall-art",
  "new-year-goals-printable": "new-year-goals-wall-art",
  "nursery-quotes-printable": "nursery-quotes-wall-art",
};

const files = (await readdir(DRAFTS)).filter((f) => f.endsWith(".body.md"));
let bound = 0;
const used = new Map();   // pool rotation so one print isn't on every post

for (const f of files) {
  const slug = f.replace(/\.body\.md$/, "");
  const p = join(DRAFTS, f);
  let body = await readFile(p, "utf8");

  let target = EXACT[slug];
  if (!target) {
    const rule = RULES.find((r) => r.test(slug));
    if (!rule) continue;
    const i = used.get(rule.name) ?? 0;
    target = rule.pool[i % rule.pool.length];
    used.set(rule.name, i + 1);
  }
  if (body.includes(`{{printable:${target}}}`)) continue;

  const paras = body.split("\n\n");
  let idx = -1;
  for (let i = paras.length - 1; i >= 0; i--)
    if (!paras[i].startsWith("#") && !paras[i].includes("{{printable:") && paras[i].trim().length > 200) { idx = i; break; }
  if (idx === -1) continue;

  paras.splice(idx + 1, 0, `{{printable:${target}}}`);
  await writeFile(p, paras.join("\n\n"));
  bound++;
}
console.log(`bound ${bound} posts to new art printables`);
