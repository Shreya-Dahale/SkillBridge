import { Router, Response } from 'express';
import {
  authenticateToken,
  requireRole,
  AuthenticatedRequest,
} from '../middleware/auth';
import {
  getAllAssessments,
  getAssessmentById,
  submitAssessment,
  getSubmissionsByUser,
} from '../models/assessmentModel';
import {
  getAllProjects,
  getProjectById,
  applyToProject,
  submitProject,
  getProjectApplicationsByUser,
} from '../models/projectModel';
import {
  getEvidenceByUser,
  getSkillFreshnessPassport,
} from '../models/evidenceModel';

const router = Router();

// Candidate only
router.use(authenticateToken, requireRole('candidate'));

// ================= ASSESSMENTS =================

// GET /api/candidate/assessments - List assessments
router.get('/assessments', async (_req, res: Response): Promise<void> => {
  try {
    const assessments = await getAllAssessments();
    res.status(200).json({ assessments });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list assessments';
    res.status(500).json({ error: msg });
  }
});

// GET /api/candidate/assessments/submissions - User attempt history
router.get('/assessments/submissions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const submissions = await getSubmissionsByUser(userId);
    res.status(200).json({ submissions });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to get submissions';
    res.status(500).json({ error: msg });
  }
});

// GET /api/candidate/assessments/:id - Assessment details
router.get('/assessments/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const assessment = await getAssessmentById(id);
    if (!assessment) {
      res.status(404).json({ error: 'Assessment not found' });
      return;
    }
    res.status(200).json({ assessment });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch assessment';
    res.status(500).json({ error: msg });
  }
});

// POST /api/candidate/assessments/:id/submit - Submit attempt
router.post('/assessments/:id/submit', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      res.status(400).json({ error: 'Answers must be provided as key-value pairs' });
      return;
    }

    const submission = await submitAssessment(userId, id, answers);
    res.status(201).json({
      message: 'Assessment submitted and evaluated successfully',
      submission,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit assessment';
    res.status(500).json({ error: msg });
  }
});

// ================= PROJECTS =================

// GET /api/candidate/projects - List projects & candidate application status
router.get('/projects', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const projects = await getAllProjects();
    const userApps = await getProjectApplicationsByUser(userId);

    const merged = projects.map((p) => {
      const app = userApps.find((a) => a.project_id === p.id);
      return {
        ...p,
        application: app || null,
      };
    });

    res.status(200).json({ projects: merged });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list projects';
    res.status(500).json({ error: msg });
  }
});

// GET /api/candidate/projects/:id - Project details
router.get('/projects/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const project = await getProjectById(id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const apps = await getProjectApplicationsByUser(userId);
    const app = apps.find((a) => a.project_id === project.id) || null;

    res.status(200).json({
      project,
      application: app,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch project';
    res.status(500).json({ error: msg });
  }
});

// POST /api/candidate/projects/:id/apply - Apply/start project
router.post('/projects/:id/apply', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const app = await applyToProject(userId, id);
    res.status(200).json({
      message: 'Applied to project successfully',
      application: app,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to apply to project';
    res.status(500).json({ error: msg });
  }
});

// POST /api/candidate/projects/:id/submit - Submit project code
router.post('/projects/:id/submit', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const { repo_url, notes } = req.body;

    if (!repo_url || typeof repo_url !== 'string' || repo_url.trim().length === 0) {
      res.status(400).json({ error: 'Code repository URL is required for submission' });
      return;
    }

    const updated = await submitProject(userId, id, {
      repo_url: repo_url.trim(),
      notes,
    });

    res.status(200).json({
      message: 'Project submitted and evaluated successfully',
      application: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to submit project';
    res.status(500).json({ error: msg });
  }
});

// ================= EVIDENCE & PASSPORT =================

// GET /api/candidate/evidence - Evidence records
router.get('/evidence', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const evidence = await getEvidenceByUser(userId);
    res.status(200).json({ evidence });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch evidence records';
    res.status(500).json({ error: msg });
  }
});

// GET /api/candidate/passport - Skill Freshness Passport
router.get('/passport', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const passportData = await getSkillFreshnessPassport(userId);
    res.status(200).json(passportData);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch skill passport';
    res.status(500).json({ error: msg });
  }
});

export default router;
