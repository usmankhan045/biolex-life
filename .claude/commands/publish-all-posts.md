# Publish All Pending Posts

Write, create printables for, and publish all of this site's planned content
priority posts.

## How to use

```
/publish-all-posts
/publish-all-posts 02        # publish specific post number
/publish-all-posts 02 03 05  # publish specific posts
```

## Where the content plan lives

The list of planned posts (numbers, slugs, target keywords, categories, and the
printable each post links) lives in **`CLAUDE.md`** — the per-site project guide.
Maintain a content priority table there, and mark each post's status
(pending / published) as you go. For example:

| # | Post slug | Printable | Status |
|---|---|---|---|
| 01 | your-first-post-slug | your-first-printable.pdf | pending |
| 02 | your-second-post-slug | your-second-printable.pdf | pending |
| … | … | … | … |

## Process for each post

For each pending post number, run `/write-post <number>` which handles:
1. Writing the full blog post content
2. Creating the printable HTML + converting to PDF (if the post has one)
3. Publishing both to Supabase

## Internal linking

Once posts are published, cross-link between them using their `/blog/<slug>`
paths. Aim for at least two internal links per post to related published posts.

## Printable specs

Document the spec for each printable in `CLAUDE.md` (or the per-post brief).
The canonical printable reference implementation lives in
`public/printables/` — see the Master Design System in
`.claude/commands/create-printable.md`.
