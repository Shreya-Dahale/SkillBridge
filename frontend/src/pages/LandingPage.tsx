import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  Target,
  FileCheck,
  Code2,
  Users,
  Compass,
} from '../components/Icons';

export const LandingPage: React.FC = () => {
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const goCandidate = () => {
    switchRole('candidate');
    navigate('/dashboard');
  };

  const goEmployer = () => {
    switchRole('employer');
    navigate('/employer');
  };

  return (
    <div className="landing-page-wrap">
      {/* Navigation Header */}
      <header className="landing-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand-icon-box">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
              SkillBridge
            </span>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button onClick={goCandidate} className="btn btn-primary btn-sm">
            Candidate Dashboard
          </button>
          <button onClick={goEmployer} className="btn btn-ghost btn-sm" style={{ color: '#93c5fd' }}>
            Employer Dashboard
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-pill-badge">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Evidence-Based Career Re-Entry Platform</span>
        </div>

        <h1 className="hero-title">
          Don't judge the gap.<br />
          <span className="hero-title-highlight">Evaluate the work.</span>
        </h1>

        <p className="hero-description">
          SkillBridge bridges the employment gap by replacing resume screening bias with verified technical proof of work. Benchmark assessments, sandbox projects, and a skill freshness passport empower returners to re-enter with confidence.
        </p>

        {/* Role Selection Cards — no login required */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Candidate Card */}
          <button
            onClick={goCandidate}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem',
              background: 'rgba(99,102,241,0.12)', border: '1.5px solid rgba(99,102,241,0.4)',
              borderRadius: '1rem', padding: '2rem 2.5rem', minWidth: '260px', maxWidth: '320px',
              color: '#fff', textDecoration: 'none', transition: 'all 0.2s',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ background: 'rgba(99,102,241,0.25)', borderRadius: '0.75rem', padding: '0.75rem' }}>
              <Users className="w-7 h-7" style={{ color: '#a5b4fc' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#c7d2fe', marginBottom: '0.3rem' }}>I'm a Candidate</div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
                View your profile, skill gaps, assessments, projects & passport
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Open Candidate Dashboard <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          {/* Employer Card */}
          <button
            onClick={goEmployer}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem',
              background: 'rgba(59,130,246,0.12)', border: '1.5px solid rgba(59,130,246,0.4)',
              borderRadius: '1rem', padding: '2rem 2.5rem', minWidth: '260px', maxWidth: '320px',
              color: '#fff', textDecoration: 'none', transition: 'all 0.2s',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{ background: 'rgba(59,130,246,0.25)', borderRadius: '0.75rem', padding: '0.75rem' }}>
              <ShieldCheck className="w-7 h-7" style={{ color: '#93c5fd' }} />
            </div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#bfdbfe', marginBottom: '0.3rem' }}>I'm an Employer</div>
              <div style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Post jobs, review candidates & evidence-based hiring tools
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Open Employer Dashboard <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        <p style={{ marginTop: '1.25rem', color: '#64748b', fontSize: '0.82rem' }}>
          No login or signup required — click to enter directly
        </p>
      </section>

      {/* 6 Core Pillars Section */}
      <section className="landing-pillars-section">
        <div className="section-label">HOW SKILLBRIDGE WORKS</div>
        <h2 className="section-heading">Built for Direct Work Evaluation</h2>

        <div className="pillars-grid">
          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="pillar-title">1. Career Gap Context</h3>
            <p className="pillar-desc">
              Document career breaks (caregiving, health, education, sabbatical) without penalty. Use our AI gap documentation assistant to craft structured narratives.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="pillar-title">2. Skill & Gap Extraction</h3>
            <p className="pillar-desc">
              Real Gemini AI extracts actual skills from your resume, compares them against live job requirements, and delivers explainable skill-gap recommendations.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="pillar-title">3. Benchmark Assessments</h3>
            <p className="pillar-desc">
              Take hands-on technical benchmark challenges. Scores, rubric feedback, and timestamps are recorded dynamically into your database record.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="pillar-title">4. Company Sandbox Projects</h3>
            <p className="pillar-desc">
              Build realistic production tasks for partner companies. Submit code repositories and live artifacts for verified rubric evaluations.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="pillar-title">5. Skill Freshness Passport</h3>
            <p className="pillar-desc">
              Your flagship evidence portfolio. Clearly distinguishes <strong>Verified</strong>, <strong>Demonstrated</strong>, and <strong>Needs Refresh</strong> skills.
            </p>
          </div>

          <div className="pillar-card">
            <div className="pillar-icon-box">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="pillar-title">6. Bias-Free Hiring</h3>
            <p className="pillar-desc">
              Employers discover candidates strictly by demonstrated capabilities and evidence records rather than historical resumes or arbitrary pedigree.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '3rem 2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          {[
            { value: '2,400+', label: 'Career Returners' },
            { value: '340+', label: 'Partner Employers' },
            { value: '89%', label: 'Placement Rate' },
            { value: '4.8★', label: 'Candidate Rating' },
          ].map((stat) => (
            <div key={stat.label}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a5b4fc', letterSpacing: '-0.03em' }}>{stat.value}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '2rem 1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <p>SkillBridge &copy; 2026. &ldquo;Don't judge the gap. Evaluate the work.&rdquo; All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
