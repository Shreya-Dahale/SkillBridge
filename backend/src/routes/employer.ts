import { Router, Response, Request } from 'express';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import {
  getEmployerProfileByUserId, saveEmployerProfile,
  getJobsByEmployerId, getAllOpenJobs, getJobById,
  createJob, updateJob, deleteJob,
  applyToJob, updateApplicationStatus,
  getJobApplicationsForEmployer, discoverCandidates,
} from '../models/employerModel';
import { pool } from '../config/db';

const router = Router();

// All employer routes require employer role
router.use(authenticateToken, requireRole('employer'));

// ---- Employer Profile ----

router.get('/profile', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const profile = await getEmployerProfileByUserId(req.user!.id);
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get employer profile' });
  }
});

router.put('/profile', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const profile = await saveEmployerProfile(req.user!.id, req.body);
    res.json({ message: 'Profile updated', profile });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update employer profile' });
  }
});

// ---- Jobs ----

router.get('/jobs', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const jobs = await getJobsByEmployerId(req.user!.id);
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get jobs' });
  }
});

router.post('/jobs', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const job = await createJob(req.user!.id, req.body);
    res.status(201).json({ message: 'Job created', job });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to create job' });
  }
});

router.put('/jobs/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const job = await updateJob(String(req.params.id), req.user!.id, req.body);
    if (!job) { res.status(404).json({ error: 'Job not found or not authorized' }); return; }
    res.json({ message: 'Job updated', job });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update job' });
  }
});

router.delete('/jobs/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const deleted = await deleteJob(String(req.params.id), req.user!.id);
    if (!deleted) { res.status(404).json({ error: 'Job not found or not authorized' }); return; }
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to delete job' });
  }
});

// ---- Candidate Discovery ----

router.get('/candidates', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const skillFilter = req.query.skill as string | undefined;
    const candidates = await discoverCandidates(skillFilter);
    res.json({ candidates });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to discover candidates' });
  }
});

// GET /api/employer/candidates/:id — full evidence review
router.get('/candidates/:id', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!pool) { res.status(503).json({ error: 'Database not available' }); return; }
  try {
    const candidateId = String(_req.params.id);

    const profileRes = await pool.query(
      `SELECT cp.*, u.name, u.email FROM candidate_profiles cp
       JOIN users u ON cp.user_id = u.id WHERE cp.user_id=$1 LIMIT 1`,
      [candidateId]
    );
    const profile = profileRes.rows[0] || null;

    const evidenceRes = await pool.query(
      'SELECT * FROM evidence_records WHERE user_id=$1 ORDER BY created_at DESC',
      [candidateId]
    );
    const evidence = evidenceRes.rows;

    const assessmentsRes = await pool.query(
      'SELECT * FROM assessment_submissions WHERE user_id=$1 ORDER BY created_at DESC',
      [candidateId]
    );
    const assessments = assessmentsRes.rows;

    const projectsRes = await pool.query(
      'SELECT * FROM project_applications WHERE user_id=$1 ORDER BY created_at DESC',
      [candidateId]
    );
    const projects = projectsRes.rows;

    res.json({ profile, evidence, assessments, projects });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get candidate details' });
  }
});

// ---- Job Applications (from employer side) ----

router.get('/jobs/:id/applications', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const applications = await getJobApplicationsForEmployer(String(req.params.id), req.user!.id);
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get applications' });
  }
});

// POST /api/employer/applications/:id/status — shortlisting / interview status / feedback
router.post('/applications/:id/status', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, employer_feedback } = req.body;
    if (!status) { res.status(400).json({ error: 'status is required' }); return; }
    const application = await updateApplicationStatus(
      String(req.params.id),
      req.user!.id,
      status,
      employer_feedback || ''
    );
    if (!application) { res.status(404).json({ error: 'Application not found or not authorized' }); return; }
    res.json({ message: 'Application status updated', application });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update application' });
  }
});

// ---- Employer can also create/edit assessments and projects ----
// These are managed via the existing assessmentsAndProjects router,
// but we expose employer-specific listing here.

router.get('/assessments', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!pool) { res.json({ assessments: [] }); return; }
  try {
    const r = await pool.query('SELECT * FROM assessments ORDER BY created_at DESC');
    res.json({ assessments: r.rows });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch assessments' });
  }
});

router.get('/projects', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!pool) { res.json({ projects: [] }); return; }
  try {
    const r = await pool.query('SELECT * FROM projects ORDER BY created_at DESC');
    res.json({ projects: r.rows });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch projects' });
  }
});

export default router;
