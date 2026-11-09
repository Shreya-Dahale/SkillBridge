import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  SkillPassportItem,
  SkillPassportSummary,
  EvidenceRecord,
} from '../types/assessmentAndProject';
import {
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Download,
  Filter,
  X,
  Award,
} from '../components/Icons';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

export const PassportPage: React.FC = () => {
  const { token } = useAuth();

  const [passportItems, setPassportItems] = useState<SkillPassportItem[]>([]);
  const [summary, setSummary] = useState<SkillPassportSummary | null>(null);
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>([]);
  const [selectedHistorySkill, setSelectedHistorySkill] = useState<SkillPassportItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchPassportData();
  }, []);

  const fetchPassportData = async () => {
    setIsLoading(true);
    try {
      const [passRes, evRes] = await Promise.all([
        fetch('/api/candidate/passport', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/candidate/evidence', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const passData = await passRes.json();
      const evData = await evRes.json();

      if (passRes.ok) {
        setPassportItems(passData.passportItems || []);
        setSummary(passData.summary || null);
      }
      if (evRes.ok) {
        setEvidenceList(evData.evidence || []);
      }
    } catch {
      setErrorMsg('Failed to load Skill Freshness Passport');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = passportItems.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.current_status.toLowerCase().replace(/\s+/g, '_') === filterStatus;
  });

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Flagship Evidence Record
            </span>
            <span className="status-badge badge-verified badge-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Platform Verified
            </span>
          </div>
          <h1 className="page-title">Skill Freshness Passport</h1>
          <p className="page-subtitle">
            Verifiable, evidence-backed proof of technical capability. Replaces historical resume uncertainty with concrete benchmark assessments and company sandbox tasks.
          </p>
        </div>

        <div className="page-header-actions">
          <Link to="/reports" className="btn btn-primary">
            <Download className="w-4 h-4 mr-1" />
            Download PDF Report
          </Link>
          <Link to="/assessments" className="btn btn-outline">
            Take Assessment
          </Link>
          <Link to="/projects" className="btn btn-outline">
            Build Project
          </Link>
        </div>
      </div>

      {errorMsg && <div className="alert-error">{errorMsg}</div>}

      {/* 4-Tier Passport KPI Counters */}
      {summary && (
        <div className="stats-grid">
          <StatCard
            label="Verified Skills"
            value={summary.verified_count}
            icon={<ShieldCheck className="w-4 h-4 text-emerald-600" />}
            hint="Passed with 80%+ evaluation score"
            variant="success"
            onClick={() => setFilterStatus('verified')}
          />
          <StatCard
            label="Demonstrated Work"
            value={summary.demonstrated_count}
            icon={<CheckCircle className="w-4 h-4 text-blue-600" />}
            hint="Demonstrated in sandbox or assessment"
            variant="default"
            onClick={() => setFilterStatus('demonstrated')}
          />
          <StatCard
            label="Needs Refresh"
            value={summary.needs_refresh_count}
            icon={<Clock className="w-4 h-4 text-amber-600" />}
            hint="Historical proficiency needing currency test"
            variant="warning"
            onClick={() => setFilterStatus('needs_refresh')}
          />
          <StatCard
            label="Developing"
            value={summary.developing_count}
            icon={<Sparkles className="w-4 h-4 text-violet-600" />}
            hint="Active upskilling in progress"
            variant="violet"
            onClick={() => setFilterStatus('developing')}
          />
        </div>
      )}

      {/* Verification Ledger Banner */}
      <div
        className="card"
        style={{
          marginBottom: '1.75rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <Award className="w-5 h-5 text-indigo-400" />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#a5b4fc', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Cryptographic Platform Audit
              </span>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              SkillBridge Verification Protocol 2.0
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.2rem', maxWidth: '640px' }}>
              Each passport record is cryptographically linked to the evaluator rubric, submitted repository artifact, and dynamic evaluation score stored in Supabase/PostgreSQL.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>AUDIT IDENTIFIER</span>
            <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: '#818cf8', fontWeight: 600 }}>
              #SB-PASSPORT-2026-ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="tabs-nav" style={{ marginBottom: 0, borderBottom: 'none' }}>
          {[
            { id: 'all', label: 'All Tracked Skills', count: passportItems.length },
            { id: 'verified', label: 'Verified', count: summary?.verified_count || 0 },
            { id: 'demonstrated', label: 'Demonstrated', count: summary?.demonstrated_count || 0 },
            { id: 'needs_refresh', label: 'Needs Refresh', count: summary?.needs_refresh_count || 0 },
            { id: 'developing', label: 'Developing', count: summary?.developing_count || 0 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`tab-btn ${filterStatus === tab.id ? 'tab-btn-active' : ''}`}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  padding: '0.1rem 0.45rem',
                  borderRadius: '9999px',
                  backgroundColor: filterStatus === tab.id ? 'var(--primary-light)' : 'var(--slate-100)',
                  color: filterStatus === tab.id ? 'var(--primary)' : 'var(--slate-600)',
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 500 }}>
          Showing {filteredItems.length} of {passportItems.length} skills
        </div>
      </div>

      {/* Passport Skills Cards Grid */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Skills Ledger
          </h3>
        </div>

        {isLoading ? (
          <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
            <div className="loading-spinner-ring" style={{ margin: '0 auto 1rem' }} />
            <p className="loading-text">Loading Skill Freshness Passport...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon-box">
              <Filter className="w-6 h-6" />
            </div>
            <h4 className="empty-state-title">No Skills Found</h4>
            <p className="empty-state-desc">
              No skills match the selected filter. Switch to "All Tracked Skills" or complete an assessment to verify skills.
            </p>
            <button onClick={() => setFilterStatus('all')} className="btn btn-outline btn-sm">
              Show All Skills
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredItems.map((item) => (
              <div
                key={item.skill}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {item.skill}
                    </h4>
                    {item.verified_hash && (
                      <span style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: 'var(--slate-400)' }}>
                        {item.verified_hash}
                      </span>
                    )}
                  </div>
                  <StatusBadge status={item.current_status} size="sm" />
                </div>

                <div style={{ backgroundColor: 'var(--slate-50)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--slate-500)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>Score / Benchmark</span>
                    <strong style={{ color: 'var(--slate-900)' }}>{item.score || 'In Progress'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--slate-500)', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 600 }}>Evidence Currency</span>
                    <span style={{ color: 'var(--slate-700)' }}>{item.evidence_date || 'Recent'}</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', lineHeight: 1.45, margin: 0, minHeight: '38px' }}>
                  {item.feedback}
                </p>

                <div style={{ marginTop: 'auto', paddingTop: '0.65rem', borderTop: '1px solid var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    {item.evidence_history.length} Record{item.evidence_history.length === 1 ? '' : 's'}
                  </span>
                  {item.evidence_history.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedHistorySkill(item)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--primary)', padding: '0.2rem 0.5rem', fontWeight: 600 }}
                    >
                      Audit Trail <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete Evidence Ledger Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">All Dynamic Evidence Records ({evidenceList.length})</h3>
            <p className="card-desc">
              Immutable ledger of all benchmark tests, sandbox tasks, and rubric evaluations stored in Supabase/PostgreSQL.
            </p>
          </div>
        </div>

        {evidenceList.length === 0 ? (
          <div className="empty-state-card">
            <p className="empty-state-desc">
              No evidence records submitted yet. Complete an assessment or company project to populate the ledger.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Source Task</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Evaluator</th>
                  <th>Supporting Artifact</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {evidenceList.map((ev) => (
                  <tr key={ev.id}>
                    <td>
                      <strong style={{ color: 'var(--slate-900)' }}>{ev.skill}</strong>
                    </td>
                    <td>
                      <span style={{ color: 'var(--slate-800)' }}>{ev.source_title}</span>{' '}
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'capitalize' }}>
                        ({ev.source_type})
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#059669' }}>{ev.score}</strong>
                    </td>
                    <td>
                      <StatusBadge status={ev.status} size="sm" />
                    </td>
                    <td style={{ fontSize: '0.8125rem' }}>{ev.evaluator}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--primary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.supporting_artifact}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: '0.8125rem' }}>{ev.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Evidence History Modal */}
      {selectedHistorySkill && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
          onClick={() => setSelectedHistorySkill(null)}
        >
          <div
            className="card"
            style={{ width: '100%', maxWidth: '600px', maxHeight: '85vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--slate-200)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  Evidence Audit Trail
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                  {selectedHistorySkill.skill}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHistorySkill(null)}
                className="btn btn-ghost btn-sm"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {selectedHistorySkill.evidence_history.map((ev, i) => (
                <div
                  key={ev.id || i}
                  style={{
                    backgroundColor: 'var(--slate-50)',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--slate-900)' }}>
                      {ev.source_title}
                    </strong>
                    <StatusBadge status={ev.status} size="sm" />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginBottom: '0.5rem' }}>
                    Score: <strong style={{ color: '#059669' }}>{ev.score}</strong> · Date: <strong>{ev.date}</strong> · Evaluator: <strong>{ev.evaluator}</strong>
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--slate-700)', lineHeight: 1.5, margin: 0 }}>
                    {ev.feedback}
                  </p>
                  {ev.supporting_artifact && (
                    <div style={{ marginTop: '0.65rem', fontSize: '0.75rem', color: 'var(--primary)', fontFamily: 'monospace' }}>
                      Artifact: {ev.supporting_artifact}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PassportPage;
