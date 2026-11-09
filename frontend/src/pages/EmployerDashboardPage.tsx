import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useRealtime } from '../hooks/useRealtime';
import type { EmployerProfile, Job, CandidateSummary, JobApplication } from '../types/employer';
import {
  Briefcase,
  Users,
  Building,
  LayoutDashboard,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Radio,
  X,
} from '../components/Icons';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

type EmployerView = 'dashboard' | 'profile' | 'jobs' | 'candidates' | 'candidate-detail' | 'applications';

const emptyJob: Partial<Job> = {
  title: '',
  description: '',
  department: '',
  location: '',
  type: 'full-time',
  experience_level: '',
  required_skills: [],
  preferred_skills: [],
  status: 'open',
};

export const EmployerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { authFetch } = useApi();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active view from URL path
  const getViewFromPath = (): EmployerView => {
    const path = location.pathname;
    if (path === '/employer/profile') return 'profile';
    if (path === '/employer/jobs') return 'jobs';
    if (path === '/employer/candidates') return 'candidates';
    return 'dashboard';
  };

  const [view, setView] = useState<EmployerView>(getViewFromPath);

  useEffect(() => {
    const v = getViewFromPath();
    if (view !== 'candidate-detail' && view !== 'applications') {
      setView(v);
    }
  }, [location.pathname]);

  const handleTabChange = (newView: EmployerView) => {
    setView(newView);
    if (newView === 'dashboard') navigate('/employer');
    else if (newView === 'profile') navigate('/employer/profile');
    else if (newView === 'jobs') navigate('/employer/jobs');
    else if (newView === 'candidates') navigate('/employer/candidates');
  };

  const [profile, setProfile] = useState<EmployerProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<CandidateSummary[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Record<string, unknown> | null>(null);
  const [applications, setApplications] = useState<(JobApplication & { candidate_name: string })[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editingJob, setEditingJob] = useState<Partial<Job> | null>(null);
  const [isNewJob, setIsNewJob] = useState(false);
  const [skillFilter, setSkillFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [realtimeEvents, setRealtimeEvents] = useState<string[]>([]);

  // Realtime notifications
  useRealtime({
    job_application: (data) => {
      setRealtimeEvents((prev) => [`New application received: ${JSON.stringify(data)}`, ...prev.slice(0, 9)]);
      if (view === 'applications' && selectedJob?.id) {
        loadApplications(selectedJob.id);
      }
    },
    candidate_submission: (data) => {
      setRealtimeEvents((prev) => [`Candidate submitted solution: ${JSON.stringify(data)}`, ...prev.slice(0, 9)]);
    },
  });

  const loadProfile = useCallback(async () => {
    try {
      const r = await authFetch('/api/employer/profile');
      if (r.ok) {
        const d = await r.json();
        setProfile(d.profile);
      }
    } catch {
      /* ignore */
    }
  }, [authFetch]);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const r = await authFetch('/api/employer/jobs');
      if (r.ok) {
        const d = await r.json();
        setJobs(d.jobs || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const url = skillFilter
        ? `/api/employer/candidates?skill=${encodeURIComponent(skillFilter)}`
        : '/api/employer/candidates';
      const r = await authFetch(url);
      if (r.ok) {
        const d = await r.json();
        setCandidates(d.candidates || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [authFetch, skillFilter]);

  const loadApplications = useCallback(
    async (jobId: string) => {
      if (!jobId) return;
      try {
        setLoading(true);
        const r = await authFetch(`/api/employer/jobs/${jobId}/applications`);
        if (r.ok) {
          const d = await r.json();
          setApplications(d.applications || []);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  const loadCandidateDetail = useCallback(
    async (candidateId: string) => {
      try {
        setLoading(true);
        const r = await authFetch(`/api/employer/candidates/${candidateId}`);
        if (r.ok) {
          const d = await r.json();
          setSelectedCandidate(d);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (view === 'jobs') loadJobs();
  }, [view, loadJobs]);

  useEffect(() => {
    if (view === 'candidates') loadCandidates();
  }, [view, loadCandidates]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const r = await authFetch('/api/employer/profile', {
        method: 'PUT',
        body: JSON.stringify(profile),
      });
      const d = await r.json();
      if (r.ok) {
        setProfile(d.profile);
        setSuccessMsg('Company profile updated successfully!');
      } else setError(d.error || 'Failed to save profile');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const saveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const url = isNewJob ? '/api/employer/jobs' : `/api/employer/jobs/${editingJob.id}`;
      const method = isNewJob ? 'POST' : 'PUT';
      const r = await authFetch(url, { method, body: JSON.stringify(editingJob) });
      const d = await r.json();
      if (r.ok) {
        setSuccessMsg(isNewJob ? 'Job opportunity posted!' : 'Job updated successfully!');
        setEditingJob(null);
        setIsNewJob(false);
        await loadJobs();
      } else setError(d.error || 'Failed to save job');
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      const r = await authFetch(`/api/employer/jobs/${jobId}`, { method: 'DELETE' });
      if (r.ok) {
        setSuccessMsg('Job posting deleted');
        await loadJobs();
      } else {
        const d = await r.json();
        setError(d.error || 'Failed to delete');
      }
    } catch {
      setError('Network error');
    }
  };

  const updateApplicationStatus = async (appId: string, status: string, feedback: string) => {
    try {
      const r = await authFetch(`/api/employer/applications/${appId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, employer_feedback: feedback }),
      });
      if (r.ok) {
        setSuccessMsg('Application status and candidate feedback updated!');
        if (selectedJob) await loadApplications(selectedJob.id);
      } else {
        const d = await r.json();
        setError(d.error || 'Failed to update');
      }
    } catch {
      setError('Network error');
    }
  };

  const parseSkills = (val: string): string[] =>
    val
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  if (!user) return null;

  const totalCandidateEvidence = candidates.reduce((sum, c) => sum + (c.evidence_count || 0), 0);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Verified Hiring Platform
            </span>
            <span className="status-badge badge-primary badge-sm">
              {profile?.company_name || 'Employer Partner'}
            </span>
          </div>
          <h1 className="page-title">Employer Workspace</h1>
          <p className="page-subtitle">
            Evaluate real engineering submissions, review authenticated Skill Passports, and hire proven talent based
            on practical work.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            onClick={() => {
              setEditingJob({ ...emptyJob });
              setIsNewJob(true);
              setView('jobs');
            }}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Post New Job
          </button>
        </div>
      </div>

      {/* Tabs navigation pill bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '1.75rem',
          backgroundColor: '#ffffff',
          padding: '0.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--slate-200)',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        {[
          { key: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { key: 'jobs', label: 'Manage Jobs', icon: <Briefcase className="w-4 h-4" /> },
          { key: 'candidates', label: 'Candidate Discovery', icon: <Users className="w-4 h-4" /> },
          { key: 'profile', label: 'Company Profile', icon: <Building className="w-4 h-4" /> },
        ].map(({ key, label, icon }) => {
          const isActive = view === key;
          return (
            <button
              key={key}
              onClick={() => handleTabChange(key as EmployerView)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.85rem',
                fontWeight: isActive ? 600 : 500,
                border: 'none',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--slate-600)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {icon}
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback & Alert Messages */}
      {successMsg && (
        <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#065f46' }}>{successMsg}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {realtimeEvents.length > 0 && (
        <div
          className="card"
          style={{ marginBottom: '1.5rem', backgroundColor: '#f0fdf4', borderColor: '#86efac', padding: '1rem 1.25rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46' }}>Realtime Candidate Activity</span>
          </div>
          {realtimeEvents.map((evt, i) => (
            <div key={i} style={{ fontSize: '0.8125rem', color: '#166534', padding: '0.15rem 0' }}>
              • {evt}
            </div>
          ))}
        </div>
      )}

      {/* 1. DASHBOARD VIEW */}
      {view === 'dashboard' && (
        <div>
          {/* Stats Grid */}
          <div className="stats-grid">
            <StatCard
              label="Active Job Postings"
              value={jobs.length}
              icon={<Briefcase className="w-4 h-4 text-indigo-600" />}
              hint="Roles open for applications"
              variant="primary"
            />
            <StatCard
              label="Candidates In Network"
              value={candidates.length}
              icon={<Users className="w-4 h-4 text-blue-600" />}
              hint="Engineers with verified work"
              variant="default"
            />
            <StatCard
              label="Evidence Records"
              value={totalCandidateEvidence}
              icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
              hint="Demonstrated submissions"
              variant="success"
            />
          </div>

          {/* Quick Access Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div
              className="card"
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              onClick={() => {
                setView('candidates');
                navigate('/employer/candidates');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                    Candidate Discovery
                  </h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                    Filter by skills & inspect passports
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5, margin: '0 0 1rem' }}>
                Review candidates returning to tech with hands-on benchmark scores, sandbox code repositories, and
                verified rubrics.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600 }}>
                Explore Candidates <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            <div
              className="card"
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              onClick={() => {
                setView('jobs');
                navigate('/employer/jobs');
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                    Job Pipeline
                  </h3>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                    Track applicants & provide feedback
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5, margin: '0 0 1rem' }}>
                Create structured job postings with required and preferred skills. Track incoming applications and move
                candidates through interview stages.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', color: '#059669', fontSize: '0.875rem', fontWeight: 600 }}>
                Manage Job Postings <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. COMPANY PROFILE VIEW */}
      {view === 'profile' && profile && (
        <div className="card" style={{ maxWidth: '760px' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">Company Profile & Employer Branding</h3>
              <p className="card-desc">
                Present your organization to candidates seeking returnship and engineering roles.
              </p>
            </div>
          </div>

          <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  className="form-input"
                  required
                  value={profile.company_name || ''}
                  onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                  placeholder="e.g. Acme Cloud Corp"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Industry Sector</label>
                <input
                  className="form-input"
                  value={profile.industry || ''}
                  onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                  placeholder="e.g. Fintech / SaaS / Enterprise"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Headquarters / Location</label>
                <input
                  className="form-input"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="e.g. Bengaluru / Remote"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Website</label>
                <input
                  type="url"
                  className="form-input"
                  value={profile.website || ''}
                  onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                  placeholder="https://company.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Company Overview & Culture</label>
              <textarea
                className="form-input"
                rows={4}
                value={profile.description || ''}
                onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                placeholder="Describe your engineering culture, supportive return-to-work philosophy, and tech stack..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving Profile...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. JOBS MANAGEMENT VIEW */}
      {view === 'jobs' && (
        <div>
          {/* Post/Edit Job Modal or Form */}
          {editingJob && (
            <div className="card" style={{ marginBottom: '2rem', border: '2px solid var(--primary)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--slate-200)',
                  paddingBottom: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <span className="status-badge badge-primary badge-sm">
                    {isNewJob ? 'New Posting' : 'Modify Posting'}
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                    {isNewJob ? 'Create New Job Opportunity' : `Edit: ${editingJob.title}`}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingJob(null);
                    setIsNewJob(false);
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={saveJob} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">Job Title *</label>
                    <input
                      className="form-input"
                      required
                      value={editingJob.title || ''}
                      onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                      placeholder="e.g. Senior Backend Engineer"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department / Team</label>
                    <input
                      className="form-input"
                      value={editingJob.department || ''}
                      onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                      placeholder="e.g. Cloud Infrastructure"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      className="form-input"
                      value={editingJob.location || ''}
                      onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                      placeholder="e.g. Remote / Bengaluru"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Experience Level</label>
                    <input
                      className="form-input"
                      value={editingJob.experience_level || ''}
                      onChange={(e) => setEditingJob({ ...editingJob, experience_level: e.target.value })}
                      placeholder="e.g. 3-6 years / Returnship friendly"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Employment Type</label>
                    <select
                      className="form-select"
                      value={editingJob.type || 'full-time'}
                      onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value as any })}
                    >
                      <option value="full-time">Full-time</option>
                      <option value="part-time">Part-time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship / Returnship</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Listing Status</label>
                    <select
                      className="form-select"
                      value={editingJob.status || 'open'}
                      onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value as any })}
                    >
                      <option value="open">Open (Accepting Applications)</option>
                      <option value="draft">Draft</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description & Responsibilities</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={editingJob.description || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                    placeholder="Outline day-to-day work, engineering challenges, architecture stack, and team culture..."
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Required Skills (comma-separated)</label>
                  <input
                    className="form-input"
                    value={(editingJob.required_skills || []).join(', ')}
                    onChange={(e) => setEditingJob({ ...editingJob, required_skills: parseSkills(e.target.value) })}
                    placeholder="Python, PostgreSQL, Docker, FastApi"
                  />
                  <span className="form-helper">
                    These skills will be matched against candidate Skill Passports and skill-gap diagnostics.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred / Nice-to-Have Skills (comma-separated)</label>
                  <input
                    className="form-input"
                    value={(editingJob.preferred_skills || []).join(', ')}
                    onChange={(e) => setEditingJob({ ...editingJob, preferred_skills: parseSkills(e.target.value) })}
                    placeholder="Kubernetes, Terraform, GraphQL"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--slate-200)', paddingTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setEditingJob(null);
                      setIsNewJob(false);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : isNewJob ? 'Publish Job' : 'Update Job'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Jobs Listing */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Active Job Opportunities ({jobs.length})</h3>
                <p className="card-desc">Review your published listings and examine incoming candidate applications.</p>
              </div>
              {!editingJob && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setEditingJob({ ...emptyJob });
                    setIsNewJob(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Post Job
                </button>
              )}
            </div>

            {loading && !editingJob ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div className="loading-spinner-ring" style={{ margin: '0 auto 1rem' }} />
                <p className="loading-text">Loading job listings...</p>
              </div>
            ) : jobs.length === 0 && !editingJob ? (
              <div className="empty-state-card">
                <p className="empty-state-desc">No job postings created yet. Publish your first opportunity above.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {jobs.map((job) => (
                  <div
                    key={job.id}
                    style={{
                      border: '1px solid var(--slate-200)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                            {job.title}
                          </h4>
                          <span
                            className={`status-badge ${
                              job.status === 'open' ? 'badge-verified' : 'badge-slate'
                            } badge-sm`}
                          >
                            {job.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                          {job.department && `${job.department} · `}
                          {job.location} · {job.type} · {job.experience_level}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setSelectedJob(job);
                            setView('applications');
                            loadApplications(job.id);
                          }}
                        >
                          Review Applications
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => {
                            setEditingJob({ ...job });
                            setIsNewJob(false);
                          }}
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          Edit
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                          onClick={() => deleteJob(job.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.45, margin: 0 }}>
                      {job.description}
                    </p>

                    {/* Skill Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                      {job.required_skills.map((s) => (
                        <span key={s} className="status-badge badge-primary badge-sm">
                          Required: {s}
                        </span>
                      ))}
                      {job.preferred_skills.map((s) => (
                        <span key={s} className="status-badge badge-developing badge-sm">
                          Preferred: {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. CANDIDATE DISCOVERY VIEW */}
      {view === 'candidates' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Candidate Discovery</h3>
              <p className="card-desc">
                Find qualified engineers based on authenticated skill evidence rather than arbitrary career gaps.
              </p>
            </div>
          </div>

          {/* Skill Filter Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search
                className="w-4 h-4 text-slate-400"
                style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Filter by skill (e.g. Python, React, PostgreSQL)..."
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadCandidates()}
              />
            </div>
            <button className="btn btn-primary" onClick={loadCandidates}>
              Search Candidates
            </button>
            {skillFilter && (
              <button
                className="btn btn-outline"
                onClick={() => {
                  setSkillFilter('');
                }}
              >
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <div className="loading-spinner-ring" style={{ margin: '0 auto 1rem' }} />
              <p className="loading-text">Discovering candidates with verified evidence...</p>
            </div>
          ) : candidates.length === 0 ? (
            <div className="empty-state-card">
              <p className="empty-state-desc">
                No candidates found matching the selected filter. Try searching for other engineering skills.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
              {candidates.map((c) => (
                <div
                  key={c.user_id}
                  style={{
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.25rem',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.1rem',
                      }}
                    >
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                        {c.name}
                      </h4>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                        Target: <strong>{c.target_role || 'Software Engineer'}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="status-badge badge-verified badge-sm">
                      <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                      {c.evidence_count} Verified Records
                    </span>
                    <span className="status-badge badge-slate badge-sm">
                      {c.confirmed_skills.length} Confirmed Skills
                    </span>
                  </div>

                  {c.confirmed_skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {c.confirmed_skills.slice(0, 7).map((s) => (
                        <span key={s} className="status-badge badge-slate badge-sm">
                          {s}
                        </span>
                      ))}
                      {c.confirmed_skills.length > 7 && (
                        <span className="status-badge badge-slate badge-sm">
                          +{c.confirmed_skills.length - 7} more
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--slate-100)',
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        setView('candidate-detail');
                        loadCandidateDetail(c.user_id);
                      }}
                    >
                      Inspect Evidence Passport <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. CANDIDATE DETAIL / EVIDENCE REVIEW VIEW */}
      {view === 'candidate-detail' && selectedCandidate && (
        <div>
          <button
            className="btn btn-outline btn-sm"
            style={{ marginBottom: '1.25rem' }}
            onClick={() => setView('candidates')}
          >
            ← Back to Candidate Directory
          </button>

          {loading ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <div className="loading-spinner-ring" style={{ margin: '0 auto 1rem' }} />
              <p className="loading-text">Loading candidate evidence ledger...</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Profile Card */}
              {Boolean(selectedCandidate.profile) && (
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                      }}
                    >
                      {String((selectedCandidate.profile as Record<string, string>).name || 'C').charAt(0)}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                        {(selectedCandidate.profile as Record<string, string>).name}
                      </h2>
                      <div style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                        {(selectedCandidate.profile as Record<string, string>).email} · Target Role:{' '}
                        <strong>{(selectedCandidate.profile as Record<string, string>).target_role || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Evidence Passport */}
              {Array.isArray(selectedCandidate.evidence) && (
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">Skill Freshness Passport Records</h3>
                      <p className="card-desc">Authenticated proof of production competence</p>
                    </div>
                  </div>

                  {(selectedCandidate.evidence as Record<string, string>[]).length === 0 ? (
                    <div className="empty-state-card">
                      <p className="empty-state-desc">No evidence records logged yet.</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Skill</th>
                            <th>Status</th>
                            <th>Source Task / Assessment</th>
                            <th>Score</th>
                            <th>Evaluator</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedCandidate.evidence as Record<string, string>[]).map((e, i) => (
                            <tr key={i}>
                              <td>
                                <strong style={{ color: 'var(--slate-900)' }}>{e.skill}</strong>
                              </td>
                              <td>
                                <StatusBadge status={e.status} size="sm" />
                              </td>
                              <td style={{ fontSize: '0.85rem' }}>{e.source_title}</td>
                              <td>
                                <strong style={{ color: '#059669' }}>{e.score}%</strong>
                              </td>
                              <td style={{ fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                                {e.evaluator || 'Automated Rubric'}
                              </td>
                              <td style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                                {e.date ? new Date(e.date).toLocaleDateString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Assessment Submissions */}
              {Array.isArray(selectedCandidate.assessments) && (
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h3 className="card-title">Technical Benchmark Submissions</h3>
                      <p className="card-desc">Standardized algorithmic and architectural evaluations</p>
                    </div>
                  </div>

                  {(selectedCandidate.assessments as Record<string, string>[]).length === 0 ? (
                    <div className="empty-state-card">
                      <p className="empty-state-desc">No benchmark tests taken.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {(selectedCandidate.assessments as Record<string, string>[]).map((a, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '1rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--slate-200)',
                            backgroundColor: '#ffffff',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <strong style={{ color: 'var(--slate-900)' }}>{a.assessment_title}</strong>
                            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669' }}>
                              Score: {a.score_raw}
                            </span>
                          </div>
                          {a.feedback && (
                            <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', margin: 0 }}>
                              "{a.feedback}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 6. APPLICATIONS REVIEW VIEW */}
      {view === 'applications' && selectedJob && (
        <div>
          <button
            className="btn btn-outline btn-sm"
            style={{ marginBottom: '1.25rem' }}
            onClick={() => setView('jobs')}
          >
            ← Back to Jobs
          </button>

          <div className="card">
            <div className="card-header">
              <div>
                <span className="status-badge badge-primary badge-sm">Applicant Pipeline</span>
                <h3 className="card-title" style={{ marginTop: '0.25rem' }}>
                  Applications for: {selectedJob.title}
                </h3>
                <p className="card-desc">
                  Review applicant details, update status (Shortlist / Interview), and provide direct feedback.
                </p>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div className="loading-spinner-ring" style={{ margin: '0 auto 1rem' }} />
                <p className="loading-text">Loading applicants...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="empty-state-card">
                <p className="empty-state-desc">No applications submitted for this role yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applications.map((app) => (
                  <ApplicationCard key={app.id} app={app} onUpdate={updateApplicationStatus} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface ApplicationCardProps {
  app: JobApplication & { candidate_name: string };
  onUpdate: (appId: string, status: string, feedback: string) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ app, onUpdate }) => {
  const [status, setStatus] = useState(app.status);
  const [feedback, setFeedback] = useState(app.employer_feedback || '');

  return (
    <div
      style={{
        border: '1px solid var(--slate-200)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
            {app.candidate_name}
          </h4>
          <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
            {app.candidate_email} · Applied on {app.created_at ? new Date(app.created_at).toLocaleDateString() : 'N/A'}
          </div>
        </div>
        <StatusBadge status={status} size="md" />
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label className="form-label">Interview / Hiring Status</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
          >
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interviewing">Interviewing</option>
            <option value="Accepted">Accepted / Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div style={{ flex: '2 1 320px' }}>
          <label className="form-label">Feedback for Candidate</label>
          <input
            className="form-input"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Feedback shared directly with candidate in realtime..."
          />
        </div>

        <button
          className="btn btn-primary btn-sm"
          style={{ height: '38px' }}
          onClick={() => onUpdate(app.id, status, feedback)}
        >
          Update Status
        </button>
      </div>
    </div>
  );
};

export default EmployerDashboardPage;
