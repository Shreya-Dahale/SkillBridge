export type UserRole = 'candidate' | 'employer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message?: string;
  token: string;
  user: UserProfile;
}
