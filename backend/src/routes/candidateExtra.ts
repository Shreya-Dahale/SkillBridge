import { Router, Response } from 'express';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import {
  getAllMentors, bookMentor, getCandidateMentorBookings,
  getAllFellowships, applyToFellowship, getCandidateFellowshipApplications,
  getCandidateReferences, addReference, updateReference, deleteReference,
  getGapNarrative, saveGapNarrative,
} from '../models/mentorFellowshipModel';
import { getCandidateApplications } from '../models/employerModel';
import { pool } from '../config/db';
import {
  generateCandidatePdf, generateCandidateCsv, generateCandidateXlsx,
} from '../services/reportService';
import { saveReportMetadata, getCandidateReports } from '../models/reportModel';
import path from 'path';
import fs from 'fs';

const router = Router();

router.use(authenticateToken, requireRole('candidate'));

// ---- Mentors ----

router.get('/mentors', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const mentors = await getAllMentors();
    res.json({ mentors });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch mentors' });
  }
});

router.get('/mentor-bookings', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const bookings = await getCandidateMentorBookings(req.user!.id);
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch bookings' });
  }
});

router.post('/mentors/:id/book', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const booking = await bookMentor(req.user!.id, {
      mentor_id: String(req.params.id),
      topic: req.body.topic || '',
      scheduled_at: req.body.scheduled_at,
      notes: req.body.notes,
    });
    res.status(201).json({ message: 'Session booked', booking });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to book session' });
  }
});

// ---- Fellowships ----

router.get('/fellowships', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const fellowships = await getAllFellowships();
    res.json({ fellowships });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch fellowships' });
  }
});

router.get('/fellowship-applications', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const applications = await getCandidateFellowshipApplications(req.user!.id);
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch applications' });
  }
});

router.post('/fellowships/:id/apply', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const app = await applyToFellowship(req.user!.id, {
      fellowship_id: String(req.params.id),
      cover_note: req.body.cover_note,
    });
    res.status(201).json({ message: 'Applied to fellowship', application: app });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to apply' });
  }
});

// ---- Professional References ----

router.get('/references', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const refs = await getCandidateReferences(req.user!.id);
    res.json({ references: refs });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch references' });
  }
});

router.post('/references', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ref = await addReference(req.user!.id, req.body);
    res.status(201).json({ message: 'Reference added', reference: ref });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to add reference' });
  }
});

router.put('/references/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ref = await updateReference(String(req.params.id), req.user!.id, req.body);
    if (!ref) { res.status(404).json({ error: 'Reference not found' }); return; }
    res.json({ message: 'Reference updated', reference: ref });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to update reference' });
  }
});

router.delete('/references/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const deleted = await deleteReference(String(req.params.id), req.user!.id);
    if (!deleted) { res.status(404).json({ error: 'Reference not found' }); return; }
    res.json({ message: 'Reference deleted' });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to delete reference' });
  }
});

// ---- Gap Narrative (Career-Break Documentation Assistant) ----

router.get('/gap-narrative', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const narrative = await getGapNarrative(req.user!.id);
    res.json({ narrative });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch gap narrative' });
  }
});

router.put('/gap-narrative', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const narrative = await saveGapNarrative(req.user!.id, req.body);
    res.json({ message: 'Gap narrative saved', narrative });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to save gap narrative' });
  }
});

// ---- Job Applications (Candidate tracking) ----

router.get('/my-applications', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const applications = await getCandidateApplications(req.user!.id);
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch applications' });
  }
});

router.post('/apply-job/:jobId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { applyToJob } = await import('../models/employerModel');
    const application = await applyToJob(String(req.params.jobId), req.user!.id);
    res.status(201).json({ message: 'Application submitted', application });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to apply to job' });
  }
});

// ---- Feedback History ----

router.get('/feedback-history', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!pool) { res.json({ feedback: [] }); return; }
  try {
    const candidateId = req.user!.id;
    const assessFb = await pool.query(
      'SELECT assessment_title AS source, skill, feedback, score_raw AS score, status, created_at FROM assessment_submissions WHERE user_id=$1 ORDER BY created_at DESC',
      [candidateId]
    );
    const projectFb = await pool.query(
      `SELECT pa.project_title AS source, pa.evaluator_feedback AS feedback, pa.evaluator_score::text AS score, pa.status, pa.evaluated_at AS created_at
       FROM project_applications pa WHERE pa.user_id=$1 AND pa.evaluator_feedback IS NOT NULL ORDER BY pa.evaluated_at DESC`,
      [candidateId]
    );
    const appFb = await pool.query(
      `SELECT j.title AS source, ja.employer_feedback AS feedback, ja.status, ja.updated_at AS created_at
       FROM job_applications ja JOIN jobs j ON ja.job_id=j.id
       WHERE ja.candidate_id=$1 AND ja.employer_feedback != '' ORDER BY ja.updated_at DESC`,
      [candidateId]
    );
    res.json({
      feedback: [
        ...assessFb.rows.map((r) => ({ ...r, type: 'assessment' })),
        ...projectFb.rows.map((r) => ({ ...r, type: 'project' })),
        ...appFb.rows.map((r) => ({ ...r, type: 'job_application' })),
      ].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()),
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch feedback history' });
  }
});

// ---- Reports ----

router.get('/report/pdf', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const filePath = await generateCandidatePdf(req.user!.id);
    await saveReportMetadata(req.user!.id, 'pdf', filePath);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="skillbridge_report_${req.user!.id}.pdf"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to generate PDF report' });
  }
});

router.get('/report/csv', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const filePath = await generateCandidateCsv(req.user!.id);
    await saveReportMetadata(req.user!.id, 'csv', filePath);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="skillbridge_export_${req.user!.id}.csv"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to generate CSV export' });
  }
});

router.get('/report/xlsx', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const filePath = await generateCandidateXlsx(req.user!.id);
    await saveReportMetadata(req.user!.id, 'xlsx', filePath);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="skillbridge_export_${req.user!.id}.xlsx"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to generate XLSX export' });
  }
});

router.get('/report/history', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const reports = await getCandidateReports(req.user!.id);
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to get report history' });
  }
});

// ---- Public Jobs (candidate can browse) ----

router.get('/jobs/open', async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { getAllOpenJobs } = await import('../models/employerModel');
    const jobs = await getAllOpenJobs();
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Failed to fetch open jobs' });
  }
});

export default router;
