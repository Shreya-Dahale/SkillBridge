import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import * as XLSX from 'xlsx';
import { pool } from '../config/db';

const reportsDir = path.join(__dirname, '../../reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

// Gather all candidate data from DB (with fallback to model cache)
async function gatherCandidateData(candidateId: string) {
  if (pool) {
    try {
      const profileRes = await pool.query(
        `SELECT cp.*, u.name, u.email FROM candidate_profiles cp
         JOIN users u ON cp.user_id = u.id WHERE cp.user_id=$1 LIMIT 1`,
        [candidateId]
      );
      const profile = profileRes.rows[0] || null;

      const skillGapRes = await pool.query(
        `SELECT * FROM skill_gap_analyses WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1`,
        [candidateId]
      );
      const skillGap = skillGapRes.rows[0] || null;

      const assessmentsRes = await pool.query(
        `SELECT * FROM assessment_submissions WHERE user_id=$1 ORDER BY created_at DESC`,
        [candidateId]
      );
      const assessments = assessmentsRes.rows;

      const projectsRes = await pool.query(
        `SELECT * FROM project_applications WHERE user_id=$1 ORDER BY created_at DESC`,
        [candidateId]
      );
      const projects = projectsRes.rows;

      const evidenceRes = await pool.query(
        `SELECT * FROM evidence_records WHERE user_id=$1 ORDER BY created_at DESC`,
        [candidateId]
      );
      const evidence = evidenceRes.rows;

      const refsRes = await pool.query(
        `SELECT * FROM professional_references WHERE candidate_id=$1 ORDER BY created_at DESC`,
        [candidateId]
      );
      const references = refsRes.rows;

      const appRes = await pool.query(
        `SELECT ja.*, j.title AS job_title, ep.company_name
         FROM job_applications ja JOIN jobs j ON ja.job_id=j.id
         LEFT JOIN employer_profiles ep ON j.employer_id=ep.user_id
         WHERE ja.candidate_id=$1 ORDER BY ja.updated_at DESC`,
        [candidateId]
      );
      const applications = appRes.rows;

      return { profile, skillGap, assessments, projects, evidence, references, applications };
    } catch {
      // Fall through to model methods
    }
  }

  // Model fallback
  const { getCandidateProfileByUserId } = await import('../models/candidateModel');
  const { findUserById } = await import('../models/userModel');
  const { getLatestSkillGapAnalysis } = await import('../models/skillGapModel');
  const { getSubmissionsByUser } = await import('../models/assessmentModel');
  const { getProjectApplicationsByUser } = await import('../models/projectModel');
  const { getEvidenceByUser } = await import('../models/evidenceModel');
  const { getCandidateReferences } = await import('../models/mentorFellowshipModel');
  const { getCandidateApplications } = await import('../models/employerModel');

  const user = await findUserById(candidateId);
  const p = await getCandidateProfileByUserId(candidateId);
  const profile = {
    ...p,
    name: user?.name || 'Candidate',
    email: user?.email || '',
  };
  const skillGap = await getLatestSkillGapAnalysis(candidateId);
  const assessments = await getSubmissionsByUser(candidateId);
  const projects = await getProjectApplicationsByUser(candidateId);
  const evidence = await getEvidenceByUser(candidateId);
  const references = await getCandidateReferences(candidateId);
  const applications = await getCandidateApplications(candidateId);

  return { profile, skillGap, assessments, projects, evidence, references, applications };
}

// ---- PDF Generation ----

export async function generateCandidatePdf(candidateId: string): Promise<string> {
  const { profile, skillGap, assessments, projects, evidence, references, applications } = await gatherCandidateData(candidateId);

  const fileName = `report_${candidateId}_${Date.now()}.pdf`;
  const filePath = path.join(reportsDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Helper functions
    const h1 = (text: string) => {
      doc.fontSize(20).fillColor('#4338ca').text(text, { underline: false });
      doc.moveDown(0.5);
    };
    const h2 = (text: string) => {
      doc.fontSize(14).fillColor('#1e1b4b').text(text);
      doc.moveDown(0.3);
    };
    const bodyText = (text: string) => {
      doc.fontSize(10).fillColor('#334155').text(text);
      doc.moveDown(0.2);
    };
    const separator = () => {
      doc.moveDown(0.5).strokeColor('#c7d2fe').lineWidth(0.5)
        .moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
    };

    // Header
    doc.fontSize(26).fillColor('#4338ca').text('SkillBridge', { align: 'center' });
    doc.fontSize(11).fillColor('#64748b').text('Candidate Evidence Report', { align: 'center' });
    doc.moveDown(0.5);
    bodyText(`Generated: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
    separator();

    // Candidate Profile
    if (profile) {
      h1('Candidate Profile');
      h2(profile.name || 'Unknown Candidate');
      bodyText(`Email: ${profile.email || 'N/A'}`);
      bodyText(`Location: ${profile.location || 'N/A'}`);
      bodyText(`Phone: ${profile.phone || 'N/A'}`);
      bodyText(`Target Role: ${profile.target_role || 'N/A'}`);
      if (profile.bio) bodyText(`Bio: ${profile.bio}`);
      separator();

      // Career Break
      const cb = typeof profile.career_break === 'string' ? JSON.parse(profile.career_break || '{}') : (profile.career_break || {});
      if (cb && cb.in_break) {
        h1('Career Break Information');
        bodyText(`Duration: ${cb.duration || 'N/A'}`);
        bodyText(`Reason: ${cb.reason || 'N/A'}`);
        bodyText(`Period: ${cb.start_date || ''} → ${cb.end_date || ''}`);
        separator();
      }

      // Career History
      const history = typeof profile.career_history === 'string' ? JSON.parse(profile.career_history || '[]') : (profile.career_history || []);
      if (history && history.length > 0) {
        h1('Career History');
        for (const job of history) {
          h2(`${job.title || ''} at ${job.company || ''}`);
          bodyText(`Period: ${job.start_date || ''} - ${job.end_date || 'Present'}`);
          if (job.description) bodyText(job.description);
          doc.moveDown(0.3);
        }
        separator();
      }

      // Education
      const education = typeof profile.education === 'string' ? JSON.parse(profile.education || '[]') : (profile.education || []);
      if (education && education.length > 0) {
        h1('Education');
        for (const edu of education) {
          bodyText(`${edu.degree || ''} - ${edu.institution || ''} (${edu.year || ''})`);
        }
        separator();
      }

      // Confirmed Skills
      const skills = typeof profile.skills === 'string' ? JSON.parse(profile.skills || '[]') : (profile.skills || []);
      if (skills && skills.length > 0) {
        h1('Confirmed Skills');
        const skillNames = skills.map((s: { name?: string } | string) => typeof s === 'string' ? s : (s.name || '')).join(', ');
        bodyText(skillNames);
        separator();
      }
    }

    // Skill Gap
    if (skillGap) {
      h1('Skill Gap Analysis');
      bodyText(`Target Role: ${skillGap.target_role || 'N/A'}`);
      const results = typeof skillGap.gap_analysis_results === 'string'
        ? JSON.parse(skillGap.gap_analysis_results || '[]')
        : (skillGap.gap_analysis_results || []);
      for (const item of results.slice(0, 20)) {
        bodyText(`• ${item.skill || ''}: ${item.status || ''}`);
      }
      separator();
    }

    // Assessments
    if (assessments && assessments.length > 0) {
      h1('Assessment Results');
      for (const a of assessments) {
        h2(a.assessment_title || a.skill || 'Assessment');
        bodyText(`Score: ${a.score_raw || a.score || 'N/A'} | Status: ${a.status || 'N/A'}`);
        if (a.feedback) bodyText(`Feedback: ${a.feedback}`);
        bodyText(`Date: ${a.created_at ? new Date(a.created_at as string).toLocaleDateString('en-IN') : 'N/A'}`);
        doc.moveDown(0.3);
      }
      separator();
    }

    // Projects
    if (projects && projects.length > 0) {
      h1('Project Submissions');
      for (const p of projects) {
        h2(p.project_title || 'Project');
        bodyText(`Status: ${p.status || 'N/A'}`);
        if (p.evaluator_score != null) bodyText(`Score: ${p.evaluator_score}`);
        if (p.evaluator_feedback) bodyText(`Feedback: ${p.evaluator_feedback}`);
        doc.moveDown(0.3);
      }
      separator();
    }

    // Evidence Passport
    if (evidence && evidence.length > 0) {
      h1('Skill Freshness Passport');
      for (const e of evidence) {
        bodyText(`• ${e.skill || ''} [${e.status || ''}] — ${e.source_title || ''} — Score: ${e.score || 'N/A'} — ${e.date || ''}`);
        if (e.feedback) bodyText(`  Feedback: ${e.feedback}`);
      }
      separator();
    }

    // Applications
    if (applications && applications.length > 0) {
      h1('Job Applications');
      for (const app of applications) {
        bodyText(`• ${(app as Record<string, unknown>).job_title || 'Job'} at ${(app as Record<string, unknown>).company_name || 'Company'} — Status: ${app.status || 'Applied'}`);
        if (app.employer_feedback) bodyText(`  Employer Feedback: ${app.employer_feedback}`);
      }
      separator();
    }

    // References
    if (references && references.length > 0) {
      h1('Professional References');
      for (const r of references) {
        h2(r.name || 'Reference');
        bodyText(`${r.relationship || ''} at ${r.company || ''}`);
        bodyText(`Email: ${r.email || 'N/A'} | Phone: ${r.phone || 'N/A'}`);
        doc.moveDown(0.3);
      }
    }

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

// ---- CSV Generation ----

export async function generateCandidateCsv(candidateId: string): Promise<string> {
  const { profile, assessments, evidence, applications } = await gatherCandidateData(candidateId);

  const fileName = `report_${candidateId}_${Date.now()}.csv`;
  const filePath = path.join(reportsDir, fileName);

  const rows: string[][] = [];
  rows.push(['Section', 'Field', 'Value']);

  if (profile) {
    rows.push(['Profile', 'Name', profile.name || '']);
    rows.push(['Profile', 'Email', profile.email || '']);
    rows.push(['Profile', 'Target Role', profile.target_role || '']);
    rows.push(['Profile', 'Location', profile.location || '']);
    const skills = typeof profile.skills === 'string' ? JSON.parse(profile.skills || '[]') : (profile.skills || []);
    const skillNames = skills.map((s: { name?: string } | string) => typeof s === 'string' ? s : (s.name || '')).join('; ');
    rows.push(['Skills', 'Confirmed Skills', skillNames]);
  }

  for (const a of assessments) {
    rows.push(['Assessment', a.assessment_title || a.skill || '', `${a.score_raw || a.score || ''} | ${a.status || ''}`]);
  }

  for (const e of evidence) {
    rows.push(['Evidence', `${e.skill || ''} [${e.status || ''}]`, `${e.source_title || ''} | Score: ${e.score || ''}`]);
  }

  for (const app of applications) {
    rows.push(['Application', `${(app as Record<string, unknown>).job_title || ''} at ${(app as Record<string, unknown>).company_name || ''}`, app.status || '']);
  }

  const csvContent = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  fs.writeFileSync(filePath, csvContent, 'utf8');
  return filePath;
}

// ---- XLSX Generation ----

export async function generateCandidateXlsx(candidateId: string): Promise<string> {
  const { profile, skillGap, assessments, projects, evidence, applications, references } = await gatherCandidateData(candidateId);

  const fileName = `report_${candidateId}_${Date.now()}.xlsx`;
  const filePath = path.join(reportsDir, fileName);

  const wb = XLSX.utils.book_new();

  // Profile sheet
  if (profile) {
    const skills = typeof profile.skills === 'string' ? JSON.parse(profile.skills || '[]') : (profile.skills || []);
    const skillNames = skills.map((s: { name?: string } | string) => typeof s === 'string' ? s : (s.name || '')).join(', ');
    const ws = XLSX.utils.aoa_to_sheet([
      ['Field', 'Value'],
      ['Name', profile.name || ''],
      ['Email', profile.email || ''],
      ['Target Role', profile.target_role || ''],
      ['Location', profile.location || ''],
      ['Phone', profile.phone || ''],
      ['Bio', profile.bio || ''],
      ['Confirmed Skills', skillNames],
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Profile');
  }

  // Skill Gap sheet
  if (skillGap) {
    const results = typeof skillGap.gap_analysis_results === 'string'
      ? JSON.parse(skillGap.gap_analysis_results || '[]')
      : (skillGap.gap_analysis_results || []);
    const rows: string[][] = [['Skill', 'Status', 'Category']];
    for (const item of results) {
      rows.push([item.skill || '', item.status || '', item.category || '']);
    }
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Skill Gap');
  }

  // Assessments sheet
  if (assessments.length > 0) {
    const rows: string[][] = [['Assessment', 'Skill', 'Score', 'Status', 'Date', 'Feedback']];
    for (const a of assessments) {
      rows.push([
        a.assessment_title || '', a.skill || '',
        String(a.score_raw || a.score || ''), a.status || '',
        a.created_at ? new Date(a.created_at as string).toLocaleDateString('en-IN') : '',
        a.feedback || '',
      ]);
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Assessments');
  }

  // Projects sheet
  if (projects.length > 0) {
    const rows: string[][] = [['Project', 'Status', 'Score', 'Feedback']];
    for (const p of projects) {
      rows.push([p.project_title || '', p.status || '', String(p.evaluator_score ?? ''), p.evaluator_feedback || '']);
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Projects');
  }

  // Evidence sheet
  if (evidence.length > 0) {
    const rows: string[][] = [['Skill', 'Status', 'Source', 'Score', 'Date', 'Evaluator', 'Feedback']];
    for (const e of evidence) {
      rows.push([e.skill || '', e.status || '', e.source_title || '', e.score || '', e.date || '', e.evaluator || '', e.feedback || '']);
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Evidence Passport');
  }

  // Applications sheet
  if (applications.length > 0) {
    const rows: string[][] = [['Job', 'Company', 'Status', 'Feedback']];
    for (const app of applications) {
      rows.push([
        String((app as Record<string, unknown>).job_title || ''),
        String((app as Record<string, unknown>).company_name || ''),
        app.status || '',
        app.employer_feedback || '',
      ]);
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Applications');
  }

  // References sheet
  if (references.length > 0) {
    const rows: string[][] = [['Name', 'Relationship', 'Company', 'Email', 'Phone']];
    for (const r of references) {
      rows.push([r.name || '', r.relationship || '', r.company || '', r.email || '', r.phone || '']);
    }
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'References');
  }

  XLSX.writeFile(wb, filePath);
  return filePath;
}
