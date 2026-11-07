import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  authenticateToken,
  requireRole,
  AuthenticatedRequest,
} from '../middleware/auth';
import {
  getCandidateProfileByUserId,
  saveCandidateProfile,
  ResumeMetadata,
  CandidateProfile,
} from '../models/candidateModel';
import { extractResumeWithGemini, validatePdfBuffer } from '../services/geminiService';

const router = Router();

// Configure uploads directory
const uploadsDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// All routes require candidate authentication
router.use(authenticateToken, requireRole('candidate'));

// GET /api/candidate/profile
router.get('/profile', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await getCandidateProfileByUserId(userId);
    res.status(200).json({ profile });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch candidate profile';
    res.status(500).json({ error: msg });
  }
});

// PUT /api/candidate/profile - Candidate edits/saves confirmed profile
router.put('/profile', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      target_role,
      bio,
      phone,
      location,
      career_break,
      career_history,
      education,
      skills,
      certifications,
      projects,
    } = req.body;

    const updated = await saveCandidateProfile(userId, {
      target_role,
      bio,
      phone,
      location,
      career_break,
      career_history,
      education,
      skills,
      certifications,
      projects,
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      profile: updated,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update profile';
    res.status(500).json({ error: msg });
  }
});

// POST /api/candidate/resume - PDF upload and REAL Gemini extraction
router.post('/resume', (req: AuthenticatedRequest, res: Response): void => {
  upload.single('resume')(req, res, async (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : 'File upload error';
      res.status(400).json({ error: message });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'Please select a PDF resume file to upload' });
      return;
    }

    try {
      const userId = req.user!.id;
      const fileBuffer = req.file.buffer;
      const originalFileName = req.file.originalname;

      // Validate PDF structure
      await validatePdfBuffer(fileBuffer);

      // Securely persist original file to disk
      const sanitizedName = originalFileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const uniqueFileName = `${userId}_${Date.now()}_${sanitizedName}`;
      const filePath = path.join(uploadsDir, uniqueFileName);
      fs.writeFileSync(filePath, fileBuffer);

      const resumeMetadata: ResumeMetadata = {
        file_name: originalFileName,
        file_path: filePath,
        mime_type: req.file.mimetype,
        file_size: req.file.size,
        uploaded_at: new Date().toISOString(),
      };

      // REAL Gemini Extraction Flow:
      // PDF Buffer -> Gemini -> Structured JSON -> Validation -> Save separately
      const { extractedData, extractionSource } = await extractResumeWithGemini(fileBuffer, originalFileName);

      // Save resume metadata and AI-extracted data separately in the profile
      const updatedProfile = await saveCandidateProfile(userId, {
        original_resume: resumeMetadata,
        extracted_data: extractedData,
      });

      res.status(200).json({
        message: 'Resume uploaded and analyzed successfully',
        extractionSource,
        original_resume: resumeMetadata,
        extracted_data: extractedData,
        profile: updatedProfile,
      });
    } catch (parseErr: unknown) {
      const message = parseErr instanceof Error ? parseErr.message : 'Error extracting resume data';
      res.status(422).json({ error: message });
    }
  });
});

// POST /api/candidate/confirm-extraction - Candidate accepts / modifies extracted data
router.post('/confirm-extraction', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      target_role,
      career_break,
      career_history,
      education,
      skills,
      certifications,
      projects,
    } = req.body;

    const current = await getCandidateProfileByUserId(userId);

    const updatedExtracted = current.extracted_data
      ? { ...current.extracted_data, status: 'confirmed' as const }
      : null;

    const updatedProfile = await saveCandidateProfile(userId, {
      target_role: target_role ?? current.target_role,
      career_break: career_break ?? current.career_break,
      career_history: career_history ?? current.career_history,
      education: education ?? current.education,
      skills: skills ?? current.skills,
      certifications: certifications ?? current.certifications,
      projects: projects ?? current.projects,
      extracted_data: updatedExtracted,
    });

    res.status(200).json({
      message: 'Extracted data reviewed and confirmed successfully',
      profile: updatedProfile,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to confirm extracted data';
    res.status(500).json({ error: msg });
  }
});

// GET /api/candidate/resume/file - Download original stored resume
router.get('/resume/file', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const profile = await getCandidateProfileByUserId(userId);

    if (!profile.original_resume || !fs.existsSync(profile.original_resume.file_path)) {
      res.status(404).json({ error: 'No original resume found for this profile' });
      return;
    }

    res.setHeader('Content-Type', profile.original_resume.mime_type || 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${encodeURIComponent(profile.original_resume.file_name)}"`
    );
    const fileStream = fs.createReadStream(profile.original_resume.file_path);
    fileStream.pipe(res);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve resume';
    res.status(500).json({ error: msg });
  }
});

export default router;
