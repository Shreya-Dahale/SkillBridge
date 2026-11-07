import { pool, supabase } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export interface CareerBreak {
  in_break: boolean;
  duration: string;
  reason: string;
  start_date?: string;
  end_date?: string;
}

export interface ExperienceItem {
  job_title: string;
  organization: string;
  dates: string;
  description?: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  dates?: string;
}

export interface SkillItem {
  name: string;
  category: string; // 'programming_languages' | 'frameworks' | 'databases' | 'tools_platforms' | 'architecture_cloud' | 'other'
  evidence_level?: 'AI Extracted' | 'Candidate Confirmed' | 'Demonstrated Evidence' | 'Verified Evidence';
  status?: 'active' | 'needs_refresh' | 'developing';
  years_experience?: number | string;
  last_used_year?: number | string;
  notes?: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  technologies: string[];
}

export interface ResumeMetadata {
  file_name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
}

export interface ExtractedSkills {
  programming_languages: string[];
  frameworks: string[];
  databases: string[];
  tools_platforms: string[];
}

export interface ExtractedData {
  name: string | null;
  target_role: string | null;
  career_break: {
    duration: string | null;
    reason: string | null;
  } | null;
  experience: ExperienceItem[];
  education: EducationItem[];
  technical_skills: ExtractedSkills;
  certifications: string[];
  projects: ProjectItem[];
  extracted_at: string;
  status: 'pending_review' | 'confirmed';
}

export interface CandidateProfile {
  id: string;
  user_id: string;
  target_role: string;
  bio: string;
  phone: string;
  location: string;
  career_break: CareerBreak;
  career_history: ExperienceItem[];
  education: EducationItem[];
  skills: SkillItem[];
  certifications: string[];
  projects: ProjectItem[];
  original_resume: ResumeMetadata | null;
  extracted_data: ExtractedData | null;
  created_at: string;
  updated_at: string;
}

// In-memory fallback for candidate profiles
const memoryProfiles: Map<string, CandidateProfile> = new Map();

export async function initCandidateTable(): Promise<void> {
  if (pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS candidate_profiles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          target_role VARCHAR(255),
          bio TEXT,
          phone VARCHAR(50),
          location VARCHAR(255),
          career_break JSONB DEFAULT '{"in_break": false, "duration": "", "reason": "", "start_date": "", "end_date": ""}'::jsonb,
          career_history JSONB DEFAULT '[]'::jsonb,
          education JSONB DEFAULT '[]'::jsonb,
          skills JSONB DEFAULT '[]'::jsonb,
          certifications JSONB DEFAULT '[]'::jsonb,
          projects JSONB DEFAULT '[]'::jsonb,
          original_resume JSONB,
          extracted_data JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('PostgreSQL candidate_profiles table initialized.');
    } catch (err) {
      console.warn('candidate_profiles table init warning:', err instanceof Error ? err.message : err);
    }
  }
}

export function createDefaultProfile(userId: string): CandidateProfile {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    user_id: userId,
    target_role: '',
    bio: '',
    phone: '',
    location: '',
    career_break: {
      in_break: false,
      duration: '',
      reason: '',
      start_date: '',
      end_date: '',
    },
    career_history: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    original_resume: null,
    extracted_data: null,
    created_at: now,
    updated_at: now,
  };
}

export async function getCandidateProfileByUserId(userId: string): Promise<CandidateProfile> {
  // 1. Try PostgreSQL pool
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM candidate_profiles WHERE user_id = $1 LIMIT 1', [userId]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: String(row.id),
          user_id: String(row.user_id),
          target_role: row.target_role || '',
          bio: row.bio || '',
          phone: row.phone || '',
          location: row.location || '',
          career_break: typeof row.career_break === 'string' ? JSON.parse(row.career_break) : row.career_break || { in_break: false, duration: '', reason: '' },
          career_history: typeof row.career_history === 'string' ? JSON.parse(row.career_history) : row.career_history || [],
          education: typeof row.education === 'string' ? JSON.parse(row.education) : row.education || [],
          skills: typeof row.skills === 'string' ? JSON.parse(row.skills) : row.skills || [],
          certifications: typeof row.certifications === 'string' ? JSON.parse(row.certifications) : row.certifications || [],
          projects: typeof row.projects === 'string' ? JSON.parse(row.projects) : row.projects || [],
          original_resume: typeof row.original_resume === 'string' ? JSON.parse(row.original_resume) : row.original_resume || null,
          extracted_data: typeof row.extracted_data === 'string' ? JSON.parse(row.extracted_data) : row.extracted_data || null,
          created_at: new Date(row.created_at).toISOString(),
          updated_at: new Date(row.updated_at).toISOString(),
        };
      }
    } catch {
      // Fall through to memory
    }
  }

  // 2. Try Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('candidate_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        return data as CandidateProfile;
      }
    } catch {
      // Fall through
    }
  }

  // 3. Fallback to memory
  let profile = memoryProfiles.get(userId);
  if (!profile) {
    profile = createDefaultProfile(userId);
    memoryProfiles.set(userId, profile);
  }
  return profile;
}

export async function saveCandidateProfile(
  userId: string,
  updates: Partial<CandidateProfile>
): Promise<CandidateProfile> {
  const current = await getCandidateProfileByUserId(userId);
  const now = new Date().toISOString();

  const merged: CandidateProfile = {
    ...current,
    ...updates,
    updated_at: now,
  };

  // 1. PostgreSQL pool
  if (pool) {
    try {
      await pool.query(
        `INSERT INTO candidate_profiles (
          id, user_id, target_role, bio, phone, location,
          career_break, career_history, education, skills, certifications, projects,
          original_resume, extracted_data, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (user_id) DO UPDATE SET
          target_role = EXCLUDED.target_role,
          bio = EXCLUDED.bio,
          phone = EXCLUDED.phone,
          location = EXCLUDED.location,
          career_break = EXCLUDED.career_break,
          career_history = EXCLUDED.career_history,
          education = EXCLUDED.education,
          skills = EXCLUDED.skills,
          certifications = EXCLUDED.certifications,
          projects = EXCLUDED.projects,
          original_resume = EXCLUDED.original_resume,
          extracted_data = EXCLUDED.extracted_data,
          updated_at = EXCLUDED.updated_at`,
        [
          merged.id,
          merged.user_id,
          merged.target_role,
          merged.bio,
          merged.phone,
          merged.location,
          JSON.stringify(merged.career_break),
          JSON.stringify(merged.career_history),
          JSON.stringify(merged.education),
          JSON.stringify(merged.skills),
          JSON.stringify(merged.certifications),
          JSON.stringify(merged.projects),
          merged.original_resume ? JSON.stringify(merged.original_resume) : null,
          merged.extracted_data ? JSON.stringify(merged.extracted_data) : null,
          merged.created_at,
          merged.updated_at,
        ]
      );
    } catch (err) {
      console.warn('PostgreSQL saveCandidateProfile warning:', err instanceof Error ? err.message : err);
    }
  }

  // 2. Supabase
  if (supabase) {
    try {
      await supabase
        .from('candidate_profiles')
        .upsert({
          ...merged,
          career_break: merged.career_break,
          career_history: merged.career_history,
          education: merged.education,
          skills: merged.skills,
          certifications: merged.certifications,
          projects: merged.projects,
        });
    } catch {
      // Fall through
    }
  }

  // 3. Memory store
  memoryProfiles.set(userId, merged);
  return merged;
}
