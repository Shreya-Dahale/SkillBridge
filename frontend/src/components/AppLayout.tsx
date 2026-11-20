import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShieldCheck,
  User,
  Target,
  FileCheck,
  Code2,
  Users,
  Compass,
  Briefcase,
  FileText,
  Download,
  Building,
  Menu,
  X,
  Zap,
} from './Icons';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCandidate = user?.role === 'candidate';
  const isEmployer = user?.role === 'employer';

  const handleSwitchToCandidate = () => {
    switchRole('candidate');
    navigate('/dashboard');
    setMobileMenuOpen(false);
  };

  const handleSwitchToEmployer = () => {
    switchRole('employer');
    navigate('/employer');
    setMobileMenuOpen(false);
  };

  const candidateGroups: NavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="nav-icon" /> },
      ],
    },
    {
      title: 'PROOF OF WORK',
      items: [
        { label: 'Skill Passport', path: '/passport', icon: <ShieldCheck className="nav-icon" />, badge: 'FLAGSHIP' },
        { label: 'Profile & Resume', path: '/profile', icon: <User className="nav-icon" /> },
        { label: 'Skills & Gap Analysis', path: '/skills', icon: <Target className="nav-icon" /> },
        { label: 'Benchmark Tests', path: '/assessments', icon: <FileCheck className="nav-icon" /> },
        { label: 'Sandbox Projects', path: '/projects', icon: <Code2 className="nav-icon" /> },
      ],
    },
    {
      title: 'CAREER OPPORTUNITIES',
      items: [
        { label: 'Job Applications', path: '/applications', icon: <Briefcase className="nav-icon" /> },
        { label: 'Returnships & Fellowships', path: '/fellowships', icon: <Compass className="nav-icon" /> },
        { label: '1:1 Mentors', path: '/mentors', icon: <Users className="nav-icon" /> },
        { label: 'References', path: '/references', icon: <FileText className="nav-icon" /> },
        { label: 'Reports & Exports', path: '/reports', icon: <Download className="nav-icon" /> },
      ],
    },
  ];

  const employerGroups: NavGroup[] = [
    {
      title: 'WORKSPACE',
      items: [
        { label: 'Employer Dashboard', path: '/employer', icon: <LayoutDashboard className="nav-icon" /> },
        { label: 'Post & Manage Jobs', path: '/employer/jobs', icon: <Briefcase className="nav-icon" /> },
        { label: 'Candidate Discovery', path: '/employer/candidates', icon: <Users className="nav-icon" />, badge: 'EVIDENCE' },
        { label: 'Company Profile', path: '/employer/profile', icon: <Building className="nav-icon" /> },
      ],
    },
  ];

  const navGroups = isEmployer ? employerGroups : candidateGroups;

  const isActive = (path: string) => {
    if (path === '/employer') {
      return location.pathname === '/employer';
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="app-shell">
      {/* Mobile Top Bar */}
      <div className="mobile-header">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-menu-btn"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <Link to={isCandidate ? '/dashboard' : '/employer'} className="mobile-brand">
          <span className="brand-symbol">SB</span>
          <span className="brand-name">SkillBridge</span>
        </Link>

        <div className="mobile-user-indicator">
          <span className={`role-chip ${isCandidate ? 'chip-candidate' : 'chip-employer'}`}>
            {isCandidate ? 'Candidate' : 'Employer'}
          </span>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand-area">
          <Link to={isCandidate ? '/dashboard' : '/employer'} className="sidebar-brand">
            <div className="brand-icon-box">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="brand-text-wrap">
              <span className="sidebar-brand-name">SkillBridge</span>
              <span className="sidebar-brand-tag">EVALUATE WORK</span>
            </div>
          </Link>
        </div>

        {/* Role Switcher */}
        <div style={{
          margin: '0.75rem 1rem 0.25rem',
          padding: '0.5rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0.5rem',
        }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
            Switch View
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={handleSwitchToCandidate}
              style={{
                flex: 1,
                padding: '0.3rem 0.5rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: '0.35rem',
                border: 'none',
                cursor: 'pointer',
                background: isCandidate ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                color: isCandidate ? '#a5b4fc' : '#64748b',
                outline: isCandidate ? '1px solid rgba(99,102,241,0.5)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              👤 Candidate
            </button>
            <button
              onClick={handleSwitchToEmployer}
              style={{
                flex: 1,
                padding: '0.3rem 0.5rem',
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: '0.35rem',
                border: 'none',
                cursor: 'pointer',
                background: isEmployer ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.05)',
                color: isEmployer ? '#93c5fd' : '#64748b',
                outline: isEmployer ? '1px solid rgba(59,130,246,0.5)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              🏢 Employer
            </button>
          </div>
        </div>

        {/* Realtime Live Indicator */}
        <div className="sidebar-live-bar">
          <span className="live-dot-pulse" />
          <span className="live-text">Live Demo Mode</span>
          <span className="live-mode-badge">{isCandidate ? 'Candidate' : 'Employer'}</span>
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav">
          {navGroups.map((group) => (
            <div key={group.title} className="nav-group">
              <span className="nav-group-title">{group.title}</span>
              <ul className="nav-list">
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`nav-link ${active ? 'nav-link-active' : ''}`}
                      >
                        <span className="nav-link-icon">{item.icon}</span>
                        <span className="nav-link-label">{item.label}</span>
                        {item.badge && (
                          <span className={`nav-link-badge ${active ? 'badge-on-active' : ''}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="user-profile-card">
            <div className="user-avatar-circle">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="user-info-text">
              <span className="user-display-name">{user?.name || 'User'}</span>
              <span className="user-email-text">{user?.email}</span>
              <span className={`user-role-pill ${isCandidate ? 'pill-candidate' : 'pill-employer'}`}>
                {isCandidate ? 'Verified Candidate' : 'Employer Partner'}
              </span>
            </div>
            {/* Switch role icon button */}
            <button
              onClick={isCandidate ? handleSwitchToEmployer : handleSwitchToCandidate}
              className="logout-icon-btn"
              title={isCandidate ? 'Switch to Employer' : 'Switch to Candidate'}
              aria-label="Switch role"
              style={{ fontSize: '0.9rem' }}
            >
              {isCandidate ? '🏢' : '👤'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main-viewport">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
