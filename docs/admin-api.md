# Admin API Reference

Bearer-token authenticated API for managing content across all sites sharing the same Supabase project.

## Authentication

Every `/api/admin/*` request requires an `Authorization` header:

```
Authorization: Bearer <ADMIN_API_TOKEN>
```

Set `ADMIN_API_TOKEN` in your `.env.local`. The comparison is constant-time (`crypto.timingSafeEqual`).

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ADMIN_API_TOKEN` | Yes | Secret bearer token for all admin routes |
| `REVALIDATION_SECRET` | Yes | Shared secret for cross-site revalidation webhook |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (bypasses RLS) |

---

## Sites

### GET /api/admin/sites

List all registered sites.

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/admin/sites
```

**Response**
```json
{
 "sites": [
 {
 "id": "uuid",
 "slug": "my-site",
 "domain": "www.example.com",
 "name": "My Site",
 "niche": "Your niche or topic",
 "deploy_url": "https://my-site.vercel.app",
 "theme_config": null,
 "created_at": "2024-01-01T00:00:00Z"
 }
 ]
}
```

### POST /api/admin/sites

Register a new site. Use when launching site #2+.

**Body**
```json
{
 "slug": "second-site",
 "domain": "second-site.com",
 "name": "Second Site",
 "niche": "Your niche or topic",
 "deploy_url": "https://second-site.vercel.app",
 "theme_config": {}
}
```

```bash
curl -X POST \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"slug":"second-site","domain":"second-site.com","name":"Second Site","deploy_url":"https://second-site.vercel.app"}' \
 http://localhost:3000/api/admin/sites
```

**Response** `201`
```json
{ "site": { "id": "uuid"... } }
```

### PUT /api/admin/sites/:id

Update a site's `deploy_url`, `theme_config`, `name`, or `niche`.

**Body** (all fields optional)
```json
{
 "deploy_url": "https://second-site-v2.vercel.app",
 "theme_config": { "colors": { "primary": "#123456" } }
}
```

```bash
curl -X PUT \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"deploy_url":"https://second-site-v2.vercel.app"}' \
 http://localhost:3000/api/admin/sites/SITE_ID
```

---

## Posts

All write operations (POST, PUT, DELETE) trigger ISR revalidation for `/blog`, `/blog/:slug`, `/category/:slug`, and any audience hub pages matching `audience_tags`.

### GET /api/admin/posts

List posts with optional filters.

**Query params**
| Param | Description |
|---|---|
| `site_id` | Defaults to current site |
| `status` | `draft` or `published` |
| `category` | Filter by category UUID |
| `audience_tag` | Filter by tag value (e.g. `segment-one`) |

```bash
curl -H "Authorization: Bearer $TOKEN" \
 "http://localhost:3000/api/admin/posts?status=published&audience_tag=segment-one"
```

### GET /api/admin/posts/:id

Fetch a single post by UUID.

```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/admin/posts/POST_ID
```

### POST /api/admin/posts

Create a post.

**Body**
```json
{
 "site_id": "uuid (optional, defaults to current site)",
 "title": "Your Post Title Here",
 "slug": "your-post-slug",
 "content": "## Introduction\n...",
 "excerpt": "Short teaser text",
 "quick_answer": "A 1-3 sentence plain-English answer to the article's core question.",
 "category_id": "uuid | null",
 "audience_tags": ["segment-one", "segment-two"],
 "status": "draft",
 "seo_title": "Your Post Title | My Site",
 "seo_description": "Short meta description of what the reader gets...",
 "faq_items": [
 { "question": "A question a reader might type?", "answer": "It depends on..." }
 ],
 "featured_image_url": "https://example.com/image.jpg",
 "published_at": null
}
```

- If `status` is `"published"` and `published_at` is omitted, it defaults to the current timestamp.

```bash
curl -X POST \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"title":"Test Post","slug":"test-post","status":"published"}' \
 http://localhost:3000/api/admin/posts
```

