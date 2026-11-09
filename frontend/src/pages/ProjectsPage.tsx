import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types/assessmentAndProject';
import {
  Code2,
  CheckCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Send,
  X,
  ExternalLink,
} from '../components/Icons';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export const ProjectsPage: React.FC = () => {
  const { token } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [activeSubmitProject, setActiveSubmitProject] = useState<Project | null>(null);
  const [repoUrl, setRepoUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/candidate/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setProjects(data.projects || []);
    } catch {
      setErrorMsg('Failed to load sandbox projects');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async (projectId: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/candidate/projects/${projectId}/apply`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to enroll');

      setSuccessMsg('Project enrolled successfully! You can now build and submit your solution.');
      fetchProjects();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error applying to project');
    }
  };

  const handleSubmitSolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSubmitProject) return;

    if (!repoUrl.trim()) {
      setErrorMsg('Please enter your code repository URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/candidate/projects/${activeSubmitProject.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          repo_url: repoUrl.trim(),
          notes: submissionNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSuccessMsg(
        `Project evaluated successfully! Score: ${data.application.evaluator_score}%. Verified evidence generated for all required skills!`
      );
      setActiveSubmitProject(null);
      setRepoUrl('');
      setSubmissionNotes('');
      fetchProjects();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const enrolledCount = projects.filter((p) => p.application?.status === 'In Progress').length;
  const verifiedCount = projects.filter((p) => p.application?.status === 'Verified').length;

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
              Practical Proof of Work
            </span>
            <span className="status-badge badge-verified badge-sm">Industry Sandboxes</span>
          </div>
          <h1 className="page-title">Engineering Sandbox Projects</h1>
          <p className="page-subtitle">
            Demonstrate real-world production engineering through hands-on company sandbox tasks. Verified code
            submissions generate authenticated evidence for your Skill Passport.
          </p>
        </div>

        <div className="page-header-actions">
          <Link to="/passport" className="btn btn-outline">
            <ShieldCheck className="w-4 h-4 mr-1" />
            View Passport
          </Link>
          <Link to="/assessments" className="btn btn-outline">
            Benchmark Tests →
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="card" style={{ marginBottom: '1.5rem', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#065f46', margin: 0 }}>
                  Operation Succeeded
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '0.2rem', margin: 0 }}>
                  {successMsg}
                </p>
              </div>
            </div>

            <Link to="/passport" className="btn btn-primary btn-sm">
              View Updated Passport →
            </Link>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="stats-grid">
        <StatCard
          label="Available Sandboxes"
          value={projects.length}
          icon={<Code2 className="w-4 h-4 text-indigo-600" />}
          hint="Production-grade scenarios"
          variant="primary"
        />
        <StatCard
          label="In Progress"
          value={enrolledCount}
          icon={<Clock className="w-4 h-4 text-amber-600" />}
          hint="Active candidate builds"
          variant="warning"
        />
        <StatCard
          label="Verified Submissions"
          value={verifiedCount}
          icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
          hint="Evidence stored in database"
          variant="success"
        />
      </div>

      {/* Project Submission Modal */}
      {activeSubmitProject && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.25rem',
          }}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--slate-200)',
                paddingBottom: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="status-badge badge-slate badge-sm">{activeSubmitProject.provider}</span>
                  <span className="status-badge badge-developing badge-sm">{activeSubmitProject.level}</span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  Submit: {activeSubmitProject.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubmitProject(null)}
                className="btn btn-ghost btn-sm"
                aria-label="Cancel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSolution} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Code Repository URL (GitHub, GitLab, Bitbucket) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/priyasharma/order-service-api"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="form-input"
                />
                <span className="form-helper">
                  Provide a public repository containing your code, README, and automated tests.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  Implementation & Architecture Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain your architectural design decisions, concurrency models, testing strategies, or how you met the evaluation rubric..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <div
                style={{
                  backgroundColor: 'var(--slate-50)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.8125rem',
                  color: 'var(--slate-700)',
                }}
              >
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--slate-900)' }}>
                  Evaluation Rubric Checklist:
                </strong>
                <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {activeSubmitProject.rubric.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  borderTop: '1px solid var(--slate-200)',
                  paddingTop: '1rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveSubmitProject(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? (
                    <>
                      <div className="loading-spinner-ring" style={{ width: '14px', height: '14px', borderWidth: '2px', marginRight: '0.5rem' }} />
                      Evaluating against rubric...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-1.5" />
                      Submit for Verification
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Projects Catalog Grid */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Production Engineering Tasks ({projects.length})</h3>
            <p className="card-desc">
              Company-authored tasks evaluated against standardized industrial rubrics.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center' }}>
            <div className="loading-spinner-ring" style={{ margin: '0 auto 1rem' }} />
            <p className="loading-text">Loading sandbox tasks...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="empty-state-card">
            <p className="empty-state-desc">No sandbox projects currently available.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {projects.map((proj) => {
              const app = proj.application;
              const isVerified = app?.status === 'Verified';
              const isInProgress = app?.status === 'In Progress';

              return (
                <div
                  key={proj.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Top Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="status-badge badge-slate badge-sm" style={{ fontWeight: 600 }}>
                      {proj.provider}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span className="status-badge badge-developing badge-sm">{proj.level}</span>
                      <span className="status-badge badge-slate badge-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock className="w-3 h-3" />
                        {proj.duration}
                      </span>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <div>
                    <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.4rem' }}>
                      {proj.title}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5, margin: 0 }}>
                      {proj.description}
                    </p>
                  </div>

                  {/* Required Skills */}
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.4rem' }}>
                      Validated Skills:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {proj.required_skills.map((skill) => (
                        <span key={skill} className="status-badge badge-slate badge-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Rubric Criteria */}
                  <div
                    style={{
                      backgroundColor: 'var(--slate-50)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.75rem 1rem',
                      fontSize: '0.8125rem',
                      border: '1px solid var(--slate-100)',
                    }}
                  >
                    <strong style={{ color: 'var(--slate-700)', display: 'block', marginBottom: '0.35rem' }}>
                      Evaluation Rubric:
                    </strong>
                    <ul style={{ paddingLeft: '1.15rem', margin: 0, color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {proj.rubric.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Evaluator Feedback Card if Verified */}
                  {isVerified && app && (
                    <div
                      style={{
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        marginTop: 'auto',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <StatusBadge status="Verified" size="sm" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#166534' }}>
                          Score: {app.evaluator_score}%
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#14532d', margin: '0 0 0.5rem', lineHeight: 1.45 }}>
                        "{app.evaluator_feedback}"
                      </p>
                      <div style={{ fontSize: '0.75rem', color: '#15803d', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Artifact: {app.supporting_artifact}</span>
                      </div>
                    </div>
                  )}

                  {/* Action Footer */}
                  <div
                    style={{
                      marginTop: isVerified ? '0.5rem' : 'auto',
                      paddingTop: '0.85rem',
                      borderTop: '1px solid var(--slate-100)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      {isVerified ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <CheckCircle className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : isInProgress ? (
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock className="w-3.5 h-3.5" /> Enrolled
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                          Ready to build
                        </span>
                      )}
                    </div>

                    <div>
                      {isVerified ? (
                        <button
                          type="button"
                          onClick={() => setActiveSubmitProject(proj)}
                          className="btn btn-outline btn-sm"
                        >
                          Resubmit Solution
                        </button>
                      ) : isInProgress ? (
                        <button
                          type="button"
                          onClick={() => setActiveSubmitProject(proj)}
                          className="btn btn-primary btn-sm"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" />
                          Submit Solution
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApply(proj.id)}
                          className="btn btn-primary btn-sm"
                        >
                          Start Project <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;
