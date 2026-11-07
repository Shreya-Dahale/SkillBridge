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
  category: string; // 'programming_languages' | 'frameworks' | 'databases' | 'tools_platforms' | 'other'
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
