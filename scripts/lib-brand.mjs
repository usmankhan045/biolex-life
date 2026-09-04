// Brand normalizer. The site was renamed Paper Posy -> Barrio Vibe -> Biolex
// (biolexlife.com). Any stray old-brand mention that slips into generated content
// is auto-corrected at build time, so every published post/pin/printable is
// consistently Biolex. Wired into build-drafts and build-printables.
export function deBrand(s) {
  if (typeof s !== "string") return s;
  return s
    .replace(/paperposy\.com/gi, "biolexlife.com")
    .replace(/barriovibe\.com/gi, "biolexlife.com")
    .replace(/paperposy/gi, "biolexlife")
    .replace(/barriovibe/gi, "biolexlife")
    .replace(/Paper\s+Posy/g, "Biolex")
    .replace(/paper\s+posy/gi, "Biolex")
    .replace(/Barrio\s+Vibe/g, "Biolex")
    .replace(/barrio[\s-]vibe/gi, "Biolex");
}
export function cleanBrand(v) {
  if (typeof v === "string") return deBrand(v);
  if (Array.isArray(v)) return v.map(cleanBrand);
  if (v && typeof v === "object") { const o = {}; for (const k in v) o[k] = cleanBrand(v[k]); return o; }
  return v;
}
