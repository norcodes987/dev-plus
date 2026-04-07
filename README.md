# DevPulse

A dark terminal-aesthetic developer best-practices explorer powered by the Google Gemini API. Pick a category, browse 6 AI-generated topic cards, and drill into any card for a full explanation with a syntax-highlighted code example.

---

## Quick Start

```bash
# 1. Add your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# 2. Install dependencies
npm install

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS v4 |
| AI | Google Gemini (`gemini-2.5-flash`) |
| Syntax highlighting | Shiki v4 (`github-dark` theme) |
| Font | IBM Plex Mono |

---

## App Flow

```
User opens app
      │
      ▼
┌─────────────────────────────────┐
│          app/page.tsx           │
│         (use client)            │
│                                 │
│  activeCategory = "frontend"    │
│  topicsCache    = {}            │
│  loading        = true          │
└────────────┬────────────────────┘
             │ fetch on mount
             ▼
┌─────────────────────────────────┐
│     POST /api/topics            │
│     { category: "frontend" }    │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│        Gemini API               │
│   gemini-2.5-flash              │
│                                 │
│  returns JSON array of 6 cards  │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Parse + add UUIDs server-side │
│   return TopicCard[]            │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Render 6 × <TopicCard>        │
│   (cached in topicsCache)       │
│                                 │
│   [React SC] [Code Split] ...   │
│   [Lazy Load] [A11y]  ...       │
└────────────┬────────────────────┘
             │ user clicks a card
             ▼
┌─────────────────────────────────┐
│  router.push(                   │
│   /topic/react-server-components│
│   ?title=...&category=...       │
│   &difficulty=...&tags=...      │
│  )                              │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│  app/topic/[slug]/page.tsx      │
│  (server component)             │
│                                 │
│  <Suspense fallback={skeleton}> │
│    <TopicDetailContent />       │
│  </Suspense>                    │
└────────────┬────────────────────┘
             │ reads searchParams, fetches on mount
             ▼
┌─────────────────────────────────┐
│     POST /api/card-detail       │
│     { title, category,          │
│       difficulty, tags }        │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│        Gemini API               │
│                                 │
│  returns { what, when,          │
│    code (raw), language,        │
│    mistakes[] }                 │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   Shiki highlights code         │
│   server-side → HTML string     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│   <DetailView>                  │
│   ├─ Title + badges + tags      │
│   ├─ WHAT IT IS                 │
│   ├─ WHEN TO USE IT             │
│   ├─ CODE EXAMPLE (Shiki HTML)  │
│   └─ COMMON MISTAKES            │
└─────────────────────────────────┘
```

---

## How Prompts Are Generated

### Topics Prompt — `topicsPrompt(category)`

Called when the user lands on a category or hits "↺ New topics".

```
┌──────────────────────────────────────────────────────────┐
│  INPUT                                                   │
│  category = "frontend"                                   │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  PROMPT (lib/prompts.ts → topicsPrompt)                  │
│  ┌────────────────────────────────────────────────────┐  │
│  │ You are a developer education assistant.           │  │
│  │ Generate 6 important best practice topics for      │  │
│  │ the "frontend" category of software development.   │  │
│  │                                                    │  │
│  │ Return ONLY a raw JSON array — no markdown fences, │  │
│  │ no explanation, no other text.                     │  │
│  │                                                    │  │
│  │ Each of the 6 objects must have:                   │  │
│  │   title      : string (3-8 words)                  │  │
│  │   summary    : string (one sentence, max 15 words) │  │
│  │   difficulty : "beginner"|"intermediate"|"advanced"│  │
│  │   impact     : "high"|"medium"|"low"               │  │
│  │   tags       : string[] (2-4 short lowercase tags) │  │
│  │   category   : "frontend"                          │  │
│  │                                                    │  │
│  │ Do NOT include an "id" field.                      │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  GEMINI RESPONSE (example)                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │ [                                                  │  │
│  │   {                                                │  │
│  │     "title": "Use Component-Based Architecture",   │  │
│  │     "summary": "Structure UIs into reusable...",   │  │
│  │     "difficulty": "beginner",                      │  │
│  │     "impact": "high",                              │  │
│  │     "tags": ["components","modularity","react"],   │  │
│  │     "category": "frontend"                         │  │
│  │   },                                               │  │
│  │   ... 5 more                                       │  │
│  │ ]                                                  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────┘
                       │ parseGeminiJson() + crypto.randomUUID()
                       ▼
                  TopicCard[]
