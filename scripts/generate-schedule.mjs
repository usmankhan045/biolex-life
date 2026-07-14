#!/usr/bin/env node
// Generates content-queue/schedule.json from the articles in the queue.
// Cadence: PER_DAY posts per day, GAP_MIN minutes apart, starting at START_DATE
// (a calendar date) at START_HOUR UTC. Run this at ACTIVATION, once you have the
// domain live and know when you want the first post to appear.
//
//   node scripts/generate-schedule.mjs 2026-08-01
//   PER_DAY=6 GAP_MIN=30 START_HOUR=14 node scripts/generate-schedule.mjs 2026-08-01
//
// Publish ORDER: reads content-queue/publish-order.json (an array of slugs) when
// present, so the drip follows an intentional sequence (pillars interleaved).
// Any queued articles missing from that list are appended alphabetically.

import { readFile, readdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE = join(ROOT, "content-queue");

const PER_DAY = Number(process.env.PER_DAY || 6);
const GAP_MIN = Number(process.env.GAP_MIN || 30);
const START_HOUR = Number(process.env.START_HOUR || 14); // 14:00 UTC ≈ 9am US-Eastern
const startArg = process.argv[2] || process.env.START_DATE;

if (!startArg || !/^\d{4}-\d{2}-\d{2}$/.test(startArg)) {
  console.error("Usage: node scripts/generate-schedule.mjs <YYYY-MM-DD>   (the date the FIRST post publishes)");
  process.exit(1);
}

async function main() {
  const files = (await readdir(join(QUEUE, "articles"))).filter((f) => f.endsWith(".json"));
  const slugs = new Set(files.map((f) => f.replace(/\.json$/, "")));

  let order = [];
  try {
    order = JSON.parse(await readFile(join(QUEUE, "manifest.json"), "utf8")).publish_order || [];
  } catch { /* no manifest order — fall back to alphabetical */ }

  const ordered = [
    ...order.filter((s) => slugs.has(s)),
    ...[...slugs].filter((s) => !order.includes(s)).sort(),
  ];

  const schedule = {};
  ordered.forEach((slug, i) => {
    const day = Math.floor(i / PER_DAY);
    const slot = i % PER_DAY;
    const d = new Date(`${startArg}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() + day);
    d.setUTCHours(START_HOUR, slot * GAP_MIN, 0, 0);
    schedule[slug] = d.toISOString().replace(/\.\d{3}Z$/, "Z");
  });

  await writeFile(join(QUEUE, "schedule.json"), JSON.stringify(schedule, null, 2) + "\n");
  const days = Math.ceil(ordered.length / PER_DAY);
  console.log(`Scheduled ${ordered.length} posts · ${PER_DAY}/day · ${GAP_MIN}-min gaps · ${days} days · first ${schedule[ordered[0]]}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
