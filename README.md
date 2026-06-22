# SiteForge AI

**AI-powered website builder for non-technical small business owners.**

Describe your business by voice or text → AI extracts structured data → generates a complete, published website in under 3 minutes. No coding, no drag-and-drop, no designers required.

> Built as a full-stack production MVP demonstrating AI integration, real analytics, Google OAuth, and database-optimized query design.

---

## What It Does

1. **Voice or text input** — owner describes their business in plain language or records audio
2. **AI extraction** — Groq Whisper transcribes audio; Mistral Large extracts business name, category, products, contact info, timings
3. **Website generation** — AI generates all copy, selects theme colors, creates product descriptions and testimonials; a dynamic SVG logo is generated and embedded in site metadata
4. **Instant publish** — website goes live at `/sites/{slug}` with its own browser tab icon
5. **Natural language editing** — "Change the hero headline to be more catchy" → AI applies it
6. **Analytics** — per-site and cross-site visitor analytics: devices, referrers, daily charts, hourly heatmaps

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | FastAPI, SQLAlchemy ORM, Pydantic v2 |
| Database | PostgreSQL (Neon serverless) |
| AI — content | Mistral Large (`mistral-large-latest`) |
| AI — voice | Groq Whisper (`whisper-large-v3`) |
| Auth | JWT (`python-jose`) + Google OAuth 2.0 (`@react-oauth/google`) |
| File storage | Local static files (`/static/uploads`) |

---

## Key Engineering Decisions

### Query optimisation
Analytics initially ran 43 sequential DB round-trips per request (a Python loop firing one `COUNT(*)` per day for 7-day and 30-day history). Replaced with:
- Single `COUNT + CASE WHEN` query for all aggregate counts
- `GROUP BY date_trunc('day', visited_at)` replacing day-by-day loops
- `GROUP BY extract('hour', visited_at)` replacing fetching all rows and looping in Python
- Two `GROUP BY business_id` aggregate queries replacing N×2 per-site queries

Result: 43 queries → 7, ~6× reduction in DB round-trips.

### Dynamic logos per website
Each generated website gets a unique SVG logo derived from business initials and accent color. Stored as a base64 data URI in `website_json.logo_url` — no separate file or URL needed, works offline, embedded directly in `<head>` metadata.

### Voice → structured data pipeline
Audio blob → Groq Whisper (transcription) → Mistral Large with a structured prompt → validated Pydantic model → website JSON. The LLM call is async and non-blocking; the FastAPI endpoint uses `asyncio` throughout.

### Parallel frontend data fetching
Dashboard fetches businesses and overview analytics in parallel on mount (`Promise.all`). Per-site analytics are cached in a `Map` so switching between sites doesn't re-fetch. Overview analytics are pre-loaded before the user even opens the Analytics tab.

---

## Features

- **Voice input** via browser microphone (WebM → Whisper transcription)
- **Text input** with AI extraction of all business fields
- **3 responsive templates** auto-selected by category: Retail, Restaurant, Bakery
- **Visual editor** — inline field editing per section (hero, about, contact, social, colors)
- **AI assistant** — free-text instructions applied to any part of the website
- **Product/menu management** — add, edit, remove items with image upload
- **Google Sign-In** — native account picker popup via `@react-oauth/google`
- **JWT authentication** with email/password fallback
- **Publish / unpublish** toggle — website goes live or offline instantly
- **Dynamic favicon** — each generated site gets its own browser tab icon
- **Visitor analytics**:
  - Total visits, today, this week, 30-day average
  - 7-day and 30-day bar charts
  - Device breakdown (mobile / desktop / tablet)
  - Traffic source attribution (Google, Instagram, WhatsApp, direct, etc.)
  - Hourly activity heatmap (24h)
  - Cross-site overview + per-site drill-down

---

## Project Structure

```
SiteForge_AI/
├── backend/
│   ├── app/
│   │   ├── api/            # Route handlers (auth, business, website)
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # Business logic & query optimisation
│   │   ├── ai/
│   │   │   ├── gpt.py      # Mistral content generation & editing
│   │   │   ├── logo_gen.py # Dynamic SVG logo generator
│   │   │   └── image_search.py
│   │   ├── database/       # Connection & session management
│   │   ├── config.py       # Pydantic settings
│   │   └── main.py         # App init, CORS, migrations
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── (auth)/         # Login & Register (split-screen + Google OAuth)
│   │   ├── dashboard/      # Websites tab + Analytics tab
│   │   ├── create-business/# Voice/text input flow
│   │   ├── editor/         # Visual Editor + AI Assistant
│   │   └── sites/[slug]/   # Public website renderer (SSR)
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── templates/      # RetailStore, Restaurant, Bakery renderers
│   │   └── GoogleProvider.tsx
│   ├── lib/                # API client, auth utilities
│   ├── services/           # Typed API service layer
│   └── types/              # Shared TypeScript interfaces
└── .gitignore
```

---

