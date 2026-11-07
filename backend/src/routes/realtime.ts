import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthenticatedRequest, JWT_SECRET } from '../middleware/auth';
import jwt from 'jsonwebtoken';
import { AuthUserPayload } from '../middleware/auth';

const router = Router();

// Middleware that accepts token from either Authorization header OR ?token= query param (for EventSource)
function authenticateTokenOrQuery(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const queryToken = req.query.token as string | undefined;
  if (queryToken && !req.headers['authorization']) {
    req.headers['authorization'] = `Bearer ${queryToken}`;
  }
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
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

// In-memory event bus for SSE
interface SSEClient {
  id: string;
  userId: string;
  role: string;
  res: Response;
}

const clients: SSEClient[] = [];

export function broadcastEvent(event: string, data: unknown, targetRole?: string, targetUserId?: string): void {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    try {
      if (targetUserId && client.userId !== targetUserId) continue;
      if (targetRole && client.role !== targetRole) continue;
      client.res.write(payload);
    } catch {
      // Client disconnected; will be cleaned up on close
    }
  }
}

// GET /api/realtime/events — SSE stream
router.get('/events', authenticateTokenOrQuery, (req: AuthenticatedRequest, res: Response): void => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const clientId = `${req.user!.id}_${Date.now()}`;
  const client: SSEClient = {
    id: clientId,
    userId: req.user!.id,
    role: req.user!.role,
    res,
  };
  clients.push(client);

  // Send initial connected event
  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to SkillBridge realtime feed', userId: req.user!.id, role: req.user!.role })}\n\n`);

  // Heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 30000);

  req.on('close', () => {
    clearInterval(heartbeat);
    const idx = clients.findIndex((c) => c.id === clientId);
    if (idx !== -1) clients.splice(idx, 1);
  });
});

export default router;
