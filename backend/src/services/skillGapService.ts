import { GoogleGenerativeAI } from '@google/generative-ai';
import { CandidateProfile, SkillItem } from '../models/candidateModel';
import {
  ExtractedJobRequirements,
  JobSkillRequirement,
  SkillGapItem,
  SkillGapStatus,
  EvidenceLevel,
  SkillGapSummary,
} from '../models/skillGapModel';

const GEMINI_TIMEOUT_MS = 25000;

const JOB_EXTRACTION_PROMPT = `
You are an expert technical recruiter and skill analyst for SkillBridge.
Analyze the following Job Description for the target role.
Extract the technical skills and competencies EXPLICITLY mentioned in the job description.

STRICT INSTRUCTIONS:
1. Divide skills strictly into:
   - "required_skills": Core technologies and mandatory skills explicitly demanded.
   - "preferred_skills": Nice-to-have, bonus, or advantageous technologies.
2. For each skill provide:
   - name: Standard technology name (e.g. "Java", "Spring Boot", "PostgreSQL", "Docker", "Kafka", "REST APIs", "AWS")
   - category: One of "programming_languages" | "frameworks" | "databases" | "tools_platforms" | "architecture_cloud" | "other"
   - description: Brief context or requirement notes from the description.
3. Extract experience level if mentioned (e.g. "Senior", "Mid-Level", "3-5 Years").
4. Return pure valid JSON adhering strictly to this schema:

{
  "required_skills": [
    { "name": string, "category": string, "description": string }
  ],
  "preferred_skills": [
    { "name": string, "category": string, "description": string }
  ],
  "experience_level": string,
  "key_responsibilities": string[]
}
`;

/**
 * Deterministic fallback extractor for job descriptions when GEMINI_API_KEY is not set or times out.
 */
function extractJobRequirementsLocally(jobText: string, targetRole: string): ExtractedJobRequirements {
  const KNOWN_TECH: { name: string; category: string }[] = [
    { name: 'Java', category: 'programming_languages' },
    { name: 'Python', category: 'programming_languages' },
    { name: 'SQL', category: 'programming_languages' },
    { name: 'TypeScript', category: 'programming_languages' },
    { name: 'JavaScript', category: 'programming_languages' },
    { name: 'Spring Boot', category: 'frameworks' },
    { name: 'Spring', category: 'frameworks' },
    { name: 'React', category: 'frameworks' },
    { name: 'Node.js', category: 'frameworks' },
    { name: 'Express', category: 'frameworks' },
    { name: 'PostgreSQL', category: 'databases' },
    { name: 'MySQL', category: 'databases' },
    { name: 'MongoDB', category: 'databases' },
    { name: 'Redis', category: 'databases' },
    { name: 'Docker', category: 'tools_platforms' },
    { name: 'Kubernetes', category: 'tools_platforms' },
    { name: 'Git', category: 'tools_platforms' },
    { name: 'REST APIs', category: 'tools_platforms' },
    { name: 'Microservices', category: 'architecture_cloud' },
    { name: 'AWS', category: 'architecture_cloud' },
    { name: 'Kafka', category: 'architecture_cloud' },
    { name: 'CI/CD', category: 'tools_platforms' },
  ];

  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  const detected: JobSkillRequirement[] = [];
  KNOWN_TECH.forEach((tech) => {
    const escaped = escapeRegExp(tech.name);
    const regex = new RegExp(`(^|[^a-zA-Z0-9+#])${escaped}($|[^a-zA-Z0-9+#])`, 'i');
    if (regex.test(jobText)) {
      detected.push({
        name: tech.name,
        category: tech.category,
        description: `Mentioned in ${targetRole} job requirements.`,
      });
    }
  });

  // Split into required vs preferred: First 70% as required, rest as preferred
  const splitIdx = Math.max(1, Math.ceil(detected.length * 0.7));
  const required = detected.slice(0, splitIdx);
  const preferred = detected.slice(splitIdx);

  return {
    required_skills: required,
    preferred_skills: preferred,
    experience_level: jobText.match(/\b(Senior|Lead|Mid-Level|Junior)\b/i)?.[0] || 'Mid-Senior Level',
    key_responsibilities: [
      `Design and implement backend services for ${targetRole}`,
      'Collaborate with cross-functional engineering teams',
      'Optimize database queries and maintain API reliability',
    ],
  };
}

