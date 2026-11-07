# SkillBridge

**"Don't judge the gap. Evaluate the work."**

An evidence-based career platform that evaluates candidates on demonstrated skills rather than employment gaps.

## Features

### For Candidates
- **Profile & Resume Upload** — PDF upload with real Gemini AI extraction
- **Skill Gap Analysis** — Compare confirmed skills against job requirements using Gemini
- **Assessments** — Benchmark assessments with scoring and feedback
- **Company Projects** — Sandbox projects with evaluator scoring
- **Evidence Passport** — Skill Freshness Passport showing Verified/Demonstrated/Needs Refresh
- **Mentor Sessions** — Book 1:1 sessions with industry mentors
- **Fellowships & Returnships** — Browse and apply for returnship opportunities
- **Career-Break Documentation** — Generate gap narratives for resumes and cover letters
- **Professional References** — Add and manage professional references
- **Job Applications Tracking** — Apply to jobs and track application status
- **Feedback History** — All feedback from assessments, projects, and applications
- **Reports** — Generate real PDF, CSV, and XLSX reports from live database data

### For Employers
- **Company Profile** — Set up company identity and details
- **Jobs Management** — Create, edit, delete job postings with required/preferred skills
- **Candidate Discovery** — Search candidates by skills and evidence count
- **Evidence Review** — View candidate evidence passport, assessments, and projects
- **Application Management** — Shortlist, interview, accept/reject with feedback
- **Real-time Updates** — Live SSE updates when candidates apply or submit

### Technical
- **Realtime** — Server-Sent Events (SSE) for live bidirectional updates
- **Auth** — JWT-based with candidate/employer role separation
- **Database** — Supabase/PostgreSQL with in-memory fallback
- **AI** — Google Gemini for resume extraction and skill analysis

## Setup

```bash
# Clone
git clone https://github.com/Shreya-Dahale/skillbridge
cd skillbridge

# Backend
cd backend
cp .env.example .env  # fill in your env vars
npm install
npm run dev  # runs on port 5001

# Frontend (new terminal)
cd frontend
npm install
npm run dev  # runs on port 3000
```

## Demo Accounts

| Role      | Email                             | Password        |
|-----------|-----------------------------------|-----------------|
| Candidate | candidate.demo@skillbridge.app    | SkillBridge@123 |
| Employer  | employer.demo@skillbridge.app     | SkillBridge@123 |

## Environment Variables

See `backend/.env.example` for required configuration.
