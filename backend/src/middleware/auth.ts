import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/userModel';

export const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge-jwt-secret-key-2026';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  // Support demo / bypass tokens used by client personas
  if (token === 'bypass_token' || token === 'bypass' || token.startsWith('bypass')) {
    const isEmployerRoute = req.originalUrl.includes('/employer');
    const roleHeader = (req.headers['x-user-role'] as string) || (req.headers['x-role'] as string);
    const role: UserRole = roleHeader
      ? (roleHeader === 'employer' ? 'employer' : 'candidate')
      : (isEmployerRoute ? 'employer' : 'candidate');

    req.user = role === 'employer'
      ? {
          id: 'usr_employer_apex',
          email: 's.jenkins@apexfintech.demo',
          role: 'employer',
          name: 'Sarah Jenkins (Apex FinTech)',
        }
      : {
          id: 'usr_candidate_priya',
          email: 'priya.sharma@skillbridge.demo',
          role: 'candidate',
          name: 'Priya Sharma',
        };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    req.user = decoded as AuthUserPayload;
    next();
  });
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}
