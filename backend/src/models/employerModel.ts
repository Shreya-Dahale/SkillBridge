import { pool } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

// ---- Types ----

export interface EmployerProfile {
  id: string;
  user_id: string;
  company_name: string;
  industry: string;
  location: string;
  website: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  type: string; // 'full-time' | 'part-time' | 'contract' | 'internship'
  experience_level: string;
  required_skills: string[];
  preferred_skills: string[];
  status: string; // 'open' | 'closed' | 'draft'
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string; // 'Applied' | 'Shortlisted' | 'Interviewing' | 'Rejected' | 'Accepted'
  employer_feedback: string;
  created_at: string;
  updated_at: string;
}

// ---- Table Initialization ----

export async function initEmployerTables(): Promise<void> {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employer_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company_name VARCHAR(255) NOT NULL DEFAULT '',
        industry VARCHAR(255) NOT NULL DEFAULT '',
        location VARCHAR(255) NOT NULL DEFAULT '',
        website VARCHAR(500) NOT NULL DEFAULT '',
        description TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_employer_profiles_user_id ON employer_profiles(user_id);

      CREATE TABLE IF NOT EXISTS jobs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        department VARCHAR(255) NOT NULL DEFAULT '',
        location VARCHAR(255) NOT NULL DEFAULT '',
        type VARCHAR(50) NOT NULL DEFAULT 'full-time',
        experience_level VARCHAR(100) NOT NULL DEFAULT '',
        required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
        preferred_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
        status VARCHAR(50) NOT NULL DEFAULT 'open',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);

      CREATE TABLE IF NOT EXISTS job_applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        candidate_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(50) NOT NULL DEFAULT 'Applied',
        employer_feedback TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, candidate_id)
      );
      CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id);
      CREATE INDEX IF NOT EXISTS idx_job_applications_candidate_id ON job_applications(candidate_id);
    `);
    console.log('Employer tables initialized.');
  } catch (err) {
    console.warn('Employer table init error:', err instanceof Error ? err.message : err);
  }
}

// ---- Employer Profile CRUD ----

export async function getEmployerProfileByUserId(userId: string): Promise<EmployerProfile> {
  if (!pool) throw new Error('Database not connected');
  const res = await pool.query(
    'SELECT * FROM employer_profiles WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  if (res.rows.length === 0) {
    // Auto-create empty profile
    const id = uuidv4();
    const now = new Date().toISOString();
    const ins = await pool.query(
      `INSERT INTO employer_profiles (id, user_id, company_name, industry, location, website, description, created_at, updated_at)
       VALUES ($1,$2,'','','','','', $3,$4) RETURNING *`,
      [id, userId, now, now]
    );
    return rowToEmployerProfile(ins.rows[0]);
  }
  return rowToEmployerProfile(res.rows[0]);
}

export async function saveEmployerProfile(userId: string, data: Partial<EmployerProfile>): Promise<EmployerProfile> {
  if (!pool) throw new Error('Database not connected');
  const now = new Date().toISOString();
  await pool.query(
    `INSERT INTO employer_profiles (id, user_id, company_name, industry, location, website, description, created_at, updated_at)
     VALUES (gen_random_uuid(),$1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (user_id) DO UPDATE SET
       company_name = EXCLUDED.company_name,
       industry = EXCLUDED.industry,
       location = EXCLUDED.location,
       website = EXCLUDED.website,
       description = EXCLUDED.description,
       updated_at = EXCLUDED.updated_at`,
    [
      userId,
      data.company_name ?? '',
      data.industry ?? '',
      data.location ?? '',
      data.website ?? '',
      data.description ?? '',
      now,
      now,
    ]
  );
  return getEmployerProfileByUserId(userId);
}

function rowToEmployerProfile(row: Record<string, unknown>): EmployerProfile {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    company_name: String(row.company_name ?? ''),
    industry: String(row.industry ?? ''),
    location: String(row.location ?? ''),
    website: String(row.website ?? ''),
    description: String(row.description ?? ''),
    created_at: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at as string).toISOString() : new Date().toISOString(),
  };
}

// ---- Jobs CRUD ----

export async function getJobsByEmployerId(employerId: string): Promise<Job[]> {
  if (!pool) return [];
  const res = await pool.query('SELECT * FROM jobs WHERE employer_id=$1 ORDER BY created_at DESC', [employerId]);
  return res.rows.map(rowToJob);
}

export async function getAllOpenJobs(): Promise<Job[]> {
  if (!pool) return [];
  const res = await pool.query("SELECT * FROM jobs WHERE status='open' ORDER BY created_at DESC");
  return res.rows.map(rowToJob);
}

export async function getJobById(jobId: string): Promise<Job | null> {
  if (!pool) return null;
  const res = await pool.query('SELECT * FROM jobs WHERE id=$1 LIMIT 1', [jobId]);
  if (res.rows.length === 0) return null;
  return rowToJob(res.rows[0]);
}

export async function createJob(employerId: string, data: Partial<Job>): Promise<Job> {
  if (!pool) throw new Error('Database not connected');
  const id = uuidv4();
  const now = new Date().toISOString();
  const res = await pool.query(
    `INSERT INTO jobs (id, employer_id, title, description, department, location, type, experience_level, required_skills, preferred_skills, status, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
    [
      id, employerId,
      data.title ?? 'Untitled Job',
      data.description ?? '',
      data.department ?? '',
      data.location ?? '',
      data.type ?? 'full-time',
      data.experience_level ?? '',
      JSON.stringify(data.required_skills ?? []),
      JSON.stringify(data.preferred_skills ?? []),
      data.status ?? 'open',
      now, now,
    ]
  );
  return rowToJob(res.rows[0]);
}

