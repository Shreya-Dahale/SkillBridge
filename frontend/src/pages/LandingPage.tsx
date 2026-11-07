import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="landing-container">
      <header className="landing-nav">
        <div className="nav-brand">SkillBridge</div>
        <div className="nav-actions">
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-secondary">
                Go to Dashboard
              </Link>
              <button onClick={() => logout()} className="btn btn-outline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="landing-card">
        <h1 className="brand-title">SkillBridge</h1>
        <p className="tagline">Don't judge the gap. Evaluate the work.</p>

        <div className="landing-cta-group">
          {user ? (
            <Link to="/dashboard" className="btn btn-primary btn-large">
              Enter Dashboard ({user.role})
            </Link>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-primary btn-large">
                Get Started / Sign In
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
