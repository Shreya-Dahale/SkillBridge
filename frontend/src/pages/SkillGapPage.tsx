import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ConfirmedSkill,
  SkillCategory,
  EvidenceLevel,
  SkillStatus,
  SkillGapAnalysisRecord,
} from '../types/skills';
import {
  Target,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Clock,
  Plus,
  Trash2,
  ShieldCheck,
} from '../components/Icons';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

const CATEGORIES: { key: SkillCategory; label: string }[] = [
  { key: 'programming_languages', label: 'Programming Languages' },
  { key: 'frameworks', label: 'Frameworks & Libraries' },
  { key: 'databases', label: 'Databases & Storage' },
  { key: 'tools_platforms', label: 'Tools & DevOps' },
  { key: 'architecture_cloud', label: 'Architecture & Cloud' },
  { key: 'other', label: 'Other Skills' },
];

const SAMPLE_JOB_DESCRIPTION = `Enterprise Senior Java Backend Developer
Company: Apex Cloud Systems
Target Role: Senior Java Backend Developer

About the Role:
We are seeking an experienced Senior Java Developer to design, develop, and scale high-throughput distributed microservices.

Required Core Skills:
- 4+ years hands-on production experience in Core Java and Spring Boot
- Deep knowledge of relational databases, SQL optimization, and PostgreSQL
- Experience designing and securing REST APIs with robust error handling
- Containerization and local orchestration using Docker
- Version control using Git and collaborative PR workflows

Preferred & Bonus Skills:
- Experience deploying microservices on AWS cloud infrastructure
- Message streaming and asynchronous architectures with Apache Kafka
- Container orchestration with Kubernetes
- CI/CD automation pipeline experience`;

