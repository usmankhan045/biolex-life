// Shared "no em/en dash" normalizer. Em dashes (—) and en dashes (–) are a
// well-known AI-writing tell; house rule is to never use them. Numeric ranges
// collapse to a hyphen; every other dash becomes a comma, with cleanup so we
// never leave ", ." or doubled commas behind.
export function deDash(s) {
  if (typeof s !== "string") return s;
  let o = s
    .replace(/(\d)[ \t]*[–—][ \t]*(\d)/g, "$1-$2") // 134–167 -> 134-167
    .replace(/[ \t]*[–—][ \t]*/g, ", ");          // — / – -> comma
  o = o
    .replace(/[ \t]+,/g, ",")
    .replace(/,[ \t]*,/g, ", ")
    .replace(/,[ \t]*([.!?;:])/g, "$1")
    .replace(/,[ \t]*\)/g, ")")
    .replace(/\([ \t]*,[ \t]*/g, "(")
    .replace(/[ \t]{2,}/g, " ");
  return o;
}
export function cleanValue(v) {
  if (typeof v === "string") return deDash(v);
  if (Array.isArray(v)) return v.map(cleanValue);
  if (v && typeof v === "object") { const o = {}; for (const k in v) o[k] = cleanValue(v[k]); return o; }
  return v;
}
export function hasDash(s) { return typeof s === "string" && /[–—]/.test(s); }
