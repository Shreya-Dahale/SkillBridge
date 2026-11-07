import { pool, supabase } from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export type SkillGapStatus = 'Demonstrated' | 'Needs Refresh' | 'Developing' | 'Not Yet Demonstrated';
export type EvidenceLevel = 'AI Extracted' | 'Candidate Confirmed' | 'Demonstrated Evidence' | 'Verified Evidence' | 'None';

export interface JobSkillRequirement {
  name: string;
  category: string;
  description?: string;
}

export interface ExtractedJobRequirements {
  required_skills: JobSkillRequirement[];
  preferred_skills: JobSkillRequirement[];
  experience_level?: string;
  key_responsibilities?: string[];
}

export interface SkillGapItem {
  skill_name: string;
  category: string;
  requirement_level: 'required' | 'preferred';
  status: SkillGapStatus;
  evidence_level: EvidenceLevel;
  explanation: string;
  recommendation?: string;
  candidate_notes?: string;
}

export interface SkillGapSummary {
  total_skills_analyzed: number;
  demonstrated_count: number;
  needs_refresh_count: number;
  developing_count: number;
  not_demonstrated_count: number;
  summary_narrative: string;
  top_recommendations: string[];
}

export interface SkillGapAnalysisRecord {
  id: string;
  user_id: string;
  target_role: string;
  job_description_raw: string;
  extracted_requirements: ExtractedJobRequirements;
  gap_analysis_results: SkillGapItem[];
  summary: SkillGapSummary;
  created_at: string;
  updated_at: string;
}

// In-memory fallback
const memoryAnalyses: Map<string, SkillGapAnalysisRecord[]> = new Map();

export async function initSkillGapTable(): Promise<void> {
  if (pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS skill_gap_analyses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          target_role VARCHAR(255) NOT NULL,
          job_description_raw TEXT NOT NULL,
          extracted_requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
          gap_analysis_results JSONB NOT NULL DEFAULT '[]'::jsonb,
          summary JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('PostgreSQL skill_gap_analyses table initialized.');
    } catch (err) {
      console.warn('skill_gap_analyses table init error:', err instanceof Error ? err.message : err);
    }
  }
}

export async function saveSkillGapAnalysis(
  record: Omit<SkillGapAnalysisRecord, 'id' | 'created_at' | 'updated_at'>
): Promise<SkillGapAnalysisRecord> {
  const id = uuidv4();
  const now = new Date().toISOString();

  const fullRecord: SkillGapAnalysisRecord = {
    ...record,
    id,
    created_at: now,
    updated_at: now,
  };

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO skill_gap_analyses (
          id, user_id, target_role, job_description_raw,
          extracted_requirements, gap_analysis_results, summary, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          fullRecord.id,
          fullRecord.user_id,
          fullRecord.target_role,
          fullRecord.job_description_raw,
          JSON.stringify(fullRecord.extracted_requirements),
          JSON.stringify(fullRecord.gap_analysis_results),
          JSON.stringify(fullRecord.summary),
          fullRecord.created_at,
          fullRecord.updated_at,
        ]
      );
    } catch (err) {
      console.warn('PostgreSQL saveSkillGapAnalysis error, saving to memory:', err instanceof Error ? err.message : err);
    }
  }

  if (supabase) {
    try {
      await supabase.from('skill_gap_analyses').insert([fullRecord]);
    } catch {
      // Fall through
    }
  }

  const userList = memoryAnalyses.get(record.user_id) || [];
  userList.unshift(fullRecord);
  memoryAnalyses.set(record.user_id, userList);

  return fullRecord;
}

export async function getLatestSkillGapAnalysis(userId: string): Promise<SkillGapAnalysisRecord | null> {
  if (pool) {
    try {
      const res = await pool.query(
        'SELECT * FROM skill_gap_analyses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: String(row.id),
          user_id: String(row.user_id),
          target_role: row.target_role,
          job_description_raw: row.job_description_raw,
          extracted_requirements: typeof row.extracted_requirements === 'string' ? JSON.parse(row.extracted_requirements) : row.extracted_requirements,
          gap_analysis_results: typeof row.gap_analysis_results === 'string' ? JSON.parse(row.gap_analysis_results) : row.gap_analysis_results,
          summary: typeof row.summary === 'string' ? JSON.parse(row.summary) : row.summary,
          created_at: new Date(row.created_at).toISOString(),
          updated_at: new Date(row.updated_at).toISOString(),
        };
      }
    } catch {
      // Fall through
    }
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('skill_gap_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) return data as SkillGapAnalysisRecord;
    } catch {
      // Fall through
    }
  }

  const userList = memoryAnalyses.get(userId) || [];
  return userList.length > 0 ? userList[0] : null;
}
