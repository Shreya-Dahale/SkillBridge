import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import { Zap, ShieldCheck, ArrowRight, AlertCircle, User, Building, CheckCircle } from '../components/Icons';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('candidate');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
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
            <span>Join the Community</span>
          </div>
          <h2 className="auth-quote-text">
            Start with your skills.<br />Prove your capability.
          </h2>
          <p className="auth-quote-desc">
            Whether you are re-entering tech after a career break or an employer hiring for verified execution, SkillBridge evaluates work directly.
          </p>

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#94a3b8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Evidence-based candidate profiles</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Industry returnship fellowships & mentors</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Direct shortlisting without resume bias</span>
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
          <h1 className="auth-header-title">Create your account</h1>
          <p className="auth-header-sub">
            Choose your account role and get started in seconds.
          </p>

          {error && (
            <div className="alert-error">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Role Selection Cards */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label>Select Your Platform Role</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
                <div
                  onClick={() => setRole('candidate')}
                  style={{
                    border: role === 'candidate' ? '2px solid var(--primary)' : '1px solid var(--slate-200)',
                    backgroundColor: role === 'candidate' ? 'var(--primary-light)' : '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <User className={`w-5 h-5 mx-auto mb-1 ${role === 'candidate' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: role === 'candidate' ? 'var(--primary)' : 'var(--slate-800)' }}>
                    Candidate
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                    Career Re-entry
                  </div>
                </div>

                <div
                  onClick={() => setRole('employer')}
                  style={{
                    border: role === 'employer' ? '2px solid var(--primary)' : '1px solid var(--slate-200)',
                    backgroundColor: role === 'employer' ? 'var(--primary-light)' : '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Building className={`w-5 h-5 mx-auto mb-1 ${role === 'employer' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: role === 'employer' ? 'var(--primary)' : 'var(--slate-800)' }}>
                    Employer
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', marginTop: '0.15rem' }}>
                    Hiring Partner
                  </div>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                required
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Work or Personal Email</label>
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
              <label htmlFor="password">Password (min 6 characters)</label>
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
              {isSubmitting ? 'Creating account...' : `Register as ${role === 'candidate' ? 'Candidate' : 'Employer'}`}
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