## API Reference

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/register` | Create account (email + password) |
| POST | `/auth/login` | Sign in, returns JWT |
| POST | `/auth/google/token` | Google OAuth — verify access token, return JWT |
| POST | `/auth/otp/send` | Send OTP email (Gmail SMTP) |
| POST | `/auth/otp/verify` | Verify OTP, return JWT |

### Business
| Method | Path | Description |
|---|---|---|
| POST | `/business/create` | Create business manually |
| POST | `/business/transcribe` | AI extraction from text |
| POST | `/business/transcribe-audio` | Whisper transcription + AI extraction |
| GET | `/business/list` | List user's businesses |
| DELETE | `/business/{id}` | Delete business + website |

### Website
| Method | Path | Description |
|---|---|---|
| POST | `/website/generate` | Generate full website from business data |
| GET | `/website/{slug}` | Public website data (no auth) |
| POST | `/website/edit` | AI-powered natural language edit |
| PATCH | `/website/field` | Direct field update (visual editor) |
| PATCH | `/website/product` | Update a product/menu item |
| POST | `/website/publish/{id}` | Make website live |
| POST | `/website/unpublish/{id}` | Take website offline |
| POST | `/website/upload-image/{id}` | Upload image for hero or product |
| POST | `/website/visit/{slug}` | Record a visit (called from public site) |
| GET | `/website/analytics/overview` | Cross-site aggregated analytics |
| GET | `/website/analytics/{id}/detailed` | Full analytics for one website |

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- A PostgreSQL database (Neon free tier works)
- Mistral AI API key (free tier available)
- Groq API key (free tier, fast Whisper)

### 1. Clone and configure

```bash
git clone <repo-url>
cd SiteForge_AI
```

**Backend env** — create `backend/.env`:
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
SECRET_KEY=your-random-secret-key-here
MISTRAL_API_KEY=your-mistral-key
MISTRAL_CHAT_MODEL=mistral-large-latest
MISTRAL_FAST_MODEL=mistral-small-latest
GROQ_API_KEY=your-groq-key
GROQ_WHISPER_MODEL=whisper-large-v3
GMAIL_USER=your-gmail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
FRONTEND_URL=http://localhost:3000
```

**Frontend env** — create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

Runs at `http://localhost:8000` · Swagger docs at `http://localhost:8000/docs`

> The app auto-migrates on startup — new columns are added with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` so existing databases are safe.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:3000`

### 4. Google OAuth (optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
2. Create an OAuth 2.0 Client ID (Web application type)
3. Add `http://localhost:3000` to **Authorized JavaScript origins**
4. Copy the Client ID to `frontend/.env.local` as `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

---

## How the AI Pipeline Works

```
User speaks / types
       │
       ▼
[Groq Whisper]  ← audio only
       │
       ▼ transcript / raw text
[Mistral Large] ← structured extraction prompt
       │
       ▼ JSON: {name, category, products[], contact, description}
[Business record saved to DB]
       │
       ▼
[Mistral Large] ← website content generation prompt
       │
       ▼ JSON: {hero, about, features[], testimonials[], colors}
[SVG logo generated] ← initials + accent color
       │
       ▼
[website_json stored in DB]
       │
       ▼
[Published at /sites/{slug}] ← SSR Next.js page with dynamic metadata
```

**Natural language editing flow:**
```
"Remove the most expensive product and make the hero more casual"
       │
[Mistral Large] ← current website_json + instruction
       │
       ▼ {"action": "remove_product", "id": "..."}, {"action": "update_field", ...}
[Backend applies structured actions]
       │
       ▼ updated website_json saved + returned
```

---

<!-- ## What's Production-Ready vs. MVP Shortcuts

| | Status | Production path |
|---|---|---|
| Database | Neon PostgreSQL (prod-grade) | Already production-ready |
| Auth | JWT + Google OAuth | Add refresh tokens |
| Analytics queries | Optimised GROUP BY | Already production-ready |
| OTP store | In-memory dict | Replace with Redis |
| File uploads | Local disk | Replace with S3/Cloudflare R2 |
| Website hosting | Same-origin `/sites/slug` | Separate CDN + custom domains |
| Rate limiting | None | Add per-user AI call limits |
| AI keys | Single shared key | Per-user key or credits system |

---

## Resume Bullet Points

- Built **SiteForge AI**, a full-stack AI website builder (Next.js 15 + FastAPI + PostgreSQL) that converts voice or text business descriptions into live, published websites in under 3 minutes
- Integrated **Groq Whisper** for real-time voice transcription and **Mistral Large** for structured data extraction and natural language website editing
- Designed and optimised a **visitor analytics system** — reduced DB query count from 43 to 7 per request by replacing Python loops with `GROUP BY date_trunc` and `CASE WHEN` aggregate queries
- Implemented **Google OAuth 2.0** native account picker, JWT authentication, and parallel frontend data fetching with per-site caching
- Generated dynamic **SVG favicons** per website using business initials and AI-selected accent colors, embedded as base64 data URIs in page metadata -->
