# Content queue — scheduled auto-publishing

This directory drives a **drip-publisher**: queued blog posts are inserted into
Supabase automatically on a schedule (**8 posts/day, 30 minutes apart**), so new
content rolls out gradually instead of all at once (which reads as spam to search
engines).

## How it works

- **`schedule.json`** — maps every `slug` → its scheduled publish time (ISO UTC).
  Generated at 8/day, 30 min apart, in pin-calendar order, starting 2026-07-14.
- **`articles/<slug>.json`** — the full post payload for each slug
  (`title, excerpt, quick_answer, content, seo_title, seo_description,
  audience_tags, faq_items, category`).
- **`../scripts/publish-due-posts.mjs`** — publishes every article whose scheduled
  time has passed and that is **not already in the database**.
- **`../.github/workflows/publish-scheduled-posts.yml`** — runs the script every
  30 minutes via GitHub Actions.

The publisher is **idempotent**: the database is the source of truth for what's
already live, so re-runs, delayed runs, or overlapping runs never double-post.
If GitHub skips or delays a cron tick (it's best-effort), the next run catches up.

## Activation (one-time)

Add two **repository secrets** — GitHub → Settings → Secrets and variables →
Actions → *New repository secret*:

| Secret | Value |
|---|---|
| `SUPABASE_URL` | your Supabase project URL (same as `.env.local`) |
| `SUPABASE_SERVICE_ROLE_KEY` | the service-role key (same as `.env.local`) |

Once merged to the default branch **and** the secrets are set, the workflow starts
publishing on schedule. Until then it does nothing.

## Test without publishing

GitHub → Actions → *Publish scheduled posts* → **Run workflow** → check
**dry_run** → Run. It logs what *would* publish and inserts nothing.

Locally:

```bash
set -a && . ./.env.local && set +a
DRY_RUN=1 node scripts/publish-due-posts.mjs
```

## Change the cadence

Re-generate `schedule.json` with different timestamps (e.g. more/fewer per day, a
different start date, a different daily start hour). The `slug → ISO time` shape is
all the publisher reads. `PER_DAY` and the 30-minute gap live in the generator, not
the publisher.

## Adding posts

Drop a new `articles/<slug>.json` and add the slug to `schedule.json`. The next run
picks it up when its time arrives.

## Notes

- `content` may contain the `{{printable:<slug>}}` shortcode; it renders a download
  callout. The linked printable page 404s until that printable is created — the
  post itself publishes fine regardless.
- Posts publish with `status: "published"` and `published_at` set to the scheduled
  time.
