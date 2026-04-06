# DevPulse — Design Spec

**Date:** 2026-04-06
**Status:** Approved

## Overview

A browsable developer best-practices explorer. Users pick a category, browse 6 AI-generated topic cards, and drill into any card for a full explanation with a code example. Topics are regenerated on demand via a refresh button. Personal use only — no authentication.

---

## Stack

- Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS v4
- Google Gemini API (`gemini-1.5-flash`) via `@google/generative-ai`
- Shiki for server-side syntax highlighting
- IBM Plex Mono font (Google Fonts via `next/font/google`)
- Gemini API key: `GEMINI_API_KEY` in `.env.local`

---

## File Structure

```
app/
  page.tsx                    # 'use client' — category tabs + card grid
  topic/[slug]/page.tsx       # 'use client' — full detail view
  api/
    topics/route.ts           # POST — generate 6 topic cards
    card-detail/route.ts      # POST — generate full card detail
  components/
    CategoryTabs.tsx
    TopicCard.tsx
    SkeletonCard.tsx
    DetailView.tsx            # full detail layout for the topic page
    ErrorBox.tsx
lib/
  gemini.ts                   # generateContent(prompt) helper
  prompts.ts                  # topicsPrompt(), cardDetailPrompt()
  types.ts                    # TopicCard, CardDetail types
docs/
  superpowers/specs/
    2026-04-06-devpulse-design.md
```

---

## TypeScript Types

```ts
type TopicCard = {
  id: string
  title: string
  summary: string
  difficulty: "beginner" | "intermediate" | "advanced"
  impact: "high" | "medium" | "low"
  tags: string[]
  category: string
}

type CardDetail = {
  what: string
  when: string
  code: string          // pre-highlighted HTML from Shiki
  language: string
  mistakes: string[]
}
```

---

## Categories & Accent Colours

| Category     | Colour    |
|--------------|-----------|
| frontend     | `#6366f1` |
| backend      | `#06b6d4` |
| cloud        | `#f97316` |
| architecture | `#a855f7` |
| security     | `#ef4444` |
| performance  | `#22c55e` |

---

## State Management (`page.tsx`)

`page.tsx` is a client component that owns all grid state:

- `activeCategory: string` — currently selected tab (default: `"frontend"`)
- `topicsCache: Record<string, TopicCard[]>` — populated on first visit to a category, reused on return
- `loading: boolean` — true while fetching topics for the active category
- `error: string | null` — set if the API call fails

On mount, fetch topics for `"frontend"`. On tab change, check cache first — fetch only if the category has not been loaded this session.

---

## API Routes

### `POST /api/topics`

**Request:** `{ category: string }`

**Flow:**
1. Call `generateContent(topicsPrompt(category))`
2. Parse JSON with 3-tier fallback: direct `JSON.parse` → strip ` ```json ` fences → regex extract first `[` to last `]`
3. Return the array of 6 `TopicCard` objects (without `code`/detail fields)

**Response:** `TopicCard[]` or `{ error: string }`

### `POST /api/card-detail`

**Request:** `{ title: string, category: string, difficulty: string, tags: string[] }`

**Flow:**
1. Call `generateContent(cardDetailPrompt(...))`
2. Parse JSON with same 3-tier fallback (extract `{` to `}`)
3. Run the `code` field through Shiki (`codeToHtml`, theme: `github-dark`) server-side
4. Return the enriched `CardDetail` object with `code` replaced by highlighted HTML

**Response:** `CardDetail` or `{ error: string }`

---

## Gemini Setup (`lib/gemini.ts`)

```ts
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

export async function generateContent(prompt: string): Promise<string> {
  const result = await model.generateContent(prompt)
  return result.response.text()
}
```

---

## Prompts (`lib/prompts.ts`)

Both prompts end with the instruction: *"Return only raw JSON with no markdown fences and no explanation."*

**`topicsPrompt(category)`** — instructs Gemini to return a JSON array of 6 objects matching `TopicCard` shape (no `id` — generated client-side via `crypto.randomUUID()`).

**`cardDetailPrompt(title, category, difficulty, tags)`** — instructs Gemini to return a single JSON object matching `CardDetail` shape (`what`, `when`, `code`, `language`, `mistakes`).

---

## Components

### `CategoryTabs`

Props: `{ activeCategory, onSelect }`. Renders 6 pill tabs. Active tab has the category accent colour as background. Inactive tabs have a subtle border.

### `TopicCard`

Props: `{ card, categoryColour, onClick }`.

- `border-top: 3px solid <categoryColour>`
- Difficulty badge: green (`beginner`), blue (`intermediate`), purple (`advanced`)
- Impact dot: orange (`high`), yellow (`medium`), grey (`low`)
- Tags as small monospace chips
- Hover: `transform: translateY(-2px)` + `box-shadow: 0 4px 24px <categoryColour>22`

### `SkeletonCard`

Same dimensions as `TopicCard`. Three placeholder bars animated with a shimmer `@keyframes` gradient sweep. Rendered 6× during loading.

### `ErrorBox`

Props: `{ message, onRetry }`. Shows a short error description, an expandable `<details>` with the raw error text, and a "Retry" button.

### `DetailView`

Rendered inside `app/topic/[slug]/page.tsx`. Props: `{ card: TopicCard, detail: CardDetail, onRegenerate, loading }`.

Layout:
- Back link → returns to previous page
- Title + difficulty badge + impact dot + tags
- **What it is** — `detail.what`
- **When to use it** — `detail.when`
- **Code example** — `<pre>` rendering `detail.code` (Shiki HTML, `dangerouslySetInnerHTML`)
- **Common mistakes** — `detail.mistakes` as bullet list
- Regenerate button (top-right), shows inline spinner while re-fetching

---

## Detail Page Navigation

Clicking a `TopicCard` routes to:

```
/topic/react-server-components?title=React+Server+Components&category=frontend&difficulty=beginner&tags=react,ssr
```

The slug is the kebab-cased title. The detail page reads metadata from `useSearchParams()` and calls `/api/card-detail` on mount. Regenerate re-calls the same endpoint.

---

## Visual Design

- **Background:** `#0a0a0f`
- **Card background:** `#0f1117`
- **Card border:** `#1e293b`
- **Font:** IBM Plex Mono
- **Shiki theme:** `github-dark`
- Difficulty badge colours: green / blue / purple
- Impact dot colours: orange / yellow / grey
- Card top border and hover shadow use category accent colour

---

## Error Handling

- API route failures return `{ error: string }` with an appropriate HTTP status
- The client renders `ErrorBox` with the message and a Retry button
- JSON parse failures surface the raw Gemini response text in the error for debuggability

---

## Not in scope

- User authentication
- Persistent storage / database
- Shareable topic URLs (card metadata is in query params but not guaranteed stable across regenerations)
- Mobile-optimised layout (desktop-first for personal use)
