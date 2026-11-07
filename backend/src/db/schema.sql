-- SkillBridge Supabase / PostgreSQL Complete Schema

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('candidate', 'employer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Candidate profiles table
CREATE TABLE IF NOT EXISTS candidate_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_candidate_profiles_user_id ON candidate_profiles(user_id);

-- 3. Skill gap analyses table
CREATE TABLE IF NOT EXISTS skill_gap_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_role VARCHAR(255) NOT NULL,
    job_description_raw TEXT NOT NULL,
    extracted_requirements JSONB NOT NULL DEFAULT '{}'::jsonb,
    gap_analysis_results JSONB NOT NULL DEFAULT '[]'::jsonb,
    summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skill_gap_user_id ON skill_gap_analyses(user_id);

-- 4. Assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    skill VARCHAR(100) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 20,
    instructions TEXT NOT NULL,
    tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Assessment Submissions / Attempts
CREATE TABLE IF NOT EXISTS assessment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assessment_id VARCHAR(100) NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    assessment_title VARCHAR(255) NOT NULL,
    skill VARCHAR(100) NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    score NUMERIC(5, 2) NOT NULL,
    score_raw VARCHAR(50) NOT NULL,
    feedback TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Evaluated',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assessment_submissions_user_id ON assessment_submissions(user_id);

-- 6. Practical Company Projects table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    level VARCHAR(50) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    rubric JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Project Applications & Submissions
CREATE TABLE IF NOT EXISTS project_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id VARCHAR(100) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    project_title VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Applied',
    submission_repo_url TEXT,
    submission_notes TEXT,
    supporting_artifact TEXT,
    evaluator_name VARCHAR(255),
    evaluator_score NUMERIC(5, 2),
    evaluator_feedback TEXT,
    submitted_at TIMESTAMPTZ,
    evaluated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_project_apps_user_id ON project_applications(user_id);

-- 8. Evidence Records
CREATE TABLE IF NOT EXISTS evidence_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

CREATE INDEX IF NOT EXISTS idx_evidence_user_id ON evidence_records(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_skill ON evidence_records(skill);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_users_updated_at ON users;
CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_candidate_profiles_updated_at ON candidate_profiles;
CREATE TRIGGER set_candidate_profiles_updated_at BEFORE UPDATE ON candidate_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_skill_gap_updated_at ON skill_gap_analyses;
CREATE TRIGGER set_skill_gap_updated_at BEFORE UPDATE ON skill_gap_analyses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_project_apps_updated_at ON project_applications;
CREATE TRIGGER set_project_apps_updated_at BEFORE UPDATE ON project_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
