// Brand normalizer. The site was renamed Paper Posy -> Barrio Vibe
// (barriovibe.com). Any stray old-brand mention that slips into generated content
// is auto-corrected at build time, so every published post/pin/printable is
// consistently Barrio Vibe. Wired into build-drafts and build-printables.
export function deBrand(s) {
  if (typeof s !== "string") return s;
  return s
    .replace(/paperposy\.com/gi, "barriovibe.com")
    .replace(/paperposy/gi, "barriovibe")
    .replace(/Paper\s+Posy/g, "Barrio Vibe")
    .replace(/paper\s+posy/gi, "Barrio Vibe");
}
export function cleanBrand(v) {
  if (typeof v === "string") return deBrand(v);
  if (Array.isArray(v)) return v.map(cleanBrand);
  if (v && typeof v === "object") { const o = {}; for (const k in v) o[k] = cleanBrand(v[k]); return o; }
  return v;
}
