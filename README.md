# SkillBridge — Evidence-Based Career Re-Entry Platform

> **"Don't judge the gap. Evaluate the work."**

SkillBridge is a full-stack professional platform that helps career returners (people with employment gaps due to caregiving, health, education, or sabbatical) re-enter the workforce by building a **verified, evidence-based skill portfolio** instead of relying on traditional resume screening.

---

## 🌐 Live Demo

> **Demo deployed on Vercel** — [https://skillbridge-app.vercel.app](https://skillbridge-app.vercel.app)
>
> No login or signup required. Click **Candidate** or **Employer** to explore.

**Demo Personas:**
- **Candidate:** Priya Sharma — Senior Java Backend Developer with 3-year career break (childcare + upskilling)
- **Employer:** Sarah Jenkins — Hiring Manager at Apex FinTech

---

## ✨ Core Features

### Candidate Side
| Feature | Description |
|---------|-------------|
| **Resume & Skill Extraction** | Upload PDF → Gemini AI extracts skills, experience, career break context |
| **Skill Gap Analysis** | Paste any job description → Gemini compares against your skills → Explainable gap report |
| **Benchmark Assessments** | Timed technical MCQ/code evaluations → Score recorded in evidence record |
| **Sandbox Projects** | Real company project briefs → Submit GitHub repo → AI-rubric evaluated |
| **Skill Freshness Passport** | Flagship evidence portfolio: Verified / Demonstrated / Needs Refresh |
| **Mentor Sessions** | Browse industry mentors → Book 1:1 sessions with scheduling |
| **Fellowships & Returnships** | Apply to structured re-entry programs at partner companies |
| **Professional References** | Add and manage reference contacts for employer verification |
| **Gap Certificate Guidance** | AI-generated structured narratives for career gap documentation |
| **Job Applications** | Apply to open employer roles and track application status |
| **Reports & Exports** | Generate PDF/CSV/Excel reports of evidence and passport data |

### Employer Side
| Feature | Description |
|---------|-------------|
| **Company Profile** | Set up employer profile with industry, location, company description |
| **Job Posting & Management** | Create, edit, delete job listings with required/preferred skills |
| **Candidate Discovery** | Browse candidates filtered by verified skills and evidence level |
| **Candidate Evaluation** | View full evidence record, passport, scores per candidate |
| **Application Review** | Review applications, update status (Shortlist / Interview / Accept / Reject) |
| **Employer Feedback** | Provide structured feedback to candidates post-review |

---

## 🏗️ Architecture

```
SkillBridge/
├── frontend/          # React 19 + TypeScript + Vite + React Router v7
│   └── src/
│       ├── pages/     # All candidate & employer pages
│       ├── components/ # AppLayout (sidebar + role switcher), StatCard, etc.
│       ├── context/   # AuthContext (role-switcher, no login required)
│       ├── hooks/     # useApi, useRealtime
│       └── types/     # Full TypeScript type definitions
├── backend/           # Express + TypeScript
│   └── src/
│       ├── routes/    # candidate, employer, skills, assessments, projects, etc.
│       ├── models/    # All DB models with PostgreSQL + in-memory fallback
│       ├── services/  # Gemini AI service, skill gap service, PDF report service
│       ├── middleware/ # Auth (bypass token support for demo)
│       └── config/    # DB connection (Supabase/PostgreSQL + fallback)
└── api/               # Vercel serverless entry point (wraps Express)
```

**Stack:**
- **Frontend:** React 19, TypeScript, Vite 6, React Router v7, Lucide React
- **Backend:** Express 4, TypeScript, Node.js 26
- **AI:** Google Gemini API (`@google/generative-ai`)
- **Database:** PostgreSQL via `pg` / Supabase (with full in-memory fallback)
- **Deployment:** Vercel (SPA + serverless `/api` functions)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 10+
- (Optional) PostgreSQL or Supabase for persistent storage

### Local Development

```bash
# Install all dependencies
npm install
npm install --prefix frontend
npm install --prefix backend

# Start frontend dev server
npm run dev:frontend        # http://localhost:5173

# Start backend dev server (separate terminal)
npm run dev:backend         # http://localhost:5001
```

### Environment Variables (backend)

```bash
# backend/.env  (copy from backend/.env.example)
DATABASE_URL=postgresql://...     # Optional — app works without it
SUPABASE_URL=https://...          # Optional
SUPABASE_SERVICE_ROLE_KEY=...     # Optional
GEMINI_API_KEY=AIza...            # Required for real AI features
JWT_SECRET=your-secret-key
```

> **Note:** Without a database, all data is stored in-memory per process (resets on restart). Perfect for demos. With a PostgreSQL/Supabase connection, data is fully persistent.

### Production Build

```bash
npm run build:frontend    # Builds to frontend/dist/
```

---

## 🔧 Vercel Deployment

The project is configured for single-command Vercel deployment:

```bash
npx vercel --prod
```

**Environment variables to set in Vercel dashboard:**
- `GEMINI_API_KEY` — Google Gemini API key
- `DATABASE_URL` — (Optional) PostgreSQL connection string
- `JWT_SECRET` — Any secret string

---

## 📝 License

MIT © 2026 SkillBridge. "Don't judge the gap. Evaluate the work."
