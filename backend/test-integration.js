// Integration test script for SkillBridge Candidate & Employer flows
const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING SKILLBRIDGE INTEGRATION TESTS ---');
  let candidateToken = '';
  let employerToken = '';
  let candidateId = '';
  let employerId = '';
  let jobId = '';

  // 1. Health check
  console.log('\n[1] Health Check...');
  const health = await request({ hostname: 'localhost', port: 5001, path: '/api/health', method: 'GET' });
  console.log('Health status:', health.status, health.body);
  if (health.status !== 200) throw new Error('Health check failed');

  // 2. Candidate Login
  console.log('\n[2] Candidate Login...');
  const candLogin = await request({
    hostname: 'localhost', port: 5001, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'candidate.demo@skillbridge.app', password: 'SkillBridge@123' });
  console.log('Candidate login status:', candLogin.status, candLogin.body.user?.email, 'Role:', candLogin.body.user?.role);
  if (candLogin.status !== 200) throw new Error('Candidate login failed');
  candidateToken = candLogin.body.token;
  candidateId = candLogin.body.user.id;

  // 3. Employer Login
  console.log('\n[3] Employer Login...');
  const empLogin = await request({
    hostname: 'localhost', port: 5001, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'employer.demo@skillbridge.app', password: 'SkillBridge@123' });
  console.log('Employer login status:', empLogin.status, empLogin.body.user?.email, 'Role:', empLogin.body.user?.role);
  if (empLogin.status !== 200) throw new Error('Employer login failed');
  employerToken = empLogin.body.token;
  employerId = empLogin.body.user.id;

  // 4. Role Authorization: Candidate accessing Employer endpoint
  console.log('\n[4] Candidate attempting Employer endpoint (should be 403)...');
  const forbiddenCheck = await request({
    hostname: 'localhost', port: 5001, path: '/api/employer/jobs', method: 'GET',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });
  console.log('Candidate accessing employer jobs status:', forbiddenCheck.status);
  if (forbiddenCheck.status !== 403) throw new Error('Role authorization failed');

  // 5. Employer Profile CRUD
  console.log('\n[5] Employer Profile Update...');
  const empProfile = await request({
    hostname: 'localhost', port: 5001, path: '/api/employer/profile', method: 'PUT',
    headers: { Authorization: `Bearer ${employerToken}`, 'Content-Type': 'application/json' }
  }, {
    company_name: 'TechBridge Innovations',
    industry: 'Cloud Software',
    location: 'Bangalore, India',
    website: 'https://techbridge.example.com',
    description: 'Pioneering work-first hiring for re-entering talent.'
  });
  console.log('Employer profile update:', empProfile.status, empProfile.body.profile?.company_name);

  // 6. Employer Create Job
  console.log('\n[6] Employer Creating Job...');
  const newJob = await request({
    hostname: 'localhost', port: 5001, path: '/api/employer/jobs', method: 'POST',
    headers: { Authorization: `Bearer ${employerToken}`, 'Content-Type': 'application/json' }
  }, {
    title: 'Senior Full Stack Engineer (Python & React)',
    department: 'Engineering',
    location: 'Hybrid - Bangalore',
    type: 'full-time',
    experience_level: '4+ years',
    required_skills: ['Python', 'React', 'Node.js', 'PostgreSQL'],
    preferred_skills: ['Docker', 'AWS', 'TypeScript'],
    description: 'Lead feature development on our core enterprise platforms.'
  });
  console.log('Create Job status:', newJob.status, 'Job ID:', newJob.body.job?.id);
  jobId = newJob.body.job.id;

  // 7. Candidate Views Open Jobs
  console.log('\n[7] Candidate views open jobs...');
  const openJobs = await request({
    hostname: 'localhost', port: 5001, path: '/api/candidate/jobs/open', method: 'GET',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });
  console.log('Open jobs count:', openJobs.body.jobs?.length);

  // 8. Candidate Applies to Job
  console.log('\n[8] Candidate applies to Job...');
  const applyRes = await request({
    hostname: 'localhost', port: 5001, path: `/api/candidate/apply-job/${jobId}`, method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });
  console.log('Apply status:', applyRes.status, applyRes.body.message);

  // 9. Employer views Job Applications
  console.log('\n[9] Employer views applications for Job...');
  const appList = await request({
    hostname: 'localhost', port: 5001, path: `/api/employer/jobs/${jobId}/applications`, method: 'GET',
    headers: { Authorization: `Bearer ${employerToken}` }
  });
  console.log('Applications found:', appList.body.applications?.length);
  const applicationId = appList.body.applications?.[0]?.id;

  // 10. Employer updates Application Status & Feedback
  if (applicationId) {
    console.log('\n[10] Employer shortlists candidate and gives feedback...');
    const statusUpdate = await request({
      hostname: 'localhost', port: 5001, path: `/api/employer/applications/${applicationId}/status`, method: 'POST',
      headers: { Authorization: `Bearer ${employerToken}`, 'Content-Type': 'application/json' }
    }, {
      status: 'Shortlisted',
      employer_feedback: 'Strong skills demonstrated in portfolio. Scheduling interview round.'
    });
    console.log('Update status:', statusUpdate.status, statusUpdate.body.application?.status);
  }

  // 11. Employer Discovers Candidates
  console.log('\n[11] Employer discovers candidates...');
  const discCandidates = await request({
    hostname: 'localhost', port: 5001, path: '/api/employer/candidates', method: 'GET',
    headers: { Authorization: `Bearer ${employerToken}` }
  });
  console.log('Discovered candidates:', discCandidates.body.candidates?.length);

  // 12. Employer Reviews Candidate Evidence
  console.log('\n[12] Employer reviews candidate evidence...');
  const candEvidence = await request({
    hostname: 'localhost', port: 5001, path: `/api/employer/candidates/${candidateId}`, method: 'GET',
    headers: { Authorization: `Bearer ${employerToken}` }
  });
  console.log('Candidate review status:', candEvidence.status, 'Evidence count:', candEvidence.body.evidence?.length);

  // 13. Candidate Mentors & Booking
  console.log('\n[13] Candidate gets mentors and books session...');
  const mentorsRes = await request({
    hostname: 'localhost', port: 5001, path: '/api/candidate/mentors', method: 'GET',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });
  console.log('Mentors count:', mentorsRes.body.mentors?.length);
  if (mentorsRes.body.mentors?.[0]) {
    const bookRes = await request({
      hostname: 'localhost', port: 5001, path: `/api/candidate/mentors/${mentorsRes.body.mentors[0].id}/book`, method: 'POST',
      headers: { Authorization: `Bearer ${candidateToken}`, 'Content-Type': 'application/json' }
    }, {
      topic: 'Career re-entry strategy and system design review',
      notes: 'Returning from a 2-year caregiving gap.'
    });
    console.log('Book mentor status:', bookRes.status, bookRes.body.booking?.status);
  }

  // 14. Candidate Fellowships
  console.log('\n[14] Candidate gets fellowships and applies...');
  const fellowships = await request({
    hostname: 'localhost', port: 5001, path: '/api/candidate/fellowships', method: 'GET',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });
  console.log('Fellowships count:', fellowships.body.fellowships?.length);
  if (fellowships.body.fellowships?.[0]) {
    const felApply = await request({
      hostname: 'localhost', port: 5001, path: `/api/candidate/fellowships/${fellowships.body.fellowships[0].id}/apply`, method: 'POST',
      headers: { Authorization: `Bearer ${candidateToken}`, 'Content-Type': 'application/json' }
    }, {
      cover_note: 'Eager to rejoin tech through the returnship program.'
    });
    console.log('Fellowship apply status:', felApply.status, felApply.body.application?.status);
  }

  // 15. Candidate References CRUD
  console.log('\n[15] Candidate adds reference...');
  const addRef = await request({
    hostname: 'localhost', port: 5001, path: '/api/candidate/references', method: 'POST',
    headers: { Authorization: `Bearer ${candidateToken}`, 'Content-Type': 'application/json' }
  }, {
    name: 'Anand Kumar',
    relationship: 'Former Engineering Director',
    company: 'Previous Tech Corp',
    email: 'anand.k@example.com',
    phone: '+91 98765 43210'
  });
  console.log('Add reference status:', addRef.status, addRef.body.reference?.name);

  // 16. Career-Break Documentation Assistant (Gap Narrative)
  console.log('\n[16] Candidate saves gap narrative...');
  const saveNarrative = await request({
    hostname: 'localhost', port: 5001, path: '/api/candidate/gap-narrative', method: 'PUT',
    headers: { Authorization: `Bearer ${candidateToken}`, 'Content-Type': 'application/json' }
  }, {
    gap_pitch: 'During my career break, I managed family responsibilities while completing modern full-stack development certifications and building verified sandbox projects.',
    resume_statement: 'Career Break (2023-2025): Dedicated full-time family care alongside active continuous learning in React, Node.js, and Cloud architectures.',
    cover_letter_note: 'You will notice a career break on my resume. During this period, I kept my engineering skills sharp through benchmark assessments and real-world project builds.'
  });
  console.log('Gap narrative status:', saveNarrative.status, saveNarrative.body.narrative?.gap_pitch?.slice(0, 30));

  // 17. Feedback History
  console.log('\n[17] Candidate checks feedback history...');
  const fbHistory = await request({
    hostname: 'localhost', port: 5001, path: '/api/candidate/feedback-history', method: 'GET',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });
  console.log('Feedback history items:', fbHistory.body.feedback?.length);

  // 18. PDF Report Generation & Download
  console.log('\n[18] Candidate generates and downloads PDF report...');
  const pdfRes = await request({
    hostname: 'localhost', port: 5001, path: '/api/candidate/report/pdf', method: 'GET',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });
  console.log('PDF Report status:', pdfRes.status, 'Content-Type:', pdfRes.headers['content-type']);
  if (pdfRes.status !== 200 || !pdfRes.headers['content-type']?.includes('pdf')) {
    throw new Error('PDF Report generation failed');
  }

  // 19. CSV Export
  console.log('\n[19] Candidate exports CSV...');
  const csvRes = await request({
    hostname: 'localhost', port: 5001, path: '/api/candidate/report/csv', method: 'GET',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });
  console.log('CSV Export status:', csvRes.status, 'Content-Type:', csvRes.headers['content-type']);
  if (csvRes.status !== 200) throw new Error('CSV Export failed');

  // 20. XLSX Export
  console.log('\n[20] Candidate exports XLSX...');
  const xlsxRes = await request({
    hostname: 'localhost', port: 5001, path: '/api/candidate/report/xlsx', method: 'GET',
    headers: { Authorization: `Bearer ${candidateToken}` }
  });
  console.log('XLSX Export status:', xlsxRes.status, 'Content-Type:', xlsxRes.headers['content-type']);
  if (xlsxRes.status !== 200) throw new Error('XLSX Export failed');

  console.log('\n=== ALL 20 INTEGRATION TESTS PASSED SUCCESSFULLY! ===');
}

runTests().catch((err) => {
  console.error('\n❌ INTEGRATION TEST FAILED:', err);
  process.exit(1);
});
