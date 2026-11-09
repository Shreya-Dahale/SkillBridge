import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Assessment, AssessmentSubmission } from '../types/assessmentAndProject';
import {
  FileCheck,
  CheckCircle,
  Clock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  X,
} from '../components/Icons';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export const AssessmentsPage: React.FC = () => {
  const { token } = useAuth();

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

  const verifiedSubmissionsCount = submissions.filter((s) => s.status === 'Verified' || Number(s.score) >= 80).length;

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Proof of Work
            </span>
            <span className="status-badge badge-verified badge-sm">Deterministic Benchmarks</span>
          </div>
          <h1 className="page-title">Technical Benchmark Assessments</h1>
          <p className="page-subtitle">
            Validate skill freshness through objective technical diagnostics. Verified results automatically generate tamper-evident evidence records for your Skill Passport.
          </p>
        </div>

        <div className="page-header-actions">
          <Link to="/passport" className="btn btn-outline">
            <ShieldCheck className="w-4 h-4 mr-1" />
            View Passport
          </Link>
          <Link to="/projects" className="btn btn-outline">
            Sandbox Projects →
          </Link>
        </div>
      </div>

      {errorMsg && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Latest Submission Banner */}
      {latestResult && (
        <div className="card" style={{ marginBottom: '1.75rem', backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#065f46' }}>
                  Assessment Completed: {latestResult.score_raw}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#047857', marginTop: '0.15rem' }}>
                  {latestResult.feedback}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="status-badge badge-verified badge-md">
                Evidence Record Created
              </span>
              <Link to="/passport" className="btn btn-primary btn-sm">
                View in Passport →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Available Benchmarks"
          value={assessments.length}
          icon={<FileCheck className="w-4 h-4 text-indigo-600" />}
          hint="Standardized test library"
          variant="primary"
        />
        <StatCard
          label="Completed Attempts"
          value={submissions.length}
          icon={<CheckCircle className="w-4 h-4 text-blue-600" />}
          hint="Evaluations recorded"
          variant="default"
        />
        <StatCard
          label="Verified Submissions"
          value={verifiedSubmissionsCount}
          icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
          hint="Scored 80% or higher"
          variant="success"
        />
      </div>

      {/* Active Assessment Taking Modal */}
      {activeAssessment && (
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
            style={{ width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Active Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-200)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span className="status-badge badge-developing badge-sm">{activeAssessment.skill}</span>
                  <span className="status-badge badge-slate badge-sm">Difficulty: {activeAssessment.difficulty}</span>
                  <span className="status-badge badge-slate badge-sm">
                    <Clock className="w-3.5 h-3.5" />
                    {activeAssessment.duration_minutes} mins
                  </span>
                </div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {activeAssessment.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveAssessment(null)}
                className="btn btn-ghost btn-sm"
                aria-label="Cancel test"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--slate-700)' }}>
              <strong>Instructions:</strong> {activeAssessment.instructions}
            </div>

            {/* Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '1.75rem' }}>
              {activeAssessment.tasks.map((task, idx) => (
                <div
                  key={task.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Question {idx + 1} of {activeAssessment.tasks.length}
                    </span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', backgroundColor: 'var(--slate-100)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      {task.points} Points
                    </span>
                  </div>

                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--slate-900)', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {task.question}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {task.options.map((opt, optIdx) => {
                      const isSelected = answers[task.id] === optIdx;
                      return (
                        <label
                          key={optIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-md)',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--slate-200)',
                            backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            color: isSelected ? 'var(--primary)' : 'var(--slate-800)',
                            fontWeight: isSelected ? 600 : 400,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="radio"
                            name={`task-${task.id}`}
                            checked={isSelected}
                            onChange={() => handleSelectOption(task.id, optIdx)}
                            style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Bottom Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                Answered {Object.keys(answers).length} of {activeAssessment.tasks.length} questions
              </span>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveAssessment(null)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAttempt}
                  disabled={isSubmitting}
                  className="btn btn-primary"
                >
                  {isSubmitting ? 'Evaluating...' : 'Submit Assessment Attempt'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Assessments Catalog */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Benchmark Catalog</h3>
            <p className="card-desc">
              Standardized assessments designed to evaluate production readiness.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <div className="loading-spinner-ring" style={{ margin: '0 auto 1rem' }} />
            <p className="loading-text">Loading technical benchmarks...</p>
          </div>
        ) : assessments.length === 0 ? (
          <div className="empty-state-card">
            <p className="empty-state-desc">No assessments currently available.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {assessments.map((a) => (
              <div
                key={a.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="status-badge badge-developing badge-sm">{a.skill}</span>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <span className="status-badge badge-slate badge-sm">
                      <Clock className="w-3 h-3" />
                      {a.duration_minutes}m
                    </span>
                    <span className="status-badge badge-slate badge-sm">{a.difficulty}</span>
                  </div>
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {a.title}
                </h4>

                <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', lineHeight: 1.5, margin: 0, minHeight: '38px' }}>
                  {a.instructions}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                    {a.tasks.length} Questions · 100 Points
                  </span>
                  <button
                    type="button"
                    onClick={() => handleStartAssessment(a)}
                    className="btn btn-primary btn-sm"
                  >
                    Start Challenge <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assessment Submissions History Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Assessment History & Evidence Log ({submissions.length})</h3>
            <p className="card-desc">
              All historical attempts, scores, and evaluator rubrics stored in Supabase/PostgreSQL.
            </p>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="empty-state-card" style={{ padding: '2rem 1rem' }}>
            <p className="empty-state-desc">You haven't submitted any benchmark assessments yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Assessment Title</th>
                  <th>Skill</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Evaluator Feedback</th>
                  <th>Attempt Date</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <strong style={{ color: 'var(--slate-900)' }}>{sub.assessment_title}</strong>
                    </td>
                    <td>
                      <span className="status-badge badge-slate badge-sm">{sub.skill}</span>
                    </td>
                    <td>
                      <strong style={{ color: '#059669' }}>{sub.score_raw}</strong>
                    </td>
                    <td>
                      <StatusBadge status={sub.status} size="sm" />
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', maxWidth: '280px' }}>
                      {sub.feedback}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>
                      {new Date(sub.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentsPage;
