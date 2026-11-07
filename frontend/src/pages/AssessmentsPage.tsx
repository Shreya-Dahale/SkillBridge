import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Assessment, AssessmentSubmission } from '../types/assessmentAndProject';

export const AssessmentsPage: React.FC = () => {
  const { token, logout } = useAuth();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<AssessmentSubmission[]>([]);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestResult, setLatestResult] = useState<AssessmentSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [assRes, subRes] = await Promise.all([
        fetch('/api/candidate/assessments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/candidate/assessments/submissions', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const assData = await assRes.json();
      const subData = await subRes.json();

      if (assRes.ok) setAssessments(assData.assessments || []);
      if (subRes.ok) setSubmissions(subData.submissions || []);
    } catch {
      setErrorMsg('Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAssessment = (assessment: Assessment) => {
    setActiveAssessment(assessment);
    setAnswers({});
    setLatestResult(null);
    setErrorMsg(null);
  };

  const handleSelectOption = (taskId: string, optionIdx: number) => {
    setAnswers({ ...answers, [taskId]: optionIdx });
  };

  const handleSubmitAttempt = async () => {
    if (!activeAssessment) return;

    // Check all questions answered
    const unanswered = activeAssessment.tasks.some((t) => answers[t.id] === undefined);
    if (unanswered) {
      setErrorMsg('Please answer all assessment questions before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/candidate/assessments/${activeAssessment.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setLatestResult(data.submission);
      setSubmissions([data.submission, ...submissions]);
      setActiveAssessment(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error submitting attempt');
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
          <Link to="/assessments" className="btn btn-primary btn-sm">Assessments</Link>
          <Link to="/projects" className="btn btn-outline btn-sm">Projects</Link>
          <Link to="/passport" className="btn btn-outline btn-sm">Passport</Link>
          <button onClick={() => logout()} className="btn btn-outline btn-sm">Logout</button>
        </nav>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-heading-section">
          <h1>Technical Assessments & Benchmark Evaluations</h1>
          <p className="dashboard-subtitle">
            Validate skill freshness through deterministic technical diagnostics. Verified results automatically generate cryptographic evidence records for your Skill Passport.
          </p>
        </div>

        {errorMsg && <div className="alert-error">{errorMsg}</div>}

        {/* Latest Submission Success Banner */}
        {latestResult && (
          <div className="alert-success" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, marginBottom: '0.25rem', color: '#14532d' }}>
              ✓ Assessment Completed: {latestResult.score_raw}
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>{latestResult.feedback}</p>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
              Evidence Record Created: {latestResult.skill} benchmark automatically added to your Skill Freshness Passport!
            </div>
          </div>
        )}

        {/* Active Assessment Modal / Taking Interface */}
        {activeAssessment && (
          <section className="profile-details-card assessment-taking-card">
            <div className="assessment-active-header">
              <div>
                <span className="badge-category">{activeAssessment.skill}</span>
                <h2>{activeAssessment.title}</h2>
                <p className="assessment-meta">
                  Difficulty: <strong>{activeAssessment.difficulty}</strong> • Duration: <strong>{activeAssessment.duration_minutes} mins</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveAssessment(null)}
                className="btn btn-outline btn-sm"
              >
                Cancel / Exit
              </button>
            </div>

            <div className="assessment-instructions">
              <strong>Instructions:</strong> {activeAssessment.instructions}
            </div>

            <div className="tasks-container">
              {activeAssessment.tasks.map((task, idx) => (
                <div key={task.id} className="task-card">
                  <div className="task-title-row">
                    <span className="task-idx">Question {idx + 1} of {activeAssessment.tasks.length}</span>
                    <span className="task-points">{task.points} Points</span>
                  </div>

                  <p className="task-question">{task.question}</p>

                  <div className="options-list">
                    {task.options.map((opt, optIdx) => (
                      <label
                        key={optIdx}
                        className={`option-label ${answers[task.id] === optIdx ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name={`task-${task.id}`}
                          checked={answers[task.id] === optIdx}
                          onChange={() => handleSelectOption(task.id, optIdx)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleSubmitAttempt}
                disabled={isSubmitting}
                className="btn btn-primary btn-large"
              >
                {isSubmitting ? 'Evaluating Submission...' : 'Submit Assessment for Evidence Verification'}
              </button>
            </div>
          </section>
        )}

        {/* Assessment Catalog List */}
        {!activeAssessment && (
          <>
            <section className="profile-details-card">
              <h2>Available Benchmarks</h2>
              <div className="assessments-grid">
                {isLoading ? (
                  <p>Loading assessment catalog...</p>
                ) : (
                  assessments.map((ass) => {
                    const pastSubmission = submissions.find((s) => s.assessment_id === ass.id);
                    return (
                      <div key={ass.id} className="assessment-card">
                        <div className="card-top">
                          <span className="skill-pill">{ass.skill}</span>
                          <span className="diff-pill">{ass.difficulty}</span>
                        </div>

                        <h3>{ass.title}</h3>
                        <p className="ass-instructions-preview">{ass.instructions}</p>

                        <div className="ass-footer">
                          <span className="ass-duration">⏱ {ass.duration_minutes} Minutes</span>
                          {pastSubmission ? (
                            <div className="passed-badge">
                              ✓ Scored {pastSubmission.score}%
                            </div>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => handleStartAssessment(ass)}
                            className="btn btn-primary btn-sm"
                          >
                            {pastSubmission ? 'Retake Benchmark' : 'Take Benchmark'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Attempt & Result History */}
            <section className="profile-details-card">
              <h2>Assessment Attempt History</h2>
              {submissions.length === 0 ? (
                <p className="empty-hint">No assessment attempts recorded yet.</p>
              ) : (
                <div className="diagnostic-table-wrapper">
                  <table className="diagnostic-table">
                    <thead>
                      <tr>
                        <th>Assessment</th>
                        <th>Target Skill</th>
                        <th>Score</th>
                        <th>Evaluator Status</th>
                        <th>Feedback</th>
                        <th>Attempt Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub) => (
                        <tr key={sub.id}>
                          <td><strong>{sub.assessment_title}</strong></td>
                          <td><span className="skill-pill">{sub.skill}</span></td>
                          <td><strong style={{ color: sub.score >= 80 ? '#15803d' : '#b45309' }}>{sub.score_raw}</strong></td>
                          <td><span className="status-badge badge-demonstrated">{sub.status}</span></td>
                          <td style={{ fontSize: '0.825rem', color: '#475569' }}>{sub.feedback}</td>
                          <td>{new Date(sub.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AssessmentsPage;
