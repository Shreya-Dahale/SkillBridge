import React from 'react';
import { Link } from 'react-router-dom';
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
          <Link to="/dashboard" className="btn btn-primary btn-sm">
            Candidate Dashboard
          </Link>
          <Link to="/employer" className="btn btn-ghost btn-sm" style={{ color: '#93c5fd' }}>
            Employer Dashboard
          </Link>
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
          SkillBridge bridges the employment gap by replacing resume screening bias with verified technical proof of work. Benchmark assessments, sandbox projects, and a cryptographic skill freshness passport empower returners to re-enter with confidence.
        </p>

        <div className="hero-cta-bar">
          <Link to="/dashboard" className="btn btn-primary btn-large">
            Candidate Dashboard <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
          <Link to="/employer" className="btn btn-outline btn-large" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
            Employer Dashboard
          </Link>
        </div>

        {/* Direct access — no login needed */}
        <div className="demo-login-callout">
          <div className="demo-callout-title">Jump straight in — no login required</div>
          <div className="demo-pills-row">
            <Link
              to="/dashboard"
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#c7d2fe', borderColor: 'rgba(99, 102, 241, 0.3)' }}
            >
              Candidate Dashboard (Returner Profile &amp; Passport)
            </Link>
            <Link
              to="/employer"
              className="btn btn-secondary btn-sm"
              style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', borderColor: 'rgba(59, 130, 246, 0.3)' }}
            >
              Employer Dashboard (Job Board &amp; Evidence Review)
            </Link>
          </div>
        </div>
      </section>

      {/* 5 Core Pillars Section */}
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

      {/* Footer */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '2rem 1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        <p>SkillBridge &copy; 2026. "Don't judge the gap. Evaluate the work." All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
