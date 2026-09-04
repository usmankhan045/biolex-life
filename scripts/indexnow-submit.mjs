#!/usr/bin/env node
// Submits all live URLs to IndexNow (Bing, Yandex, Naver, etc.) for fast
// discovery/indexing. Key file is hosted at /<KEY>.txt in public/. Run after a
// publish batch. Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
const HOST = "www.biolexlife.com";
const KEY = "8e0f08cab3c95c0f7422368a8ce4b6a6";
const BASE_URL = `https://${HOST}`;
const SITE_ID = (process.env.SITE_ID || "5a5babff-6213-4f05-b8cb-986aaa2d0b80").trim();
const SB = (process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
const SK = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
const H = { apikey: SK, Authorization: `Bearer ${SK}` };

async function q(path) {
  const r = await fetch(`${SB}/rest/v1/${path}`, { headers: H });
  if (!r.ok) throw new Error(`${path} -> ${r.status}`);
  return r.json();
}

const [posts, printables, cats] = await Promise.all([
  q(`posts?site_id=eq.${SITE_ID}&status=eq.published&select=slug`),
  q(`printables?site_id=eq.${SITE_ID}&select=slug`),
  q(`categories?site_id=eq.${SITE_ID}&select=slug`),
]);

const urls = [
  `${BASE_URL}/`,
  `${BASE_URL}/blog`,
  `${BASE_URL}/free-printables`,
  `${BASE_URL}/about`,
  `${BASE_URL}/author/muhammad-usman`,
  ...posts.map((p) => `${BASE_URL}/blog/${p.slug}`),
  ...cats.map((c) => `${BASE_URL}/category/${c.slug}`),
  ...printables.map((p) => `${BASE_URL}/free-printables/${p.slug}`),
];

console.log(`Submitting ${urls.length} URLs to IndexNow...`);
const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${BASE_URL}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow response: ${res.status} ${res.statusText}`);
if (res.status !== 200 && res.status !== 202) console.log(await res.text().catch(() => ""));
