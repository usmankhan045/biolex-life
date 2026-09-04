# Pin Creation Spec (v2) — MANDATORY, NO EXCEPTIONS

Every pin in `docs/pins-v2/` must satisfy every rule below. These exist because
v1 (624 pins, 4.9 impressions each) violated them.

## 1. TITLE  (Pinterest field, max 100 chars, aim 30-40)
- MUST contain the subject, a search keyword ("printable" / "free printable" /
  "coloring pages"), and the hook.
- Front-load the keyword. Mobile truncates around 40 chars; what survives the
  cut must still say what the thing is.
- NEVER a clever line that omits the subject.
  BAD:  "How To Color It So It Looks Right"   (color what?)
  BAD:  "Under The Sink In 4 Zones"           (which sink?)
  GOOD: "Free Owl Coloring Page For Adults"
  GOOD: "Bathroom Under-Sink Plan, Free Printable"
- Every title in the account is unique. No template reuse.

## 2. ON-PIN HEADLINE  (text rendered in the image)
- Names the subject + keyword. Same rule as the title, may differ in wording.
- 2-4 words per line, max 2 lines, heavy condensed sans, near-black #191720.
- The clever hook goes in the SUB-LINE, never instead of the subject.

## 3. SUB-LINE  (text rendered in the image)
- INFO-LED pins (organization, cleaning, meal, kids, holiday, checklists):
  REQUIRED. One line, <= 60 chars, teaches one specific thing.
- ART-LED pins (wall art, coloring pages, anything showing the actual print):
  OMITTED. The artwork is the explanation. Headline + pill only.

## 4. DESCRIPTION  (Pinterest field, max 500 chars, aim 200-320)
- Opens a curiosity GAP: give the WHY, withhold the HOW.
  BAD:  "Print at 100 percent scale on standard paper."  (answer given, no click)
  GOOD: "The PDF is set up to print clean on any home printer."
- 2-3 sentences, natural voice, no hashtag spam (0-3 max, only if natural).
- Unique per pin. No two descriptions share a sentence.

## 5. IMAGE MUST MATCH THE PRINTABLE  (the rule v1 broke)
- The pin image MUST depict the actual artwork in the bound PDF. Read the real
  file in `assets/` before writing the prompt and describe what is genuinely
  there: the exact motifs, colors, and composition.
- If the post has a printable, the pin SHOWS that printable as a physical sheet:
  on a surface, slight angle, soft shadow, page content legible.
- Infographic-only layouts are allowed ONLY when the printable is a plain text
  list with nothing visual to show.
- NEVER invent artwork the PDF does not contain.

## 6. AESTHETIC (every prompt)
- 1000x1500 vertical. Palette locked: cream #FCFBF7, grape violet #5B34E0,
  electric lime #C9F24E, ink #191720, plus sage/terracotta/sand accents.
- Sheet photographed on a real surface: pale oak, linen, or warm plaster.
- 1-2 restrained props only: eucalyptus sprig, sage scissors, terracotta mug,
  colored pencils. Never a cluttered flat-lay.
- Soft directional light, real shadow under the page, paper texture, slight
  curl at one corner.
- Lime pill with the practical line ("FREE PDF", "PRINT, CUT, DONE").
- "biolexlife.com" wordmark at the bottom. No people, no faces, no logos.

## 7. VARIETY (enforced across the batch)
- Each of a post's 3 pins comes from a DIFFERENT H2 section of that post.
- Rotate layout archetypes; no two consecutive pins share a composition:
  framed mockup / fanned stack / sheet-on-desk / annotated scene / timeline /
  tile grid / two-panel flow / detail crop.
- No two pins in the account look alike. Only palette and wordmark are constant.

## 8. ALT TEXT
- Describes what is literally visible, for screen readers. <= 125 chars.
- Unique per pin. Never a copy of the title or description.

## 9. BOARD  (exactly these 7, never invent an eighth)
- Free Printable Wall Art & Quotes
- Home Organization Printables
- Free Printable Coloring Pages
- Kids & Classroom Printables
- Cleaning Checklists & Chore Charts
- Meal Planning & Grocery Printables
- Christmas & Holiday Printables

## 10. LINK
- Always https://www.biolexlife.com/blog/<slug>
- The slug MUST exist in content-queue/drafts/. Verify before writing.

## 11. NO EM DASHES OR EN DASHES anywhere. Plain hyphens for ranges (2-3).

## 12. SCHEDULE
- 6 pins/day. A post's 3 pins are spread across 3 separate passes over the
  whole library, roughly 35 days apart, never 2 days apart.