**Response** `201`
```json
{ "post": { "id": "uuid"... } }
```

### PUT /api/admin/posts/:id

Update a post. All fields are optional.

```bash
curl -X PUT \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"status":"published","seo_title":"Updated SEO Title"}' \
 http://localhost:3000/api/admin/posts/POST_ID
```

### DELETE /api/admin/posts/:id

Delete a post and revalidate affected pages.

```bash
curl -X DELETE \
 -H "Authorization: Bearer $TOKEN" \
 http://localhost:3000/api/admin/posts/POST_ID
```

**Response**
```json
{ "deleted": true, "id": "uuid" }
```

---

## Pages

### GET /api/admin/pages

```bash
curl -H "Authorization: Bearer $TOKEN" \
 "http://localhost:3000/api/admin/pages?site_id=UUID"
```

### GET /api/admin/pages/:id

### POST /api/admin/pages

**Body**
```json
{
 "site_id": "uuid (optional)",
 "slug": "start-here",
 "title": "Start Here",
 "content": "## Welcome\n...",
 "seo_title": "Start Here | My Site",
 "seo_description": "New to the site? Begin here."
}
```

### PUT /api/admin/pages/:id

All fields optional.

### DELETE /api/admin/pages/:id

---

## Categories

### GET /api/admin/categories

```bash
curl -H "Authorization: Bearer $TOKEN" \
 "http://localhost:3000/api/admin/categories?site_id=UUID"
```

### GET /api/admin/categories/:id

### POST /api/admin/categories

**Body**
```json
{
 "site_id": "uuid (optional)",
 "slug": "category-one",
 "name": "Category One",
 "description": "Short description of this category"
}
```

### PUT /api/admin/categories/:id

### DELETE /api/admin/categories/:id

---

## Printables

### GET /api/admin/printables

### GET /api/admin/printables/:id

### POST /api/admin/printables

**Body**
```json
{
 "site_id": "uuid (optional)",
 "slug": "printable-worksheet",
 "title": "Printable Worksheet",
 "description": "Short description of this printable sheet",
 "file_url": "https://example.com/worksheet.pdf",
 "thumbnail_url": "https://example.com/worksheet-thumb.jpg",
 "category_id": "uuid | null"
}
```

Write operations revalidate `/free-printables` and `/free-printables/:slug`.

### PUT /api/admin/printables/:id

### DELETE /api/admin/printables/:id

---

## Media Upload

### POST /api/admin/media

Upload a file to Supabase Storage. Files are organized under `{site_slug}/{timestamp}-{filename}` in the `media` bucket.

**Prerequisites:** Create a `media` bucket in Supabase Storage (Storage → New bucket → name: `media`, public: true).

**Body**
```json
{
 "site_id": "uuid (optional)",
 "filename": "hero-image.jpg",
 "data": "data:image/jpeg;base64,/9j/4AAQ...",
 "content_type": "image/jpeg"
}
```

- `data`: Full data URI or raw base64 string. The `data:image/...;base64,` prefix is stripped automatically.
- `content_type`: Optional, inferred from the filename extension if omitted (jpg, png, gif, webp, svg, pdf supported).

```bash
B64=$(base64 -i image.jpg)
curl -X POST \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d "{\"filename\":\"image.jpg\",\"data\":\"$B64\",\"content_type\":\"image/jpeg\"}" \
 http://localhost:3000/api/admin/media
```

**Response** `201`
```json
{
 "url": "https://xxxx.supabase.co/storage/v1/object/public/media/my-site/1700000000-image.jpg",
 "path": "my-site/1700000000-image.jpg"
}
```

---

## Subscribers

### GET /api/admin/subscribers

Export subscriber list for a site.

**Query params**
| Param | Description |
|---|---|
| `site_id` | Defaults to current site |

```bash
curl -H "Authorization: Bearer $TOKEN" \
 "http://localhost:3000/api/admin/subscribers?site_id=UUID"
```

