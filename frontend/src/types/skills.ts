export type SkillCategory =
  | 'programming_languages'
  | 'frameworks'
  | 'databases'
  | 'tools_platforms'
  | 'architecture_cloud'
  | 'other';

export type EvidenceLevel =
  | 'AI Extracted'
  | 'Candidate Confirmed'
  | 'Demonstrated Evidence'
  | 'Verified Evidence'
  | 'None';

export type SkillStatus = 'active' | 'needs_refresh' | 'developing';

export type SkillGapStatus = 'Demonstrated' | 'Needs Refresh' | 'Developing' | 'Not Yet Demonstrated';

export interface ConfirmedSkill {
  name: string;
  category: string;
  evidence_level?: EvidenceLevel;
  status?: SkillStatus;
  years_experience?: number | string;
  last_used_year?: number | string;
  notes?: string;
}

export interface SkillGapItem {
  skill_name: string;
  category: string;
  requirement_level: 'required' | 'preferred';
  status: SkillGapStatus;
  evidence_level: EvidenceLevel;
  explanation: string;
  recommendation?: string;
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
  gap_analysis_results: SkillGapItem[];
  summary: SkillGapSummary;
  created_at: string;
  updated_at: string;
}
