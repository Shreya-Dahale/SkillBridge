import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CandidateProfile,
  SkillItem,
  ExperienceItem,
  ExtractedData,
} from '../types/candidate';
import {
  User,
  Upload,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  ShieldCheck,
  X,
} from '../components/Icons';

export const CandidateProfilePage: React.FC = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Resume Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Editable Profile Form State (Confirmed Data)
  const [targetRole, setTargetRole] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [inBreak, setInBreak] = useState(false);
  const [breakDuration, setBreakDuration] = useState('');
  const [breakReason, setBreakReason] = useState('');
  const [careerHistory, setCareerHistory] = useState<ExperienceItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);

  // AI Extracted Review State (Editing before accepting)
  const [extractedReview, setExtractedReview] = useState<ExtractedData | null>(null);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('programming_languages');

  // Load Profile on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/candidate/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load profile');

      const p: CandidateProfile = data.profile;
      setProfile(p);
      setTargetRole(p.target_role || '');
      setBio(p.bio || '');
      setPhone(p.phone || '');
      setLocation(p.location || '');
      setInBreak(p.career_break?.in_break || false);
      setBreakDuration(p.career_break?.duration || '');
      setBreakReason(p.career_break?.reason || '');
      setCareerHistory(p.career_history || []);
      setSkills(p.skills || []);

      if (p.extracted_data && p.extracted_data.status === 'pending_review') {
        setExtractedReview(p.extracted_data);
      } else {
        setExtractedReview(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading candidate profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Please select a valid PDF file (.pdf)');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUploadResume = async (fileToUpload?: File) => {
    const file = fileToUpload || selectedFile;
    if (!file) {
      setError('Please choose a PDF file to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMsg(null);
    setUploadProgressMsg('Uploading PDF to secure server & extracting with Gemini AI...');

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await fetch('/api/candidate/resume', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Resume extraction failed');

      setProfile(data.profile);
      setExtractedReview(data.extracted_data);
      setSuccessMsg(`Resume successfully uploaded! AI extracted data is ready for your review.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgressMsg(null);
    }
  };

  // Helper to load sample resume (Priya Sharma)
  const handleLoadSampleResume = async () => {
    try {
      setIsUploading(true);
      setUploadProgressMsg('Loading sample resume (Priya Sharma)...');
      setError(null);

      const samplePdfContent = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R >> endobj
4 0 obj << /Length 250 >> stream
BT
/F1 18 Tf 50 720 Td (Priya Sharma - Senior Java Backend Developer) Tj
/F1 12 Tf 0 -30 Td (Career Break: 3 Years | Reason: Childcare & Upskilling) Tj
0 -25 Td (Previous Experience: 4 Years at Apex Global Tech) Tj
0 -25 Td (Skills: Java, Spring Boot, SQL, PostgreSQL, REST APIs, Git, Docker, Microservices) Tj
ET
endstream endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000216 00000 n
trailer << /Size 5 /Root 1 0 R >>
startxref
530
%%EOF`;

      const blob = new Blob([samplePdfContent], { type: 'application/pdf' });
      const sampleFile = new File([blob], 'Priya_Sharma_Resume.pdf', { type: 'application/pdf' });

      await handleUploadResume(sampleFile);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load sample resume');
      setIsUploading(false);
    }
  };

  // Remove skill from extracted review
  const handleRemoveExtractedSkill = (category: keyof ExtractedData['technical_skills'], skillToRemove: string) => {
    if (!extractedReview) return;
    const currentList = extractedReview.technical_skills[category] || [];
    setExtractedReview({
      ...extractedReview,
      technical_skills: {
        ...extractedReview.technical_skills,
        [category]: currentList.filter((s) => s !== skillToRemove),
      },
    });
  };

  // Add skill to extracted review
  const handleAddExtractedSkill = () => {
    if (!extractedReview || !newSkillName.trim()) return;
    const category = newSkillCategory as keyof ExtractedData['technical_skills'];
    const currentList = extractedReview.technical_skills[category] || [];
    if (!currentList.includes(newSkillName.trim())) {
      setExtractedReview({
        ...extractedReview,
        technical_skills: {
          ...extractedReview.technical_skills,
          [category]: [...currentList, newSkillName.trim()],
        },
      });
    }
    setNewSkillName('');
  };

  // Candidate accepts and confirms AI-extracted data
  const handleConfirmExtraction = async () => {
    if (!extractedReview) return;
    setIsLoading(true);
    setError(null);

    const confirmedSkills: SkillItem[] = [];
    Object.entries(extractedReview.technical_skills).forEach(([category, list]) => {
      list.forEach((skill: string) => {
        confirmedSkills.push({ name: skill, category });
      });
    });

    const payload = {
      target_role: extractedReview.target_role || targetRole,
      career_break: {
        in_break: Boolean(extractedReview.career_break?.duration),
        duration: extractedReview.career_break?.duration || '',
        reason: extractedReview.career_break?.reason || '',
      },
      career_history: extractedReview.experience.length > 0 ? extractedReview.experience : careerHistory,
      skills: confirmedSkills,
    };

    try {
      const res = await fetch('/api/candidate/confirm-extraction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to confirm extracted data');

      setProfile(data.profile);
      setTargetRole(data.profile.target_role || '');
      setInBreak(data.profile.career_break?.in_break || false);
      setBreakDuration(data.profile.career_break?.duration || '');
      setBreakReason(data.profile.career_break?.reason || '');
      setCareerHistory(data.profile.career_history || []);
      setSkills(data.profile.skills || []);
      setExtractedReview(null);
      setSuccessMsg('AI-extracted information successfully reviewed and saved to your profile!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Confirmation failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Candidate saves confirmed profile edits
  const handleSaveConfirmedProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      target_role: targetRole,
      bio,
      phone,
      location,
      career_break: {
        in_break: inBreak,
        duration: breakDuration,
        reason: breakReason,
      },
      career_history: careerHistory,
      skills,
    };

    try {
      const res = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');

      setProfile(data.profile);
      setSuccessMsg('Candidate profile updated successfully!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Add career history entry manually
  const handleAddExperience = () => {
    setCareerHistory([
      ...careerHistory,
      { job_title: '', organization: '', dates: '', description: '' },
    ]);
  };

  const handleUpdateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    const updated = [...careerHistory];
    updated[index] = { ...updated[index], [field]: value };
    setCareerHistory(updated);
  };

  const handleRemoveExperience = (index: number) => {
    setCareerHistory(careerHistory.filter((_, i) => i !== index));
  };

  // Confirmed skill helpers
  const handleRemoveConfirmedSkill = (skillName: string) => {
    setSkills(skills.filter((s) => s.name !== skillName));
  };

  const [profileNewSkill, setProfileNewSkill] = useState('');
  const [profileNewSkillCat, setProfileNewSkillCat] = useState('programming_languages');
  const handleAddConfirmedSkill = () => {
    if (!profileNewSkill.trim()) return;
    if (!skills.some((s) => s.name.toLowerCase() === profileNewSkill.trim().toLowerCase())) {
      setSkills([...skills, { name: profileNewSkill.trim(), category: profileNewSkillCat }]);
    }
    setProfileNewSkill('');
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Candidate Portfolio
            </span>
            <span className="status-badge badge-slate badge-sm">Resume & Profile Hub</span>
          </div>
          <h1 className="page-title">Candidate Profile & Career Information</h1>
          <p className="page-subtitle">
            Upload your resume for real Gemini AI extraction, review extracted skills, and manage your verified career profile.
          </p>
        </div>

        <div className="page-header-actions">
          <Link to="/skills" className="btn btn-outline">
            Skill Gap Analysis →
          </Link>
          <Link to="/passport" className="btn btn-primary">
            <ShieldCheck className="w-4 h-4 mr-1" />
            Skill Passport
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="success-banner">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* SECTION 1: Resume Upload & Gemini Extraction */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Upload className="w-4 h-4 text-indigo-600" />
              1. Resume PDF Upload & AI Extraction
            </h3>
            <p className="card-desc">
              Upload your resume in PDF format. Gemini AI analyzes and extracts your verified experience, career-break information, and technical skills into structured data.
            </p>
          </div>
        </div>

        <div
          style={{
            border: '2px dashed var(--slate-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--slate-50)',
            transition: 'border-color 0.15s ease',
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <FileText className="w-6 h-6" />
          </div>

          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--slate-800)', marginBottom: '0.25rem' }}>
            Select your PDF resume
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginBottom: '1.25rem' }}>
            PDF files only (max 10MB) · Extracted server-side with Gemini 2.5 Flash
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={isUploading}
              style={{ display: 'none' }}
              id="resume-file-input"
            />
            <label htmlFor="resume-file-input" className="btn btn-outline" style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}>
              <Upload className="w-4 h-4 mr-1" />
              {selectedFile ? selectedFile.name : 'Choose PDF File'}
            </label>

            <button
              type="button"
              onClick={() => handleUploadResume()}
              disabled={isUploading || !selectedFile}
              className="btn btn-primary"
            >
              {isUploading ? 'Extracting with Gemini...' : 'Upload & Extract'}
            </button>

            <button
              type="button"
              onClick={handleLoadSampleResume}
              disabled={isUploading}
              className="btn btn-secondary"
              title="Load Priya Sharma's sample resume for demonstration"
            >
              <Sparkles className="w-4 h-4 mr-1 text-indigo-600" />
              Load Priya Sharma Demo Resume
            </button>
          </div>

          {uploadProgressMsg && (
            <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>
              <div className="loading-spinner-ring" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
              <span>{uploadProgressMsg}</span>
            </div>
          )}
        </div>

        {/* Current Stored Resume Details */}
        {profile?.original_resume && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.85rem 1rem',
              backgroundColor: '#ffffff',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <strong style={{ fontSize: '0.875rem', color: 'var(--slate-900)' }}>
                  {profile.original_resume.file_name}
                </strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  {(profile.original_resume.file_size / 1024).toFixed(1)} KB · Stored securely on server · Uploaded {new Date(profile.original_resume.uploaded_at).toLocaleString()}
                </div>
              </div>
            </div>

            <a
              href="/api/candidate/resume/file"
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1" />
              View / Download Stored PDF
            </a>
          </div>
        )}
      </div>

      {/* SECTION 2: AI-Extracted Data Review (Stored Separately from Confirmed Profile) */}
      {extractedReview && (
        <div className="card" style={{ marginBottom: '1.75rem', borderColor: '#c7d2fe', backgroundColor: '#faf5ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="status-badge badge-developing badge-md">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini AI Extraction Review
              </span>
              <span className="status-badge badge-pending badge-sm">
                Pending Candidate Confirmation
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExtractedReview(null)}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--slate-500)' }}
            >
              <X className="w-4 h-4 mr-1" />
              Dismiss Review
            </button>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '1.25rem' }}>
            The details below were extracted directly from your resume by Gemini without hallucination. You can review, edit, add or remove skills before accepting them into your confirmed profile.
          </p>

          <div className="profile-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="profile-field">
              <label>Extracted Full Name</label>
              <input
                type="text"
                value={extractedReview.name || ''}
                onChange={(e) => setExtractedReview({ ...extractedReview, name: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="profile-field">
              <label>Detected Target Role</label>
              <input
                type="text"
                value={extractedReview.target_role || ''}
                onChange={(e) => setExtractedReview({ ...extractedReview, target_role: e.target.value })}
                className="form-input"
              />
            </div>

            <div className="profile-field">
              <label>Career Break Duration</label>
              <input
                type="text"
                value={extractedReview.career_break?.duration || ''}
                onChange={(e) =>
                  setExtractedReview({
                    ...extractedReview,
                    career_break: {
                      duration: e.target.value,
                      reason: extractedReview.career_break?.reason || '',
                    },
                  })
                }
                className="form-input"
              />
            </div>

            <div className="profile-field">
              <label>Career Break Focus / Reason</label>
              <input
                type="text"
                placeholder="e.g. Caregiving, Health, Upskilling"
                value={extractedReview.career_break?.reason || ''}
                onChange={(e) =>
                  setExtractedReview({
                    ...extractedReview,
                    career_break: {
                      duration: extractedReview.career_break?.duration || '',
                      reason: e.target.value,
                    },
                  })
                }
                className="form-input"
              />
            </div>
          </div>

          {/* Extracted Skills Management */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e9d5ff', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#581c87', marginBottom: '0.85rem' }}>
              Extracted Technical Skills (Click ✕ to remove any skill):
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.25rem' }}>
              {Object.entries(extractedReview.technical_skills).map(([category, skillList]) => (
                <div key={category}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '0.35rem' }}>
                    {category.replace(/_/g, ' ')}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {skillList.length === 0 ? (
                      <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>None detected</span>
                    ) : (
                      skillList.map((skill: string) => (
                        <span
                          key={skill}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.25rem 0.6rem',
                            backgroundColor: 'var(--slate-100)',
                            border: '1px solid var(--slate-200)',
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            color: 'var(--slate-800)',
                          }}
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveExtractedSkill(
                                category as keyof ExtractedData['technical_skills'],
                                skill
                              )
                            }
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', padding: 0 }}
                            title="Remove skill"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add Skill to Extracted Data */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', paddingTop: '0.85rem', borderTop: '1px solid var(--slate-100)' }}>
              <input
                type="text"
                placeholder="Add missing skill (e.g. Docker, TypeScript)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="form-input"
                style={{ flex: 1, minWidth: '180px' }}
              />
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value)}
                className="profile-input"
                style={{ width: 'auto' }}
              >
                <option value="programming_languages">Programming Language</option>
                <option value="frameworks">Framework</option>
                <option value="databases">Database</option>
                <option value="tools_platforms">Tool / Platform</option>
              </select>
              <button
                type="button"
                onClick={handleAddExtractedSkill}
                className="btn btn-secondary btn-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Skill
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleConfirmExtraction}
              className="btn btn-primary"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Accept & Save to Confirmed Profile
            </button>
            <button
              type="button"
              onClick={() => setExtractedReview(null)}
              className="btn btn-outline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: Confirmed Candidate Profile & Career History */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <User className="w-4 h-4 text-emerald-600" />
              2. Confirmed Career Profile & History
            </h3>
            <p className="card-desc">
              Your confirmed profile data visible to partner employers and used for skill-gap diagnostics.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveConfirmedProfile}>
          <div className="profile-grid" style={{ marginBottom: '1.25rem' }}>
            <div className="profile-field">
              <label htmlFor="targetRole">Target Role</label>
              <input
                id="targetRole"
                type="text"
                placeholder="e.g. Senior Java Backend Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="location">Location / Work Preference</label>
              <input
                id="location"
                type="text"
                placeholder="e.g. Bangalore, India (or Remote)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="profile-field">
              <label htmlFor="phone">Contact Phone Number</label>
              <input
                id="phone"
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="profile-field" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="bio">Professional Summary / Bio</label>
            <textarea
              id="bio"
              rows={3}
              placeholder="Brief professional background, career trajectory, and current focus..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="profile-textarea"
            />
          </div>

          {/* Career Break Documentation Box */}
          <div
            style={{
              backgroundColor: 'var(--slate-50)',
              border: '1px solid var(--slate-200)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              marginBottom: '1.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <strong style={{ fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                  Career Break / Hiatus Information
                </strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--slate-500)', margin: '0.15rem 0 0' }}>
                  Transparently communicate your career break reason and duration to remove employer ambiguity.
                </p>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={inBreak}
                  onChange={(e) => setInBreak(e.target.checked)}
                  style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                />
                <span>Active / Past Career Break</span>
              </label>
            </div>

            {inBreak && (
              <div className="profile-grid" style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--slate-200)' }}>
                <div className="profile-field">
                  <label>Break Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Years (2023 - 2026)"
                    value={breakDuration}
                    onChange={(e) => setBreakDuration(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="profile-field">
                  <label>Primary Focus / Reason</label>
                  <input
                    type="text"
                    placeholder="e.g. Childcare, Family Caregiving, Skill Modernization"
                    value={breakReason}
                    onChange={(e) => setBreakReason(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Career History List */}
          <div style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Career History & Work Experience
              </h4>
              <button
                type="button"
                onClick={handleAddExperience}
                className="btn btn-secondary btn-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Role
              </button>
            </div>

            {careerHistory.length === 0 ? (
              <div className="empty-state-card" style={{ padding: '2rem 1rem' }}>
                <p className="empty-state-desc">No work experience entries added yet. Click "+ Add Role" to record your history.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {careerHistory.map((exp, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--slate-50)',
                      border: '1px solid var(--slate-200)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>
                        ROLE #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#dc2626', padding: '0.2rem 0.5rem' }}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Remove
                      </button>
                    </div>

                    <div className="profile-grid" style={{ marginBottom: '0.75rem' }}>
                      <div className="profile-field">
                        <label>Job Title</label>
                        <input
                          type="text"
                          placeholder="e.g. Senior Java Backend Developer"
                          value={exp.job_title}
                          onChange={(e) => handleUpdateExperience(idx, 'job_title', e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <div className="profile-field">
                        <label>Organization / Company</label>
                        <input
                          type="text"
                          placeholder="e.g. TechCorp Solutions"
                          value={exp.organization}
                          onChange={(e) => handleUpdateExperience(idx, 'organization', e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <div className="profile-field">
                        <label>Dates / Duration</label>
                        <input
                          type="text"
                          placeholder="e.g. 2019 - 2023"
                          value={exp.dates}
                          onChange={(e) => handleUpdateExperience(idx, 'dates', e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="profile-field">
                      <label>Description & Key Responsibilities</label>
                      <textarea
                        rows={2}
                        placeholder="Architected microservices, optimized SQL queries, led release cycles..."
                        value={exp.description || ''}
                        onChange={(e) => handleUpdateExperience(idx, 'description', e.target.value)}
                        className="profile-textarea"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirmed Skills Section */}
          <div style={{ marginBottom: '1.75rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.85rem' }}>
              Confirmed Technical Skills ({skills.length})
            </h4>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '1rem', minHeight: '40px' }}>
              {skills.length === 0 ? (
                <p className="empty-state-desc" style={{ textAlign: 'left', margin: 0 }}>No confirmed skills saved yet.</p>
              ) : (
                skills.map((skill, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.3rem 0.75rem',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px solid var(--primary-border)',
                      borderRadius: '9999px',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'var(--primary)',
                    }}
                  >
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveConfirmedSkill(skill.name)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: 0 }}
                      title="Remove skill"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Add confirmed skill"
                value={profileNewSkill}
                onChange={(e) => setProfileNewSkill(e.target.value)}
                className="form-input"
                style={{ flex: 1, minWidth: '180px' }}
              />
              <select
                value={profileNewSkillCat}
                onChange={(e) => setProfileNewSkillCat(e.target.value)}
                className="profile-input"
                style={{ width: 'auto' }}
              >
                <option value="programming_languages">Programming Language</option>
                <option value="frameworks">Framework</option>
                <option value="databases">Database</option>
                <option value="tools_platforms">Tool / Platform</option>
              </select>
              <button
                type="button"
                onClick={handleAddConfirmedSkill}
                className="btn btn-secondary btn-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Skill
              </button>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '1.25rem' }}>
            <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg">
              {isLoading ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CandidateProfilePage;
