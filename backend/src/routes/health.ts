import { Router, Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/db';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  const dbStatus = await checkDatabaseConnection();

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'skillbridge-backend',
    database: dbStatus,
  });
});

export default router;