**Response**
```json
{
 "subscribers": [
 { "id": "uuid", "email": "user@example.com", "source": "homepage-mid", "created_at": "..." }
 ],
 "total": 42
}
```

---

## Portfolio Audit

### GET /api/admin/audit

Content health summary across all sites (or a single site with `?site_id=`).

```bash
# All sites
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/admin/audit

# Single site
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/admin/audit?site_id=UUID"
```

**Response**
```json
{
 "sites": [
 {
 "id": "uuid",
 "slug": "my-site",
 "name": "My Site",
 "domain": "www.example.com",
 "deploy_url": "https://my-site.vercel.app",
 "summary": {
 "post_count": 25,
 "published_post_count": 20,
 "posts_with_seo_title": 18,
 "posts_with_seo_description": 15,
 "posts_with_faq": 10,
 "avg_word_count": 1240,
 "page_count": 6,
 "printable_count": 4
 },
 "posts": [
 {
 "id": "uuid",
 "slug": "your-post-slug",
 "title": "Your Post Title Here",
 "status": "published",
 "word_count": 1845,
 "has_faq": true,
 "has_seo_title": true,
 "has_seo_description": true,
 "seo_title": "...",
 "seo_description": "...",
 "audience_tags": ["segment-one"],
 "category_slug": "category-one"
 }
 ],
 "pages": [ { "id": "uuid", "slug": "start-here", "title": "Start Here", "word_count": 600, "has_seo_title": true, "has_seo_description": true } ],
 "printables": [ { "id": "uuid", "slug": "printable-worksheet", "title": "Printable Worksheet", "has_description": true } ]
 }
 ]
}
```

---

## Revalidation Webhook

Every site must expose this endpoint to receive cross-site cache purge signals.

### POST /api/revalidate

**Body**
```json
{
 "secret": "REVALIDATION_SECRET value",
 "paths": ["/blog", "/blog/some-post-slug", "/category/category-one"]
}
```

Validates `secret` against `process.env.REVALIDATION_SECRET` (constant-time). Calls `revalidatePath(path)` for each path and returns the list of paths revalidated.

**Response**
```json
{ "revalidated": true, "paths": ["/blog", "/blog/some-post-slug"] }
```

This endpoint is called automatically by `revalidateForSite()` when a write on site A triggers revalidation on site B.

---

## Cross-Site Revalidation Flow

1. Admin POST/PUT/DELETE on a post → `revalidatePost()` computes affected paths
2. `revalidateForSite(siteId, paths)` is called
3. If `siteId` matches the current deployment's site ID → `revalidatePath()` called locally
4. Otherwise → `POST {deploy_url}/api/revalidate` with `{ secret: REVALIDATION_SECRET, paths }`
5. Target site calls `revalidatePath()` for each path on next visitor request

---

## Full Cycle Test

```bash
TOKEN=your_token
BASE=http://localhost:3000

# 1. Create a test post
POST_RESPONSE=$(curl -s -X POST \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{
 "title": "Test Post, Admin API Smoke Test",
 "slug": "test-post-smoke",
 "content": "## Hello\nThis is a test post created via the admin API.",
 "status": "published",
 "audience_tags": ["segment-one"]
 }' \
 $BASE/api/admin/posts)

echo $POST_RESPONSE
POST_ID=$(echo $POST_RESPONSE | python3 -c "import sys,json; print(json.load(sys.stdin)['post']['id'])")

# 2. Confirm post appears in list
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/api/admin/posts?status=published" | python3 -m json.tool

# 3. Update it
curl -s -X PUT \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"seo_title":"Updated SEO Title"}' \
 $BASE/api/admin/posts/$POST_ID | python3 -m json.tool

# 4. Delete it
curl -s -X DELETE \
 -H "Authorization: Bearer $TOKEN" \
 $BASE/api/admin/posts/$POST_ID | python3 -m json.tool

# 5. Confirm removal
curl -s -H "Authorization: Bearer $TOKEN" $BASE/api/admin/posts/$POST_ID
# → 404
```
