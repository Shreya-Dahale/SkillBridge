import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  FileCheck,
  Code2,
  ArrowRight,
  Briefcase,
  CheckCircle,
  Sparkles,
  Download,
  Upload,
} from '../components/Icons';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import type { CandidateProfile } from '../types/candidate';
import type { SkillPassportItem, SkillPassportSummary } from '../types/assessmentAndProject';

export const DashboardPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [passportSummary, setPassportSummary] = useState<SkillPassportSummary | null>(null);
  const [recentEvidence, setRecentEvidence] = useState<SkillPassportItem[]>([]);
  const [applicationsCount, setApplicationsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Redirect employers to their dedicated page
  useEffect(() => {
    if (user && user.role === 'employer') {
      navigate('/employer', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (token && user?.role === 'candidate') {
      loadDashboardData();
    }
  }, [token, user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [profRes, passRes, appRes] = await Promise.all([
        fetch('/api/candidate/profile', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/candidate/passport', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/candidate/my-applications', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (profRes.ok) {
        const pData = await profRes.json();
        setProfile(pData.profile);
      }
      if (passRes.ok) {
        const passData = await passRes.json();
        setPassportSummary(passData.summary || null);
        setRecentEvidence((passData.passportItems || []).slice(0, 5));
      }
      if (appRes.ok) {
        const aData = await appRes.json();
        setApplicationsCount((aData.applications || []).length);
      }
    } catch {
      // Offline / fallback graceful
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role === 'employer') {
    return null;
  }

  if (isLoading && !profile) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
        <div className="loading-spinner-ring" style={{ margin: '0 auto 1rem' }} />
        <p className="loading-text">Loading candidate workspace...</p>
      </div>
    );
  }

  const confirmedSkillsCount = profile?.skills?.length || 0;
  const verifiedCount = passportSummary?.verified_count || 0;
  const demonstratedCount = passportSummary?.demonstrated_count || 0;
  const totalTracked = passportSummary?.total_tracked_skills || confirmedSkillsCount || 1;
  const readinessPercent = Math.min(100, Math.round(((verifiedCount * 1.5 + demonstratedCount) / Math.max(1, totalTracked)) * 100));

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Candidate Workspace
            </span>
            {profile?.career_break?.in_break && (
              <span className="status-badge badge-refresh badge-sm">
                Career Break Re-Entry ({profile.career_break.duration || 'Active'})
              </span>
            )}
          </div>
          <h1 className="page-title">Welcome back, {user.name}</h1>
          <p className="page-subtitle">
            Targeting: <strong>{profile?.target_role || 'Software Engineer'}</strong> · Track confirmed skills, benchmark work evidence, and verify capability.
          </p>
        </div>

        <div className="page-header-actions">
          <Link to="/passport" className="btn btn-primary">
            <ShieldCheck className="w-4 h-4 mr-1" />
            View Skill Passport
          </Link>
          <Link to="/profile" className="btn btn-outline">
            <Upload className="w-4 h-4 mr-1" />
            Upload Resume
          </Link>
          <Link to="/reports" className="btn btn-outline">
            <Download className="w-4 h-4 mr-1" />
            Export Reports
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Confirmed Skills"
          value={confirmedSkillsCount}
          icon={<CheckCircle className="w-4 h-4" />}
          hint="Candidate verified skills"
          variant="primary"
          onClick={() => navigate('/skills')}
        />
        <StatCard
          label="Verified Evidence"
          value={verifiedCount}
          icon={<ShieldCheck className="w-4 h-4" />}
          hint="Rubric & assessment verified"
          variant="success"
          onClick={() => navigate('/passport')}
        />
        <StatCard
          label="Demonstrated Work"
          value={demonstratedCount}
          icon={<Code2 className="w-4 h-4" />}
          hint="Sandbox & project proofs"
          variant="default"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          label="Active Applications"
          value={applicationsCount}
          icon={<Briefcase className="w-4 h-4" />}
          hint="Jobs & Returnship programs"
          variant="violet"
          onClick={() => navigate('/applications')}
        />
      </div>

      {/* Evidence Health & Readiness Banner */}
      <div className="card" style={{ marginBottom: '1.75rem', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Evidence Readiness Score
            </span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-900)', marginTop: '0.15rem' }}>
              Work-First Hiring Index: {readinessPercent}%
            </h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span className="status-badge badge-verified badge-sm">Verified: {verifiedCount}</span>
            <span className="status-badge badge-demonstrated badge-sm">Demonstrated: {demonstratedCount}</span>
            <span className="status-badge badge-refresh badge-sm">Needs Refresh: {passportSummary?.needs_refresh_count || 0}</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--slate-100)', borderRadius: '9999px', overflow: 'hidden', display: 'flex' }}>
          <div style={{ width: `${Math.min(100, (verifiedCount / totalTracked) * 100)}%`, backgroundColor: '#10b981', transition: 'width 0.4s ease' }} title="Verified" />
          <div style={{ width: `${Math.min(100, (demonstratedCount / totalTracked) * 100)}%`, backgroundColor: '#3b82f6', transition: 'width 0.4s ease' }} title="Demonstrated" />
          <div style={{ width: `${Math.min(100, ((passportSummary?.needs_refresh_count || 0) / totalTracked) * 100)}%`, backgroundColor: '#f59e0b', transition: 'width 0.4s ease' }} title="Needs Refresh" />
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.65rem' }}>
          Scores are generated strictly from practical submissions. Take benchmark assessments or company sandbox tasks to increase verified capability.
        </p>
      </div>

      {/* Main Two-Column Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Core Workspaces Hub */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Core Career Modules
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <Link
              to="/passport"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--slate-50)';
                e.currentTarget.style.borderColor = 'var(--slate-200)';
              }}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--slate-900)', display: 'block' }}>
                  Skill Freshness Passport
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  View cryptographically tagged evidence and verified skill history.
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/skills"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--slate-50)';
                e.currentTarget.style.borderColor = 'var(--slate-200)';
              }}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--slate-900)', display: 'block' }}>
                  Gemini Skill Gap Analysis
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  Benchmark against real target roles and job descriptions.
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/assessments"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--slate-50)';
                e.currentTarget.style.borderColor = 'var(--slate-200)';
              }}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--slate-900)', display: 'block' }}>
                  Benchmark Assessments
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  Complete timed technical evaluations for verified status.
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/projects"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: 'var(--slate-50)',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--slate-50)';
                e.currentTarget.style.borderColor = 'var(--slate-200)';
              }}
            >
              <div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--slate-900)', display: 'block' }}>
                  Company Sandbox Projects
                </strong>
                <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  Submit production repos for evaluation by partner employers.
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Passport Preview & Latest Evidence */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Latest Skill Passport Records
            </h3>
            <Link to="/passport" style={{ fontSize: '0.8125rem', color: 'var(--primary)', fontWeight: 600 }}>
              View All →
            </Link>
          </div>

          {recentEvidence.length === 0 ? (
            <div className="empty-state-card" style={{ padding: '2rem 1rem' }}>
              <div className="empty-state-icon-box">
                <FileCheck className="w-6 h-6" />
              </div>
              <h4 className="empty-state-title">No Evidence Submitted Yet</h4>
              <p className="empty-state-desc">
                Complete your first technical benchmark assessment or sandbox project to generate verified evidence.
              </p>
              <Link to="/assessments" className="btn btn-primary btn-sm">
                Take an Assessment
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentEvidence.map((item) => (
                <div
                  key={item.skill}
                  style={{
                    padding: '0.75rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--slate-900)' }}>
                      {item.skill}
                    </strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.1rem' }}>
                      {item.latest_evidence?.source_title || 'Confirmed skill'}
                      {item.score && ` · Score: ${item.score}`}
                    </div>
                  </div>
                  <StatusBadge status={item.current_status} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Account Profile Details Footer Card */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '1rem' }}>
          Account Verification & Security
        </h3>
        <div className="profile-grid">
          <div className="profile-field">
            <span className="field-label">Account ID</span>
            <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--slate-600)' }}>
              {user.id}
            </span>
          </div>
          <div className="profile-field">
            <span className="field-label">Full Name</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>
              {user.name}
            </span>
          </div>
          <div className="profile-field">
            <span className="field-label">Email Address</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>
              {user.email}
            </span>
          </div>
          <div className="profile-field">
            <span className="field-label">Assigned Role</span>
            <div>
              <span className="status-badge badge-verified badge-sm">Verified Candidate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
