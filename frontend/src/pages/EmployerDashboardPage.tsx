import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useRealtime } from '../hooks/useRealtime';
import type { EmployerProfile, Job, CandidateSummary, JobApplication } from '../types/employer';

type EmployerView = 'dashboard' | 'profile' | 'jobs' | 'candidates' | 'candidate-detail' | 'applications';

const emptyJob: Partial<Job> = {
  title: '', description: '', department: '', location: '',
  type: 'full-time', experience_level: '', required_skills: [], preferred_skills: [], status: 'open',
};

export const EmployerDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { authFetch } = useApi();
  const navigate = useNavigate();
  const [view, setView] = useState<EmployerView>('dashboard');
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
      if (view === 'applications') loadApplications(selectedJob?.id || '');
    },
    candidate_submission: (data) => {
      setRealtimeEvents((prev) => [`Candidate submission: ${JSON.stringify(data)}`, ...prev.slice(0, 9)]);
    },
  });

  const loadProfile = useCallback(async () => {
    try {
      const r = await authFetch('/api/employer/profile');
      if (r.ok) { const d = await r.json(); setProfile(d.profile); }
    } catch { /* ignore */ }
  }, [authFetch]);

  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      const r = await authFetch('/api/employer/jobs');
      if (r.ok) { const d = await r.json(); setJobs(d.jobs || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [authFetch]);

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const url = skillFilter ? `/api/employer/candidates?skill=${encodeURIComponent(skillFilter)}` : '/api/employer/candidates';
      const r = await authFetch(url);
      if (r.ok) { const d = await r.json(); setCandidates(d.candidates || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [authFetch, skillFilter]);

  const loadApplications = useCallback(async (jobId: string) => {
    if (!jobId) return;
    try {
      setLoading(true);
      const r = await authFetch(`/api/employer/jobs/${jobId}/applications`);
      if (r.ok) { const d = await r.json(); setApplications(d.applications || []); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [authFetch]);

  const loadCandidateDetail = useCallback(async (candidateId: string) => {
    try {
      setLoading(true);
      const r = await authFetch(`/api/employer/candidates/${candidateId}`);
      if (r.ok) { const d = await r.json(); setSelectedCandidate(d); }
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [authFetch]);

  useEffect(() => { loadProfile(); }, [loadProfile]);
  useEffect(() => { if (view === 'jobs') loadJobs(); }, [view, loadJobs]);
  useEffect(() => { if (view === 'candidates') loadCandidates(); }, [view, loadCandidates]);

  const handleLogout = async () => { await logout(); navigate('/login'); };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const r = await authFetch('/api/employer/profile', { method: 'PUT', body: JSON.stringify(profile) });
      const d = await r.json();
      if (r.ok) { setProfile(d.profile); setSuccessMsg('Profile saved!'); }
      else setError(d.error || 'Failed to save');
    } catch { setError('Network error'); } finally { setLoading(false); }
  };

  const saveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;
    setLoading(true); setError(''); setSuccessMsg('');
    try {
      const url = isNewJob ? '/api/employer/jobs' : `/api/employer/jobs/${editingJob.id}`;
      const method = isNewJob ? 'POST' : 'PUT';
      const r = await authFetch(url, { method, body: JSON.stringify(editingJob) });
      const d = await r.json();
      if (r.ok) {
        setSuccessMsg(isNewJob ? 'Job created!' : 'Job updated!');
        setEditingJob(null); setIsNewJob(false);
        await loadJobs();
      } else setError(d.error || 'Failed to save job');
    } catch { setError('Network error'); } finally { setLoading(false); }
  };

  const deleteJob = async (jobId: string) => {
    if (!confirm('Delete this job?')) return;
    try {
      const r = await authFetch(`/api/employer/jobs/${jobId}`, { method: 'DELETE' });
      if (r.ok) { setSuccessMsg('Job deleted'); await loadJobs(); }
      else { const d = await r.json(); setError(d.error || 'Failed to delete'); }
    } catch { setError('Network error'); }
  };

  const updateApplicationStatus = async (appId: string, status: string, feedback: string) => {
    try {
      const r = await authFetch(`/api/employer/applications/${appId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, employer_feedback: feedback }),
      });
      if (r.ok) {
        setSuccessMsg('Application updated');
        if (selectedJob) await loadApplications(selectedJob.id);
      } else { const d = await r.json(); setError(d.error || 'Failed'); }
    } catch { setError('Network error'); }
  };

  const parseSkills = (val: string): string[] =>
    val.split(',').map((s) => s.trim()).filter(Boolean);

  if (!user) return null;

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <Link to="/dashboard" className="brand-logo-text" style={{ textDecoration: 'none' }}>SkillBridge</Link>
          <span className="role-badge badge-employer">Employer</span>
          {realtimeEvents.length > 0 && (
            <span className="role-badge" style={{ background: '#059669', fontSize: '0.65rem', animation: 'pulse 2s infinite' }}>
              🔴 Live
            </span>
          )}
        </div>
        <div className="dashboard-user-bar">
          <span className="user-greeting">Signed in as <strong>{user.name}</strong></span>
          {(['dashboard', 'profile', 'jobs', 'candidates'] as EmployerView[]).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={`btn btn-sm ${view === v ? 'btn-primary' : 'btn-outline'}`}
              style={{ textTransform: 'capitalize' }}>{v}</button>
          ))}
          <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        {successMsg && <div className="success-banner" style={{ background: '#d1fae5', color: '#065f46', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>{successMsg}</div>}
        {error && <div className="error-banner" style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

        {/* Realtime feed */}
        {realtimeEvents.length > 0 && (
          <div className="profile-details-card" style={{ background: '#f0fdf4', borderColor: '#86efac', marginBottom: '1rem' }}>
            <h3 style={{ color: '#065f46', margin: '0 0 0.5rem' }}>🔴 Live Activity</h3>
            {realtimeEvents.map((evt, i) => (
              <div key={i} style={{ fontSize: '0.8rem', color: '#166534', padding: '0.2rem 0' }}>• {evt}</div>
            ))}
          </div>
        )}

        {/* DASHBOARD */}
        {view === 'dashboard' && (
          <div>
            <div className="dashboard-heading-section">
              <h1>Employer Dashboard</h1>
              <p className="dashboard-subtitle">
                {profile?.company_name ? `${profile.company_name} — ` : ''}Manage jobs, discover candidates, review evidence.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Open Jobs', value: jobs.length, action: () => setView('jobs'), color: '#4338ca' },
                { label: 'Candidates', value: candidates.length, action: () => setView('candidates'), color: '#059669' },
              ].map((stat) => (
                <div key={stat.label} className="profile-details-card" style={{ textAlign: 'center', cursor: 'pointer' }} onClick={stat.action}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ color: '#475569', fontSize: '0.9rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button onClick={() => setView('profile')} className="btn btn-primary">Company Profile →</button>
              <button onClick={() => { setView('jobs'); }} className="btn btn-secondary">Manage Jobs →</button>
              <button onClick={() => setView('candidates')} className="btn btn-outline">Discover Candidates →</button>
            </div>
          </div>
        )}

        {/* COMPANY PROFILE */}
        {view === 'profile' && profile && (
          <div>
            <h2>Company Profile</h2>
            <form onSubmit={saveProfile} className="profile-details-card">
              {(['company_name', 'industry', 'location', 'website'] as const).map((field) => (
                <div className="profile-field" key={field}>
                  <label className="field-label" style={{ textTransform: 'capitalize' }}>
                    {field.replace('_', ' ')}
                  </label>
                  <input className="profile-input"
                    value={profile[field] || ''}
                    onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
                  />
                </div>
              ))}
              <div className="profile-field">
                <label className="field-label">Description</label>
                <textarea className="profile-textarea" rows={4}
                  value={profile.description || ''}
                  onChange={(e) => setProfile({ ...profile, description: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        )}

        {/* JOBS MANAGEMENT */}
        {view === 'jobs' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Jobs</h2>
              <button className="btn btn-primary" onClick={() => { setEditingJob({ ...emptyJob }); setIsNewJob(true); }}>
                + New Job
              </button>
            </div>

            {/* Job Form */}
            {editingJob && (
              <form onSubmit={saveJob} className="profile-details-card" style={{ marginBottom: '2rem', borderColor: '#c7d2fe' }}>
                <h3>{isNewJob ? 'Create New Job' : 'Edit Job'}</h3>
                <div className="profile-grid">
                  {[
                    { field: 'title', label: 'Job Title', required: true },
                    { field: 'department', label: 'Department', required: false },
                    { field: 'location', label: 'Location', required: false },
                    { field: 'experience_level', label: 'Experience Level', required: false },
                  ].map(({ field, label, required }) => (
                    <div className="profile-field" key={field}>
                      <label className="field-label">{label}</label>
                      <input className="profile-input" required={required}
                        value={(editingJob as Record<string, string>)[field] || ''}
                        onChange={(e) => setEditingJob({ ...editingJob, [field]: e.target.value })}
                      />
                    </div>
                  ))}
                  <div className="profile-field">
                    <label className="field-label">Type</label>
                    <select className="profile-input"
                      value={editingJob.type || 'full-time'}
                      onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value })}
                    >
                      {['full-time', 'part-time', 'contract', 'internship'].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="profile-field">
                    <label className="field-label">Status</label>
                    <select className="profile-input"
                      value={editingJob.status || 'open'}
                      onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value })}
                    >
                      {['open', 'draft', 'closed'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="profile-field">
                  <label className="field-label">Description</label>
                  <textarea className="profile-textarea" rows={4}
                    value={editingJob.description || ''}
                    onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  />
                </div>
                <div className="profile-field">
                  <label className="field-label">Required Skills (comma-separated)</label>
                  <input className="profile-input"
                    value={(editingJob.required_skills || []).join(', ')}
                    onChange={(e) => setEditingJob({ ...editingJob, required_skills: parseSkills(e.target.value) })}
                    placeholder="Python, React, SQL"
                  />
                </div>
                <div className="profile-field">
                  <label className="field-label">Preferred Skills (comma-separated)</label>
                  <input className="profile-input"
                    value={(editingJob.preferred_skills || []).join(', ')}
                    onChange={(e) => setEditingJob({ ...editingJob, preferred_skills: parseSkills(e.target.value) })}
                    placeholder="Docker, Kubernetes"
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : (isNewJob ? 'Create Job' : 'Update Job')}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => { setEditingJob(null); setIsNewJob(false); }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {loading && !editingJob && <div className="loading-spinner" />}
            {jobs.length === 0 && !loading && (
              <div className="empty-state-card">
                <div className="empty-state-icon">📋</div>
                <h3>No Jobs Yet</h3>
                <p>Create your first job posting to start finding candidates.</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {jobs.map((job) => (
                <div key={job.id} className="profile-details-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#1e1b4b' }}>{job.title}</h3>
                      <div style={{ color: '#475569', fontSize: '0.85rem' }}>
                        {job.department && `${job.department} · `}{job.location} · {job.type} · {job.experience_level}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`role-badge ${job.status === 'open' ? 'badge-candidate' : 'badge-employer'}`} style={{ fontSize: '0.7rem' }}>
                        {job.status}
                      </span>
                      <button className="btn btn-outline btn-sm" onClick={() => { setEditingJob({ ...job }); setIsNewJob(false); }}>Edit</button>
                      <button className="btn btn-outline btn-sm" onClick={() => {
                        setSelectedJob(job); setView('applications'); loadApplications(job.id);
                      }}>Applications</button>
                      <button className="btn btn-sm" style={{ background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer' }} onClick={() => deleteJob(job.id)}>Delete</button>
                    </div>
                  </div>
                  {job.required_skills.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Required: </span>
                      {job.required_skills.map((s) => (
                        <span key={s} className="skill-badge skill-confirmed" style={{ fontSize: '0.75rem', marginRight: '0.3rem' }}>{s}</span>
                      ))}
                    </div>
                  )}
                  {job.preferred_skills.length > 0 && (
                    <div style={{ marginTop: '0.4rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Preferred: </span>
                      {job.preferred_skills.map((s) => (
                        <span key={s} className="skill-badge skill-developing" style={{ fontSize: '0.75rem', marginRight: '0.3rem' }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CANDIDATE DISCOVERY */}
        {view === 'candidates' && (
          <div>
            <h2>Candidate Discovery</h2>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <input className="profile-input" placeholder="Filter by skill (e.g. Python, React)"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={loadCandidates}>Search</button>
            </div>

            {loading && <div className="loading-spinner" />}
            {candidates.length === 0 && !loading && (
              <div className="empty-state-card">
                <div className="empty-state-icon">🔍</div>
                <h3>No Candidates Found</h3>
                <p>Try a different skill filter, or wait for candidates to register.</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {candidates.map((c) => (
                <div key={c.user_id} className="profile-details-card" style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{c.name}</h3>
                      <div style={{ color: '#475569', fontSize: '0.85rem' }}>{c.email} · Target: {c.target_role || 'N/A'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.3rem' }}>
                        {c.evidence_count} evidence records
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => {
                      setView('candidate-detail');
                      loadCandidateDetail(c.user_id);
                    }}>View Evidence</button>
                  </div>
                  {c.confirmed_skills.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      {c.confirmed_skills.slice(0, 8).map((s) => (
                        <span key={s} className="skill-badge skill-confirmed" style={{ fontSize: '0.75rem', marginRight: '0.3rem' }}>{s}</span>
                      ))}
                      {c.confirmed_skills.length > 8 && <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>+{c.confirmed_skills.length - 8} more</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CANDIDATE DETAIL / EVIDENCE REVIEW */}
        {view === 'candidate-detail' && selectedCandidate && (
          <div>
            <button className="btn btn-outline btn-sm" style={{ marginBottom: '1rem' }} onClick={() => setView('candidates')}>← Back to Candidates</button>
            {loading && <div className="loading-spinner" />}
            {!loading && (
              <>
                {/* Profile */}
                {selectedCandidate.profile && (
                  <div className="profile-details-card">
                    <h2>{(selectedCandidate.profile as Record<string, string>).name}</h2>
                    <div style={{ color: '#475569' }}>{(selectedCandidate.profile as Record<string, string>).email}</div>
                    <div>Target Role: <strong>{(selectedCandidate.profile as Record<string, string>).target_role || 'N/A'}</strong></div>
                  </div>
                )}

                {/* Evidence Passport */}
                {Array.isArray(selectedCandidate.evidence) && (selectedCandidate.evidence as unknown[]).length > 0 && (
                  <div className="profile-details-card" style={{ marginTop: '1rem' }}>
                    <h3>Evidence Passport</h3>
                    {(selectedCandidate.evidence as Record<string, string>[]).map((e, i) => (
                      <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                        <span className={`skill-badge ${e.status === 'Verified' ? 'skill-demonstrated' : 'skill-developing'}`}>{e.status}</span>
                        <strong style={{ marginLeft: '0.5rem' }}>{e.skill}</strong> — {e.source_title}
                        <span style={{ color: '#6b7280', marginLeft: '0.5rem', fontSize: '0.85rem' }}>Score: {e.score}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Assessments */}
                {Array.isArray(selectedCandidate.assessments) && (selectedCandidate.assessments as unknown[]).length > 0 && (
                  <div className="profile-details-card" style={{ marginTop: '1rem' }}>
                    <h3>Assessment Results</h3>
                    {(selectedCandidate.assessments as Record<string, string>[]).map((a, i) => (
                      <div key={i} style={{ padding: '0.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
                        <strong>{a.assessment_title}</strong> — Score: {a.score_raw} — {a.status}
                        {a.feedback && <div style={{ fontSize: '0.8rem', color: '#475569' }}>{a.feedback}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* APPLICATIONS */}
        {view === 'applications' && selectedJob && (
          <div>
            <button className="btn btn-outline btn-sm" style={{ marginBottom: '1rem' }} onClick={() => setView('jobs')}>← Back to Jobs</button>
            <h2>Applications for: {selectedJob.title}</h2>
            {loading && <div className="loading-spinner" />}
            {applications.length === 0 && !loading && (
              <div className="empty-state-card">
                <div className="empty-state-icon">📨</div>
                <h3>No Applications Yet</h3>
                <p>Applications for this job will appear here.</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applications.map((app) => (
                <ApplicationCard key={app.id} app={app} onUpdate={updateApplicationStatus} />
              ))}
            </div>
          </div>
        )}
      </main>
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
    <div className="profile-details-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0 }}>{app.candidate_name}</h3>
          <div style={{ color: '#475569', fontSize: '0.85rem' }}>{app.candidate_email}</div>
        </div>
        <span className="role-badge badge-candidate" style={{ fontSize: '0.75rem' }}>{app.status}</span>
      </div>
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label className="field-label">Update Status</label>
          <select className="profile-input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {['Applied', 'Shortlisted', 'Interviewing', 'Rejected', 'Accepted'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div style={{ flex: '2 1 300px' }}>
          <label className="field-label">Feedback</label>
          <input className="profile-input" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Optional feedback for candidate..." />
        </div>
      </div>
      <button className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }} onClick={() => onUpdate(app.id, status, feedback)}>
        Update Application
      </button>
    </div>
  );
};

export default EmployerDashboardPage;
