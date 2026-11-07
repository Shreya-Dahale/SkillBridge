import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Project } from '../types/assessmentAndProject';

export const ProjectsPage: React.FC = () => {
  const { token, logout } = useAuth();

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
      setErrorMsg('Failed to load projects');
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
      if (!res.ok) throw new Error(data.error || 'Failed to apply');

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

      setSuccessMsg(`Project evaluated successfully! Score: ${data.application.evaluator_score}%. Verified evidence generated for all required skills!`);
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
          <Link to="/skills" className="btn btn-outline btn-sm">Skills & Gap</Link>
          <Link to="/assessments" className="btn btn-outline btn-sm">Assessments</Link>
          <Link to="/projects" className="btn btn-primary btn-sm">Projects</Link>
          <Link to="/passport" className="btn btn-outline btn-sm">Passport</Link>
          <button onClick={() => logout()} className="btn btn-outline btn-sm">Logout</button>
        </nav>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-heading-section">
          <h1>Practical Company Sandbox Projects</h1>
          <p className="dashboard-subtitle">
            Demonstrate real-world production engineering through hands-on company sandbox tasks. Verified code submissions provide undeniable evidence for your Skill Passport.
          </p>
        </div>

        {errorMsg && <div className="alert-error">{errorMsg}</div>}
        {successMsg && <div className="alert-success">{successMsg}</div>}

        {/* Project Submission Modal */}
        {activeSubmitProject && (
          <section className="profile-details-card" style={{ border: '2px solid #6366f1' }}>
            <div className="card-header-flex">
              <div>
                <span className="badge-category">{activeSubmitProject.provider}</span>
                <h2>Submit Solution: {activeSubmitProject.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubmitProject(null)}
                className="btn btn-outline btn-sm"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitSolution} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Code Repository URL (GitHub / GitLab / Bitbucket)</label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/your-username/order-processing-api"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Implementation & Architecture Notes</label>
                <textarea
                  rows={3}
                  placeholder="Detail how you satisfied the rubric contracts, test suite coverage, and error contracts..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="form-input"
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-large"
                >
                  {isSubmitting ? 'Evaluating Code with Rubric...' : 'Submit Code for Evaluator Verification'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Projects Catalog Grid */}
        <section className="profile-details-card">
          <h2>Available Company Engineering Tasks</h2>
          <div className="projects-grid">
            {isLoading ? (
              <p>Loading projects...</p>
            ) : (
              projects.map((proj) => {
                const app = proj.application;
                const isVerified = app?.status === 'Verified';
                const isInProgress = app?.status === 'In Progress';

                return (
                  <div key={proj.id} className="project-card">
                    <div className="project-top-row">
                      <span className="provider-pill">{proj.provider}</span>
                      <span className="diff-pill">{proj.level}</span>
                    </div>

                    <h3>{proj.title}</h3>
                    <p className="project-desc">{proj.description}</p>

                    <div className="required-skills-row">
                      <span className="skills-label">Required Skills:</span>
                      <div className="tags-container">
                        {proj.required_skills.map((skill) => (
                          <span key={skill} className="skill-pill-sm">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="rubric-block">
                      <strong>Employer Evaluation Rubric:</strong>
                      <ul>
                        {proj.rubric.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Evaluator Feedback Section if Evaluated */}
                    {isVerified && app && (
                      <div className="evaluator-feedback-card">
                        <div className="eval-header">
                          <span className="status-badge badge-demonstrated">✓ Verified ({app.evaluator_score}%)</span>
                          <span className="eval-name">Evaluator: {app.evaluator_name}</span>
                        </div>
                        <p className="eval-feedback">{app.evaluator_feedback}</p>
                        <div className="eval-artifact">{app.supporting_artifact}</div>
                      </div>
                    )}

                    <div className="project-action-bar">
                      <span className="proj-duration">⏱ {proj.duration}</span>

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
                          Submit Solution
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleApply(proj.id)}
                          className="btn btn-secondary btn-sm"
                        >
                          Start Project
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProjectsPage;
