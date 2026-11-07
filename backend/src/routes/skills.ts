import { Router, Response } from 'express';
import {
  authenticateToken,
  requireRole,
  AuthenticatedRequest,
} from '../middleware/auth';
import {
  getCandidateProfileByUserId,
  saveCandidateProfile,
  SkillItem,
} from '../models/candidateModel';
import {
  extractJobRequirementsWithGemini,
  analyzeSkillGap,
} from '../services/skillGapService';
import {
  saveSkillGapAnalysis,
  getLatestSkillGapAnalysis,
} from '../models/skillGapModel';

const router = Router();

// Candidate only
router.use(authenticateToken, requireRole('candidate'));

// GET /api/candidate/skills - Get confirmed skills
router.get('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await getCandidateProfileByUserId(userId);

    res.status(200).json({
      target_role: profile.target_role,
      career_break: profile.career_break,
      skills: profile.skills || [],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve skills';
    res.status(500).json({ error: msg });
  }
});

// PUT /api/candidate/skills - Update confirmed skills
router.put('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { skills, target_role } = req.body;

    if (!Array.isArray(skills)) {
      res.status(400).json({ error: 'Skills must be an array' });
      return;
    }

    const updatedProfile = await saveCandidateProfile(userId, {
      skills: skills as SkillItem[],
      target_role: target_role ?? undefined,
    });

    res.status(200).json({
      message: 'Skills updated successfully',
      skills: updatedProfile.skills,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update skills';
    res.status(500).json({ error: msg });
  }
});

// POST /api/candidate/skills/gap-analyze - Run REAL Gemini extraction & skill gap analysis
router.post('/gap-analyze', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { target_role, job_description } = req.body;

    if (!job_description || typeof job_description !== 'string' || job_description.trim().length === 0) {
      res.status(400).json({ error: 'Job description text is required for skill gap analysis' });
      return;
    }

    const effectiveTargetRole = target_role && target_role.trim().length > 0
      ? target_role.trim()
      : 'Software Engineer';

    // 1. Fetch Candidate Profile (confirmed skills + career break)
    const profile = await getCandidateProfileByUserId(userId);

    // 2. REAL Gemini Job Requirement Extraction
    const { extractedRequirements, source } = await extractJobRequirementsWithGemini(
      job_description.trim(),
      effectiveTargetRole
    );

    // 3. Explainable 4-tier Skill Gap Comparison
    const { gapResults, summary } = analyzeSkillGap(profile, extractedRequirements);

    // 4. Save to Database
    const savedRecord = await saveSkillGapAnalysis({
      user_id: userId,
      target_role: effectiveTargetRole,
      job_description_raw: job_description.trim(),
      extracted_requirements: extractedRequirements,
      gap_analysis_results: gapResults,
      summary,
    });

    res.status(200).json({
      message: 'Skill gap analysis completed successfully',
      source,
      analysis: savedRecord,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Skill gap analysis failed';
    res.status(500).json({ error: msg });
  }
});

// GET /api/candidate/skills/gap-latest - Fetch latest skill gap analysis
router.get('/gap-latest', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const latest = await getLatestSkillGapAnalysis(userId);

    res.status(200).json({
      analysis: latest,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch latest analysis';
    res.status(500).json({ error: msg });
  }
});

export default router;
