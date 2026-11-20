// Vercel Serverless Handler — wraps the Express app
// This file is auto-detected by Vercel at /api/index.ts
import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load env
dotenv.config();

// Import routers — using relative paths from backend/src
import healthRouter from '../backend/src/routes/health';
import authRouter from '../backend/src/routes/auth';
import candidateRouter from '../backend/src/routes/candidate';
import candidateExtraRouter from '../backend/src/routes/candidateExtra';
import skillsRouter from '../backend/src/routes/skills';
import assessmentsAndProjectsRouter from '../backend/src/routes/assessmentsAndProjects';
import employerRouter from '../backend/src/routes/employer';
import realtimeRouter from '../backend/src/routes/realtime';

// Init DB tables
import { initDatabase } from '../backend/src/models/userModel';
import { initCandidateTable } from '../backend/src/models/candidateModel';
import { initSkillGapTable } from '../backend/src/models/skillGapModel';
import { initAssessmentsTable } from '../backend/src/models/assessmentModel';
import { initProjectsTable } from '../backend/src/models/projectModel';
import { initEvidenceTable } from '../backend/src/models/evidenceModel';
import { initEmployerTables } from '../backend/src/models/employerModel';
import { initMentorFellowshipTables } from '../backend/src/models/mentorFellowshipModel';
import { initReportMetadataTable } from '../backend/src/models/reportModel';

const app: Application = express();

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app') ||
      origin.includes('skillbridge')
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all during demo
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/candidate', candidateRouter);
app.use('/api/candidate', candidateExtraRouter);
app.use('/api/candidate/skills', skillsRouter);
app.use('/api/candidate', assessmentsAndProjectsRouter);
app.use('/api/employer', employerRouter);
app.use('/api/realtime', realtimeRouter);

// Initialize DB on cold start (async, non-blocking)
Promise.all([
  initDatabase(),
  initCandidateTable(),
  initSkillGapTable(),
  initAssessmentsTable(),
  initProjectsTable(),
  initEvidenceTable(),
  initEmployerTables(),
  initMentorFellowshipTables(),
  initReportMetadataTable(),
]).catch((err) => {
  console.warn('DB init warning:', err?.message || err);
});

export default app;
