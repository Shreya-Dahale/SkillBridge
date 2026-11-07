import { GoogleGenerativeAI } from '@google/generative-ai';
// @ts-ignore
const { PDFParse } = require('pdf-parse');
import { ExtractedData, ExtractedSkills } from '../models/candidateModel';

const GEMINI_TIMEOUT_MS = 25000;

export async function validatePdfBuffer(buffer: Buffer): Promise<{ numPages: number; text: string }> {
  if (!buffer || buffer.length === 0) {
    throw new Error('Invalid PDF: Uploaded file is empty');
  }

  // Check PDF magic header '%PDF-'
  const header = buffer.subarray(0, 5).toString('ascii');
  if (header !== '%PDF-') {
    throw new Error('Invalid PDF: File does not have a valid PDF header (%PDF-)');
  }

  try {
    const parser = new PDFParse(new Uint8Array(buffer));
    const data = await parser.getText();
    return {
      numPages: data.total || 1,
      text: data.text || '',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Corrupted or unreadable PDF: ${message}`);
  }
}

const EXTRACTION_PROMPT = `
You are an expert, objective resume parser for SkillBridge.
Your goal is to extract information that is EXPLICITLY PRESENT in the resume text.

STRICT INSTRUCTIONS:
1. Extract ONLY facts, names, roles, skills, and dates directly written in the text.
2. DO NOT INVENT, ASSUME, OR INFER ANY SKILLS OR EXPERIENCE. If a skill, project, or role is not explicitly written in the resume, DO NOT include it.
3. Categorize technical skills strictly into:
   - programming_languages (e.g. Java, Python, TypeScript, SQL)
   - frameworks (e.g. Spring Boot, React, Node.js, Express)
   - databases (e.g. PostgreSQL, MySQL, MongoDB)
   - tools_platforms (e.g. Docker, Git, AWS, Kubernetes, Linux)
4. Check for career gap, career hiatus, or career break information (duration and reason if stated). If none is mentioned, set career_break to null.
5. Extract job titles, organizations, and employment dates for each experience entry.
6. Return purely valid JSON with NO markdown formatting, matching this exact JSON schema:

{
  "name": string or null,
  "target_role": string or null,
  "career_break": {
    "duration": string or null,
    "reason": string or null
  } or null,
  "experience": [
    {
      "job_title": string,
      "organization": string,
      "dates": string,
      "description": string
    }
  ],
  "education": [
    {
      "degree": string,
      "institution": string,
      "dates": string
    }
  ],
  "technical_skills": {
    "programming_languages": string[],
    "frameworks": string[],
    "databases": string[],
    "tools_platforms": string[]
  },
  "certifications": string[],
  "projects": [
    {
      "title": string,
      "description": string,
      "technologies": string[]
    }
  ]
}
`;

function sanitizeExtractedData(parsed: any): ExtractedData {
  const sanitizeString = (val: any): string | null => {
    return typeof val === 'string' && val.trim().length > 0 ? val.trim() : null;
  };

  const sanitizeStringArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
  };

  const technical_skills: ExtractedSkills = {
    programming_languages: sanitizeStringArray(parsed?.technical_skills?.programming_languages),
    frameworks: sanitizeStringArray(parsed?.technical_skills?.frameworks),
    databases: sanitizeStringArray(parsed?.technical_skills?.databases),
    tools_platforms: sanitizeStringArray(parsed?.technical_skills?.tools_platforms),
  };

  const experience = Array.isArray(parsed?.experience)
    ? parsed.experience.map((exp: any) => ({
        job_title: typeof exp?.job_title === 'string' ? exp.job_title.trim() : '',
        organization: typeof exp?.organization === 'string' ? exp.organization.trim() : '',
        dates: typeof exp?.dates === 'string' ? exp.dates.trim() : '',
        description: typeof exp?.description === 'string' ? exp.description.trim() : '',
      }))
    : [];

  const education = Array.isArray(parsed?.education)
    ? parsed.education.map((edu: any) => ({
        degree: typeof edu?.degree === 'string' ? edu.degree.trim() : '',
        institution: typeof edu?.institution === 'string' ? edu.institution.trim() : '',
        dates: typeof edu?.dates === 'string' ? edu.dates.trim() : '',
      }))
    : [];

  const projects = Array.isArray(parsed?.projects)
    ? parsed.projects.map((proj: any) => ({
        title: typeof proj?.title === 'string' ? proj.title.trim() : '',
        description: typeof proj?.description === 'string' ? proj.description.trim() : '',
        technologies: sanitizeStringArray(proj?.technologies),
      }))
    : [];

  return {
    name: sanitizeString(parsed?.name),
    target_role: sanitizeString(parsed?.target_role),
    career_break: parsed?.career_break
      ? {
          duration: sanitizeString(parsed.career_break.duration),
          reason: sanitizeString(parsed.career_break.reason),
        }
      : null,
    experience,
    education,
    technical_skills,
    certifications: sanitizeStringArray(parsed?.certifications),
    projects,
    extracted_at: new Date().toISOString(),
    status: 'pending_review',
  };
}

/**
 * Deterministic local fallback extractor when GEMINI_API_KEY is not configured
 * or network fails. Extracts ONLY explicitly written keywords from PDF text.
 */
export function extractFromTextLocally(text: string): ExtractedData {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  let name: string | null = null;
  let target_role: string | null = null;
  let breakDuration: string | null = null;
  let breakReason: string | null = null;

  // Search for name / role pattern in header lines
  for (const line of lines.slice(0, 5)) {
    if (line.includes(' - ')) {
      const parts = line.split(' - ');
      name = parts[0].trim();
      target_role = parts[1].trim();
    } else if (!name && line.length < 50 && !line.toLowerCase().includes('skills')) {
      name = line;
    }
  }

  // Check for Career Break / Gap pattern
  const breakMatch = text.match(/Career Break:\s*([^|\n]+)/i);
  if (breakMatch) {
    breakDuration = breakMatch[1].trim();
  }
  const reasonMatch = text.match(/Reason:\s*([^|\n]+)/i);
  if (reasonMatch) {
    breakReason = reasonMatch[1].trim();
  }

  // Check target role
  const targetMatch = text.match(/Target Role:\s*([^\n|]+)/i);
  if (targetMatch) {
    target_role = targetMatch[1].trim();
  }

  // Common technologies to match strictly against text
  const KNOWN_LANGUAGES = ['Java', 'Python', 'TypeScript', 'JavaScript', 'SQL', 'C++', 'C#', 'Go', 'Rust', 'Ruby'];
  const KNOWN_FRAMEWORKS = ['Spring Boot', 'Spring', 'React', 'Node.js', 'Express', 'Angular', 'Vue', 'Django', 'Flask'];
  const KNOWN_DATABASES = ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Oracle', 'SQLite'];
  const KNOWN_TOOLS = ['Git', 'Docker', 'Kubernetes', 'AWS', 'Linux', 'Microservices', 'REST APIs', 'REST API', 'CI/CD'];

  const foundLanguages: string[] = [];
  const foundFrameworks: string[] = [];
  const foundDatabases: string[] = [];
  const foundTools: string[] = [];

  function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function matchesKeyword(keyword: string, content: string): boolean {
    const escaped = escapeRegExp(keyword);
    const regex = new RegExp(`(^|[^a-zA-Z0-9+#])${escaped}($|[^a-zA-Z0-9+#])`, 'i');
    return regex.test(content);
  }

  KNOWN_LANGUAGES.forEach((lang) => {
    if (matchesKeyword(lang, text)) foundLanguages.push(lang);
  });
  KNOWN_FRAMEWORKS.forEach((fw) => {
    if (matchesKeyword(fw, text)) foundFrameworks.push(fw);
  });
  KNOWN_DATABASES.forEach((db) => {
    if (matchesKeyword(db, text)) foundDatabases.push(db);
  });
  KNOWN_TOOLS.forEach((tool) => {
    if (matchesKeyword(tool, text)) foundTools.push(tool);
  });

  // Extract experience if any
  const expMatch = text.match(/Previous Experience:\s*([^|\n]+)/i);
  const experience = expMatch
    ? [
        {
          job_title: target_role || 'Developer',
          organization: 'Previous Employer',
          dates: expMatch[1].trim(),
          description: 'Software development experience stated in resume.',
        },
      ]
    : [];

  return {
    name,
    target_role,
    career_break: breakDuration ? { duration: breakDuration, reason: breakReason } : null,
    experience,
    education: [],
    technical_skills: {
      programming_languages: foundLanguages,
      frameworks: foundFrameworks,
      databases: foundDatabases,
      tools_platforms: foundTools,
    },
    certifications: [],
    projects: [],
    extracted_at: new Date().toISOString(),
    status: 'pending_review',
  };
}

export async function extractResumeWithGemini(
  pdfBuffer: Buffer,
  fileName: string
): Promise<{ extractedData: ExtractedData; extractionSource: 'gemini' | 'local_fallback' }> {
  // 1. Validate PDF format and extract text
  const { text } = await validatePdfBuffer(pdfBuffer);

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your-gemini-api-key') {
    console.warn('[Gemini] GEMINI_API_KEY not configured. Using strict local deterministic text extractor.');
    const data = extractFromTextLocally(text);
    return { extractedData: data, extractionSource: 'local_fallback' };
  }

  // 2. Call REAL Gemini API
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.0, // Zero temperature to prevent hallucinations
      },
    });

    const promptText = `${EXTRACTION_PROMPT}\n\nRESUME FILE NAME: ${fileName}\n\nRESUME FULL TEXT CONTENT:\n${text}`;

    // Execute with timeout
    const geminiCall = model.generateContent(promptText);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 25 seconds')), GEMINI_TIMEOUT_MS)
    );

    const result = await Promise.race([geminiCall, timeoutPromise]);
    const responseText = result.response.text();

    if (!responseText || responseText.trim().length === 0) {
      throw new Error('Malformed response: Gemini returned empty content');
    }

    // Strip markdown code fences if returned
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(cleanJson);
    const sanitized = sanitizeExtractedData(parsed);

    return { extractedData: sanitized, extractionSource: 'gemini' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Gemini Error] ${errorMsg}. Falling back to strict deterministic text parser.`);
    // In case of API failure, timeout, or quota errors, fallback to deterministic extraction
    const fallbackData = extractFromTextLocally(text);
    return { extractedData: fallbackData, extractionSource: 'local_fallback' };
  }
}
