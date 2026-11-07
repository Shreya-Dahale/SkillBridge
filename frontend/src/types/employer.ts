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
  type: string;
  experience_level: string;
  required_skills: string[];
  preferred_skills: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: string;
  job_id: string;
  candidate_id: string;
  status: string;
  employer_feedback: string;
  job_title?: string;
  company_name?: string;
  candidate_name?: string;
  candidate_email?: string;
  created_at: string;
  updated_at: string;
}

export interface CandidateSummary {
  user_id: string;
  name: string;
  email: string;
  target_role: string;
  confirmed_skills: string[];
  evidence_count: number;
}

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
  mentor_name?: string;
  mentor_title?: string;
  mentor_company?: string;
  created_at: string;
  updated_at: string;
}

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
  fellowship_title?: string;
  fellowship_provider?: string;
  created_at: string;
  updated_at: string;
}

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

export interface GapNarrative {
  id: string;
  candidate_id: string;
  gap_pitch: string;
  resume_statement: string;
  cover_letter_note: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackItem {
  source: string;
  skill?: string;
  feedback: string;
  score?: string;
  status: string;
  type: 'assessment' | 'project' | 'job_application';
  created_at: string;
}
