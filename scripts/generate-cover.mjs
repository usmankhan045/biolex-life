#!/usr/bin/env node
// Generates light-themed, on-brand blog cover images (1200×630) for posts.
// These are the on-site featured_image_url assets (SEO / OG / social) — NOT the
// Pinterest pins. Rendered with headless Chrome for exact fonts + layout, then
// compressed with sharp. Output: public/covers/<slug>.png
//
//   # one cover:
//   node scripts/generate-cover.mjs --slug weekly-cleaning-schedule-printable \
//        --title "The Weekly Cleaning Schedule That Actually Works (Free Printable)" \
//        --eyebrow "Home Organization" --badge "Free Printable Inside"
//
//   # every queued article that lacks a cover (reads content-queue/articles/*.json,
//   # each of which may carry a `cover: { eyebrow, badge }` hint):
//   node scripts/generate-cover.mjs --all
//
// Requires: Google Chrome (macOS default path) + sharp (installed).

import { readFile, readdir, writeFile, mkdir, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import sharp from "sharp";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "public", "covers");
const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const CATEGORY_LABEL = {
  "home-organization": "Home Organization",
  "meal-planning": "Meal Planning",
  "kids-printables": "Kids & Preschool",
  "printable-wall-art": "Printable Wall Art",
  "coloring-pages": "Coloring Pages",
};

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Headline auto-fit: fewer, larger for short titles; smaller for long ones.
function headlineSize(title) {
  const n = title.length;
  if (n <= 40) return 74;
  if (n <= 60) return 64;
  if (n <= 80) return 54;
  return 46;
}

