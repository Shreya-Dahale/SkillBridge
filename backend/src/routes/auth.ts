import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {
  findUserByEmail,
  findUserById,
  createUser,
  toUserProfile,
  UserRole,
} from '../models/userModel';
import {
  authenticateToken,
  AuthenticatedRequest,
  JWT_SECRET,
} from '../middleware/auth';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({ error: 'Valid email is required' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    if (!role || (role !== 'candidate' && role !== 'employer')) {
      res.status(400).json({ error: 'Role must be either candidate or employer' });
      return;
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await createUser({
      name: name.trim(),
      email,
      password_hash,
      role: role as UserRole,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    res.status(500).json({ error: message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const userProfile = toUserProfile(user);
    const token = jwt.sign(
      { id: userProfile.id, email: userProfile.email, role: userProfile.role, name: userProfile.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userProfile,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Login failed';
    res.status(500).json({ error: message });
  }
});

// GET /api/auth/me (Protected route)
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await findUserById(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      user: toUserProfile(user),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch user';
    res.status(500).json({ error: message });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;