```

---

### Card Detail Prompt — `cardDetailPrompt(title, category, difficulty, tags)`

Called when the user clicks a card (and again on "↺ Regenerate").

```
┌──────────────────────────────────────────────────────────┐
│  INPUT (from URL search params)                          │
│  title      = "Use Component-Based Architecture"         │
│  category   = "frontend"                                 │
│  difficulty = "beginner"                                 │
│  tags       = ["components", "modularity", "react"]      │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  PROMPT (lib/prompts.ts → cardDetailPrompt)              │
│  ┌────────────────────────────────────────────────────┐  │
│  │ You are a developer education assistant.           │  │
│  │ Provide a detailed explanation of this best        │  │
│  │ practice:                                          │  │
│  │                                                    │  │
│  │   Title:      "Use Component-Based Architecture"   │  │
│  │   Category:   frontend                             │  │
│  │   Difficulty: beginner                             │  │
│  │   Tags:       components, modularity, react        │  │
│  │                                                    │  │
│  │ Return ONLY a raw JSON object with these fields:   │  │
│  │   what      : string (2-3 sentences, what it is)   │  │
│  │   when      : string (2-3 sentences, when to use)  │  │
│  │   code      : string (10-20 lines of real code     │  │
│  │               with inline comments)                │  │
│  │   language  : string (e.g. "typescript")           │  │
│  │   mistakes  : string[] (exactly 3, verb-first)     │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│  GEMINI RESPONSE (example)                               │
│  ┌────────────────────────────────────────────────────┐  │
│  │ {                                                  │  │
│  │   "what": "Component-based architecture involves   │  │
│  │            building UIs from small, independent    │  │
│  │            reusable pieces called components...",  │  │
│  │   "when": "Apply this in virtually all modern      │  │
│  │            frontend projects...",                  │  │
│  │   "code": "function Button({ label, onClick }) {  │  │
│  │              return <button onClick={onClick}>     │  │
│  │                {label}                             │  │
│  │              </button>                             │  │
│  │            }",                                     │  │
│  │   "language": "javascript",                        │  │
│  │   "mistakes": [                                    │  │
│  │     "Create overly large components...",           │  │
│  │     "Over-componentize trivial UI elements...",    │  │
│  │     "Hardcode business logic inside components..." │  │
│  │   ]                                                │  │
│  │ }                                                  │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────┬───────────────────────────────────┘
                       │ parseGeminiJson()
                       │ Shiki codeToHtml(code, { lang, theme: "github-dark" })
                       ▼
                   CardDetail
              (code = <pre>...</pre>)
```

---

### JSON Parse Fallback Chain

Gemini sometimes wraps its response in markdown fences. `parseGeminiJson()` handles this with three tiers:

```
Raw Gemini response
        │
        ▼
┌───────────────────┐
│  Tier 1           │
│  JSON.parse(raw)  │──── success ──▶ return parsed value
└────────┬──────────┘
         │ SyntaxError
         ▼
┌───────────────────────────────────┐
│  Tier 2                           │
│  raw.trim()                       │
│     .replace(/^```json/i, "")     │
│     .replace(/^```/i, "")         │
│     .replace(/```\s*$/i, "")      │
│     .trim()                       │
│  JSON.parse(stripped)             │──── success ──▶ return parsed value
└────────┬──────────────────────────┘
         │ SyntaxError
         ▼
┌───────────────────────────────────┐
│  Tier 3                           │
│  find first '[' or '{'            │
│  find last  ']' or '}'            │
│  JSON.parse(raw.slice(start, end))│──── success ──▶ return parsed value
└────────┬──────────────────────────┘
         │ still fails
         ▼
    throw Error (raw response included for debugging)
```

---

## File Structure

```
dev-pulse/
├── app/
│   ├── page.tsx                      # Home — category tabs + card grid
│   ├── layout.tsx                    # IBM Plex Mono font + metadata
│   ├── globals.css                   # Dark theme + shimmer animation
│   ├── api/
│   │   ├── topics/route.ts           # POST — generate 6 topic cards
│   │   └── card-detail/route.ts      # POST — generate detail + Shiki highlight
│   ├── components/
│   │   ├── CategoryTabs.tsx          # 6 pill tabs with accent colours
│   │   ├── TopicCard.tsx             # Card with hover effect, badges, tags
│   │   ├── SkeletonCard.tsx          # Shimmer placeholder (shown while loading)
│   │   ├── ErrorBox.tsx              # Error + expandable details + retry
│   │   ├── DetailView.tsx            # Full detail layout (what/when/code/mistakes)
│   │   └── TopicDetailContent.tsx   # (use client) reads searchParams, fetches detail
│   └── topic/
│       └── [slug]/page.tsx           # Server component — Suspense wrapper
└── lib/
    ├── types.ts                      # TopicCard, CardDetail types
    ├── gemini.ts                     # generateContent() + parseGeminiJson()
    └── prompts.ts                    # topicsPrompt() + cardDetailPrompt()
```

---

## Categories

| Category | Accent |
|---|---|
| Frontend | `#6366f1` indigo |
| Backend | `#06b6d4` cyan |
| Cloud | `#f97316` orange |
| Architecture | `#a855f7` purple |
| Security | `#ef4444` red |
| Performance | `#22c55e` green |
