import React, { createContext, useContext } from 'react';
import { UserProfile, UserRole } from '../types/auth';

// ── Auth-bypass mode ──────────────────────────────────────────────────────────
// Login / signup is REMOVED. We inject a default guest user so every component
// that calls useAuth() still gets a valid object without redirecting to /login.
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const defaultUser: UserProfile = {
  id: 'guest',
  name: 'Guest User',
  email: 'guest@skillbridge.app',
  role: 'candidate' as UserRole,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always authenticated – no token needed
  const noop = async () => {};

  return (
    <AuthContext.Provider
      value={{
        user: defaultUser,
        token: 'bypass',
        isLoading: false,
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
