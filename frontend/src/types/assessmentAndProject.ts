export interface AssessmentTask {
  id: string;
  question: string;
  type: 'multiple_choice' | 'code_snippet';
  options: string[];
  explanation: string;
  points: number;
}

export interface Assessment {
  id: string;
  title: string;
  skill: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_minutes: number;
  instructions: string;
  tasks: AssessmentTask[];
}

export interface AssessmentSubmission {
  id: string;
  user_id: string;
  assessment_id: string;
  assessment_title: string;
  skill: string;
  answers: Record<string, number>;
  score: number;
  score_raw: string;
  feedback: string;
  status: string;
  created_at: string;
}

export interface ProjectApplication {
  id: string;
  user_id: string;
  project_id: string;
  project_title: string;
  status: 'Applied' | 'In Progress' | 'Submitted' | 'Verified';
  submission_repo_url?: string;
  submission_notes?: string;
  supporting_artifact?: string;
  evaluator_name?: string;
  evaluator_score?: number;
  evaluator_feedback?: string;
  submitted_at?: string;
  evaluated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  provider: string;
  required_skills: string[];
  level: string;
  duration: string;
  description: string;
  rubric: string[];
  application?: ProjectApplication | null;
}

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
  status: 'Verified' | 'Demonstrated';
  created_at: string;
}

export interface SkillPassportItem {
  skill: string;
  current_status: 'Verified' | 'Demonstrated' | 'Needs Refresh' | 'Developing';
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