export const SkillGapPage: React.FC = () => {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState<'skills' | 'gap_analysis'>('skills');

  // Skills State
  const [skills, setSkills] = useState<ConfirmedSkill[]>([]);
  const [targetRole, setTargetRole] = useState<string>('Senior Java Backend Developer');
  const [isLoadingSkills, setIsLoadingSkills] = useState<boolean>(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // New Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState<SkillCategory>('programming_languages');
  const [newSkillEvidence] = useState<EvidenceLevel>('Candidate Confirmed');
  const [newSkillStatus, setNewSkillStatus] = useState<SkillStatus>('active');
  const [newSkillYears, setNewSkillYears] = useState('');
  const [newSkillNotes, setNewSkillNotes] = useState('');

  // Skill Gap Analysis State
  const [jobDescriptionInput, setJobDescriptionInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisRecord, setAnalysisRecord] = useState<SkillGapAnalysisRecord | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchSkills();
    fetchLatestAnalysis();
  }, []);

  const fetchSkills = async () => {
    setIsLoadingSkills(true);
    try {
      const res = await fetch('/api/candidate/skills', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setSkills(data.skills || []);
        if (data.target_role) setTargetRole(data.target_role);
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsLoadingSkills(false);
    }
  };

  const fetchLatestAnalysis = async () => {
    try {
      const res = await fetch('/api/candidate/skills/gap-latest', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.analysis) {
        setAnalysisRecord(data.analysis);
      }
    } catch {
      // Graceful fallback
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const exists = skills.some(
      (s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase()
    );
    if (exists) {
      setErrorMsg(`Skill "${newSkillName}" is already in your confirmed list.`);
      return;
    }

    const added: ConfirmedSkill = {
      name: newSkillName.trim(),
      category: newSkillCat,
      evidence_level: newSkillEvidence,
      status: newSkillStatus,
      years_experience: newSkillYears ? Number(newSkillYears) : undefined,
      notes: newSkillNotes.trim() || undefined,
    };

    setSkills([...skills, added]);
    setNewSkillName('');
    setNewSkillYears('');
    setNewSkillNotes('');
    setErrorMsg(null);
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(skills.filter((s) => s.name !== skillName));
  };

  const handleSaveSkills = async () => {
    setSaveSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/candidate/skills', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ skills, target_role: targetRole }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save skills');

      setSaveSuccessMsg('Confirmed skills saved successfully!');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Save error');
    }
  };

  const handleRunAnalysis = async () => {
    if (!jobDescriptionInput.trim()) {
      setErrorMsg('Please enter or paste a job description to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/candidate/skills/gap-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_role: targetRole,
          job_description: jobDescriptionInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      setAnalysisRecord(data.analysis);
      setActiveTab('gap_analysis');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error running skill gap analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredGapResults = analysisRecord?.gap_analysis_results.filter((item) => {
    if (statusFilter === 'all') return true;
    return item.status.toLowerCase().replace(/\s+/g, '_') === statusFilter;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Skill Diagnostics
            </span>
            <span className="status-badge badge-developing badge-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini AI Powered
            </span>
          </div>
          <h1 className="page-title">Skills & Skill-Gap Analysis</h1>
          <p className="page-subtitle">
            Manage your confirmed skills inventory and benchmark your capabilities against specific job descriptions using Gemini AI.
          </p>
        </div>

        <div className="page-header-actions">
          <Link to="/passport" className="btn btn-outline">
            <ShieldCheck className="w-4 h-4 mr-1" />
            Skill Passport
          </Link>
          <Link to="/assessments" className="btn btn-primary">
            Take Assessment →
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {saveSuccessMsg && (
        <div className="success-banner">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Target Role Banner Card */}
      <div
        className="card"
        style={{
          marginBottom: '1.75rem',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target className="w-6 h-6" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Target Job Role
            </span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
              {targetRole || 'Software Engineer'}
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Change target role..."
            className="form-input"
            style={{ width: '220px' }}
          />
          <button onClick={handleSaveSkills} className="btn btn-outline btn-sm">
            Update Role
          </button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="tabs-nav">
        <button
          onClick={() => setActiveTab('skills')}
          className={`tab-btn ${activeTab === 'skills' ? 'tab-btn-active' : ''}`}
        >
          <CheckCircle className="w-4 h-4" />
          Confirmed Skills Inventory ({skills.length})
        </button>
        <button
          onClick={() => setActiveTab('gap_analysis')}
          className={`tab-btn ${activeTab === 'gap_analysis' ? 'tab-btn-active' : ''}`}
        >
          <Sparkles className="w-4 h-4" />
          Gemini Skill-Gap Diagnostics
          {analysisRecord && (
            <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.45rem', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '9999px', fontWeight: 700 }}>
              Analyzed
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: CONFIRMED SKILLS */}
      {activeTab === 'skills' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Add Skill Card */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              <Plus className="w-4 h-4 text-indigo-600" />
              Add Confirmed Skill to Inventory
            </h3>

            <form onSubmit={handleAddSkill}>
              <div className="profile-grid">
                <div className="profile-field">
                  <label>Skill Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Java, Spring Boot, React, Docker"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="profile-field">
                  <label>Category</label>
                  <select
                    value={newSkillCat}
                    onChange={(e) => setNewSkillCat(e.target.value as SkillCategory)}
                    className="profile-input"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="profile-field">
                  <label>Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="e.g. 3.5"
                    value={newSkillYears}
                    onChange={(e) => setNewSkillYears(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="profile-field">
                  <label>Status / Currency</label>
                  <select
                    value={newSkillStatus}
                    onChange={(e) => setNewSkillStatus(e.target.value as SkillStatus)}
                    className="profile-input"
                  >
                    <option value="active">Active / Confirmed</option>
                    <option value="needs_refresh">Needs Refresh</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="profile-field" style={{ marginTop: '0.25rem' }}>
                <label>Practical Context / Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Built core auth microservice and REST endpoints"
                  value={newSkillNotes}
                  onChange={(e) => setNewSkillNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btn btn-primary">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Skill
                </button>
                <button type="button" onClick={handleSaveSkills} className="btn btn-secondary">
                  Save All Changes to Database
                </button>
              </div>
            </form>
          </div>

          {/* Categorized Skills View */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Confirmed Skills by Category</h3>
                <p className="card-desc">
                  Separates candidate-confirmed skills from AI predictions and verified test evidence.
                </p>
              </div>
              <button onClick={handleSaveSkills} className="btn btn-primary btn-sm">
                Save Skills
              </button>
            </div>

            {isLoadingSkills ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <div className="loading-spinner-ring" style={{ margin: '0 auto 0.75rem' }} />
                <p className="loading-text">Loading confirmed skills...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {CATEGORIES.map((cat) => {
                const catSkills = skills.filter((s) => s.category === cat.key);
                return (
                  <div key={cat.key} style={{ backgroundColor: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--slate-700)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {cat.label} ({catSkills.length})
                      </span>
                    </div>

                    {catSkills.length === 0 ? (
                      <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>
                        No skills recorded in this category.
                      </span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {catSkills.map((s) => (
                          <div
                            key={s.name}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                              padding: '0.35rem 0.75rem',
                              backgroundColor: '#ffffff',
                              border: '1px solid var(--slate-200)',
                              borderRadius: 'var(--radius-md)',
                              fontSize: '0.8125rem',
                              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
                            }}
                          >
                            <strong style={{ color: 'var(--slate-900)' }}>{s.name}</strong>
                            {s.years_experience != null && (
                              <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                                ({s.years_experience}y)
                              </span>
                            )}
                            <StatusBadge status={s.status === 'active' ? 'Demonstrated' : 'Needs Refresh'} size="sm" showIcon={false} />
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(s.name)}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: 0 }}
                              title="Remove skill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GEMINI SKILL GAP DIAGNOSTICS */}
      {activeTab === 'gap_analysis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Job Description Input Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  1. Target Job Description Input
                </h3>
                <p className="card-desc">
                  Paste any job description to run a real Gemini AI extraction of required and preferred skills.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setJobDescriptionInput(SAMPLE_JOB_DESCRIPTION)}
                className="btn btn-outline btn-sm"
              >
                Insert Sample Job Spec
              </button>
            </div>

            <div className="form-group">
              <label>Job Description & Requirements</label>
              <textarea
                rows={6}
                placeholder="Paste the job description or role specification here..."
                value={jobDescriptionInput}
                onChange={(e) => setJobDescriptionInput(e.target.value)}
                className="profile-textarea"
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </div>

            <button
              type="button"
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="btn btn-primary btn-lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="loading-spinner-ring" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  Extracting Requirements with Gemini AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  Run Gemini Skill-Gap Analysis
                </>
              )}
            </button>
          </div>

          {/* Analysis Results View */}
          {analysisRecord && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    <Target className="w-4 h-4 text-indigo-600" />
                    2. Explainable Skill-Gap Results
                  </h3>
                  <p className="card-desc">
                    Target Role: <strong>{analysisRecord.target_role}</strong> · Analyzed {new Date(analysisRecord.created_at).toLocaleString()}
                  </p>
                </div>

                {analysisRecord.summary && (
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>
                      REQUIREMENTS MATCH
                    </span>
                    <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669' }}>
                      {analysisRecord.summary.total_skills_analyzed > 0
                        ? Math.round(
                            ((analysisRecord.summary.demonstrated_count +
                              analysisRecord.summary.developing_count * 0.5) /
                              analysisRecord.summary.total_skills_analyzed) *
                              100
                          )
                        : 0}
                      %
                    </strong>
                  </div>
                )}
              </div>

              {/* Status Breakdown Summary */}
              {analysisRecord.summary && (
                <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                  <StatCard
                    label="Demonstrated"
                    value={analysisRecord.summary.demonstrated_count || 0}
                    icon={<CheckCircle className="w-4 h-4 text-emerald-600" />}
                    hint="Skills ready for interview"
                    variant="success"
                  />
                  <StatCard
                    label="Needs Refresh"
                    value={analysisRecord.summary.needs_refresh_count || 0}
                    icon={<Clock className="w-4 h-4 text-amber-600" />}
                    hint="Hiatus refresh suggested"
                    variant="warning"
                  />
                  <StatCard
                    label="Developing"
                    value={analysisRecord.summary.developing_count || 0}
                    icon={<Sparkles className="w-4 h-4 text-violet-600" />}
                    hint="In active progression"
                    variant="violet"
                  />
                  <StatCard
                    label="Not Yet Demonstrated"
                    value={analysisRecord.summary.not_demonstrated_count || 0}
                    icon={<AlertCircle className="w-4 h-4 text-red-600" />}
                    hint="High priority upskilling"
                    variant="default"
                  />
                </div>
              )}

              {/* Skill Matrix Filter */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)' }}>
                  Detailed Skill Comparison Matrix:
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {['all', 'demonstrated', 'needs_refresh', 'developing', 'not_yet_demonstrated'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`btn btn-sm ${statusFilter === f ? 'btn-primary' : 'btn-outline'}`}
                      style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
                    >
                      {f.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diagnostic Table */}
              <div className="table-responsive" style={{ marginBottom: '1.5rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Job Requirement Skill</th>
                      <th>Category</th>
                      <th>Evaluated Status</th>
                      <th>Evidence Tier</th>
                      <th>Explainable Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(filteredGapResults || []).map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong style={{ color: 'var(--slate-900)' }}>{item.skill_name}</strong>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--slate-500)', textTransform: 'capitalize' }}>
                          {item.category?.replace(/_/g, ' ')}
                        </td>
                        <td>
                          <StatusBadge status={item.status} size="sm" />
                        </td>
                        <td>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-600)' }}>
                            {item.evidence_level}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.8125rem', color: 'var(--slate-700)' }}>
                          {item.recommendation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Next Action Prompts */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap', backgroundColor: 'var(--slate-50)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                  Recommended Next Steps:
                </span>
                <Link to="/assessments" className="btn btn-primary btn-sm">
                  Take Benchmark Challenge
                </Link>
                <Link to="/projects" className="btn btn-outline btn-sm">
                  Build Sandbox Project
                </Link>
                <Link to="/reports" className="btn btn-outline btn-sm">
                  Export Diagnostic Report
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SkillGapPage;
