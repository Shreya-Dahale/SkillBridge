import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import candidateRouter from './routes/candidate';
import candidateExtraRouter from './routes/candidateExtra';
import skillsRouter from './routes/skills';
import assessmentsAndProjectsRouter from './routes/assessmentsAndProjects';
import employerRouter from './routes/employer';
import realtimeRouter from './routes/realtime';
import { initDatabase } from './models/userModel';
import { initCandidateTable } from './models/candidateModel';
import { initSkillGapTable } from './models/skillGapModel';
import { initAssessmentsTable } from './models/assessmentModel';
import { initProjectsTable } from './models/projectModel';
import { initEvidenceTable } from './models/evidenceModel';
import { initEmployerTables } from './models/employerModel';
import { initMentorFellowshipTables } from './models/mentorFellowshipModel';
import { initReportMetadataTable } from './models/reportModel';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
    if (!origin) return callback(null, true);
    if (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all during demo deployment
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

// Initialize database schemas & seed accounts
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
])
  .then(() => {
    console.log('All database tables initialized and demo accounts seeded.');
  })
  .catch((err) => {
    console.error('Initialization error:', err);
  });

// Only listen directly when not running in serverless (e.g., local dev)
if (process.env.VERCEL !== '1' && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`SkillBridge backend running on port ${PORT}`);
  });
}

export default app;
