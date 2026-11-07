import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const isCandidate = user.role === 'candidate';

  // Redirect employers to their dedicated page
  useEffect(() => {
    if (user && user.role === 'employer') {
      navigate('/employer', { replace: true });
    }
  }, [user, navigate]);

  if (user.role === 'employer') return null;

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <Link to="/dashboard" className="brand-logo-text" style={{ textDecoration: 'none' }}>
            SkillBridge
          </Link>
          <span className={`role-badge ${isCandidate ? 'badge-candidate' : 'badge-employer'}`}>
            {isCandidate ? 'Candidate' : 'Employer'}
          </span>
        </div>

        <div className="dashboard-user-bar">
          <span className="user-greeting">
            Signed in as <strong>{user.name}</strong>
          </span>
          {isCandidate && (
            <>
              <Link to="/profile" className="btn btn-outline btn-sm">Profile</Link>
              <Link to="/skills" className="btn btn-outline btn-sm">Skills & Gap</Link>
              <Link to="/assessments" className="btn btn-outline btn-sm">Assessments</Link>
              <Link to="/projects" className="btn btn-outline btn-sm">Projects</Link>
              <Link to="/passport" className="btn btn-primary btn-sm">Skill Passport</Link>
              <Link to="/candidate-extra" className="btn btn-outline btn-sm">More →</Link>
            </>
          )}
          <button onClick={handleLogout} className="btn btn-outline btn-sm">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-heading-section">
          <h1>Candidate Dashboard</h1>
          <p className="dashboard-subtitle">
            Candidate workspace for evidence-based career progression.
          </p>
        </div>

        {isCandidate && (
          <>
            <section className="profile-details-card" style={{ background: '#f8fafc', borderColor: '#c7d2fe' }}>
              <h2>Core Workspaces</h2>
              <p style={{ color: '#475569', marginBottom: '1rem' }}>
                Upload your resume for real Gemini AI extraction, manage confirmed skills, and benchmark against job requirements.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/profile" className="btn btn-primary">Profile & Resume Upload →</Link>
                <Link to="/skills" className="btn btn-secondary">Skills & Skill-Gap Analysis →</Link>
                <Link to="/assessments" className="btn btn-outline">Benchmark Assessments →</Link>
                <Link to="/projects" className="btn btn-outline">Company Sandbox Projects →</Link>
                <Link to="/passport" className="btn btn-primary" style={{ background: '#4338ca' }}>Skill Freshness Passport →</Link>
              </div>
            </section>

            <section className="profile-details-card" style={{ marginTop: '1rem', background: '#f8fafc', borderColor: '#86efac' }}>
              <h2>Career Support & Reports</h2>
              <p style={{ color: '#475569', marginBottom: '1rem' }}>
                Book mentors, apply to fellowships, manage references, track applications, and download reports.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/mentors" className="btn btn-outline">🎓 Mentor Sessions →</Link>
                <Link to="/fellowships" className="btn btn-outline">🌟 Fellowships →</Link>
                <Link to="/references" className="btn btn-outline">📋 References →</Link>
                <Link to="/applications" className="btn btn-outline">💼 Job Applications →</Link>
                <Link to="/candidate-extra" className="btn btn-outline">💬 Feedback History →</Link>
                <Link to="/reports" className="btn btn-primary" style={{ background: '#059669' }}>📊 Download Reports →</Link>
              </div>
            </section>
          </>
        )}

        <section className="profile-details-card">
          <h2>User Account Details</h2>
          <div className="profile-grid">
            <div className="profile-field">
              <span className="field-label">User ID</span>
              <span className="field-value font-mono">{user.id}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Full Name</span>
              <span className="field-value">{user.name}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Email Address</span>
              <span className="field-value">{user.email}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Assigned Role</span>
              <span className="field-value capitalize">{user.role}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Created At</span>
              <span className="field-value">{new Date(user.created_at).toLocaleString()}</span>
            </div>
            <div className="profile-field">
              <span className="field-label">Updated At</span>
              <span className="field-value">{new Date(user.updated_at).toLocaleString()}</span>
            </div>
          </div>
        </section>

        <section className="empty-state-card">
          <div className="empty-state-icon">✓</div>
          <h3>Authentication & Role Verification Complete</h3>
          <p>
            You are successfully authenticated as a verified <strong>{user.role}</strong>.
          </p>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