export async function updateJob(jobId: string, employerId: string, data: Partial<Job>): Promise<Job | null> {
  if (!pool) throw new Error('Database not connected');
  const now = new Date().toISOString();
  const res = await pool.query(
    `UPDATE jobs SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       department = COALESCE($3, department),
       location = COALESCE($4, location),
       type = COALESCE($5, type),
       experience_level = COALESCE($6, experience_level),
       required_skills = COALESCE($7, required_skills),
       preferred_skills = COALESCE($8, preferred_skills),
       status = COALESCE($9, status),
       updated_at = $10
     WHERE id = $11 AND employer_id = $12 RETURNING *`,
    [
      data.title ?? null,
      data.description ?? null,
      data.department ?? null,
      data.location ?? null,
      data.type ?? null,
      data.experience_level ?? null,
      data.required_skills ? JSON.stringify(data.required_skills) : null,
      data.preferred_skills ? JSON.stringify(data.preferred_skills) : null,
      data.status ?? null,
      now, jobId, employerId,
    ]
  );
  if (res.rows.length === 0) return null;
  return rowToJob(res.rows[0]);
}

export async function deleteJob(jobId: string, employerId: string): Promise<boolean> {
  if (!pool) throw new Error('Database not connected');
  const res = await pool.query('DELETE FROM jobs WHERE id=$1 AND employer_id=$2 RETURNING id', [jobId, employerId]);
  return res.rows.length > 0;
}

function rowToJob(row: Record<string, unknown>): Job {
  return {
    id: String(row.id),
    employer_id: String(row.employer_id),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    department: String(row.department ?? ''),
    location: String(row.location ?? ''),
    type: String(row.type ?? 'full-time'),
    experience_level: String(row.experience_level ?? ''),
    required_skills: Array.isArray(row.required_skills) ? row.required_skills as string[] : (typeof row.required_skills === 'string' ? JSON.parse(row.required_skills) : []),
    preferred_skills: Array.isArray(row.preferred_skills) ? row.preferred_skills as string[] : (typeof row.preferred_skills === 'string' ? JSON.parse(row.preferred_skills) : []),
    status: String(row.status ?? 'open'),
    created_at: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at as string).toISOString() : new Date().toISOString(),
  };
}

// ---- Job Applications ----

export async function applyToJob(jobId: string, candidateId: string): Promise<JobApplication> {
  if (!pool) throw new Error('Database not connected');
  const id = uuidv4();
  const now = new Date().toISOString();
  const res = await pool.query(
    `INSERT INTO job_applications (id, job_id, candidate_id, status, employer_feedback, created_at, updated_at)
     VALUES ($1,$2,$3,'Applied','',$4,$5)
     ON CONFLICT (job_id, candidate_id) DO UPDATE SET updated_at = EXCLUDED.updated_at
     RETURNING *`,
    [id, jobId, candidateId, now, now]
  );
  return rowToJobApplication(res.rows[0]);
}

