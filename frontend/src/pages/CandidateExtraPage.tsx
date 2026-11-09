import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { useRealtime } from '../hooks/useRealtime';
import type {
  MentorProfile,
  MentorBooking,
  Fellowship,
  FellowshipApplication,
  ProfessionalReference,
  GapNarrative,
  FeedbackItem,
} from '../types/employer';
import {
  GraduationCap,
  Compass,
  FileCheck,
  FileText,
  Briefcase,
  Award,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  X,
  ShieldCheck,
  Radio,
  FileSpreadsheet,
} from '../components/Icons';
import StatusBadge from '../components/StatusBadge';

type CandidateExtraView =
  | 'mentors'
  | 'fellowships'
  | 'references'
  | 'gap-narrative'
  | 'applications'
  | 'feedback'
  | 'reports';

export const CandidateExtraPage: React.FC = () => {
  const { user } = useAuth();
  const { authFetch } = useApi();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active view based on path
  const getViewFromPath = (): CandidateExtraView => {
    const path = location.pathname.replace('/', '');
    if (path === 'fellowships') return 'fellowships';
    if (path === 'references') return 'references';
    if (path === 'gap-narrative') return 'gap-narrative';
    if (path === 'applications') return 'applications';
    if (path === 'feedback') return 'feedback';
    if (path === 'reports') return 'reports';
    return 'mentors';
  };

  const [view, setView] = useState<CandidateExtraView>(getViewFromPath);

  // Sync view when URL changes
  useEffect(() => {
    setView(getViewFromPath());
  }, [location.pathname]);

  const handleTabChange = (newView: CandidateExtraView) => {
    setView(newView);
    if (newView === 'gap-narrative') {
      navigate('/candidate-extra');
    } else {
      navigate(`/${newView}`);
    }
  };

  // Mentor state
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [bookings, setBookings] = useState<(MentorBooking & { mentor_name: string })[]>([]);
  const [bookingForm, setBookingForm] = useState<{
    mentorId: string;
    mentorName: string;
    topic: string;
    scheduled_at: string;
    notes: string;
  } | null>(null);

  // Fellowship state
  const [fellowships, setFellowships] = useState<Fellowship[]>([]);
  const [fellowshipApps, setFellowshipApps] = useState<(FellowshipApplication & { fellowship_title: string })[]>([]);
  const [fellowshipModal, setFellowshipModal] = useState<{ fellowship: Fellowship; cover_note: string } | null>(null);

  // References state
  const [references, setReferences] = useState<ProfessionalReference[]>([]);
  const [refForm, setRefForm] = useState<Partial<ProfessionalReference> | null>(null);
  const [editingRefId, setEditingRefId] = useState<string | null>(null);

  // Gap Narrative state
  const [narrative, setNarrative] = useState<GapNarrative | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Applications state
  const [applications, setApplications] = useState<Record<string, unknown>[]>([]);
  const [openJobs, setOpenJobs] = useState<Record<string, unknown>[]>([]);

  // Feedback state
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [realtimeEvents, setRealtimeEvents] = useState<string[]>([]);

  // Realtime notifications
  useRealtime({
    employer_feedback: (data) => {
      setRealtimeEvents((prev) => [`New feedback received: ${JSON.stringify(data)}`, ...prev.slice(0, 9)]);
      if (view === 'feedback') loadFeedback();
    },
    job_updated: (data) => {
      setRealtimeEvents((prev) => [`Job updated: ${JSON.stringify(data)}`, ...prev.slice(0, 9)]);
      if (view === 'applications') loadOpenJobs();
    },
  });

  const loadMentors = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch('/api/candidate/mentors');
      if (r.ok) {
        const d = await r.json();
        setMentors(d.mentors || []);
      }
      const r2 = await authFetch('/api/candidate/mentor-bookings');
      if (r2.ok) {
        const d = await r2.json();
        setBookings(d.bookings || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const loadFellowships = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch('/api/candidate/fellowships');
      if (r.ok) {
        const d = await r.json();
        setFellowships(d.fellowships || []);
      }
      const r2 = await authFetch('/api/candidate/fellowship-applications');
      if (r2.ok) {
        const d = await r2.json();
        setFellowshipApps(d.applications || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const loadReferences = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch('/api/candidate/references');
      if (r.ok) {
        const d = await r.json();
        setReferences(d.references || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const loadNarrative = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch('/api/candidate/gap-narrative');
      if (r.ok) {
        const d = await r.json();
        setNarrative(d.narrative || { gap_pitch: '', resume_statement: '', cover_letter_note: '' });
      } else {
        setNarrative({
          id: '',
          candidate_id: '',
          gap_pitch: '',
          resume_statement: '',
          cover_letter_note: '',
          created_at: '',
          updated_at: '',
        });
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch('/api/candidate/my-applications');
      if (r.ok) {
        const d = await r.json();
        setApplications(d.applications || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const loadOpenJobs = useCallback(async () => {
    try {
      const r = await authFetch('/api/candidate/jobs/open');
      if (r.ok) {
        const d = await r.json();
        setOpenJobs(d.jobs || []);
      }
    } catch {
      /* ignore */
    }
  }, [authFetch]);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch('/api/candidate/feedback-history');
      if (r.ok) {
        const d = await r.json();
        setFeedbackHistory(d.feedback || []);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  useEffect(() => {
    if (view === 'mentors') loadMentors();
    else if (view === 'fellowships') loadFellowships();
    else if (view === 'references') loadReferences();
    else if (view === 'gap-narrative') loadNarrative();
    else if (view === 'applications') {
      loadApplications();
      loadOpenJobs();
    } else if (view === 'feedback') loadFeedback();
  }, [view]);

  const bookSession = async () => {
    if (!bookingForm) return;
    setError('');
    setSuccessMsg('');
    try {
      const r = await authFetch(`/api/candidate/mentors/${bookingForm.mentorId}/book`, {
        method: 'POST',
        body: JSON.stringify({
          topic: bookingForm.topic,
          scheduled_at: bookingForm.scheduled_at,
          notes: bookingForm.notes,
        }),
      });
      const d = await r.json();
      if (r.ok) {
        setSuccessMsg('Session booked successfully!');
        setBookingForm(null);
        await loadMentors();
      } else setError(d.error || 'Failed to book session');
    } catch {
      setError('Network error');
    }
  };

  const applyFellowship = async () => {
    if (!fellowshipModal) return;
    setError('');
    setSuccessMsg('');
    try {
      const r = await authFetch(`/api/candidate/fellowships/${fellowshipModal.fellowship.id}/apply`, {
        method: 'POST',
        body: JSON.stringify({ cover_note: fellowshipModal.cover_note }),
      });
      const d = await r.json();
      if (r.ok) {
        setSuccessMsg('Application submitted successfully!');
        setFellowshipModal(null);
        await loadFellowships();
      } else setError(d.error || 'Failed to apply');
    } catch {
      setError('Network error');
    }
  };

  const saveReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refForm) return;
    setError('');
    setSuccessMsg('');
    try {
      const isEdit = !!editingRefId;
      const url = isEdit ? `/api/candidate/references/${editingRefId}` : '/api/candidate/references';
      const method = isEdit ? 'PUT' : 'POST';
      const r = await authFetch(url, { method, body: JSON.stringify(refForm) });
      const d = await r.json();
      if (r.ok) {
        setSuccessMsg(isEdit ? 'Reference updated!' : 'Reference added successfully!');
        setRefForm(null);
        setEditingRefId(null);
        await loadReferences();
      } else setError(d.error || 'Failed to save reference');
    } catch {
      setError('Network error');
    }
  };

  const deleteRef = async (refId: string) => {
    if (!confirm('Are you sure you want to delete this reference?')) return;
    try {
      const r = await authFetch(`/api/candidate/references/${refId}`, { method: 'DELETE' });
      if (r.ok) {
        setSuccessMsg('Reference deleted');
        await loadReferences();
      }
    } catch {
      setError('Network error');
    }
  };

  const saveNarrative = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative) return;
    setError('');
    setSuccessMsg('');
    try {
      const r = await authFetch('/api/candidate/gap-narrative', {
        method: 'PUT',
        body: JSON.stringify(narrative),
      });
      const d = await r.json();
      if (r.ok) {
        setNarrative(d.narrative);
        setSuccessMsg('Career-break narratives saved successfully!');
      } else setError(d.error || 'Failed to save');
    } catch {
      setError('Network error');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const applyToJob = async (jobId: string) => {
    setError('');
    setSuccessMsg('');
    try {
      const r = await authFetch(`/api/candidate/apply-job/${jobId}`, { method: 'POST' });
      const d = await r.json();
      if (r.ok) {
        setSuccessMsg('Application submitted to employer!');
        await loadApplications();
      } else setError(d.error || 'Failed to apply');
    } catch {
      setError('Network error');
    }
  };

  const downloadReport = async (type: 'pdf' | 'csv' | 'xlsx') => {
    setError('');
    setSuccessMsg('');
    try {
      const r = await authFetch(`/api/candidate/report/${type}`);
      if (r.ok) {
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `skillbridge_report.${type}`;
        a.click();
        URL.revokeObjectURL(url);
        setSuccessMsg(`${type.toUpperCase()} report generated & downloaded!`);
      } else {
        const d = await r.json();
        setError(d.error || 'Failed to download report');
      }
    } catch {
      setError('Network error');
    }
  };

  if (!user) return null;

  const navItems: { key: CandidateExtraView; label: string; icon: React.ReactNode }[] = [
    { key: 'mentors', label: '1:1 Mentors', icon: <GraduationCap className="w-4 h-4" /> },
    { key: 'fellowships', label: 'Returnships & Fellowships', icon: <Compass className="w-4 h-4" /> },
    { key: 'references', label: 'References', icon: <FileCheck className="w-4 h-4" /> },
    { key: 'gap-narrative', label: 'Gap Narrative', icon: <FileText className="w-4 h-4" /> },
    { key: 'applications', label: 'Job Applications', icon: <Briefcase className="w-4 h-4" /> },
    { key: 'feedback', label: 'Feedback History', icon: <Award className="w-4 h-4" /> },
    { key: 'reports', label: 'Reports & Exports', icon: <Download className="w-4 h-4" /> },
  ];

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
              Career Acceleration
            </span>
            <span className="status-badge badge-slate badge-sm">Opportunities & Growth</span>
          </div>
          <h1 className="page-title">Career Re-Entry & Opportunities</h1>
          <p className="page-subtitle">
            Connect with seasoned engineering mentors, apply to returnships, track job applications, and document your
            career-break narrative.
          </p>
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
        {navItems.map(({ key, label, icon }) => {
          const isActive = view === key;
          return (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
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

      {/* Notifications */}
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
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065f46' }}>Live Realtime Stream</span>
          </div>
          {realtimeEvents.map((evt, i) => (
            <div key={i} style={{ fontSize: '0.8125rem', color: '#166534', padding: '0.15rem 0' }}>
              • {evt}
            </div>
          ))}
        </div>
      )}

      {/* 1. MENTORS VIEW */}
      {view === 'mentors' && (
        <div>
          {/* Booking Modal */}
          {bookingForm && (
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
              <div className="card" style={{ width: '100%', maxWidth: '520px' }}>
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
                    <span className="status-badge badge-primary badge-sm">1:1 Mentorship</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                      Book Session with {bookingForm.mentorName}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBookingForm(null)}
                    className="btn btn-ghost btn-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Discussion Topic *</label>
                    <input
                      className="form-input"
                      required
                      value={bookingForm.topic}
                      onChange={(e) => setBookingForm({ ...bookingForm, topic: e.target.value })}
                      placeholder="e.g. System design interview prep, career-gap strategy..."
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Preferred Date & Time</label>
                    <input
                      className="form-input"
                      type="datetime-local"
                      value={bookingForm.scheduled_at}
                      onChange={(e) => setBookingForm({ ...bookingForm, scheduled_at: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Notes & Context</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      placeholder="Provide background context or specific questions..."
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button className="btn btn-outline" onClick={() => setBookingForm(null)}>
                      Cancel
                    </button>
                    <button className="btn btn-primary" onClick={bookSession}>
                      Confirm Booking
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Booked Sessions */}
          {bookings.length > 0 && (
            <div className="card" style={{ marginBottom: '1.75rem', backgroundColor: '#f8fafc' }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">My Booked Mentorship Sessions ({bookings.length})</h3>
                  <p className="card-desc">Scheduled 1:1 sessions with industry leaders</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {bookings.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.85rem 1rem',
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--slate-200)',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--slate-900)' }}>{b.mentor_name}</strong>
                      <span style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                        ({b.mentor_title}, {b.mentor_company})
                      </span>
                      <div style={{ fontSize: '0.85rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                        Topic: {b.topic}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {b.scheduled_at && (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(b.scheduled_at).toLocaleString()}
                        </span>
                      )}
                      <StatusBadge status={b.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Mentors */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Available Mentors</h3>
                <p className="card-desc">Book 1:1 sessions for career strategy, mock interviews, and code reviews.</p>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div className="loading-spinner-ring" style={{ margin: '0 auto 1rem' }} />
                <p className="loading-text">Loading mentors...</p>
              </div>
            ) : mentors.length === 0 ? (
              <div className="empty-state-card">
                <p className="empty-state-desc">No mentors currently available.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
                {mentors.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      border: '1px solid var(--slate-200)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
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
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                          {m.name}
                        </h4>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                          {m.title} at <strong>{m.company}</strong>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.45, margin: 0 }}>
                      {m.bio}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {m.expertise.map((e) => (
                        <span key={e} className="status-badge badge-slate badge-sm">
                          {e}
                        </span>
                      ))}
                    </div>

                    <div
                      style={{
                        marginTop: 'auto',
                        paddingTop: '0.85rem',
                        borderTop: '1px solid var(--slate-100)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock className="w-3.5 h-3.5" />
                        {m.session_duration_min}m session · {m.availability}
                      </span>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                          setBookingForm({
                            mentorId: m.id,
                            mentorName: m.name,
                            topic: '',
                            scheduled_at: '',
                            notes: '',
                          })
                        }
                      >
                        Book Session
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. FELLOWSHIPS VIEW */}
      {view === 'fellowships' && (
        <div>
          {/* Apply Modal */}
          {fellowshipModal && (
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
              <div className="card" style={{ width: '100%', maxWidth: '540px' }}>
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
                    <span className="status-badge badge-primary badge-sm">Returnship Application</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.25rem' }}>
                      Apply: {fellowshipModal.fellowship.title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFellowshipModal(null)}
                    className="btn btn-ghost btn-sm"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">Cover Note / Candidate Statement</label>
                  <textarea
                    className="form-input"
                    rows={4}
                    value={fellowshipModal.cover_note}
                    onChange={(e) => setFellowshipModal({ ...fellowshipModal, cover_note: e.target.value })}
                    placeholder="Highlight your relevant engineering background, what you learned during your career break, and why this fellowship aligns with your goals..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button className="btn btn-outline" onClick={() => setFellowshipModal(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={applyFellowship}>
                    Submit Application
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* My Applications */}
          {fellowshipApps.length > 0 && (
            <div className="card" style={{ marginBottom: '1.75rem', backgroundColor: '#f0f9ff', borderColor: '#bae6fd' }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title" style={{ color: '#0369a1' }}>
                    My Returnship Applications ({fellowshipApps.length})
                  </h3>
                  <p className="card-desc">Track status of your fellowship submissions</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {fellowshipApps.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid #e0f2fe',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--slate-900)' }}>{a.fellowship_title}</strong>
                      <span style={{ color: 'var(--slate-500)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                        ({a.fellowship_provider})
                      </span>
                    </div>
                    <StatusBadge status={a.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fellowships List */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Fellowship & Returnship Programs</h3>
                <p className="card-desc">
                  Curated return-to-work fellowships designed specifically for experienced professionals re-entering tech.
                </p>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div className="loading-spinner-ring" style={{ margin: '0 auto 1rem' }} />
                <p className="loading-text">Loading returnship opportunities...</p>
              </div>
            ) : fellowships.length === 0 ? (
              <div className="empty-state-card">
                <p className="empty-state-desc">No fellowships currently listed.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {fellowships.map((f) => {
                  const applied = fellowshipApps.some((a) => a.fellowship_id === f.id);
                  return (
                    <div
                      key={f.id}
                      style={{
                        border: '1px solid var(--slate-200)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.85rem',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span className="status-badge badge-slate badge-sm" style={{ fontWeight: 600 }}>
                          {f.provider}
                        </span>
                        <span className="status-badge badge-verified badge-sm">
                          {f.stipend}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                        {f.title}
                      </h4>

                      <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.45, margin: 0 }}>
                        {f.description}
                      </p>

                      <div
                        style={{
                          backgroundColor: 'var(--slate-50)',
                          borderRadius: 'var(--radius-md)',
                          padding: '0.65rem 0.85rem',
                          fontSize: '0.8125rem',
                          color: 'var(--slate-700)',
                        }}
                      >
                        <strong>Eligibility:</strong> {f.eligibility}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {f.skills_required.map((s) => (
                          <span key={s} className="status-badge badge-slate badge-sm">
                            {s}
                          </span>
                        ))}
                      </div>

                      <div
                        style={{
                          marginTop: 'auto',
                          paddingTop: '0.85rem',
                          borderTop: '1px solid var(--slate-100)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                          Duration: {f.duration} · Deadline: {f.application_deadline}
                        </span>
                        {applied ? (
                          <span className="status-badge badge-verified badge-sm">
                            Applied ✓
                          </span>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setFellowshipModal({ fellowship: f, cover_note: '' })}
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. REFERENCES VIEW */}
      {view === 'references' && (
        <div>
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <div className="card-header" style={{ marginBottom: refForm ? '1.5rem' : 0 }}>
              <div>
                <h3 className="card-title">Professional References ({references.length})</h3>
                <p className="card-desc">
                  Former managers, tech leads, or colleagues who can validate your technical ability and work ethic.
                </p>
              </div>
              {!refForm && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setRefForm({ name: '', relationship: '', company: '', email: '', phone: '' });
                    setEditingRefId(null);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Reference
                </button>
              )}
            </div>

            {/* Reference Form */}
            {refForm && (
              <form onSubmit={saveReference} style={{ backgroundColor: 'var(--slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', marginBottom: '1.5rem' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '1rem' }}>
                  {editingRefId ? 'Edit Reference Details' : 'Add New Reference'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      className="form-input"
                      required
                      value={refForm.name || ''}
                      onChange={(e) => setRefForm({ ...refForm, name: e.target.value })}
                      placeholder="e.g. Anand Kumar"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Professional Relationship</label>
                    <input
                      className="form-input"
                      value={refForm.relationship || ''}
                      onChange={(e) => setRefForm({ ...refForm, relationship: e.target.value })}
                      placeholder="e.g. Former Engineering Manager"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company / Organization</label>
                    <input
                      className="form-input"
                      value={refForm.company || ''}
                      onChange={(e) => setRefForm({ ...refForm, company: e.target.value })}
                      placeholder="e.g. TechCorp India"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-input"
                      value={refForm.email || ''}
                      onChange={(e) => setRefForm({ ...refForm, email: e.target.value })}
                      placeholder="anand@example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={refForm.phone || ''}
                      onChange={(e) => setRefForm({ ...refForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => {
                      setRefForm(null);
                      setEditingRefId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingRefId ? 'Update Reference' : 'Save Reference'}
                  </button>
                </div>
              </form>
            )}

            {loading ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div className="loading-spinner-ring" style={{ margin: '0 auto 1rem' }} />
                <p className="loading-text">Loading references...</p>
              </div>
            ) : references.length === 0 && !refForm ? (
              <div className="empty-state-card">
                <p className="empty-state-desc">
                  No professional references added yet. Add references to vouch for your past work.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {references.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      border: '1px solid var(--slate-200)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.65rem',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                          {r.name}
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                          {r.relationship} at <strong>{r.company}</strong>
                        </div>
                      </div>
                      {r.verified && (
                        <span className="status-badge badge-verified badge-sm">
                          Verified ✓
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      {r.email && <div>✉ {r.email}</div>}
                      {r.phone && <div>☎ {r.phone}</div>}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          setRefForm({ ...r });
                          setEditingRefId(r.id);
                        }}
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        style={{ color: '#ef4444', borderColor: '#fca5a5' }}
                        onClick={() => deleteRef(r.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. GAP NARRATIVE VIEW */}
      {view === 'gap-narrative' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Career-Break Documentation Assistant</h3>
              <p className="card-desc">
                Craft compelling, honest explanations of your career gap for resumes, interviews, and cover letters.
              </p>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <div className="loading-spinner-ring" style={{ margin: '0 auto 1rem' }} />
              <p className="loading-text">Loading narrative...</p>
            </div>
          ) : narrative !== null ? (
            <form onSubmit={saveNarrative} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Section 1: Gap Pitch */}
              <div style={{ backgroundColor: 'var(--slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                    1. Gap Pitch (Interview Elevator Speech)
                  </label>
                  {narrative.gap_pitch && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => copyToClipboard(narrative.gap_pitch, 'pitch')}
                    >
                      {copiedKey === 'pitch' ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copiedKey === 'pitch' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <span className="form-helper" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  2–3 concise sentences when asked "Tell me about this career gap" during interviews.
                </span>
                <textarea
                  className="form-input"
                  rows={3}
                  value={narrative.gap_pitch || ''}
                  onChange={(e) => setNarrative({ ...narrative, gap_pitch: e.target.value })}
                  placeholder="e.g. Between 2023 and 2025, I took a deliberate career break for family responsibilities. During this period, I kept my technical foundation razor-sharp by building full-stack cloud projects and earning verified skill certifications on SkillBridge."
                />
              </div>

              {/* Section 2: Resume Statement */}
              <div style={{ backgroundColor: 'var(--slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                    2. Resume Statement
                  </label>
                  {narrative.resume_statement && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => copyToClipboard(narrative.resume_statement, 'resume')}
                    >
                      {copiedKey === 'resume' ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copiedKey === 'resume' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <span className="form-helper" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  1–2 sentences positioned in your resume work history timeline to address gaps transparently.
                </span>
                <textarea
                  className="form-input"
                  rows={2}
                  value={narrative.resume_statement || ''}
                  onChange={(e) => setNarrative({ ...narrative, resume_statement: e.target.value })}
                  placeholder="Career Transition & Upskilling (2023–2025): Dedicated period focused on cloud-native software engineering, microservices architecture, and technical upskilling with verified project portfolio."
                />
              </div>

              {/* Section 3: Cover Letter Note */}
              <div style={{ backgroundColor: 'var(--slate-50)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontWeight: 700, margin: 0 }}>
                    3. Cover Letter Note
                  </label>
                  {narrative.cover_letter_note && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => copyToClipboard(narrative.cover_letter_note, 'cover')}
                    >
                      {copiedKey === 'cover' ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                      {copiedKey === 'cover' ? 'Copied' : 'Copy'}
                    </button>
                  )}
                </div>
                <span className="form-helper" style={{ display: 'block', marginBottom: '0.5rem' }}>
                  A polished paragraph explaining your return with renewed energy and verified modern skills.
                </span>
                <textarea
                  className="form-input"
                  rows={4}
                  value={narrative.cover_letter_note || ''}
                  onChange={(e) => setNarrative({ ...narrative, cover_letter_note: e.target.value })}
                  placeholder="You will notice a career break in my resume. Rather than treating this as lost time, I used it to deepen my technical domain expertise in React, TypeScript, and distributed systems. My attached SkillBridge Evidence Passport demonstrates verified proof of my production readiness."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">
                  Save All Narratives
                </button>
              </div>
            </form>
          ) : null}
        </div>
      )}

      {/* 5. APPLICATIONS VIEW */}
      {view === 'applications' && (
        <div>
          {/* Open Jobs to apply */}
          {openJobs.length > 0 && (
            <div className="card" style={{ marginBottom: '1.75rem' }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">Available Employer Jobs ({openJobs.length})</h3>
                  <p className="card-desc">Partner employers looking for verified talent</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
                {openJobs.map((job) => {
                  const j = job as Record<string, unknown>;
                  const alreadyApplied = applications.some((a) => (a as Record<string, unknown>).job_id === j.id);
                  return (
                    <div
                      key={j.id as string}
                      style={{
                        border: '1px solid var(--slate-200)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                            {String(j.title || '')}
                          </h4>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)' }}>
                            {String(j.location || '')} · {String(j.type || '')}
                          </div>
                        </div>
                        {alreadyApplied ? (
                          <span className="status-badge badge-verified badge-sm">Applied ✓</span>
                        ) : (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => applyToJob(j.id as string)}
                          >
                            Apply Now
                          </button>
                        )}
                      </div>

                      {Array.isArray(j.required_skills) && j.required_skills.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                          {(j.required_skills as string[]).slice(0, 5).map((s) => (
                            <span key={s} className="status-badge badge-slate badge-sm">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* My Submitted Applications */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">My Applications ({applications.length})</h3>
                <p className="card-desc">Track status and review direct employer feedback</p>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
                <div className="loading-spinner-ring" style={{ margin: '0 auto 1rem' }} />
                <p className="loading-text">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="empty-state-card">
                <p className="empty-state-desc">You haven't submitted any job applications yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applications.map((app) => {
                  const a = app as Record<string, string>;
                  return (
                    <div
                      key={a.id}
                      style={{
                        border: '1px solid var(--slate-200)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1.25rem',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                            {a.job_title}
                          </h4>
                          <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '0.15rem' }}>
                            {a.company_name} · Applied: {a.created_at ? new Date(a.created_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                        <StatusBadge status={a.status} size="md" />
                      </div>

                      {a.employer_feedback && (
                        <div
                          style={{
                            marginTop: '0.85rem',
                            backgroundColor: '#f8fafc',
                            border: '1px solid var(--slate-200)',
                            borderRadius: 'var(--radius-md)',
                            padding: '0.85rem 1rem',
                            fontSize: '0.85rem',
                            color: 'var(--slate-800)',
                          }}
                        >
                          <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--primary)' }}>
                            Employer Feedback:
                          </strong>
                          "{a.employer_feedback}"
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

      {/* 6. FEEDBACK VIEW */}
      {view === 'feedback' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Comprehensive Feedback Ledger ({feedbackHistory.length})</h3>
              <p className="card-desc">Evaluations from technical benchmarks, sandbox projects, and hiring managers.</p>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
              <div className="loading-spinner-ring" style={{ margin: '0 auto 1rem' }} />
              <p className="loading-text">Loading feedback ledger...</p>
            </div>
          ) : feedbackHistory.length === 0 ? (
            <div className="empty-state-card">
              <p className="empty-state-desc">
                No feedback received yet. Complete assessments or sandbox tasks to accumulate evaluation notes.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {feedbackHistory.map((item, i) => (
                <div
                  key={i}
                  style={{
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--slate-900)', margin: 0 }}>
                        {item.source}
                      </h4>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                        {item.type.replace('_', ' ').toUpperCase()} · {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {item.score && (
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#059669' }}>
                          Score: {item.score}
                        </span>
                      )}
                      <StatusBadge status={item.status} size="sm" />
                    </div>
                  </div>

                  {item.feedback && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        backgroundColor: 'var(--slate-50)',
                        border: '1px solid var(--slate-100)',
                        borderRadius: 'var(--radius-md)',
                        padding: '0.75rem 1rem',
                        fontSize: '0.85rem',
                        color: 'var(--slate-700)',
                        lineHeight: 1.5,
                      }}
                    >
                      "{item.feedback}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 7. REPORTS VIEW */}
      {view === 'reports' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">Authorized Reports & Data Exports</h3>
                <p className="card-desc">
                  Generate signed reports containing your confirmed skills, skill gap diagnostics, and tamper-evident
                  evidence records directly from PostgreSQL.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* PDF Card */}
              <div
                style={{
                  border: '1px solid #c7d2fe',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#ffffff',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#e0e7ff',
                    color: '#4338ca',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <FileText className="w-6 h-6" />
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', margin: '0 0 0.4rem' }}>
                  PDF Evidence Dossier
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                  Comprehensive audit-ready dossier: candidate profile, career gap narrative, confirmed skills, skill
                  gap diagnostics, benchmark assessments, and verified sandbox evidence.
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => downloadReport('pdf')}
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Download PDF Dossier
                  </button>
                </div>
              </div>

              {/* CSV Card */}
              <div
                style={{
                  border: '1px solid #a7f3d0',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#ffffff',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#d1fae5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', margin: '0 0 0.4rem' }}>
                  CSV Data Export
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                  Flat structured comma-separated records of your skills, assessments, verified evidence, and
                  applications for analysis in spreadsheets.
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <button
                    className="btn btn-outline"
                    style={{ width: '100%', borderColor: '#10b981', color: '#059669' }}
                    onClick={() => downloadReport('csv')}
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Download Flat CSV
                  </button>
                </div>
              </div>

              {/* XLSX Card */}
              <div
                style={{
                  border: '1px solid #fde68a',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#ffffff',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: '#fef3c7',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                  }}
                >
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h4 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', margin: '0 0 0.4rem' }}>
                  Excel Multi-Sheet Workbook
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
                  Multi-sheet workbook containing discrete sheets for Profile, Skill Gap, Benchmark Attempts, Sandbox
                  Projects, and Evidence Passport ledger.
                </p>
                <div style={{ marginTop: 'auto' }}>
                  <button
                    className="btn btn-outline"
                    style={{ width: '100%', borderColor: '#f59e0b', color: '#d97706' }}
                    onClick={() => downloadReport('xlsx')}
                  >
                    <Download className="w-4 h-4 mr-1.5" />
                    Download Excel Workbook
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div
            className="card"
            style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe', padding: '1rem 1.25rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <strong style={{ fontSize: '0.875rem', color: '#1e40af' }}>Database-Backed Authenticity</strong>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#1e40af', margin: 0 }}>
              All reports and exports are generated synchronously from your current PostgreSQL records. There are no
              hardcoded placeholders.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateExtraPage;