export async function extractJobRequirementsWithGemini(
  jobDescription: string,
  targetRole: string
): Promise<{ extractedRequirements: ExtractedJobRequirements; source: 'gemini' | 'local_fallback' }> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your-gemini-api-key') {
    console.warn('[Gemini Job Extraction] GEMINI_API_KEY not configured. Using deterministic fallback.');
    const local = extractJobRequirementsLocally(jobDescription, targetRole);
    return { extractedRequirements: local, source: 'local_fallback' };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const prompt = `${JOB_EXTRACTION_PROMPT}\n\nTARGET ROLE: ${targetRole}\n\nJOB DESCRIPTION:\n${jobDescription}`;

    const geminiCall = model.generateContent(prompt);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 25s')), GEMINI_TIMEOUT_MS)
    );

    const result = await Promise.race([geminiCall, timeoutPromise]);
    let responseText = result.response.text().trim();

    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(responseText);

    const sanitizeSkills = (arr: any[]): JobSkillRequirement[] => {
      if (!Array.isArray(arr)) return [];
      return arr.map((item) => ({
        name: typeof item?.name === 'string' ? item.name.trim() : 'Technical Skill',
        category: typeof item?.category === 'string' ? item.category.trim() : 'other',
        description: typeof item?.description === 'string' ? item.description.trim() : '',
      })).filter((item) => item.name.length > 0);
    };

    const extracted: ExtractedJobRequirements = {
      required_skills: sanitizeSkills(parsed.required_skills),
      preferred_skills: sanitizeSkills(parsed.preferred_skills),
      experience_level: typeof parsed.experience_level === 'string' ? parsed.experience_level : undefined,
      key_responsibilities: Array.isArray(parsed.key_responsibilities)
        ? parsed.key_responsibilities.filter((r: any) => typeof r === 'string')
        : [],
    };

    return { extractedRequirements: extracted, source: 'gemini' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[Gemini Job Extraction Error] ${msg}. Using local fallback.`);
    const fallback = extractJobRequirementsLocally(jobDescription, targetRole);
    return { extractedRequirements: fallback, source: 'local_fallback' };
  }
}

/**
 * Normalizes skill names for comparison (e.g. "REST APIs" vs "REST API", "Postgres" vs "PostgreSQL")
 */
function normalizeSkillName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/apis?$/, 'api')
    .replace(/postgresql/, 'postgres')
    .replace(/reactjs/, 'react')
    .replace(/nodejs/, 'node');
}

/**
 * Compare candidate confirmed skills and career break against job requirements.
 * Produces explainable 4-tier diagnostic status:
 * - Demonstrated
 * - Needs Refresh
 * - Developing
 * - Not Yet Demonstrated
 *
 * Keeps distinctions explicit: AI Extracted, Candidate Confirmed, Demonstrated Evidence, Verified Evidence.
 */
export function analyzeSkillGap(
  candidateProfile: CandidateProfile,
  jobReqs: ExtractedJobRequirements
): { gapResults: SkillGapItem[]; summary: SkillGapSummary } {
  const confirmedSkills = candidateProfile.skills || [];
  const careerBreak = candidateProfile.career_break;
  const inBreak = Boolean(careerBreak?.in_break);
  const breakDuration = careerBreak?.duration || 'extended';

  // Check AI-extracted resume skills for distinction
  const aiExtractedNames = new Set<string>();
  if (candidateProfile.extracted_data?.technical_skills) {
    Object.values(candidateProfile.extracted_data.technical_skills).forEach((arr) => {
      arr.forEach((s: string) => aiExtractedNames.add(normalizeSkillName(s)));
    });
  }

  // Map of candidate confirmed skills
  const confirmedMap = new Map<string, SkillItem>();
  confirmedSkills.forEach((s) => {
    confirmedMap.set(normalizeSkillName(s.name), s);
  });

  const gapResults: SkillGapItem[] = [];

  // Helper to process a skill requirement
  const processSkill = (req: JobSkillRequirement, requirementLevel: 'required' | 'preferred') => {
    const normName = normalizeSkillName(req.name);
    const candidateSkill = confirmedMap.get(normName);
    const isAiExtracted = aiExtractedNames.has(normName);

    let status: SkillGapStatus;
    let evidenceLevel: EvidenceLevel;
    let explanation: string;
    let recommendation: string | undefined;

    if (candidateSkill) {
      // Skill is confirmed by candidate
      evidenceLevel = candidateSkill.evidence_level || 'Candidate Confirmed';

      if (candidateSkill.status === 'developing') {
        status = 'Developing';
        explanation = `Candidate confirmed active learning / developing competency in ${req.name}.`;
        recommendation = `Continue hands-on coursework and practical code exercises for ${req.name}.`;
      } else if (inBreak && !candidateSkill.evidence_level?.includes('Evidence')) {
        // Candidate has a career hiatus and no fresh evidence yet
        status = 'Needs Refresh';
        explanation = `Candidate has confirmed production background in ${req.name}, but a ${breakDuration} career hiatus indicates framework updates and current design patterns require refreshing.`;
        recommendation = `Complete a focused refresher covering modern versions, performance best practices, and error contracts for ${req.name}.`;
      } else {
        // Demonstrated competency with active practice or verified evidence
        status = 'Demonstrated';
        explanation = `Candidate has verified/confirmed practical capability in ${req.name}.`;
      }
    } else if (isAiExtracted) {
      // Found in resume extraction, but not yet explicitly confirmed
      evidenceLevel = 'AI Extracted';
      status = 'Needs Refresh';
      explanation = `Detected in resume extraction as historical skill, but requires explicit confirmation and currency refresh after career break.`;
      recommendation = `Confirm this skill in your profile and complete a targeted refresher.`;
    } else {
      // Not present in candidate profile
      evidenceLevel = 'None';
      status = 'Not Yet Demonstrated';
      explanation = `Demanded by job requirement, but not yet demonstrated or documented in candidate profile.`;
      recommendation = `Target ${req.name} for foundational learning to eliminate this requirement gap.`;
    }

    gapResults.push({
      skill_name: req.name,
      category: req.category || 'other',
      requirement_level: requirementLevel,
      status,
      evidence_level: evidenceLevel,
      explanation,
      recommendation,
    });
  };

  // Analyze required skills first
  jobReqs.required_skills.forEach((req) => processSkill(req, 'required'));

  // Analyze preferred skills
  jobReqs.preferred_skills.forEach((req) => processSkill(req, 'preferred'));

  // Calculate distinct counts (do not collapse into single opaque percentage)
  let demonstratedCount = 0;
  let needsRefreshCount = 0;
  let developingCount = 0;
  let notDemonstratedCount = 0;

  gapResults.forEach((item) => {
    if (item.status === 'Demonstrated') demonstratedCount++;
    else if (item.status === 'Needs Refresh') needsRefreshCount++;
    else if (item.status === 'Developing') developingCount++;
    else if (item.status === 'Not Yet Demonstrated') notDemonstratedCount++;
  });

  const total = gapResults.length;

  // Generate top actionable recommendations
  const topRecs: string[] = [];
  gapResults
    .filter((g) => g.status === 'Needs Refresh' && g.requirement_level === 'required')
    .slice(0, 3)
    .forEach((g) => {
      topRecs.push(`Priority Refresh: Update ${g.skill_name} to modern industry practices and versions.`);
    });

  gapResults
    .filter((g) => g.status === 'Not Yet Demonstrated' && g.requirement_level === 'required')
    .slice(0, 2)
    .forEach((g) => {
      topRecs.push(`Acquire Core Skill: ${g.skill_name} is required for this role—engage in targeted upskilling.`);
    });

  let narrative = '';
  if (demonstratedCount >= total * 0.6) {
    narrative = 'Strong alignment: Core competencies are demonstrated with clear practical readiness.';
  } else if (demonstratedCount + needsRefreshCount >= total * 0.5) {
    narrative = 'Promising foundational background: Candidate possesses key core skills; targeted skill refreshing will close evidence gaps.';
  } else {
    narrative = 'Skill development needed: Address essential job requirements through targeted learning and evidence building.';
  }

  const summary: SkillGapSummary = {
    total_skills_analyzed: total,
    demonstrated_count: demonstratedCount,
    needs_refresh_count: needsRefreshCount,
    developing_count: developingCount,
    not_demonstrated_count: notDemonstratedCount,
    summary_narrative: narrative,
    top_recommendations: topRecs,
  };

  return { gapResults, summary };
}
