import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CandidateProfile,
  SkillItem,
  ExperienceItem,
  ExtractedData,
} from '../types/candidate';

export const CandidateProfilePage: React.FC = () => {
  const { token, logout } = useAuth();
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

      // Generate a mock PDF Blob or fetch sample
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

    // Flatten categorized skills into profile skills
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

  // Add a career history entry manually
  const handleAddExperience = () => {
    setCareerHistory([
      ...careerHistory,
      { job_title: '', organization: '', dates: '', description: '' },
    ]);
  };

  // Update a career history entry
  const handleUpdateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    const updated = [...careerHistory];
    updated[index] = { ...updated[index], [field]: value };
    setCareerHistory(updated);
  };

  // Remove a career history entry
  const handleRemoveExperience = (index: number) => {
    setCareerHistory(careerHistory.filter((_, i) => i !== index));
  };

  // Remove skill from confirmed profile
  const handleRemoveConfirmedSkill = (skillName: string) => {
    setSkills(skills.filter((s) => s.name !== skillName));
  };

  // Add skill to confirmed profile
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
    <div className="dashboard-layout">
      {/* Header Navigation */}
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <Link to="/dashboard" className="brand-logo-text" style={{ textDecoration: 'none' }}>
            SkillBridge
          </Link>
          <span className="role-badge badge-candidate">Candidate</span>
        </div>

        <nav className="header-nav-links">
          <Link to="/dashboard" className="btn btn-outline btn-sm">Dashboard</Link>
          <Link to="/profile" className="btn btn-primary btn-sm">Profile</Link>
          <Link to="/skills" className="btn btn-outline btn-sm">Skills & Gap</Link>
          <Link to="/assessments" className="btn btn-outline btn-sm">Assessments</Link>
          <Link to="/projects" className="btn btn-outline btn-sm">Projects</Link>
          <Link to="/passport" className="btn btn-outline btn-sm">Passport</Link>
          <button onClick={() => logout()} className="btn btn-outline btn-sm">Logout</button>
        </nav>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-heading-section">
          <h1>Candidate Profile & Career Information</h1>
          <p className="dashboard-subtitle">
            Upload your resume for real Gemini AI extraction, review extracted skills, and manage your verified career profile.
          </p>
        </div>

        {error && <div className="alert-error">{error}</div>}
        {successMsg && <div className="alert-success">{successMsg}</div>}

        {/* SECTION 1: Resume Upload & Gemini Extraction */}
        <section className="profile-details-card">
          <h2>1. Resume PDF Upload & AI Extraction</h2>
          <p className="section-instruction">
            Upload your resume in PDF format. Gemini AI will analyze and extract your verified experience, career-break information, and technical skills.
          </p>

          <div className="resume-upload-box">
            <div className="upload-controls">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                disabled={isUploading}
                className="file-input"
              />
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
                Load Sample Resume
              </button>
            </div>

            {uploadProgressMsg && (
              <div className="progress-banner">
                <span className="spinner">⏳</span> {uploadProgressMsg}
              </div>
            )}

            {/* Current Stored Resume Info */}
            {profile?.original_resume && (
              <div className="stored-resume-badge">
                <div className="resume-file-info">
                  <strong>Uploaded Resume:</strong> {profile.original_resume.file_name} (
                  {(profile.original_resume.file_size / 1024).toFixed(1)} KB)
                  <span className="upload-date">
                    • {new Date(profile.original_resume.uploaded_at).toLocaleString()}
                  </span>
                </div>
                <a
                  href="/api/candidate/resume/file"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                >
                  View / Download Stored PDF
                </a>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: AI-Extracted Data Review (Stored Separately from Confirmed Profile) */}
        {extractedReview && (
          <section className="extraction-review-card">
            <div className="review-badge-header">
              <span className="ai-pill">✨ AI Resume Extraction Review</span>
              <span className="status-pill pending">Pending Candidate Confirmation</span>
            </div>
            <p className="review-instruction">
              The details below were extracted directly from your resume by Gemini. Review, edit, add or remove skills before accepting.
            </p>

            <div className="review-grid">
              <div className="review-field">
                <label>Extracted Name</label>
                <input
                  type="text"
                  value={extractedReview.name || ''}
                  onChange={(e) => setExtractedReview({ ...extractedReview, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="review-field">
                <label>Target Role</label>
                <input
                  type="text"
                  value={extractedReview.target_role || ''}
                  onChange={(e) => setExtractedReview({ ...extractedReview, target_role: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="review-field">
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

              <div className="review-field">
                <label>Career Break Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Caregiving, Maternity, Upskilling"
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
            <div className="extracted-skills-section">
              <h3>Extracted Technical Skills (Click ✕ to remove):</h3>
              <div className="skills-categorized">
                {Object.entries(extractedReview.technical_skills).map(([category, skillList]) => (
                  <div key={category} className="skill-category-block">
                    <span className="category-title">{category.replace('_', ' ')}</span>
                    <div className="tags-container">
                      {skillList.length === 0 ? (
                        <span className="empty-hint">None detected</span>
                      ) : (
                        skillList.map((skill: string) => (
                          <span key={skill} className="skill-tag">
                            {skill}
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveExtractedSkill(
                                  category as keyof ExtractedData['technical_skills'],
                                  skill
                                )
                              }
                              className="remove-tag-btn"
                              title="Remove skill"
                            >
                              ✕
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Skill to Extracted Data */}
              <div className="add-skill-bar">
                <input
                  type="text"
                  placeholder="Add skill (e.g. Docker, TypeScript)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="form-input form-input-sm"
                />
                <select
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="form-input form-input-sm"
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
                  + Add Skill
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="review-action-row">
              <button
                type="button"
                onClick={handleConfirmExtraction}
                className="btn btn-primary"
              >
                Accept & Save to Confirmed Profile
              </button>
              <button
                type="button"
                onClick={() => setExtractedReview(null)}
                className="btn btn-outline"
              >
                Dismiss Review
              </button>
            </div>
          </section>
        )}

        {/* SECTION 3: Confirmed Candidate Profile & Career History (View & Edit) */}
        <section className="profile-details-card">
          <h2>2. Confirmed Career Profile & History</h2>
          <form onSubmit={handleSaveConfirmedProfile} className="profile-form">
            <div className="form-grid">
              <div className="form-group">
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

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Bangalore, India (or Remote)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
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

            <div className="form-group">
              <label htmlFor="bio">Professional Summary / Bio</label>
              <textarea
                id="bio"
                rows={3}
                placeholder="Brief professional background and focus..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Career Break Information */}
            <div className="career-break-box">
              <h3>Career-Break Information</h3>
              <div className="break-toggle-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={inBreak}
                    onChange={(e) => setInBreak(e.target.checked)}
                  />
                  <span>Currently navigating or returning from a career hiatus / break</span>
                </label>
              </div>

              {inBreak && (
                <div className="break-fields-grid">
                  <div className="form-group">
                    <label>Break Duration</label>
                    <input
                      type="text"
                      placeholder="e.g. 3 Years (2023 - 2026)"
                      value={breakDuration}
                      onChange={(e) => setBreakDuration(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
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
            <div className="career-history-section">
              <div className="section-title-row">
                <h3>Career History & Work Experience</h3>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="btn btn-secondary btn-sm"
                >
                  + Add Role
                </button>
              </div>

              {careerHistory.length === 0 ? (
                <p className="empty-hint">No career history entries added yet.</p>
              ) : (
                <div className="experience-list">
                  {careerHistory.map((exp, idx) => (
                    <div key={idx} className="experience-item-card">
                      <div className="experience-item-header">
                        <span className="exp-index">#{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExperience(idx)}
                          className="btn-link text-danger"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="form-grid">
                        <div className="form-group">
                          <label>Job Title</label>
                          <input
                            type="text"
                            placeholder="e.g. Senior Java Backend Developer"
                            value={exp.job_title}
                            onChange={(e) => handleUpdateExperience(idx, 'job_title', e.target.value)}
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
                          <label>Organization / Company</label>
                          <input
                            type="text"
                            placeholder="e.g. TechCorp Solutions"
                            value={exp.organization}
                            onChange={(e) =>
                              handleUpdateExperience(idx, 'organization', e.target.value)
                            }
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
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

                      <div className="form-group" style={{ marginTop: '0.5rem' }}>
                        <label>Description & Responsibilities</label>
                        <textarea
                          rows={2}
                          placeholder="Key achievements and technical responsibilities..."
                          value={exp.description || ''}
                          onChange={(e) =>
                            handleUpdateExperience(idx, 'description', e.target.value)
                          }
                          className="form-input"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmed Skills Section */}
            <div className="confirmed-skills-section">
              <h3>Confirmed Technical Skills</h3>
              <div className="tags-container">
                {skills.length === 0 ? (
                  <p className="empty-hint">No confirmed skills saved yet.</p>
                ) : (
                  skills.map((skill, index) => (
                    <span key={index} className="skill-tag confirmed">
                      {skill.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveConfirmedSkill(skill.name)}
                        className="remove-tag-btn"
                        title="Remove skill"
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>

              <div className="add-skill-bar" style={{ marginTop: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Add confirmed skill"
                  value={profileNewSkill}
                  onChange={(e) => setProfileNewSkill(e.target.value)}
                  className="form-input form-input-sm"
                />
                <select
                  value={profileNewSkillCat}
                  onChange={(e) => setProfileNewSkillCat(e.target.value)}
                  className="form-input form-input-sm"
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
                  + Add Skill
                </button>
              </div>
            </div>

            <div className="form-submit-row">
              <button type="submit" disabled={isLoading} className="btn btn-primary btn-large">
                {isLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default CandidateProfilePage;
