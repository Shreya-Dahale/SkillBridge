import { pool, supabase } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { getCandidateProfileByUserId } from './candidateModel';

export type EvidenceStatus = 'Verified' | 'Demonstrated';
export type PassportStatus = 'Verified' | 'Demonstrated' | 'Needs Refresh' | 'Developing';

export interface EvidenceRecord {
  id: string;
  user_id: string;
  skill: string;
  source_type: 'assessment' | 'project';
  source_title: string;
  source_id: string;
  score: string;
  score_numeric: number;
  date: string;
  evaluator: string;
  supporting_artifact: string;
  feedback: string;
  status: EvidenceStatus;
  created_at: string;
}

export interface SkillPassportItem {
  skill: string;
  current_status: PassportStatus;
  latest_evidence: EvidenceRecord | null;
  score: string;
  evidence_date: string;
  evidence_history: EvidenceRecord[];
  feedback: string;
  verified_hash?: string;
}

export interface SkillPassportSummary {
  verified_count: number;
  demonstrated_count: number;
  needs_refresh_count: number;
  developing_count: number;
  total_tracked_skills: number;
}

// In-memory fallback
const memoryEvidence: Map<string, EvidenceRecord[]> = new Map();

export async function initEvidenceTable(): Promise<void> {
  if (pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS evidence_records (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          skill VARCHAR(100) NOT NULL,
          source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('assessment', 'project')),
          source_title VARCHAR(255) NOT NULL,
          source_id VARCHAR(100) NOT NULL,
          score VARCHAR(100) NOT NULL,
          score_numeric NUMERIC(5, 2) NOT NULL,
          date VARCHAR(50) NOT NULL,
          evaluator VARCHAR(255) NOT NULL,
          supporting_artifact TEXT NOT NULL,
          feedback TEXT NOT NULL,
          status VARCHAR(50) NOT NULL CHECK (status IN ('Verified', 'Demonstrated')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('PostgreSQL evidence_records table initialized.');
    } catch (err) {
      console.warn('initEvidenceTable error:', err instanceof Error ? err.message : err);
    }
  }
}

export async function createEvidenceRecord(
  data: Omit<EvidenceRecord, 'id' | 'created_at'>
): Promise<EvidenceRecord> {
  const record: EvidenceRecord = {
    ...data,
    id: uuidv4(),
    created_at: new Date().toISOString(),
  };

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO evidence_records (
          id, user_id, skill, source_type, source_title, source_id,
          score, score_numeric, date, evaluator, supporting_artifact, feedback, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
        [
          record.id,
          record.user_id,
          record.skill,
          record.source_type,
          record.source_title,
          record.source_id,
          record.score,
          record.score_numeric,
          record.date,
          record.evaluator,
          record.supporting_artifact,
          record.feedback,
          record.status,
          record.created_at,
        ]
      );
    } catch (err) {
      console.warn('PostgreSQL createEvidenceRecord error, saving to memory:', err);
    }
  }

  const list = memoryEvidence.get(record.user_id) || [];
  list.unshift(record);
  memoryEvidence.set(record.user_id, list);

  return record;
}

export async function getEvidenceByUser(userId: string): Promise<EvidenceRecord[]> {
  if (pool) {
    try {
      const res = await pool.query(
        'SELECT * FROM evidence_records WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      if (res.rows.length > 0) {
        return res.rows.map((row) => ({
          id: String(row.id),
          user_id: String(row.user_id),
          skill: row.skill,
          source_type: row.source_type,
          source_title: row.source_title,
          source_id: row.source_id,
          score: row.score,
          score_numeric: Number(row.score_numeric),
          date: row.date,
          evaluator: row.evaluator,
          supporting_artifact: row.supporting_artifact,
          feedback: row.feedback,
          status: row.status as EvidenceStatus,
          created_at: new Date(row.created_at).toISOString(),
        }));
      }
    } catch {
      // Fall through to memory
    }
  }
  return memoryEvidence.get(userId) || [];
}

/**
 * Build Candidate Skill Freshness Passport by aggregating confirmed skills, career break, and evidence records.
 */
export async function getSkillFreshnessPassport(userId: string): Promise<{
  passportItems: SkillPassportItem[];
  summary: SkillPassportSummary;
}> {
  const profile = await getCandidateProfileByUserId(userId);
  const evidenceList = await getEvidenceByUser(userId);
  const inBreak = Boolean(profile.career_break?.in_break);
  const confirmedSkills = profile.skills || [];

  // Group evidence by skill (normalized key)
  const evidenceMap = new Map<string, EvidenceRecord[]>();
  evidenceList.forEach((ev) => {
    const key = ev.skill.trim().toLowerCase();
    const existing = evidenceMap.get(key) || [];
    existing.push(ev);
    evidenceMap.set(key, existing);
  });

  // Collect all skills tracked in profile + evidence
  const allSkillNames = new Set<string>();
  confirmedSkills.forEach((s) => allSkillNames.add(s.name));
  evidenceList.forEach((ev) => allSkillNames.add(ev.skill));

  const passportItems: SkillPassportItem[] = [];

  allSkillNames.forEach((skillName) => {
    const key = skillName.trim().toLowerCase();
    const history = evidenceMap.get(key) || [];
    const latest = history.length > 0 ? history[0] : null;
    const confirmedInfo = confirmedSkills.find((s) => s.name.trim().toLowerCase() === key);

    let status: PassportStatus;

    if (latest && latest.status === 'Verified' && latest.score_numeric >= 80) {
      status = 'Verified';
    } else if (latest) {
      status = 'Demonstrated';
    } else if (confirmedInfo?.status === 'developing') {
      status = 'Developing';
    } else if (inBreak) {
      status = 'Needs Refresh';
    } else {
      status = 'Demonstrated';
    }

    const score = latest ? latest.score : confirmedInfo?.notes || 'No Evidence Submitted';
    const date = latest ? latest.date : inBreak ? 'Break Ongoing' : 'Active';
    const feedback = latest
      ? latest.feedback
      : status === 'Needs Refresh'
      ? 'Historical experience confirmed; complete an assessment benchmark or company project to verify current freshness.'
      : 'Active in confirmed profile.';

    passportItems.push({
      skill: skillName,
      current_status: status,
      latest_evidence: latest,
      score,
      evidence_date: date,
      evidence_history: history,
      feedback,
      verified_hash: latest ? `#SB-EV-${latest.id.slice(0, 6).toUpperCase()}` : undefined,
    });
  });

  // Calculate distinct counts
  let verifiedCount = 0;
  let demonstratedCount = 0;
  let needsRefreshCount = 0;
  let developingCount = 0;

  passportItems.forEach((item) => {
    if (item.current_status === 'Verified') verifiedCount++;
    else if (item.current_status === 'Demonstrated') demonstratedCount++;
    else if (item.current_status === 'Needs Refresh') needsRefreshCount++;
    else if (item.current_status === 'Developing') developingCount++;
  });

  const summary: SkillPassportSummary = {
    verified_count: verifiedCount,
    demonstrated_count: demonstratedCount,
    needs_refresh_count: needsRefreshCount,
    developing_count: developingCount,
    total_tracked_skills: passportItems.length,
  };

  return { passportItems, summary };
}