function coverHtml({ title, eyebrow, badge }) {
  const size = headlineSize(title);
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,800&family=Hanken+Grotesk:wght@500;700&family=Geist+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:1200px; height:630px; }
  body {
    background:#FCFBF7; color:#191720; position:relative; overflow:hidden;
    font-family:'Hanken Grotesk',system-ui,sans-serif;
    padding:66px 72px; display:flex; flex-direction:column; justify-content:space-between;
  }
  /* soft brand wash + framing */
  body::before { content:""; position:absolute; inset:0;
    background:radial-gradient(120% 90% at 100% 0%, rgba(91,52,224,0.07), transparent 55%); }
  .frame { position:absolute; inset:22px; border:1.5px solid rgba(25,23,32,0.10); border-radius:26px; }
  .leaf { position:absolute; right:-40px; bottom:-46px; width:340px; opacity:0.5; }
  .top { display:flex; align-items:center; justify-content:space-between; position:relative; z-index:2; }
  .eyebrow { font-family:'Geist Mono',monospace; font-size:17px; letter-spacing:0.16em;
    text-transform:uppercase; color:#5B34E0; font-weight:500; }
  .brand { font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:22px;
    letter-spacing:-0.01em; color:#191720; display:flex; align-items:center; gap:10px; }
  .mono { display:inline-flex; align-items:center; justify-content:center; width:34px; height:34px;
    border-radius:9px; background:#5B34E0; color:#fff; font-size:15px; font-weight:800; }
  .mid { position:relative; z-index:2; max-width:1000px; }
  h1 { font-family:'Bricolage Grotesque',sans-serif; font-weight:800; font-size:${size}px;
    line-height:1.05; letter-spacing:-0.02em; color:#191720; }
  .badge { display:inline-flex; align-items:center; gap:9px; margin-top:30px;
    background:#C9F24E; color:#191720; font-weight:700; font-size:19px;
    padding:11px 20px; border-radius:999px; }
  .dot { width:9px; height:9px; border-radius:50%; background:#191720; }
  .bottom { display:flex; align-items:center; justify-content:space-between;
    position:relative; z-index:2; font-family:'Geist Mono',monospace; font-size:18px; color:#5A5763; }
  .bottom .site { color:#191720; font-weight:500; }
</style></head><body>
  <div class="frame"></div>
  <svg class="leaf" viewBox="0 0 54 90" fill="none" aria-hidden="true">
    <line x1="27" y1="86" x2="27" y2="8" stroke="#5B34E0" stroke-width="1.4" stroke-opacity="0.5"/>
    <path d="M27 42 C20 32 10 30 6 25 C13 23 22 28 27 42Z" fill="#C9F24E" fill-opacity="0.45" stroke="#5B34E0" stroke-opacity="0.4" stroke-width="1"/>
    <path d="M27 55 C34 45 44 43 48 38 C41 36 32 41 27 55Z" fill="#C9F24E" fill-opacity="0.45" stroke="#5B34E0" stroke-opacity="0.4" stroke-width="1"/>
    <path d="M27 28 C21 20 15 16 11 12 C16 12 23 17 27 28Z" fill="#C9F24E" fill-opacity="0.45" stroke="#5B34E0" stroke-opacity="0.4" stroke-width="1"/>
    <path d="M27 67 C33 58 40 56 44 52 C39 50 32 55 27 67Z" fill="#C9F24E" fill-opacity="0.45" stroke="#5B34E0" stroke-opacity="0.4" stroke-width="1"/>
    <circle cx="27" cy="6" r="3.4" fill="#5B34E0"/>
  </svg>
  <div class="top">
    <span class="eyebrow">${esc(eyebrow)}</span>
    <span class="brand"><span class="mono">BV</span>Barrio Vibe</span>
  </div>
  <div class="mid">
    <h1>${esc(title)}</h1>
    ${badge ? `<span class="badge"><span class="dot"></span>${esc(badge)}</span>` : ""}
  </div>
  <div class="bottom">
    <span class="site">barriovibe.com</span>
    <span>Print it. Frame it. Done.</span>
  </div>
</body></html>`;
}

async function renderCover({ slug, title, eyebrow, badge }) {
  await mkdir(OUT_DIR, { recursive: true });
  const html = coverHtml({ title, eyebrow, badge });
  const htmlPath = join(tmpdir(), `cover-${slug}.html`);
  const rawPng = join(tmpdir(), `cover-${slug}.png`);
  await writeFile(htmlPath, html);

  const res = spawnSync(CHROME, [
    "--headless", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
    "--force-color-profile=srgb", "--default-background-color=FCFBF7FF",
    `--screenshot=${rawPng}`, "--window-size=1200,630",
    `file://${htmlPath}`,
  ], { timeout: 60000 });
  if (res.status !== 0) throw new Error(`Chrome failed for ${slug}: ${res.stderr || res.status}`);

  const outPath = join(OUT_DIR, `${slug}.png`);
  await sharp(rawPng).png({ quality: 90, compressionLevel: 9 }).toFile(outPath);
  return `/covers/${slug}.png`;
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const k = argv[i].slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true;
      a[k] = v;
    }
  }
  return a;
}

async function exists(p) { try { await access(p); return true; } catch { return false; } }

async function main() {
  const a = parseArgs(process.argv.slice(2));

  if (a.all) {
    const dir = join(ROOT, "content-queue", "articles");
    const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
    let made = 0, skipped = 0;
    for (const f of files) {
      const slug = f.replace(/\.json$/, "");
      if (!a.force && (await exists(join(OUT_DIR, `${slug}.png`)))) { skipped++; continue; }
      const art = JSON.parse(await readFile(join(dir, f), "utf8"));
      const eyebrow = art.cover?.eyebrow || CATEGORY_LABEL[art.category] || "Free Printable";
      const badge = art.cover?.badge ?? "Free Printable Inside";
      // Cover uses the SEO title without the "(Free Printable)" tail for a cleaner headline.
      const title = (art.cover?.title || art.title).replace(/\s*\((?:free\s+)?printable\)\s*$/i, "");
      await renderCover({ slug, title, eyebrow, badge });
      made++;
      console.log(`cover ✓ ${slug}`);
    }
    console.log(`\nDONE: ${made} covers made, ${skipped} already existed`);
    return;
  }

  if (!a.slug || !a.title) {
    console.error('Usage: --slug <slug> --title "<title>" [--eyebrow "<label>"] [--badge "<text>"]  |  --all [--force]');
    process.exit(1);
  }
  const url = await renderCover({
    slug: a.slug, title: a.title,
    eyebrow: a.eyebrow || "Free Printable",
    badge: a.badge === "none" ? "" : (a.badge || "Free Printable Inside"),
  });
  console.log(`cover ✓ ${url}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
