# Contract Clause Risk Extractor

AI-powered contract analysis tool that identifies risk clauses, scores severity, and generates actionable negotiation recommendations — built for the **Leveld.ai Technical Challenge**.

---

## Architectural Decisions

### Multi-Stage Pipeline (Not a Single Mega-Prompt)

The system processes contracts through **six logically isolated stages**, each with strict TypeScript input/output contracts. Stages 3–5 are executed in a **single optimised AI call** for production speed while maintaining clean service boundaries:

```
PDF / Text  →  Ingestion  →  Chunking  →  Combined AI Analysis  →  Executive Summary  →  Dashboard
                (parse)      (split)      (classify+score+rec)      (AI call 2)
                                            (AI call 1)
```

| Stage | Service | Purpose |
|-------|---------|---------|
| 1 | Ingestion | PDF parsing via `pdf-parse`, noise removal, repeated header/footer detection |
| 2 | Chunking | Heading-based clause boundary detection (ALL CAPS, Title Case, numbered) |
| 3–5 | Combined Analysis | Single AI call: classify into 12 categories, score severity, generate recommendations |
| 6 | Summary | Executive-level risk briefing with red flags and negotiation priorities |

**Why this design:**
- **2 API calls total** — immune to rate limiting, fast (~15–25s)
- **Prompt specialisation** — the combined prompt gives the AI full clause context for better scoring
- **Service isolation** — each module has its own directory, types, and validation logic
- **Extensibility** — new stages (compliance checks, benchmarking) plug in without modifying existing code

### Intelligent Chunking (Not Naive Token Splitting)

Clause boundaries are detected via regex patterns matching real legal heading styles:
- `CLAUSE 5 — PROVISION OF SERVICES` / `Clause 5 — Title`
- `Section 4 - Fees` / `SECTION 4 - FEES`
- `3. Client Obligations` / `3. CLIENT OBLIGATIONS`
- `Article 7`, `Part III`, `ANNEX A`, `Schedule 1`

Repeated headers/footers are removed using **frequency analysis** — any line appearing 3+ times (with numbers normalised) is stripped. Fully generic: no company-specific patterns.

---

## AI Model & Provider

**Provider:** [Groq](https://groq.com) (free tier)
**Model:** LLaMA 3.3 70B Versatile

**Why Groq + LLaMA 3.3 70B:**
- **14,400 requests/day** free (vs 1,500 for Gemini) — production-viable
- **30 RPM** rate limit — handles concurrent users
- **Sub-second inference** on Groq's custom LPU hardware
- **Strong structured output** — reliable JSON responses for classification and scoring
- **OpenAI-compatible API** — swap providers by changing one config file
- **No credit card required**

All AI calls use `response_format: { type: 'json_object' }` with low temperature (0.1–0.3) for deterministic, parseable output. Every response is validated against strict TypeScript types with fallback defaults.

---

## Known Limitations

- **Scanned PDFs** — image-only PDFs are not supported; requires text-layer PDFs
- **Token ceiling** — contracts exceeding ~80 pages may hit per-request token limits
- **English only** — prompts and heading detection are optimised for English-language contracts
- **No persistence** — analysis results are ephemeral (not stored server-side)
- **Table-heavy annexes** — fee schedules and tabular data are chunked but lack financial context for deep analysis

---

## What I Would Improve With More Time

1. **Server-Sent Events** — stream real pipeline progress instead of simulated stage indicators
2. **Contract comparison** — upload two versions and diff risk profiles side-by-side
3. **PDF annotation** — highlight risky clauses directly in the rendered PDF
4. **Persistent history** — save analyses to a database for longitudinal tracking
5. **Custom risk templates** — let users define severity thresholds per industry/contract type
6. **Multi-provider failover** — automatic fallback across Groq → Gemini → OpenAI if one rate-limits
7. **Batch processing** — queue and analyse multiple contracts in parallel

---

## Setup and Run

### Prerequisites

- Node.js 20+
- npm 10+

### Install Dependencies

```bash
git clone <repo-url>
cd contract-risk-extractor
npm install
```

### Environment Variables

Create `.env.local`:
```
GROQ_API_KEY=your_groq_api_key_here
```
Get a free key at [console.groq.com](https://console.groq.com)

### Run Locally

```bash
npm run dev
```
Open `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm run start
```

## Core Dependencies

Installed via `npm install` from `package.json`:

- Runtime: `next`, `react`, `react-dom`, `openai`, `pdf-parse`, `lucide-react`
- Development: `typescript`, `eslint`, `eslint-config-next`, `tailwindcss`, `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom`

## Tech Stack

Next.js 16 (App Router) · TypeScript (strict) · Tailwind CSS 4 · Groq LLaMA 3.3 70B · OpenAI SDK · pdf-parse · Lucide React · Vercel
