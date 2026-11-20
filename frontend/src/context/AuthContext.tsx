import React, { createContext, useContext, useState } from 'react';
import { UserProfile, UserRole } from '../types/auth';

// ── Auth-bypass & Role Switcher mode ──────────────────────────────────────────
// Login / signup is REMOVED. Users can freely switch between Candidate and Employer
// roles at any time without any authentication or credentials barrier.
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  activeRole: UserRole;
  switchRole: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const candidatePersona: UserProfile = {
  id: 'usr_candidate_priya',
  name: 'Priya Sharma',
  email: 'priya.sharma@skillbridge.demo',
  role: 'candidate',
  created_at: '2026-01-15T09:00:00Z',
  updated_at: '2026-11-20T10:30:00Z',
};

const employerPersona: UserProfile = {
  id: 'usr_employer_apex',
  name: 'Sarah Jenkins (Apex FinTech)',
  email: 's.jenkins@apexfintech.demo',
  role: 'employer',
  created_at: '2026-01-10T08:00:00Z',
  updated_at: '2026-11-20T10:30:00Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem('skillbridge_active_role');
      if (saved === 'employer' || saved === 'candidate') return saved;
    } catch {}
    return 'candidate';
  });

  const currentUser = activeRole === 'employer' ? employerPersona : candidatePersona;

  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    try {
      localStorage.setItem('skillbridge_active_role', role);
    } catch {}
  };

  const noop = async () => {};

  return (
    <AuthContext.Provider
      value={{
        user: currentUser,
        token: 'bypass_token',
        isLoading: false,
        activeRole,
        switchRole,
        login: noop,
        register: noop,
        logout: noop,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

