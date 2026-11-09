import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, ShieldCheck, ArrowRight, CheckCircle, AlertCircle, User, Building } from '../components/Icons';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle URL query param demo trigger (e.g. /login?demo=candidate)
  useEffect(() => {
    const demo = searchParams.get('demo');
    if (demo === 'candidate') {
      fillDemoAccount('candidate.demo@skillbridge.app');
    } else if (demo === 'employer') {
      fillDemoAccount('employer.demo@skillbridge.app');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid login credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('SkillBridge@123');
    setError(null);
  };

  return (
    <div className="auth-split-screen">
      {/* Brand & Value Side */}
      <div className="auth-brand-side">
        <Link to="/" className="auth-brand-logo">
          <div className="brand-icon-box">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
            SkillBridge
          </span>
        </Link>

        <div className="auth-quote-box">
          <div className="hero-pill-badge" style={{ marginBottom: '1rem' }}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Work-First Evaluation</span>
          </div>
          <h2 className="auth-quote-text">
            "Don't judge the gap.<br />Evaluate the work."
          </h2>
          <p className="auth-quote-desc">
            Sign in to access your verified Skill Freshness Passport, benchmark technical submissions, and employer evaluation pipelines.
          </p>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Real Gemini AI resume & skill gap analysis</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Tamper-evident Skill Freshness Passport</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Direct candidate-employer evidence review</span>
            </div>
          </div>
        </div>

        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
          SkillBridge Platform &copy; 2026. All rights reserved.
        </div>
      </div>

      {/* Form Side */}
      <div className="auth-form-side">
        <div className="auth-card-box">
          <h1 className="auth-header-title">Welcome back</h1>
          <p className="auth-header-sub">
            Sign in with your credentials or select a 1-click demo account.
          </p>

          {error && (
            <div className="alert-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1-Click Demo Accounts Selector */}
          <div style={{ backgroundColor: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Instant Demo Credentials:
            </div>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ flex: 1, justifyContent: 'center', background: '#fff' }}
                onClick={() => fillDemoAccount('candidate.demo@skillbridge.app')}
              >
                <User className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                Candidate Demo
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ flex: 1, justifyContent: 'center', background: '#fff' }}
                onClick={() => fillDemoAccount('employer.demo@skillbridge.app')}
              >
                <Building className="w-3.5 h-3.5 text-blue-600 mr-1" />
                Employer Demo
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="password">Password</label>
              </div>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary btn-block"
              style={{ marginTop: '0.75rem' }}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in to Dashboard'}
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
