import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

// ---- Mentor Types ----

export interface MentorProfile {
  id: string;
  name: string;
  title: string;
  company: string;
  expertise: string[];
  bio: string;
  availability: string;
  session_duration_min: number;
  created_at: string;
}

export interface MentorBooking {
  id: string;
  candidate_id: string;
  mentor_id: string;
  topic: string;
  scheduled_at: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// ---- Fellowship Types ----

export interface Fellowship {
  id: string;
  title: string;
  provider: string;
  stipend: string;
  duration: string;
  description: string;
  eligibility: string;
  skills_required: string[];
  application_deadline: string;
  created_at: string;
}

export interface FellowshipApplication {
  id: string;
  fellowship_id: string;
  candidate_id: string;
  status: string;
  cover_note: string;
  created_at: string;
  updated_at: string;
}

// ---- Professional Reference Types ----

export interface ProfessionalReference {
  id: string;
  candidate_id: string;
  name: string;
  relationship: string;
  company: string;
  email: string;
  phone: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Gap Narrative Types ----

export interface GapNarrative {
  id: string;
  candidate_id: string;
  gap_pitch: string;
  resume_statement: string;
  cover_letter_note: string;
  created_at: string;
  updated_at: string;
}

// In-memory fallback stores
const memoryMentors: Map<string, MentorProfile> = new Map();
const memoryBookings: Map<string, MentorBooking> = new Map();
const memoryFellowships: Map<string, Fellowship> = new Map();
const memoryFellowshipApps: Map<string, FellowshipApplication> = new Map();
const memoryReferences: Map<string, ProfessionalReference> = new Map();
const memoryGapNarratives: Map<string, GapNarrative> = new Map();

const initialMentors: MentorProfile[] = [
  {
    id: 'mentor-1',
    name: 'Priya Sharma',
    title: 'Senior Engineering Manager',
    company: 'Google India',
    expertise: ['Engineering Leadership', 'Career Transitions', 'Resume Review', 'Python'],
    bio: 'Ex-career-break returner turned engineering manager. Specializes in helping returners navigate re-entry.',
    availability: 'weekends',
    session_duration_min: 60,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mentor-2',
    name: 'Arun Mehta',
    title: 'Product Director',
    company: 'Flipkart',
    expertise: ['Product Management', 'Skill-gap Analysis', 'Interview Prep'],
    bio: 'Passionate about helping candidates demonstrate work over resumes.',
    availability: 'evenings',
    session_duration_min: 45,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mentor-3',
    name: 'Deepa Nair',
    title: 'Data Science Lead',
    company: 'Infosys',
    expertise: ['Data Science', 'Machine Learning', 'Portfolio Building', 'Python', 'SQL'],
    bio: 'Helping candidates build an evidence-based portfolio in DS/ML.',
    availability: 'mornings',
    session_duration_min: 60,
    created_at: new Date().toISOString(),
  },
];

const initialFellowships: Fellowship[] = [
  {
    id: 'fellowship-1',
    title: 'TechReturn Fellowship 2026',
    provider: 'NASSCOM Foundation',
    stipend: '₹50,000/month',
    duration: '6 months',
    description: 'Paid returnship for tech professionals re-entering after a career break of 1+ years.',
    eligibility: 'At least 1 year career break, 3+ years prior experience in tech',
    skills_required: ['Python', 'JavaScript', 'SQL'],
    application_deadline: '2026-12-31',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fellowship-2',
    title: 'Women in Tech Returnship',
    provider: 'IIMB & Adobe',
    stipend: '₹60,000/month',
    duration: '4 months',
    description: 'Structured returnship program for women returning to engineering roles.',
    eligibility: 'Women with 2+ years break, previous SWE experience',
    skills_required: ['JavaScript', 'React', 'Node.js'],
    application_deadline: '2026-11-30',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fellowship-3',
    title: 'Data Science Re-entry Program',
    provider: 'Analytics Vidhya',
    stipend: '₹40,000/month',
    duration: '3 months',
    description: 'Bridging program for data professionals returning from career breaks.',
    eligibility: 'Open to all genders, 1+ year break, prior DS/analytics experience',
    skills_required: ['Python', 'SQL', 'Machine Learning'],
    application_deadline: '2026-12-15',
    created_at: new Date().toISOString(),
  },
];

// Seed memory stores
for (const m of initialMentors) memoryMentors.set(m.id, m);
for (const f of initialFellowships) memoryFellowships.set(f.id, f);

// ---- Table Initialization ----

export async function initMentorFellowshipTables(): Promise<void> {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mentors (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL DEFAULT '',
        company VARCHAR(255) NOT NULL DEFAULT '',
        expertise JSONB NOT NULL DEFAULT '[]'::jsonb,
        bio TEXT NOT NULL DEFAULT '',
        availability VARCHAR(100) NOT NULL DEFAULT '',
        session_duration_min INT NOT NULL DEFAULT 60,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS mentor_bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        mentor_id VARCHAR(100) NOT NULL REFERENCES mentors(id) ON DELETE CASCADE,
        topic VARCHAR(500) NOT NULL DEFAULT '',
        scheduled_at TIMESTAMPTZ,
        notes TEXT NOT NULL DEFAULT '',
        status VARCHAR(50) NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_mentor_bookings_candidate ON mentor_bookings(candidate_id);

      CREATE TABLE IF NOT EXISTS fellowships (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        provider VARCHAR(255) NOT NULL DEFAULT '',
        stipend VARCHAR(100) NOT NULL DEFAULT '',
        duration VARCHAR(100) NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        eligibility TEXT NOT NULL DEFAULT '',
        skills_required JSONB NOT NULL DEFAULT '[]'::jsonb,
        application_deadline VARCHAR(50) NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fellowship_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        fellowship_id VARCHAR(100) NOT NULL REFERENCES fellowships(id) ON DELETE CASCADE,
        candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'Applied',
        cover_note TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(fellowship_id, candidate_id)
      );
      CREATE INDEX IF NOT EXISTS idx_fellowship_apps_candidate ON fellowship_applications(candidate_id);

      CREATE TABLE IF NOT EXISTS professional_references (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        relationship VARCHAR(100) NOT NULL DEFAULT '',
        company VARCHAR(255) NOT NULL DEFAULT '',
        email VARCHAR(255) NOT NULL DEFAULT '',
        phone VARCHAR(50) NOT NULL DEFAULT '',
        verified BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_references_candidate ON professional_references(candidate_id);

      CREATE TABLE IF NOT EXISTS gap_narratives (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        gap_pitch TEXT NOT NULL DEFAULT '',
        resume_statement TEXT NOT NULL DEFAULT '',
        cover_letter_note TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed database if empty
    for (const m of initialMentors) {
      await pool.query(
        `INSERT INTO mentors (id, name, title, company, expertise, bio, availability, session_duration_min)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO NOTHING`,
        [m.id, m.name, m.title, m.company, JSON.stringify(m.expertise), m.bio, m.availability, m.session_duration_min]
      );
    }
    for (const f of initialFellowships) {
      await pool.query(
        `INSERT INTO fellowships (id, title, provider, stipend, duration, description, eligibility, skills_required, application_deadline)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO NOTHING`,
        [f.id, f.title, f.provider, f.stipend, f.duration, f.description, f.eligibility, JSON.stringify(f.skills_required), f.application_deadline]
      );
    }
    console.log('Mentor/fellowship tables initialized.');
  } catch (err) {
    console.warn('Mentor/fellowship table init error:', err instanceof Error ? err.message : err);
  }
}

// ---- Mentor CRUD ----

export async function getAllMentors(): Promise<MentorProfile[]> {
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM mentors ORDER BY name ASC');
      return res.rows.map(rowToMentor);
    } catch {
      // Fall through
    }
  }
  return Array.from(memoryMentors.values());
}

export async function bookMentor(candidateId: string, data: { mentor_id: string; topic: string; scheduled_at?: string; notes?: string }): Promise<MentorBooking> {
  const id = uuidv4();
  const now = new Date().toISOString();

  if (pool) {
    try {
      const res = await pool.query(
        `INSERT INTO mentor_bookings (id, candidate_id, mentor_id, topic, scheduled_at, notes, status, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,'Pending',$7,$8) RETURNING *`,
        [id, candidateId, data.mentor_id, data.topic, data.scheduled_at || null, data.notes || '', now, now]
      );
      if (res.rows.length > 0) return rowToMentorBooking(res.rows[0]);
    } catch {
      // Fall through
    }
  }

  const booking: MentorBooking = {
    id,
    candidate_id: candidateId,
    mentor_id: data.mentor_id,
    topic: data.topic,
    scheduled_at: data.scheduled_at || '',
    notes: data.notes || '',
    status: 'Pending',
    created_at: now,
    updated_at: now,
  };
  memoryBookings.set(id, booking);
  return booking;
}

export async function getCandidateMentorBookings(candidateId: string): Promise<(MentorBooking & { mentor_name: string; mentor_title: string; mentor_company: string })[]> {
  if (pool) {
    try {
      const res = await pool.query(
        `SELECT mb.*, m.name AS mentor_name, m.title AS mentor_title, m.company AS mentor_company
         FROM mentor_bookings mb JOIN mentors m ON mb.mentor_id = m.id
         WHERE mb.candidate_id = $1 ORDER BY mb.created_at DESC`,
        [candidateId]
      );
      return res.rows.map((row) => ({
        ...rowToMentorBooking(row),
        mentor_name: String(row.mentor_name ?? ''),
        mentor_title: String(row.mentor_title ?? ''),
        mentor_company: String(row.mentor_company ?? ''),
      }));
    } catch {
      // Fall through
    }
  }

  return Array.from(memoryBookings.values())
    .filter((b) => b.candidate_id === candidateId)
    .map((b) => {
      const mentor = memoryMentors.get(b.mentor_id);
      return {
        ...b,
        mentor_name: mentor?.name || 'Mentor',
        mentor_title: mentor?.title || '',
        mentor_company: mentor?.company || '',
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function rowToMentor(row: Record<string, unknown>): MentorProfile {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    title: String(row.title ?? ''),
    company: String(row.company ?? ''),
    expertise: Array.isArray(row.expertise) ? row.expertise as string[] : (typeof row.expertise === 'string' ? JSON.parse(row.expertise) : []),
    bio: String(row.bio ?? ''),
    availability: String(row.availability ?? ''),
    session_duration_min: Number(row.session_duration_min ?? 60),
    created_at: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
  };
}

function rowToMentorBooking(row: Record<string, unknown>): MentorBooking {
  return {
    id: String(row.id),
    candidate_id: String(row.candidate_id),
    mentor_id: String(row.mentor_id),
    topic: String(row.topic ?? ''),
    scheduled_at: row.scheduled_at ? new Date(row.scheduled_at as string).toISOString() : '',
    notes: String(row.notes ?? ''),
    status: String(row.status ?? 'Pending'),
    created_at: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at as string).toISOString() : new Date().toISOString(),
  };
}

// ---- Fellowship CRUD ----

export async function getAllFellowships(): Promise<Fellowship[]> {
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM fellowships ORDER BY application_deadline ASC');
      return res.rows.map(rowToFellowship);
    } catch {
      // Fall through
    }
  }
  return Array.from(memoryFellowships.values());
}

export async function applyToFellowship(candidateId: string, data: { fellowship_id: string; cover_note?: string }): Promise<FellowshipApplication> {
  const id = uuidv4();
  const now = new Date().toISOString();

  if (pool) {
    try {
      const res = await pool.query(
        `INSERT INTO fellowship_applications (id, fellowship_id, candidate_id, status, cover_note, created_at, updated_at)
         VALUES ($1,$2,$3,'Applied',$4,$5,$6)
         ON CONFLICT (fellowship_id, candidate_id) DO UPDATE SET cover_note = EXCLUDED.cover_note, updated_at = EXCLUDED.updated_at
         RETURNING *`,
        [id, data.fellowship_id, candidateId, data.cover_note || '', now, now]
      );
      if (res.rows.length > 0) return rowToFellowshipApp(res.rows[0]);
    } catch {
      // Fall through
    }
  }

  for (const app of memoryFellowshipApps.values()) {
    if (app.fellowship_id === data.fellowship_id && app.candidate_id === candidateId) {
      app.cover_note = data.cover_note || app.cover_note;
      app.updated_at = now;
      return app;
    }
  }

  const app: FellowshipApplication = {
    id,
    fellowship_id: data.fellowship_id,
    candidate_id: candidateId,
    status: 'Applied',
    cover_note: data.cover_note || '',
    created_at: now,
    updated_at: now,
  };
  memoryFellowshipApps.set(id, app);
  return app;
}

export async function getCandidateFellowshipApplications(candidateId: string): Promise<(FellowshipApplication & { fellowship_title: string; fellowship_provider: string })[]> {
  if (pool) {
    try {
      const res = await pool.query(
        `SELECT fa.*, f.title AS fellowship_title, f.provider AS fellowship_provider
         FROM fellowship_applications fa JOIN fellowships f ON fa.fellowship_id = f.id
         WHERE fa.candidate_id = $1 ORDER BY fa.created_at DESC`,
        [candidateId]
      );
      return res.rows.map((row) => ({
        ...rowToFellowshipApp(row),
        fellowship_title: String(row.fellowship_title ?? ''),
        fellowship_provider: String(row.fellowship_provider ?? ''),
      }));
    } catch {
      // Fall through
    }
  }

  return Array.from(memoryFellowshipApps.values())
    .filter((a) => a.candidate_id === candidateId)
    .map((a) => {
      const fellowship = memoryFellowships.get(a.fellowship_id);
      return {
        ...a,
        fellowship_title: fellowship?.title || 'Fellowship',
        fellowship_provider: fellowship?.provider || 'Provider',
      };
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

function rowToFellowship(row: Record<string, unknown>): Fellowship {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    provider: String(row.provider ?? ''),
    stipend: String(row.stipend ?? ''),
    duration: String(row.duration ?? ''),
    description: String(row.description ?? ''),
    eligibility: String(row.eligibility ?? ''),
    skills_required: Array.isArray(row.skills_required) ? row.skills_required as string[] : (typeof row.skills_required === 'string' ? JSON.parse(row.skills_required) : []),
    application_deadline: String(row.application_deadline ?? ''),
    created_at: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
  };
}

function rowToFellowshipApp(row: Record<string, unknown>): FellowshipApplication {
  return {
    id: String(row.id),
    fellowship_id: String(row.fellowship_id),
    candidate_id: String(row.candidate_id),
    status: String(row.status ?? 'Applied'),
    cover_note: String(row.cover_note ?? ''),
    created_at: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at as string).toISOString() : new Date().toISOString(),
  };
}

// ---- Professional References ----

export async function getCandidateReferences(candidateId: string): Promise<ProfessionalReference[]> {
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM professional_references WHERE candidate_id=$1 ORDER BY created_at DESC', [candidateId]);
      return res.rows.map(rowToReference);
    } catch {
      // Fall through
    }
  }
  return Array.from(memoryReferences.values())
    .filter((r) => r.candidate_id === candidateId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function addReference(candidateId: string, data: Partial<ProfessionalReference>): Promise<ProfessionalReference> {
  const id = uuidv4();
  const now = new Date().toISOString();

  if (pool) {
    try {
      const res = await pool.query(
        `INSERT INTO professional_references (id, candidate_id, name, relationship, company, email, phone, verified, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,false,$8,$9) RETURNING *`,
        [id, candidateId, data.name ?? '', data.relationship ?? '', data.company ?? '', data.email ?? '', data.phone ?? '', now, now]
      );
      if (res.rows.length > 0) return rowToReference(res.rows[0]);
    } catch {
      // Fall through
    }
  }

  const ref: ProfessionalReference = {
    id,
    candidate_id: candidateId,
    name: data.name ?? '',
    relationship: data.relationship ?? '',
    company: data.company ?? '',
    email: data.email ?? '',
    phone: data.phone ?? '',
    verified: false,
    created_at: now,
    updated_at: now,
  };
  memoryReferences.set(id, ref);
  return ref;
}

export async function updateReference(refId: string, candidateId: string, data: Partial<ProfessionalReference>): Promise<ProfessionalReference | null> {
  const now = new Date().toISOString();

  if (pool) {
    try {
      const res = await pool.query(
        `UPDATE professional_references SET
           name = COALESCE($1, name),
           relationship = COALESCE($2, relationship),
           company = COALESCE($3, company),
           email = COALESCE($4, email),
           phone = COALESCE($5, phone),
           updated_at = $6
         WHERE id=$7 AND candidate_id=$8 RETURNING *`,
        [data.name, data.relationship, data.company, data.email, data.phone, now, refId, candidateId]
      );
      if (res.rows.length > 0) return rowToReference(res.rows[0]);
    } catch {
      // Fall through
    }
  }

  const existing = memoryReferences.get(refId);
  if (!existing || existing.candidate_id !== candidateId) return null;
  const updated: ProfessionalReference = {
    ...existing,
    name: data.name ?? existing.name,
    relationship: data.relationship ?? existing.relationship,
    company: data.company ?? existing.company,
    email: data.email ?? existing.email,
    phone: data.phone ?? existing.phone,
    updated_at: now,
  };
  memoryReferences.set(refId, updated);
  return updated;
}

export async function deleteReference(refId: string, candidateId: string): Promise<boolean> {
  if (pool) {
    try {
      const res = await pool.query('DELETE FROM professional_references WHERE id=$1 AND candidate_id=$2 RETURNING id', [refId, candidateId]);
      if (res.rows.length > 0) return true;
    } catch {
      // Fall through
    }
  }

  const existing = memoryReferences.get(refId);
  if (existing && existing.candidate_id === candidateId) {
    memoryReferences.delete(refId);
    return true;
  }
  return false;
}

function rowToReference(row: Record<string, unknown>): ProfessionalReference {
  return {
    id: String(row.id),
    candidate_id: String(row.candidate_id),
    name: String(row.name ?? ''),
    relationship: String(row.relationship ?? ''),
    company: String(row.company ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    verified: Boolean(row.verified),
    created_at: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at as string).toISOString() : new Date().toISOString(),
  };
}

// ---- Gap Narrative ----

export async function getGapNarrative(candidateId: string): Promise<GapNarrative | null> {
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM gap_narratives WHERE candidate_id=$1 LIMIT 1', [candidateId]);
      if (res.rows.length > 0) return rowToNarrative(res.rows[0]);
    } catch {
      // Fall through
    }
  }
  return memoryGapNarratives.get(candidateId) || null;
}

export async function saveGapNarrative(candidateId: string, data: Partial<GapNarrative>): Promise<GapNarrative> {
  const id = uuidv4();
  const now = new Date().toISOString();

  if (pool) {
    try {
      const res = await pool.query(
        `INSERT INTO gap_narratives (id, candidate_id, gap_pitch, resume_statement, cover_letter_note, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (candidate_id) DO UPDATE SET
           gap_pitch = EXCLUDED.gap_pitch,
           resume_statement = EXCLUDED.resume_statement,
           cover_letter_note = EXCLUDED.cover_letter_note,
           updated_at = EXCLUDED.updated_at
         RETURNING *`,
        [id, candidateId, data.gap_pitch ?? '', data.resume_statement ?? '', data.cover_letter_note ?? '', now, now]
      );
      if (res.rows.length > 0) return rowToNarrative(res.rows[0]);
    } catch {
      // Fall through
    }
  }

  const existing = memoryGapNarratives.get(candidateId);
  const narrative: GapNarrative = {
    id: existing?.id || id,
    candidate_id: candidateId,
    gap_pitch: data.gap_pitch ?? existing?.gap_pitch ?? '',
    resume_statement: data.resume_statement ?? existing?.resume_statement ?? '',
    cover_letter_note: data.cover_letter_note ?? existing?.cover_letter_note ?? '',
    created_at: existing?.created_at || now,
    updated_at: now,
  };
  memoryGapNarratives.set(candidateId, narrative);
  return narrative;
}

function rowToNarrative(row: Record<string, unknown>): GapNarrative {
  return {
    id: String(row.id),
    candidate_id: String(row.candidate_id),
    gap_pitch: String(row.gap_pitch ?? ''),
    resume_statement: String(row.resume_statement ?? ''),
    cover_letter_note: String(row.cover_letter_note ?? ''),
    created_at: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at as string).toISOString() : new Date().toISOString(),
  };
}