export async function updateApplicationStatus(
  appId: string,
  employerId: string,
  status: string,
  feedback: string
): Promise<JobApplication | null> {
  if (!pool) return null;
  const now = new Date().toISOString();
  // Verify employer owns the job
  const res = await pool.query(
    `UPDATE job_applications ja SET
       status = $1,
       employer_feedback = $2,
       updated_at = $3
     FROM jobs j
     WHERE ja.id = $4 AND ja.job_id = j.id AND j.employer_id = $5
     RETURNING ja.*`,
    [status, feedback, now, appId, employerId]
  );
  if (res.rows.length === 0) return null;
  return rowToJobApplication(res.rows[0]);
}

export async function getCandidateApplications(candidateId: string): Promise<(JobApplication & { job_title: string; company_name: string })[]> {
  if (!pool) return [];
  const res = await pool.query(
    `SELECT ja.*, j.title AS job_title, ep.company_name
     FROM job_applications ja
     JOIN jobs j ON ja.job_id = j.id
     LEFT JOIN employer_profiles ep ON j.employer_id = ep.user_id
     WHERE ja.candidate_id = $1
     ORDER BY ja.updated_at DESC`,
    [candidateId]
  );
  return res.rows.map((row) => ({
    ...rowToJobApplication(row),
    job_title: String(row.job_title ?? ''),
    company_name: String(row.company_name ?? ''),
  }));
}

export async function getJobApplicationsForEmployer(jobId: string, employerId: string): Promise<(JobApplication & { candidate_name: string; candidate_email: string })[]> {
  if (!pool) return [];
  const res = await pool.query(
    `SELECT ja.*, u.name AS candidate_name, u.email AS candidate_email
     FROM job_applications ja
     JOIN users u ON ja.candidate_id = u.id
     JOIN jobs j ON ja.job_id = j.id
     WHERE ja.job_id = $1 AND j.employer_id = $2
     ORDER BY ja.created_at DESC`,
    [jobId, employerId]
  );
  return res.rows.map((row) => ({
    ...rowToJobApplication(row),
    candidate_name: String(row.candidate_name ?? ''),
    candidate_email: String(row.candidate_email ?? ''),
  }));
}

function rowToJobApplication(row: Record<string, unknown>): JobApplication {
  return {
    id: String(row.id),
    job_id: String(row.job_id),
    candidate_id: String(row.candidate_id),
    status: String(row.status ?? 'Applied'),
    employer_feedback: String(row.employer_feedback ?? ''),
    created_at: row.created_at ? new Date(row.created_at as string).toISOString() : new Date().toISOString(),
    updated_at: row.updated_at ? new Date(row.updated_at as string).toISOString() : new Date().toISOString(),
  };
}

// ---- Candidate Discovery (for employers) ----

export interface CandidateSummary {
  user_id: string;
  name: string;
  email: string;
  target_role: string;
  confirmed_skills: string[];
  evidence_count: number;
}

export async function discoverCandidates(skillFilter?: string): Promise<CandidateSummary[]> {
  if (!pool) return [];
  let query: string;
  let params: unknown[];
  if (skillFilter) {
    query = `
      SELECT u.id AS user_id, u.name, u.email,
             cp.target_role,
             cp.skills AS confirmed_skills,
             COUNT(DISTINCT er.id) AS evidence_count
      FROM users u
      JOIN candidate_profiles cp ON u.id = cp.user_id
      LEFT JOIN evidence_records er ON u.id = er.user_id
      WHERE u.role = 'candidate'
        AND cp.skills::text ILIKE $1
      GROUP BY u.id, u.name, u.email, cp.target_role, cp.skills
      ORDER BY evidence_count DESC
    `;
    params = [`%${skillFilter}%`];
  } else {
    query = `
      SELECT u.id AS user_id, u.name, u.email,
             cp.target_role,
             cp.skills AS confirmed_skills,
             COUNT(DISTINCT er.id) AS evidence_count
      FROM users u
      JOIN candidate_profiles cp ON u.id = cp.user_id
      LEFT JOIN evidence_records er ON u.id = er.user_id
      WHERE u.role = 'candidate'
      GROUP BY u.id, u.name, u.email, cp.target_role, cp.skills
      ORDER BY evidence_count DESC
      LIMIT 50
    `;
    params = [];
  }
  const res = await pool.query(query, params);
  return res.rows.map((row) => ({
    user_id: String(row.user_id),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    target_role: String(row.target_role ?? ''),
    confirmed_skills: Array.isArray(row.confirmed_skills)
      ? (row.confirmed_skills as { name?: string }[]).map((s) => (typeof s === 'string' ? s : (s.name ?? '')))
      : [],
    evidence_count: Number(row.evidence_count ?? 0),
  }));
}
