import { pool, supabase } from '../config/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export type UserRole = 'candidate' | 'employer';

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type UserProfile = Omit<User, 'password_hash'>;

export function toUserProfile(user: User): UserProfile {
  const { password_hash, ...profile } = user;
  return profile;
}

// In-memory fallback cache when PostgreSQL/Supabase is not yet configured with external credentials
const memoryUsers: Map<string, User> = new Map();

// Helper to seed demo accounts
export async function seedDemoAccounts() {
  const demoAccounts = [
    {
      id: 'demo-candidate-uuid-1',
      name: 'Demo Candidate',
      email: 'candidate.demo@skillbridge.app',
      password: 'SkillBridge@123',
      role: 'candidate' as UserRole,
    },
    {
      id: 'demo-employer-uuid-2',
      name: 'Demo Employer',
      email: 'employer.demo@skillbridge.app',
      password: 'SkillBridge@123',
      role: 'employer' as UserRole,
    },
  ];

  for (const account of demoAccounts) {
    const existing = await findUserByEmail(account.email);
    if (!existing) {
      const password_hash = await bcrypt.hash(account.password, 10);
      const now = new Date().toISOString();
      const newUser: User = {
        id: account.id,
        name: account.name,
        email: account.email.toLowerCase(),
        password_hash,
        role: account.role,
        created_at: now,
        updated_at: now,
      };

      if (pool) {
        try {
          await pool.query(
            `INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (email) DO NOTHING`,
            [newUser.id, newUser.name, newUser.email, newUser.password_hash, newUser.role, newUser.created_at, newUser.updated_at]
          );
        } catch {
          // If insert fails into PG, preserve in memory
          memoryUsers.set(newUser.email, newUser);
        }
      } else {
        memoryUsers.set(newUser.email, newUser);
      }
    }
  }
}

export async function initDatabase() {
  if (pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('candidate', 'employer')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('PostgreSQL users table initialized.');
    } catch (err) {
      console.warn('PostgreSQL table init error (fallback enabled):', err instanceof Error ? err.message : err);
    }
  }

  await seedDemoAccounts();
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Try PostgreSQL pool
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1 LIMIT 1', [normalizedEmail]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: String(row.id),
          name: row.name,
          email: row.email,
          password_hash: row.password_hash,
          role: row.role as UserRole,
          created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
          updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
        };
      }
    } catch {
      // Fall through to memory store if query fails
    }
  }

  // 2. Try Supabase Client
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (!error && data) {
        return data as User;
      }
    } catch {
      // Fall through to memory store
    }
  }

  // 3. Fallback to memory store
  return memoryUsers.get(normalizedEmail) || null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: String(row.id),
          name: row.name,
          email: row.email,
          password_hash: row.password_hash,
          role: row.role as UserRole,
          created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
          updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
        };
      }
    } catch {
      // Fall through to memory store
    }
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (!error && data) {
        return data as User;
      }
    } catch {
      // Fall through
    }
  }

  for (const user of memoryUsers.values()) {
    if (user.id === id) {
      return user;
    }
  }
  return null;
}

export async function createUser(params: {
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
}): Promise<UserProfile> {
  const normalizedEmail = params.email.toLowerCase().trim();
  const id = uuidv4();
  const now = new Date().toISOString();

  const user: User = {
    id,
    name: params.name.trim(),
    email: normalizedEmail,
    password_hash: params.password_hash,
    role: params.role,
    created_at: now,
    updated_at: now,
  };

  if (pool) {
    try {
      const res = await pool.query(
        `INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, email, role, created_at, updated_at`,
        [user.id, user.name, user.email, user.password_hash, user.role, user.created_at, user.updated_at]
      );
      if (res.rows.length > 0) {
        const row = res.rows[0];
        return {
          id: String(row.id),
          name: row.name,
          email: row.email,
          role: row.role as UserRole,
          created_at: new Date(row.created_at).toISOString(),
          updated_at: new Date(row.updated_at).toISOString(),
        };
      }
    } catch (err) {
      console.warn('PostgreSQL insert error, saving to memory fallback:', err instanceof Error ? err.message : err);
    }
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([user])
        .select('id, name, email, role, created_at, updated_at')
        .single();

      if (!error && data) {
        return data as UserProfile;
      }
    } catch {
      // Fall through
    }
  }

  memoryUsers.set(normalizedEmail, user);
  return toUserProfile(user);
}
