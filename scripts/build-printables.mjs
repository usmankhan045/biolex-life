#!/usr/bin/env node
// Converts printable HTML sources into PDFs + preview thumbnails and (re)builds
// content-queue/printables.json so the drip-publisher upserts each printable when
// its post publishes.
//
//   node scripts/build-printables.mjs          # process every printable in the manifest
//   node scripts/build-printables.mjs <slug>   # one
//
// For each <slug>:
//   public/printables/<slug>.html  ->  <slug>.pdf (WeasyPrint) + <slug>-preview.png (pdftoppm+sharp)
// Orientation is auto-detected from the @page rule. A customer-facing description
// comes from public/printables/<slug>.meta.json {description} if present, else the
// manifest spec. Idempotent: skips PDF render if the PDF is newer than the HTML.

import { readFile, writeFile, stat, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";
import { deDash, hasDash } from "./lib-dedash.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PDIR = join(ROOT, "public", "printables");

async function exists(p){ try{ await access(p); return true; }catch{ return false; } }
async function newer(a,b){ try{ return (await stat(a)).mtimeMs >= (await stat(b)).mtimeMs; }catch{ return false; } }

function render(slug){
  const html = join(PDIR, `${slug}.html`);
  const pdf  = join(PDIR, `${slug}.pdf`);
  const r = spawnSync("weasyprint", [html, pdf], { encoding: "utf8", timeout: 120000 });
  if (r.status !== 0) throw new Error(`weasyprint failed for ${slug}: ${(r.stderr||"").slice(0,300)}`);
}

async function thumb(slug){
  const pdf = join(PDIR, `${slug}.pdf`);
  const base = join("/tmp", `pt-${slug}`);
  const r = spawnSync("pdftoppm", ["-png","-r","150","-f","1","-l","1", pdf, base], { encoding:"utf8" });
  if (r.status !== 0) throw new Error(`pdftoppm failed for ${slug}`);
  await sharp(`${base}-1.png`).resize(600).png({ compressionLevel: 9 }).toFile(join(PDIR, `${slug}-preview.png`));
}

async function main(){
  const manifest = JSON.parse(await readFile(join(ROOT,"content-queue","manifest.json"),"utf8"));
  const one = process.argv[2];
  const list = one ? manifest.printables.filter(p=>p.slug===one) : manifest.printables;

  let printables = {};
  const pjson = join(ROOT,"content-queue","printables.json");
  if (await exists(pjson)) printables = JSON.parse(await readFile(pjson,"utf8"));

  const ok=[], err=[];
  for (const p of list){
    try{
      const html = join(PDIR, `${p.slug}.html`);
      if (!(await exists(html))) { err.push([p.slug,"no HTML yet"]); continue; }
      // House rule: strip em/en dashes from printable text before rendering.
      const rawHtml = await readFile(html, "utf8");
      if (hasDash(rawHtml)) await writeFile(html, deDash(rawHtml));
      if (!(await newer(join(PDIR,`${p.slug}.pdf`), html))) render(p.slug);
      if (!(await exists(join(PDIR,`${p.slug}-preview.png`))) || !(await newer(join(PDIR,`${p.slug}-preview.png`), join(PDIR,`${p.slug}.pdf`)))) await thumb(p.slug);

      const src = await readFile(html,"utf8");
      const orientation = /@page[^}]*landscape/i.test(src) ? "landscape" : "portrait";
      let description = p.spec;
      const metaPath = join(PDIR, `${p.slug}.meta.json`);
      if (await exists(metaPath)) { try { description = JSON.parse(await readFile(metaPath,"utf8")).description || description; } catch {} }

      printables[p.slug] = {
        title: deDash(p.title),
        description: deDash(description),
        file_url: `/printables/${p.slug}.pdf`,
        thumbnail_url: `/printables/${p.slug}-preview.png`,
        orientation,
        category: p.category,
      };
      const kb = Math.round((await stat(join(PDIR,`${p.slug}.pdf`))).size/1024);
      ok.push([p.slug, `${kb}KB ${orientation}`]);
    }catch(e){ err.push([p.slug, e.message]); }
  }

  await writeFile(pjson, JSON.stringify(printables,null,2)+"\n");
  for (const [s,m] of ok) console.log(`✓ ${s} (${m})`);
  if (err.length){ console.error("\nPENDING/ERRORS:"); for (const [s,m] of err) console.error(`  … ${s}: ${m}`); }
  console.log(`\nBuilt ${ok.length}/${list.length} printables · printables.json has ${Object.keys(printables).length} entries`);
}
main().catch((e)=>{ console.error(e); process.exit(1); });
