import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ConfirmedSkill,
  SkillCategory,
  EvidenceLevel,
  SkillStatus,
  SkillGapAnalysisRecord,
  SkillGapStatus,
} from '../types/skills';

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
  const { token, logout } = useAuth();

  // Navigation tab: 'skills' | 'gap_analysis'
  const [activeTab, setActiveTab] = useState<'skills' | 'gap_analysis'>('skills');

  // Skills State
  const [skills, setSkills] = useState<ConfirmedSkill[]>([]);
  const [targetRole, setTargetRole] = useState<string>('Senior Java Backend Developer');
  const [isLoadingSkills, setIsLoadingSkills] = useState<boolean>(true);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // New Skill Form State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCat, setNewSkillCat] = useState<SkillCategory>('programming_languages');
  const [newSkillEvidence, setNewSkillEvidence] = useState<EvidenceLevel>('Candidate Confirmed');
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
      // Fallback
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
      // Fallback
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

  const getStatusBadgeClass = (status: SkillGapStatus) => {
    switch (status) {
      case 'Demonstrated':
        return 'badge-demonstrated';
      case 'Needs Refresh':
        return 'badge-refresh';
      case 'Developing':
        return 'badge-developing';
      case 'Not Yet Demonstrated':
        return 'badge-missing';
      default:
        return '';
    }
  };

  const getEvidenceBadgeClass = (level: EvidenceLevel) => {
    switch (level) {
      case 'Verified Evidence':
        return 'badge-verified';
      case 'Demonstrated Evidence':
        return 'badge-demonstrated-ev';
      case 'Candidate Confirmed':
        return 'badge-confirmed';
      case 'AI Extracted':
        return 'badge-ai';
      default:
        return 'badge-none';
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Top Header */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <Link to="/dashboard" className="brand-logo-text" style={{ textDecoration: 'none' }}>
            SkillBridge
          </Link>
          <span className="role-badge badge-candidate">Candidate</span>
        </div>

        <nav className="header-nav-links">
          <Link to="/dashboard" className="btn btn-outline btn-sm">Dashboard</Link>
          <Link to="/profile" className="btn btn-outline btn-sm">Profile</Link>
          <Link to="/skills" className="btn btn-primary btn-sm">Skills & Gap</Link>
          <Link to="/assessments" className="btn btn-outline btn-sm">Assessments</Link>
          <Link to="/projects" className="btn btn-outline btn-sm">Projects</Link>
          <Link to="/passport" className="btn btn-outline btn-sm">Passport</Link>
          <button onClick={() => logout()} className="btn btn-outline btn-sm">Logout</button>
        </nav>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-heading-section">
          <h1>Skills & Explainable Skill-Gap Diagnostics</h1>
          <p className="dashboard-subtitle">
            Manage your categorized confirmed skills, benchmark against job requirements, and view explainable gap analysis.
          </p>
        </div>

        {errorMsg && <div className="alert-error">{errorMsg}</div>}
        {saveSuccessMsg && <div className="alert-success">{saveSuccessMsg}</div>}

        {/* Tab Navigation */}
        <div className="subnav-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            Confirmed Skills ({skills.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'gap_analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('gap_analysis')}
          >
            Skill-Gap Analysis {analysisRecord ? '✓' : ''}
          </button>
        </div>

        {/* TAB 1: CONFIRMED SKILLS PAGE */}
        {activeTab === 'skills' && (
          <div className="tab-pane">
            <section className="profile-details-card">
              <div className="card-header-flex">
                <div>
                  <h2>Candidate Confirmed Skills</h2>
                  <p className="section-instruction">
                    Skills explicitly verified and documented by you. Track experience, currency, and evidence level distinctions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSkills}
                  className="btn btn-primary"
                >
                  Save Skills
                </button>
              </div>

              {isLoadingSkills ? (
                <p>Loading confirmed skills...</p>
              ) : (
                <div className="categories-stack">
                  {CATEGORIES.map((cat) => {
                    const catSkills = skills.filter((s) => s.category === cat.key);
                    return (
                      <div key={cat.key} className="skill-category-card">
                        <div className="cat-header">
                          <span className="cat-title">{cat.label}</span>
                          <span className="cat-count">({catSkills.length})</span>
                        </div>

                        {catSkills.length === 0 ? (
                          <p className="empty-hint">No skills confirmed in this category yet.</p>
                        ) : (
                          <div className="skills-detailed-grid">
                            {catSkills.map((skill) => (
                              <div key={skill.name} className="skill-item-row">
                                <div className="skill-main-info">
                                  <strong className="skill-title">{skill.name}</strong>
                                  <div className="badge-cluster">
                                    <span className={`evidence-badge ${getEvidenceBadgeClass(skill.evidence_level || 'Candidate Confirmed')}`}>
                                      {skill.evidence_level || 'Candidate Confirmed'}
                                    </span>
                                    <span className={`status-pill ${skill.status === 'developing' ? 'developing' : 'active'}`}>
                                      {skill.status === 'developing' ? 'Developing' : 'Active'}
                                    </span>
                                    {skill.years_experience && (
                                      <span className="exp-pill">{skill.years_experience} yrs exp</span>
                                    )}
                                  </div>
                                  {skill.notes && <p className="skill-note">{skill.notes}</p>}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSkill(skill.name)}
                                  className="remove-tag-btn"
                                  title="Remove skill"
                                >
                                  ✕
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
            </section>

            {/* Add New Skill Form */}
            <section className="profile-details-card">
              <h2>+ Add Confirmed Skill</h2>
              <form onSubmit={handleAddSkill} className="add-skill-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Skill Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Java, PostgreSQL, Kafka"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={newSkillCat}
                      onChange={(e) => setNewSkillCat(e.target.value as SkillCategory)}
                      className="form-input"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Evidence Distinction</label>
                    <select
                      value={newSkillEvidence}
                      onChange={(e) => setNewSkillEvidence(e.target.value as EvidenceLevel)}
                      className="form-input"
                    >
                      <option value="Candidate Confirmed">Candidate Confirmed</option>
                      <option value="Demonstrated Evidence">Demonstrated Evidence</option>
                      <option value="Verified Evidence">Verified Evidence</option>
                      <option value="AI Extracted">AI Extracted</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Currency / Status</label>
                    <select
                      value={newSkillStatus}
                      onChange={(e) => setNewSkillStatus(e.target.value as SkillStatus)}
                      className="form-input"
                    >
                      <option value="active">Active</option>
                      <option value="needs_refresh">Needs Refresh</option>
                      <option value="developing">Developing / Learning</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Years Experience (Optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 4"
                      value={newSkillYears}
                      onChange={(e) => setNewSkillYears(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '0.75rem' }}>
                  <label>Skill Context / Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Production microservices development"
                    value={newSkillNotes}
                    onChange={(e) => setNewSkillNotes(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div style={{ marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-secondary">
                    Add to Confirmed Skills
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* TAB 2: SKILL GAP ANALYSIS */}
        {activeTab === 'gap_analysis' && (
          <div className="tab-pane">
            {/* Input Job Requirement Section */}
            <section className="profile-details-card">
              <h2>Job Requirement & Target Role Input</h2>
              <p className="section-instruction">
                Enter your target role and paste a real job description. Gemini AI will extract required vs. preferred skills and generate an explainable 4-tier gap diagnostic.
              </p>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Senior Java Backend Developer"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <div className="label-row-flex">
                  <label>Job Description Requirements</label>
                  <button
                    type="button"
                    onClick={() => setJobDescriptionInput(SAMPLE_JOB_DESCRIPTION)}
                    className="btn-link"
                    style={{ color: '#4f46e5' }}
                  >
                    Load Sample Job Description
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={jobDescriptionInput}
                  onChange={(e) => setJobDescriptionInput(e.target.value)}
                  placeholder="Paste job description or requirements here..."
                  className="form-input"
                />
              </div>

              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing || !jobDescriptionInput.trim()}
                  className="btn btn-primary"
                >
                  {isAnalyzing ? 'Analyzing with Gemini AI...' : 'Analyze Skill Gap with Gemini'}
                </button>
                {analysisRecord && (
                  <span className="saved-indicator">
                    ✓ Stored in database ({new Date(analysisRecord.created_at).toLocaleTimeString()})
                  </span>
                )}
              </div>
            </section>

            {/* Analysis Results Display */}
            {analysisRecord && (
              <section className="profile-details-card">
                <h2>Explainable Skill-Gap Diagnostics</h2>
                <p className="section-instruction">
                  {analysisRecord.summary.summary_narrative}
                </p>

                {/* Separate Breakdown Cards (No Flattened Opaque Score) */}
                <div className="metrics-grid">
                  <div className="metric-box demonstrated">
                    <span className="metric-number">{analysisRecord.summary.demonstrated_count}</span>
                    <span className="metric-label">Demonstrated</span>
                    <span className="metric-desc">Verified / Confirmed capability</span>
                  </div>

                  <div className="metric-box refresh">
                    <span className="metric-number">{analysisRecord.summary.needs_refresh_count}</span>
                    <span className="metric-label">Needs Refresh</span>
                    <span className="metric-desc">Historical background; hiatus refresh needed</span>
                  </div>

                  <div className="metric-box developing">
                    <span className="metric-number">{analysisRecord.summary.developing_count}</span>
                    <span className="metric-label">Developing</span>
                    <span className="metric-desc">Active learning in progress</span>
                  </div>

                  <div className="metric-box missing">
                    <span className="metric-number">{analysisRecord.summary.not_demonstrated_count}</span>
                    <span className="metric-label">Not Yet Demonstrated</span>
                    <span className="metric-desc">Required by job; no evidence yet</span>
                  </div>
                </div>

                {/* Top Recommendations */}
                {analysisRecord.summary.top_recommendations.length > 0 && (
                  <div className="recommendations-box">
                    <h3>Actionable Recommendations for Improvement</h3>
                    <ul className="rec-list">
                      {analysisRecord.summary.top_recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Status Filter */}
                <div className="filter-bar">
                  <span className="filter-title">Filter by Diagnostic Status:</span>
                  <div className="filter-buttons">
                    {['all', 'demonstrated', 'needs_refresh', 'developing', 'not_yet_demonstrated'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={`filter-btn ${statusFilter === f ? 'active' : ''}`}
                        onClick={() => setStatusFilter(f)}
                      >
                        {f.replace(/_/g, ' ').toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diagnostic Skills Table / Cards */}
                <div className="diagnostic-table-wrapper">
                  <table className="diagnostic-table">
                    <thead>
                      <tr>
                        <th>Skill & Category</th>
                        <th>Job Requirement</th>
                        <th>Diagnostic Status</th>
                        <th>Evidence Distinction</th>
                        <th>Explainable Rationale & Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGapResults?.map((item) => (
                        <tr key={item.skill_name}>
                          <td>
                            <strong>{item.skill_name}</strong>
                            <span className="cat-sub">{item.category.replace(/_/g, ' ')}</span>
                          </td>
                          <td>
                            <span className={`req-badge ${item.requirement_level}`}>
                              {item.requirement_level === 'required' ? 'Mandatory' : 'Preferred'}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td>
                            <span className={`evidence-badge ${getEvidenceBadgeClass(item.evidence_level)}`}>
                              {item.evidence_level}
                            </span>
                          </td>
                          <td>
                            <p className="explanation-text">{item.explanation}</p>
                            {item.recommendation && (
                              <p className="recommendation-text">
                                <strong>Recommendation:</strong> {item.recommendation}
                              </p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default SkillGapPage;
