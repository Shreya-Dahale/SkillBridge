import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

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
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-brand-link">SkillBridge</Link>
          <h2>Sign in to your account</h2>
          <p className="auth-subtitle">Don't judge the gap. Evaluate the work.</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <div className="demo-accounts-panel">
          <span className="demo-title">Quick Demo Login:</span>
          <div className="demo-buttons">
            <button
              type="button"
              className="demo-btn candidate"
              onClick={() => fillDemoAccount('candidate.demo@skillbridge.app')}
            >
              Candidate Demo
            </button>
            <button
              type="button"
              className="demo-btn employer"
              onClick={() => fillDemoAccount('employer.demo@skillbridge.app')}
            >
              Employer Demo
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
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
            <label htmlFor="password">Password</label>
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
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
