import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  SkillPassportItem,
  SkillPassportSummary,
  EvidenceRecord,
} from '../types/assessmentAndProject';

export const PassportPage: React.FC = () => {
  const { token, logout } = useAuth();

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

  const getPassportBadgeClass = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'badge-verified-solid';
      case 'Demonstrated':
        return 'badge-demonstrated';
      case 'Needs Refresh':
        return 'badge-refresh';
      case 'Developing':
        return 'badge-developing';
      default:
        return '';
    }
  };

  const filteredItems = passportItems.filter((item) => {
    if (filterStatus === 'all') return true;
    return item.current_status.toLowerCase().replace(/\s+/g, '_') === filterStatus;
  });

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
          <Link to="/projects" className="btn btn-outline btn-sm">Projects</Link>
          <Link to="/passport" className="btn btn-primary btn-sm">Passport</Link>
          <button onClick={() => logout()} className="btn btn-outline btn-sm">Logout</button>
        </nav>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-heading-section">
          <h1>Skill Freshness Passport</h1>
          <p className="dashboard-subtitle">
            Verifiable, evidence-backed proof of technical capability. Replaces historical resume uncertainty with concrete benchmark assessments and company sandbox tasks.
          </p>
        </div>

        {errorMsg && <div className="alert-error">{errorMsg}</div>}

        {/* 4-Tier Passport KPI Counters */}
        {summary && (
          <div className="metrics-grid">
            <div className="metric-box demonstrated" style={{ borderColor: '#818cf8', background: '#f5f3ff' }}>
              <span className="metric-number" style={{ color: '#4f46e5' }}>{summary.verified_count}</span>
              <span className="metric-label" style={{ color: '#3730a3' }}>Verified</span>
              <span className="metric-desc">Benchmark or project passed (80%+)</span>
            </div>

            <div className="metric-box demonstrated">
              <span className="metric-number">{summary.demonstrated_count}</span>
              <span className="metric-label">Demonstrated</span>
              <span className="metric-desc">Practical capability demonstrated</span>
            </div>

            <div className="metric-box refresh">
              <span className="metric-number">{summary.needs_refresh_count}</span>
              <span className="metric-label">Needs Refresh</span>
              <span className="metric-desc">Historical background; hiatus refresh needed</span>
            </div>

            <div className="metric-box developing">
              <span className="metric-number">{summary.developing_count}</span>
              <span className="metric-label">Developing</span>
              <span className="metric-desc">Active learning in progress</span>
            </div>
          </div>
        )}

        {/* Status Filter */}
        <div className="filter-bar" style={{ marginTop: '0.5rem' }}>
          <span className="filter-title">Filter Passport Skills:</span>
          <div className="filter-buttons">
            {['all', 'verified', 'demonstrated', 'needs_refresh', 'developing'].map((f) => (
              <button
                key={f}
                type="button"
                className={`filter-btn ${filterStatus === f ? 'active' : ''}`}
                onClick={() => setFilterStatus(f)}
              >
                {f.replace(/_/g, ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Passport Skills Grid */}
        <section className="profile-details-card">
          <h2>Verified Skill Passport ({filteredItems.length})</h2>

          {isLoading ? (
            <p>Loading Passport data...</p>
          ) : filteredItems.length === 0 ? (
            <p className="empty-hint">No skills match the selected filter.</p>
          ) : (
            <div className="passport-grid">
              {filteredItems.map((item) => (
                <div key={item.skill} className="passport-card">
                  <div className="passport-card-top">
                    <div>
                      <h3 className="passport-skill-title">{item.skill}</h3>
                      {item.verified_hash && (
                        <span className="passport-hash">{item.verified_hash}</span>
                      )}
                    </div>
                    <span className={`status-badge ${getPassportBadgeClass(item.current_status)}`}>
                      {item.current_status}
                    </span>
                  </div>

                  <div className="passport-score-row">
                    <span className="score-label">LATEST BENCHMARK / SCORE</span>
                    <strong className="score-value">{item.score}</strong>
                  </div>

                  <div className="passport-date-row">
                    <span className="date-label">EVIDENCE CURRENCY</span>
                    <span className="date-value">{item.evidence_date}</span>
                  </div>

                  <p className="passport-feedback">{item.feedback}</p>

                  <div className="passport-card-footer">
                    <span className="evidence-count-pill">
                      {item.evidence_history.length} Evidence Record{item.evidence_history.length === 1 ? '' : 's'}
                    </span>
                    {item.evidence_history.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedHistorySkill(item)}
                        className="btn-link"
                        style={{ color: '#4f46e5', fontWeight: 600, fontSize: '0.8rem' }}
                      >
                        View History →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Evidence History Modal */}
        {selectedHistorySkill && (
          <div className="modal-backdrop">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Evidence History: {selectedHistorySkill.skill}</h3>
                <button
                  type="button"
                  onClick={() => setSelectedHistorySkill(null)}
                  className="btn-link"
                  style={{ fontSize: '1.25rem' }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                {selectedHistorySkill.evidence_history.map((ev) => (
                  <div key={ev.id} className="history-item-card">
                    <div className="history-top">
                      <strong>{ev.source_title}</strong>
                      <span className="status-badge badge-demonstrated">{ev.status}</span>
                    </div>
                    <div className="history-meta">
                      Score: <strong>{ev.score}</strong> • Date: <strong>{ev.date}</strong> • Evaluator: <strong>{ev.evaluator}</strong>
                    </div>
                    <p className="history-feedback">{ev.feedback}</p>
                    <div className="eval-artifact" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>
                      {ev.supporting_artifact}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Complete Evidence Ledger */}
        <section className="profile-details-card">
          <h2>All Supporting Evidence Records ({evidenceList.length})</h2>
          <p className="section-instruction">
            Immutable log of all technical assessments, benchmarks, and company sandbox submissions stored in the database.
          </p>

          {evidenceList.length === 0 ? (
            <p className="empty-hint">No evidence records created yet. Complete an assessment or project to verify your skills.</p>
          ) : (
            <div className="diagnostic-table-wrapper">
              <table className="diagnostic-table">
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
                      <td><strong>{ev.skill}</strong></td>
                      <td>{ev.source_title} <span className="cat-sub">({ev.source_type})</span></td>
                      <td><strong>{ev.score}</strong></td>
                      <td>
                        <span className={`status-badge ${ev.status === 'Verified' ? 'badge-verified-solid' : 'badge-demonstrated'}`}>
                          {ev.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{ev.evaluator}</td>
                      <td style={{ fontSize: '0.75rem', color: '#6366f1' }}>{ev.supporting_artifact}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{ev.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PassportPage;
