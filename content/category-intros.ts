// Long-form intro copy for the category archive pages.
//
// Category archives are the best-matched URLs on the site for head terms like
// "printable wall art" or "coloring pages", but they shipped with only the
// one-line `categories.description` from the DB above a grid of cards, which is
// thin for a page expected to rank on its own.
//
// Keyed by the category slug. A category with no entry here simply falls back
// to the DB description, so this file is additive and safe to extend.
//
// House rules: no em/en dashes, second person, concrete over promotional.

export interface CategoryIntro {
  /** Shown under the H1, one or two short paragraphs. */
  paragraphs: readonly string[];
  /** Practical, scannable points. Rendered as a bulleted list. */
  highlights?: readonly string[];
}

export const categoryIntros: Record<string, CategoryIntro> = {
  "printable-wall-art": {
    paragraphs: [
      "Every print in this collection is designed in house and sized for standard ready made frames, so you can skip custom framing entirely. Download the PDF, print it, and drop it straight into an 8x10, 11x14, or 16x20 frame.",
      "The guides below cover the parts that actually decide whether a printed piece looks store bought or homemade: which paper weight to use, what size to hang above a sofa or bed, and how to group prints into a gallery wall that reads as deliberate rather than cluttered.",
    ],
    highlights: [
      "Files are US Letter (8.5 x 11 in) PDFs, free for personal use",
      "Print at 100% scale, not Fit to Page, so sizing stays true",
      "Heavier matte stock (roughly 60 to 80 lb) avoids the flimsy look behind glass",
    ],
  },
  "coloring-pages": {
    paragraphs: [
      "Original line art for adults and kids, from simple shapes a preschooler can fill in to intricate mandalas that take an evening. Nothing here is traced from stock art or licensed characters.",
      "The guides below explain which paper stops markers bleeding through, how to pick a design that matches the colorist's patience level, and how to turn a stack of loose sheets into a bound book at home.",
    ],
    highlights: [
      "Single sided line art so markers cannot ruin the page behind",
      "Around 32 lb stock is the practical minimum if you color with markers",
      "Free for classroom and personal use, print as many copies as you need",
    ],
  },
  "home-organization": {
    paragraphs: [
      "Labels, zone maps, cleaning schedules, and checklists for the rooms that get out of hand fastest. These are working documents, not decor: print them, fill them in, and stick them where the mess happens.",
      "The guides below use the same approach in every room. Edit what is there, group what is left into a handful of named categories, then give every category a labelled home so things get returned instead of dumped.",
    ],
    highlights: [
      "Label sets are sized for common bin and shelf fronts",
      "Checklists are built to be reprinted weekly or monthly, not laminated once",
      "Start with one cabinet or drawer rather than a whole room",
    ],
  },
  "kids-printables": {
    paragraphs: [
      "Activity sheets, worksheets, chore charts, and routine cards for toddlers through early elementary, usable at home or in a classroom.",
      "The guides below pair each printable with how to actually use it: how long an activity should realistically hold attention at a given age, and how to adjust when a child finds a task frustrating rather than fun.",
    ],
    highlights: [
      "Grouped by rough age range so you can skip what will not land",
      "Chore and routine charts are designed to be reused, not filled in once",
      "Free for teachers and parents, no sign up and no email required",
    ],
  },
  "meal-planning": {
    paragraphs: [
      "Weekly planners, grocery lists, and freezer inventory sheets for people who want dinner decided before 5 p.m. rather than improvised at the store.",
      "The guides below cover the habit as much as the template: planning around what is already in your kitchen, building a list from the plan instead of the other way around, and leaving a flex night so one disrupted evening does not collapse the week.",
    ],
    highlights: [
      "Planners leave room for a flex night, because rigid weeks fail first",
      "Grocery lists are grouped by store section to cut backtracking",
      "Print weekly and keep it on the fridge where the whole house can see it",
    ],
  },
};
